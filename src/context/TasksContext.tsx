import { createContext, ReactNode, useContext } from 'react';
import { useTasks } from '../hooks/useTasks';

type TasksContextValue = ReturnType<typeof useTasks>;

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

/**
 * Crea una sola instancia de useTasks y la comparte con todas las pantallas,
 * para que agregar una tarea en una pantalla se refleje en las demás.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
 const value = useTasks();
 return (
  <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
 );
}

/**
 * Da acceso al estado compartido de tareas.
 * Falla con un mensaje claro si se usa fuera de un TasksProvider.
 */
export function useTasksContext(): TasksContextValue {
 const context = useContext(TasksContext);
 if (!context) {
  throw new Error('useTasksContext debe usarse dentro de un TasksProvider.');
 }
 return context;
}