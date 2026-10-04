import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface PrimaryButtonProps {
 title: string;
 onPress: () => void;
}

/**
 * Botón de acción principal. Centraliza el estilo para que todas las
 * pantallas se vean igual y cambiarlo sea tocar un solo archivo.
 */
export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
 return (
  <TouchableOpacity style={styles.button} onPress={onPress}>
   <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
 );
}

const styles = StyleSheet.create({
 button: {
  backgroundColor: '#2980b9',
  borderRadius: 8,
  padding: 14,
  alignItems: 'center',
 },
 text: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
 },
});