import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

/**
 * Pantalla de registro. Al crear la cuenta vuelve al Login, donde la persona
 * inicia sesión con los datos recién registrados.
 */
export function RegisterScreen({ navigation }: Props) {
 const { register } = useAuth();
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);

 const handleRegister = async () => {
  const registerError = await register(username, password);
  if (registerError) {
   setError(registerError);
   return;
  }
  Alert.alert('Registro exitoso', 'Ya puedes iniciar sesión.', [
   { text: 'Aceptar', onPress: () => navigation.navigate('Login') },
  ]);
 };

 return (
  <View style={styles.container}>
   <Text style={styles.title}>Crear cuenta</Text>
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
   <PrimaryButton title="Registrarme" onPress={handleRegister} />
   <TouchableOpacity onPress={() => navigation.navigate('Login')}>
    <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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