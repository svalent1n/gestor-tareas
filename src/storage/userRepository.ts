import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USERS_KEY = '@gestor_tareas/users';
const SESSION_KEY = '@gestor_tareas/session';

/**
 * Único punto de la app que conoce AsyncStorage para usuarios y sesión.
 */
export const userRepository = {
 /** Devuelve todos los usuarios registrados, o una lista vacía si no hay ninguno. */
 async getAll(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
 },

 /** Reemplaza la lista completa de usuarios guardada por la que recibe. */
 async saveAll(users: User[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
 },

 /** Devuelve el nombre del usuario con sesión abierta, o null si no hay ninguno. */
 async getSession(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
 },

 /** Recuerda qué usuario inició sesión. */
 async saveSession(username: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, username);
 },

 /** Borra la sesión guardada (cierre de sesión). */
 async clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
 },
};