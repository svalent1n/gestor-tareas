import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../types';

interface TaskItemProps {
 task: Task;
 onToggle: (id: string) => void;
 onDelete: (id: string) => void;
}

/**
 * Fila de la lista de tareas. Tocar el texto alterna hecha/pendiente
 * y tocar la ✕ elimina la tarea; las acciones las decide quien lo usa.
 */
export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
 return (
  <View style= { styles.container } >
  <TouchableOpacity style={ styles.content } onPress = {() => onToggle(task.id)
}>
 <Text style={ [styles.title, task.completed && styles.titleDone] }>
  { task.title }
  </Text>
  </TouchableOpacity>
  < TouchableOpacity onPress = {() => onDelete(task.id)}>
   <Text style={ styles.delete }>✕</Text>
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
 delete: {
  fontSize: 18,
  color: '#c0392b',
  paddingHorizontal: 8,
 },
});