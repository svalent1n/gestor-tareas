import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types";

const STORAGE_KEY = '@gestor_tareas/tasks';


/**
 * Único punto de la app que conoce AsyncStorage para las tareas.
 * Pantallas y hooks piden y guardan tareas por acá, sin saber dónde viven.
 */
export const taskRepository = {
 /** Devuelve todas las tareas guardadas, o una lista vacía si no hay ninguna. */
 async getAll(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
 },
 /** Reemplaza la lista completa guardada por la que recibe. */
 async saveAll(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
 }
}