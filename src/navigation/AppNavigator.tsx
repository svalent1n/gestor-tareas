import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Define las pantallas de la app según haya o no una sesión abierta.
 * Las pantallas de la app no están registradas sin sesión, por lo que
 * no se puede llegar a ellas ni con el botón "atrás".
 */
export function AppNavigator() {
 const { currentUser, loading } = useAuth();

 // Evita mostrar el Login un instante a quien ya tiene sesión guardada.
 if (loading) {
  return (
   <View style={styles.center}>
    <ActivityIndicator size="large" />
   </View>
  );
 }

 return (
  <NavigationContainer>
   <Stack.Navigator>
    {currentUser ? (
     <>
      <Stack.Screen
       name="Home"
       component={HomeScreen}
       options={{ title: 'Mis tareas' }}
      />
      <Stack.Screen
       name="AddTask"
       component={AddTaskScreen}
       options={{ title: 'Nueva tarea' }}
      />
     </>
    ) : (
     <>
      <Stack.Screen
       name="Login"
       component={LoginScreen}
       options={{ title: 'Iniciar sesión' }}
      />
      <Stack.Screen
       name="Register"
       component={RegisterScreen}
       options={{ title: 'Crear cuenta' }}
      />
     </>
    )}
   </Stack.Navigator>
  </NavigationContainer>
 );
}

const styles = StyleSheet.create({
 center: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
});