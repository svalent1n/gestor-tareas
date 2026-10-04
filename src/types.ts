/** Una tarea del gestor. */
export interface Task {
 id: string;
 title: string;
 completed: boolean;
 // Es un timestamp en milisegundos y no un Date: AsyncStorage guarda JSON,
 // y JSON convierte las fechas en texto, así que al leerlas ya no serían Date.
 reminderAt?: number;
 // (comentario del id)
 notificationId?: string;
}


/**
 * Un usuario registrado en el dispositivo.
 */
export interface User {
 username: string;
 // El TP permite guardar la contraseña en texto plano. En una app real se
 // guardaría un hash, nunca la contraseña tal cual.
 password: string;
}