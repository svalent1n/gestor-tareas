import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
 cancelReminder,
 scheduleTaskReminder,
} from '../services/notificationService';
import { Task } from '../types';

/** Datos para crear una tarea; el resto de los campos los completa el store. */
export type NewTaskInput = Pick<
 Task,
 'title' | 'reminderAt' | 'photoUri' | 'location' | 'contact' | 'calendarEventId'
>;

interface TasksState {
 tasks: Task[];
 // false hasta que AsyncStorage terminó de cargar las tareas guardadas.
 hydrated: boolean;
 error: string | null;
 addTask: (input: NewTaskInput) => Promise<Task>;
 deleteTask: (id: string) => Promise<void>;
 toggleTask: (id: string) => Promise<void>;
 updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void;
 clearError: () => void;
 setHydrated: () => void;
}

// Intenta cancelar el aviso de una tarea si lo tiene.
async function cancelTaskReminder(task: Task | undefined) {
 if (!task?.notificationId) {
  return;
 }
 try {
  await cancelReminder(task.notificationId);
 } catch {
  // El aviso ya se disparó o ya no existe: no hay nada que cancelar.
 }
}

/**
 * Estado global de las tareas. Reemplaza a useTasks + TasksContext + taskRepository:
 * el middleware persist guarda la lista en AsyncStorage y la recupera al abrir la app.
 */
export const useTasksStore = create<TasksState>()(
 persist(
  (set, get) => ({
   tasks: [],
   hydrated: false,
   error: null,

   addTask: async (input) => {
    const title = input.title.trim();

    // El aviso se programa antes de crear la tarea para guardar su id junto a ella.
    let notificationId: string | undefined;
    if (input.reminderAt) {
     try {
      notificationId =
       (await scheduleTaskReminder(title, input.reminderAt)) ?? undefined;
     } catch {
      set({ error: 'No se pudo programar el recordatorio.' });
     }
    }

    const newTask: Task = {
     ...input,
     // El sufijo aleatorio evita ids repetidos si se agregan dos tareas en el mismo milisegundo.
     id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
     title,
     completed: false,
     notificationId,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
   },

   deleteTask: async (id) => {
    await cancelTaskReminder(get().tasks.find((task) => task.id === id));
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
   },

   toggleTask: async (id) => {
    const target = get().tasks.find((task) => task.id === id);
    if (!target) {
     return;
    }
    const completed = !target.completed;
    // Al completarla ya no tiene sentido el recordatorio pendiente.
    if (completed) {
     await cancelTaskReminder(target);
    }
    set((state) => ({
     tasks: state.tasks.map((task) =>
      task.id === id
       ? {
         ...task,
         completed,
         notificationId: completed ? undefined : task.notificationId,
        }
       : task,
     ),
    }));
   },

   updateTask: (id, patch) =>
    set((state) => ({
     tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...patch } : task,
     ),
    })),

   clearError: () => set({ error: null }),
   setHydrated: () => set({ hydrated: true }),
  }),
  {
   // Clave nueva: la anterior guardaba un array plano, y persist guarda { state, version }.
   name: '@gestor_tareas/tasks-store',
   storage: createJSONStorage(() => AsyncStorage),
   // Solo se persiste la lista; hydrated y error son estado de sesión.
   partialize: (state) => ({ tasks: state.tasks }),
   onRehydrateStorage: () => (state, error) => {
    if (state) {
     state.setHydrated();
    } else {
     useTasksStore.setState({
      hydrated: true,
      error: error ? 'No se pudieron cargar las tareas.' : null,
     });
    }
   },
  },
 ),
);
