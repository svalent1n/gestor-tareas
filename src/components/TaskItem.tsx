import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task, TaskLocation } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// Muestra la dirección si se pudo obtener; si no, las coordenadas.
function formatLocation(location: TaskLocation): string {
  return (
    location.address ??
    `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
  );
}

/**
 * Fila de la lista de tareas. Tocar el texto alterna hecha/pendiente
 * y tocar la ✕ elimina la tarea; las acciones las decide quien lo usa.
 * Si la tarea tiene foto, ubicación, responsable o evento, también los muestra.
 */
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <View style={styles.container}>
      {task.photoUri && (
        <Image
          source={{ uri: task.photoUri }}
          style={styles.thumbnail}
          accessibilityLabel="Foto de la tarea"
        />
      )}
      <TouchableOpacity style={styles.content} onPress={() => onToggle(task.id)}>
        <Text style={[styles.title, task.completed && styles.titleDone]}>
          {task.title}
        </Text>
        {task.location && (
          <Text style={styles.detail}>Ubicación: {formatLocation(task.location)}</Text>
        )}
        {task.contact && (
          <Text style={styles.detail}>Responsable: {task.contact.name}</Text>
        )}
        {task.calendarEventId && (
          <Text style={styles.detail}>Evento en el calendario</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 8,
    borderRadius: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#222',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  delete: {
    fontSize: 18,
    color: '#c0392b',
    paddingHorizontal: 8,
  },
});
