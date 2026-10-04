import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
 ActivityIndicator,
 FlatList,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { TaskItem } from '../components/TaskItem';
import { useAuth } from '../context/AuthContext';
import { useTasksContext } from '../context/TasksContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/**
 * Pantalla principal: saluda al usuario, lista sus tareas y permite crear otra
 * o cerrar la sesión.
 */
export function HomeScreen({ navigation }: Props) {
 const { currentUser, logout } = useAuth();
 const { tasks, loading, error, deleteTask, toggleTask } = useTasksContext();

 if (loading) {
  return (
   <View style={styles.center}>
    <ActivityIndicator size="large" />
   </View>
  );
 }

 return (
  <SafeAreaView style={styles.container} edges={['bottom']}>
   <View style={styles.userBar}>
    <Text style={styles.userText}>Hola, {currentUser}</Text>
    <TouchableOpacity onPress={logout}>
     <Text style={styles.logout}>Cerrar sesión</Text>
    </TouchableOpacity>
   </View>
   {error && <Text style={styles.error}>{error}</Text>}
   <FlatList
    style={styles.list}
    data={tasks}
    keyExtractor={(task) => task.id}
    renderItem={({ item }) => (
     <TaskItem task={item} onToggle={toggleTask} onDelete={deleteTask} />
    )}
    ListEmptyComponent={
     <Text style={styles.empty}>Todavía no hay tareas.</Text>
    }
   />
   <PrimaryButton
    title="Nueva tarea"
    onPress={() => navigation.navigate('AddTask')}
   />
  </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 center: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
 container: {
  flex: 1,
  padding: 16,
  backgroundColor: '#f0f0f5',
 },
 userBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
 },
 userText: {
  fontSize: 16,
  fontWeight: '600',
 },
 logout: {
  color: '#c0392b',
 },
 list: {
  flex: 1,
 },
 error: {
  color: '#c0392b',
  marginBottom: 8,
 },
 empty: {
  textAlign: 'center',
  color: '#777',
  marginTop: 32,
 },
});