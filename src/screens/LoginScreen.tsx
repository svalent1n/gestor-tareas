import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/**
 * Pantalla de acceso. Si las credenciales son válidas, el navegador reacciona
 * al cambio de sesión y muestra la app; esta pantalla no navega por su cuenta.
 */
export function LoginScreen({ navigation }: Props) {
 const { login } = useAuth();
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);

 const handleLogin = async () => {
  const loginError = await login(username, password);
  if (loginError) {
   setError(loginError);
  }
 };

 return (
  <View style={styles.container}>
   <Text style={styles.title}>Iniciar sesión</Text>
   <TextInput
    style={styles.input}
    placeholder="Usuario"
    autoCapitalize="none"
    autoCorrect={false}
    value={username}
    onChangeText={setUsername}
   />
   <TextInput
    style={styles.input}
    placeholder="Contraseña"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
   />
   {error && <Text style={styles.error}>{error}</Text>}
   <PrimaryButton title="Ingresar" onPress={handleLogin} />
   <TouchableOpacity onPress={() => navigation.navigate('Register')}>
    <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
   </TouchableOpacity>
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  padding: 16,
  backgroundColor: '#f0f0f5',
 },
 title: {
  fontSize: 24,
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: 24,
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
 },
 link: {
  color: '#2980b9',
  textAlign: 'center',
  marginTop: 16,
 },
});