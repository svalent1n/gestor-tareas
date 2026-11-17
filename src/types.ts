/** Ubicación guardada junto a una tarea. */
export interface TaskLocation {
 latitude: number;
 longitude: number;
 // Dirección aproximada obtenida por geocodificación inversa (puede no estar disponible).
 address?: string;
}

/** Contacto de la agenda asociado a una tarea (responsable). */
export interface TaskContact {
 name: string;
 phone?: string;
}

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
 // Parcial 2: recursos del dispositivo asociados a la tarea.
 photoUri?: string;
 location?: TaskLocation;
 contact?: TaskContact;
 // Id del evento creado en el calendario del dispositivo.
 calendarEventId?: string;
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