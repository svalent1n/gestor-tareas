import {
 MAX_REMINDER_MINUTES,
 MAX_TITLE_LENGTH,
 validatePassword,
 validateReminderMinutes,
 validateTaskTitle,
 validateUsername,
} from '../validators';

describe('validateTaskTitle', () => {
 it('acepta un título válido', () => {
  expect(validateTaskTitle('Comprar pan')).toBeNull();
 });

 it('rechaza un título vacío o con solo espacios', () => {
  expect(validateTaskTitle('')).toBe('El título es obligatorio.');
  expect(validateTaskTitle('   ')).toBe('El título es obligatorio.');
 });

 it('rechaza un título más largo que el máximo', () => {
  expect(validateTaskTitle('a'.repeat(MAX_TITLE_LENGTH + 1))).not.toBeNull();
 });
});

describe('validateReminderMinutes', () => {
 it('acepta el campo vacío porque es opcional', () => {
  expect(validateReminderMinutes('')).toBeNull();
 });

 it('acepta un entero dentro del rango', () => {
  expect(validateReminderMinutes('30')).toBeNull();
 });

 it('rechaza texto que no es un entero, como una hora', () => {
  expect(validateReminderMinutes('12:00')).toBe(
   'Ingresa un número entero de minutos.',
  );
 });

 it('rechaza valores fuera del rango', () => {
  expect(validateReminderMinutes('0')).not.toBeNull();
  expect(validateReminderMinutes(String(MAX_REMINDER_MINUTES + 1))).not.toBeNull();
 });
});

describe('validateUsername y validatePassword', () => {
 it('rechaza un usuario con espacios', () => {
  expect(validateUsername('ana lopez')).toBe(
   'El usuario no puede contener espacios.',
  );
 });

 it('rechaza una contraseña corta', () => {
  expect(validatePassword('123')).not.toBeNull();
  expect(validatePassword('123456')).toBeNull();
 });
});