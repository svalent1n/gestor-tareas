import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { TasksProvider } from './src/context/TasksContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
 return (
  <AuthProvider>
   <TasksProvider>
    <AppNavigator />
    <StatusBar style="auto" />
   </TasksProvider>
  </AuthProvider>
 );
}