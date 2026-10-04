// Estos imports apuntan a archivos internos de la librería a propósito: el import
// oficial (`import * as Notifications from 'expo-notifications'`) carga también
// un módulo que registra el token push al iniciar, y en Expo Go para Android eso
// lanza un error. Importando solo lo necesario se evita. Si se migra a un
// development build, se puede volver al import oficial cambiando solo este archivo.
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { Platform } from 'react-native';

const CHANNEL_ID = 'tareas';

// Se ejecuta una sola vez, al importarse el módulo: define qué hacer si el aviso
// llega con la app abierta (por defecto Android no lo mostraría).
setNotificationHandler({
 handleNotification: async () => ({
  shouldShowBanner: true,
  shouldShowList: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
 }),
});

/**
 * Pide permiso para mostrar notificaciones. En Android crea antes el canal,
 * porque desde Android 13 el cuadro de permiso no aparece sin un canal creado.
 * @returns true si el usuario concedió el permiso.
 */
export async function requestNotificationPermission(): Promise<boolean> {
 if (Platform.OS === 'android') {
  try {
   await setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Recordatorios de tareas',
    importance: AndroidImportance.HIGH,
   });
  } catch {
   // Un fallo al crear el canal no debe impedir pedir el permiso.
  }
 }

 const current = await getPermissionsAsync();
 if (current.granted) {
  return true;
 }
 const requested = await requestPermissionsAsync();
 return requested.granted;
}

/**
 * Programa una notificación local para el momento indicado.
 * @param title Título de la tarea; se muestra como cuerpo del aviso.
 * @param reminderAt Momento del aviso, en milisegundos.
 * @returns El id de la notificación programada, o null si no se programó
 * (momento ya pasado o permiso denegado).
 */
export async function scheduleTaskReminder(
 title: string,
 reminderAt: number,
): Promise<string | null> {
 const seconds = Math.ceil((reminderAt - Date.now()) / 1000);
 if (seconds < 1) {
  return null;
 }
 if (!(await requestNotificationPermission())) {
  return null;
 }

 return scheduleNotificationAsync({
  content: { title: 'Recordatorio de tarea', body: title },
  trigger: {
   type: SchedulableTriggerInputTypes.TIME_INTERVAL,
   seconds,
   channelId: CHANNEL_ID,
  },
 });
}

/**
 * Cancela una notificación programada que todavía no se disparó.
 * @param notificationId Id devuelto por scheduleTaskReminder.
 */
export async function cancelReminder(notificationId: string): Promise<void> {
 await cancelScheduledNotificationAsync(notificationId);
}