import { useEffect, useState } from 'react';
import { cancelReminder, scheduleTaskReminder } from '../services/notificationService';
import { taskRepository } from '../storage/taskRepository';
import { Task } from '../types';


/**
 * Maneja la lista de tareas de la pantalla: la carga al abrirse, la modifica
 * y expone su estado (datos, cargando, error).
 */
export function useTasks() {
 const [tasks, setTasks] = useState<Task[]>([]);
 // Arranca en true porque al montarse todavía no leímos el almacenamiento.
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  // useEffect no admite un callback async, por eso la función va adentro.
  const load = async () => {
   try {
    setTasks(await taskRepository.getAll());
   } catch {
    setError('No se pudieron cargar las tareas.');
   } finally {
    setLoading(false);
   }
  };
  load();
 }, []);

 // Punto único para cambiar la lista: actualiza la pantalla primero y guarda después
 // (actualización optimista), así toda operación se comporta igual ante un fallo.
 const commit = async (updated: Task[]) => {
  setTasks(updated);
  try {
   await taskRepository.saveAll(updated);
  } catch {
   setError('No se pudieron guardar los cambios.');
  }
 };

 // Intenta cancelar el aviso de una tarea si lo tiene.
 const cancelTaskReminder = async (task: Task | undefined) => {
  if (!task?.notificationId) {
   return;
  }
  try {
   await cancelReminder(task.notificationId);
  } catch {
   // El aviso ya se disparó o ya no existe: no hay nada que cancelar.
  }
 };

 /**
  * Crea una tarea nueva, programa su recordatorio si lo tiene y la persiste.
  * @param title Texto de la tarea; se le quitan los espacios sobrantes.
  * @param reminderAt Momento del recordatorio en milisegundos (opcional).
  */
 const addTask = async (title: string, reminderAt?: number) => {
  const cleanTitle = title.trim();

  // El aviso se programa antes de crear la tarea para guardar su id junto a ella.
  let notificationId: string | undefined;
  if (reminderAt) {
   try {
    notificationId =
     (await scheduleTaskReminder(cleanTitle, reminderAt)) ?? undefined;
   } catch {
    setError('No se pudo programar el recordatorio.');
   }
  }

  const newTask: Task = {
   // El sufijo aleatorio evita ids repetidos si se agregan dos tareas en el mismo milisegundo.
   id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
   title: cleanTitle,
   completed: false,
   reminderAt,
   notificationId,
  };

  await commit([newTask, ...tasks]);
 };

 /**
  * Elimina la tarea con ese id, cancela su recordatorio y persiste el cambio.
  * @param id Identificador de la tarea a eliminar.
  */
 const deleteTask = async (id: string) => {
  await cancelTaskReminder(tasks.find((task) => task.id === id));
  await commit(tasks.filter((task) => task.id !== id));
 };

 /**
  * Alterna una tarea entre pendiente y hecha. Al completarla se cancela su recordatorio.
  * @param id Identificador de la tarea a alternar.
  */
 const toggleTask = async (id: string) => {
  const target = tasks.find((task) => task.id === id);
  if (!target) {
   return;
  }
  const completed = !target.completed;
  if (completed) {
   await cancelTaskReminder(target);
  }
  await commit(
   tasks.map((task) =>
    task.id === id
     ? {
      ...task,
      completed,
      notificationId: completed ? undefined : task.notificationId,
     }
     : task,
   ),
  );
 };

 return { tasks, loading, error, addTask, deleteTask, toggleTask };
}