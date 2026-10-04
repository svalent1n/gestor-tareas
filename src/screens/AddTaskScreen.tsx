import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTasksContext } from '../context/TasksContext';
import { RootStackParamList } from '../navigation/types';
import { validateReminderMinutes, validateTaskTitle } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

/**
 * Formulario para crear una tarea con título y, opcionalmente, un recordatorio
 * expresado en minutos desde ahora.
 */
export function AddTaskScreen({ navigation }: Props) {
 const { addTask } = useTasksContext();
 const [title, setTitle] = useState('');
 const [minutes, setMinutes] = useState('');
 const [error, setError] = useState<string | null>(null);

 const handleSave = async () => {
  // Ambos validadores devuelven null cuando todo está bien, por eso sirve el ??.
  const validationError =
   validateTaskTitle(title) ?? validateReminderMinutes(minutes);
  if (validationError) {
   setError(validationError);
   return;
  }
  const reminderAt = minutes.trim()
   ? Date.now() + Number(minutes) * 60 * 1000
   : undefined;
  await addTask(title, reminderAt);
  navigation.goBack();
 };

 return (
  <View style={styles.container}>
   <TextInput
    style={styles.input}
    placeholder="Título de la tarea"
    value={title}
    onChangeText={setTitle}
   />
   <TextInput
    style={styles.input}
    placeholder="Recordarme en (minutos, opcional)"
    keyboardType="numeric"
    value={minutes}
    onChangeText={setMinutes}
   />
   {error && <Text style={styles.error}>{error}</Text>}
   <PrimaryButton title="Guardar" onPress={handleSave} />
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  padding: 16,
  backgroundColor: '#f0f0f5',
 },
 input: {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
 },
 error: {
  color: '#c0392b',
  marginBottom: 12,
 }
});