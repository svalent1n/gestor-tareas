import AsyncStorage from '@react-native-async-storage/async-storage';
import {
 cancelReminder,
 scheduleTaskReminder,
} from '../../services/notificationService';
import { useTasksStore } from '../tasksStore';

jest.mock('@react-native-async-storage/async-storage', () =>
 require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../../services/notificationService', () => ({
 scheduleTaskReminder: jest.fn(),
 cancelReminder: jest.fn(),
}));

const mockedSchedule = scheduleTaskReminder as jest.Mock;
const mockedCancel = cancelReminder as jest.Mock;

describe('tasksStore', () => {
 beforeEach(() => {
  useTasksStore.setState({ tasks: [], error: null });
  mockedSchedule.mockReset();
  mockedCancel.mockReset();
 });

 it('agrega una tarea al principio de la lista y recorta el título', async () => {
  await useTasksStore.getState().addTask({ title: '  Primera  ' });
  await useTasksStore.getState().addTask({ title: 'Segunda' });

  const { tasks } = useTasksStore.getState();
  expect(tasks.map((task) => task.title)).toEqual(['Segunda', 'Primera']);
  expect(tasks[0].completed).toBe(false);
 });

 it('guarda los recursos del dispositivo asociados a la tarea', async () => {
  await useTasksStore.getState().addTask({
   title: 'Comprar pan',
   photoUri: 'file:///foto.jpg',
   location: { latitude: -34.6, longitude: -58.4 },
   contact: { name: 'Ana', phone: '1155550000' },
  });

  const [task] = useTasksStore.getState().tasks;
  expect(task.photoUri).toBe('file:///foto.jpg');
  expect(task.location).toEqual({ latitude: -34.6, longitude: -58.4 });
  expect(task.contact?.name).toBe('Ana');
 });

 it('programa el recordatorio y guarda el id de la notificación', async () => {
  mockedSchedule.mockResolvedValue('notif-1');

  await useTasksStore.getState().addTask({ title: 'Llamar', reminderAt: 123 });

  expect(mockedSchedule).toHaveBeenCalledWith('Llamar', 123);
  expect(useTasksStore.getState().tasks[0].notificationId).toBe('notif-1');
 });

 it('alterna el estado y cancela el recordatorio al completarla', async () => {
  mockedSchedule.mockResolvedValue('notif-2');
  const task = await useTasksStore
   .getState()
   .addTask({ title: 'Estudiar', reminderAt: 456 });

  await useTasksStore.getState().toggleTask(task.id);

  const updated = useTasksStore.getState().tasks[0];
  expect(updated.completed).toBe(true);
  expect(updated.notificationId).toBeUndefined();
  expect(mockedCancel).toHaveBeenCalledWith('notif-2');
 });

 it('elimina la tarea', async () => {
  const task = await useTasksStore.getState().addTask({ title: 'Borrar' });

  await useTasksStore.getState().deleteTask(task.id);

  expect(useTasksStore.getState().tasks).toHaveLength(0);
 });

 it('actualiza campos de una tarea existente', async () => {
  const task = await useTasksStore.getState().addTask({ title: 'Evento' });

  useTasksStore.getState().updateTask(task.id, { calendarEventId: 'evt-9' });

  expect(useTasksStore.getState().tasks[0].calendarEventId).toBe('evt-9');
 });

 it('persiste solo la lista de tareas en AsyncStorage', async () => {
  await useTasksStore.getState().addTask({ title: 'Persistida' });

  const raw = await AsyncStorage.getItem('@gestor_tareas/tasks-store');
  const saved = JSON.parse(raw as string);
  expect(saved.state.tasks[0].title).toBe('Persistida');
  expect(saved.state).not.toHaveProperty('hydrated');
 });
});
