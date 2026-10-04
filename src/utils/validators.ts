export const MAX_TITLE_LENGTH = 100;

/**
 * Valida el título de una tarea.
 * @param title Texto ingresado por el usuario.
 * @returns El mensaje de error, o null si el título es válido.
 */
export function validateTaskTitle(title: string): string | null {
 const trimmed = title.trim();

 // Un título con solo espacios cuenta como vacío: se valida ya recortado.
 if (!trimmed) {
  return 'El título es obligatorio.';
 }
 if (trimmed.length > MAX_TITLE_LENGTH) {
  return `El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`;
 }
 return null;
}

export const MAX_REMINDER_MINUTES = 1440;

/**
 * Valida los minutos de un recordatorio. El campo es opcional: vacío es válido.
 * @param value Texto ingresado por el usuario.
 * @returns El mensaje de error, o null si es válido o está vacío.
 */
export function validateReminderMinutes(value: string): string | null {
 const trimmed = value.trim();

 if (!trimmed) {
  return null;
 }
 // Se exige solo dígitos antes de convertir: Number('12abc') da NaN y
 // Number('1.5') o Number('-3') pasarían como números válidos pero no deseados.
 if (!/^\d+$/.test(trimmed)) {
  return 'Ingresa un número entero de minutos.';
 }
 const minutes = Number(trimmed);
 if (minutes < 1 || minutes > MAX_REMINDER_MINUTES) {
  return `Los minutos deben estar entre 1 y ${MAX_REMINDER_MINUTES}.`;
 }
 return null;
}

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Valida el nombre de usuario al registrarse.
 * @param username Texto ingresado por el usuario.
 * @returns El mensaje de error, o null si es válido.
 */
export function validateUsername(username: string): string | null {
 const trimmed = username.trim();

 if (!trimmed) {
  return 'El usuario es obligatorio.';
 }
 if (trimmed.length < MIN_USERNAME_LENGTH) {
  return `El usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres.`;
 }
 if (/\s/.test(trimmed)) {
  return 'El usuario no puede contener espacios.';
 }
 return null;
}

/**
 * Valida la contraseña al registrarse.
 * @param password Texto ingresado por el usuario.
 * @returns El mensaje de error, o null si es válida.
 */
export function validatePassword(password: string): string | null {
 // No se recorta: un espacio al inicio o al final puede ser parte intencional de la contraseña.
 if (!password) {
  return 'La contraseña es obligatoria.';
 }
 if (password.length < MIN_PASSWORD_LENGTH) {
  return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
 }
 return null;
}