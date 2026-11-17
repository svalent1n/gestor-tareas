import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Calendar from 'expo-calendar/legacy';
import * as Contacts from 'expo-contacts/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { useTasksStore } from '../store/tasksStore';
import { TaskContact, TaskLocation } from '../types';
import { ensurePermission } from '../utils/permissions';
import { validateReminderMinutes, validateTaskTitle } from '../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

const ONE_HOUR_MS = 60 * 60 * 1000;

// Busca un calendario del dispositivo en el que se puedan crear eventos.
async function findWritableCalendarId(): Promise<string | undefined> {
  if (Platform.OS === 'ios') {
    return (await Calendar.getDefaultCalendarAsync()).id;
  }
  // Android no tiene "calendario por defecto": se elige uno que permita escribir.
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  return (writable.find((calendar) => calendar.isPrimary) ?? writable[0])?.id;
}

/**
 * Formulario para crear una tarea con título y, opcionalmente, un recordatorio
 * expresado en minutos desde ahora. También permite adjuntar recursos del
 * dispositivo: foto, ubicación, contacto responsable y evento de calendario.
 */
export function AddTaskScreen({ navigation }: Props) {
  const addTask = useTasksStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string>();
  const [location, setLocation] = useState<TaskLocation>();
  const [contact, setContact] = useState<TaskContact>();
  // Id del calendario donde se va a crear el evento al guardar la tarea.
  const [calendarId, setCalendarId] = useState<string>();
  // Nombre del recurso que se está pidiendo (permiso pendiente o dato en camino).
  const [busy, setBusy] = useState<string | null>(null);

  // Ejecuta una acción de adjuntar mostrando el estado "pendiente" mientras dura.
  const runAttach = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    try {
      await action();
    } catch {
      Alert.alert('Error', `No se pudo obtener ${label}.`);
    } finally {
      setBusy(null);
    }
  };

  const handleTakePhoto = () =>
    runAttach('la foto', async () => {
      const permission = await ensurePermission(
        ImagePicker.requestCameraPermissionsAsync,
        'la cámara',
      );
      if (permission !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.5,
      });
      // Si el usuario cerró la cámara sin sacar la foto no hay assets.
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    });

  const handlePickPhoto = () =>
    runAttach('la foto', async () => {
      const permission = await ensurePermission(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        'la galería',
      );
      if (permission !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
      });
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    });

  const handleAttachLocation = () =>
    runAttach('la ubicación', async () => {
      const permission = await ensurePermission(
        Location.requestForegroundPermissionsAsync,
        'la ubicación',
      );
      if (permission !== 'granted') {
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      // La dirección es opcional: si la geocodificación falla quedan las coordenadas.
      let address: string | undefined;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          address = [place.street, place.streetNumber, place.city]
            .filter(Boolean)
            .join(' ');
        }
      } catch {
        // Sin conexión o sin servicio de geocodificación.
      }
      setLocation({ latitude, longitude, address: address || undefined });
    });

  const handlePickContact = () =>
    runAttach('el contacto', async () => {
      const permission = await ensurePermission(
        Contacts.requestPermissionsAsync,
        'los contactos',
      );
      if (permission !== 'granted') {
        return;
      }
      // Devuelve null si el usuario cierra el selector sin elegir.
      const picked = await Contacts.presentContactPickerAsync();
      if (picked) {
        setContact({
          name: picked.name ?? 'Sin nombre',
          phone: picked.phoneNumbers?.[0]?.number,
        });
      }
    });

  const handleToggleCalendar = () => {
    if (calendarId) {
      setCalendarId(undefined);
      return;
    }
    return runAttach('el calendario', async () => {
      const permission = await ensurePermission(
        Calendar.requestCalendarPermissionsAsync,
        'el calendario',
      );
      if (permission !== 'granted') {
        return;
      }
      const id = await findWritableCalendarId();
      if (!id) {
        Alert.alert(
          'Sin calendario',
          'No hay ningún calendario en el dispositivo donde crear eventos.',
        );
        return;
      }
      setCalendarId(id);
    });
  };

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

    // El evento se crea recién al guardar porque necesita el título definitivo.
    // Empieza a la hora del recordatorio (o dentro de una hora) y dura una hora.
    let calendarEventId: string | undefined;
    if (calendarId) {
      try {
        const start = reminderAt ?? Date.now() + ONE_HOUR_MS;
        calendarEventId = await Calendar.createEventAsync(calendarId, {
          title: title.trim(),
          startDate: new Date(start),
          endDate: new Date(start + ONE_HOUR_MS),
        });
      } catch {
        Alert.alert(
          'Error',
          'No se pudo crear el evento. La tarea se guardó sin evento.',
        );
      }
    }

    await addTask({
      title,
      reminderAt,
      photoUri,
      location,
      contact,
      calendarEventId,
    });
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
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

      <TouchableOpacity style={styles.attach} onPress={handleTakePhoto}>
        <Text style={styles.attachText}>Sacar foto</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.attach} onPress={handlePickPhoto}>
        <Text style={styles.attachText}>Elegir foto de la galería</Text>
      </TouchableOpacity>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}

      <TouchableOpacity style={styles.attach} onPress={handleAttachLocation}>
        <Text style={styles.attachText}>Adjuntar ubicación actual</Text>
      </TouchableOpacity>
      {location && (
        <Text style={styles.attached}>
          {location.address ? `${location.address} ` : ''}(
          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
        </Text>
      )}

      <TouchableOpacity style={styles.attach} onPress={handlePickContact}>
        <Text style={styles.attachText}>Elegir responsable</Text>
      </TouchableOpacity>
      {contact && (
        <Text style={styles.attached}>
          Responsable: {contact.name}
          {contact.phone ? ` (${contact.phone})` : ''}
        </Text>
      )}

      <TouchableOpacity style={styles.attach} onPress={handleToggleCalendar}>
        <Text style={styles.attachText}>
          {calendarId ? 'Quitar evento del calendario' : 'Crear evento en el calendario'}
        </Text>
      </TouchableOpacity>
      {calendarId && (
        <Text style={styles.attached}>
          Al guardar se va a crear un evento en el calendario.
        </Text>
      )}

      {busy && <Text style={styles.attached}>Obteniendo {busy}…</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton title="Guardar" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  content: {
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  attach: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2980b9',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  attachText: {
    color: '#2980b9',
    fontSize: 15,
    fontWeight: '600',
  },
  attached: {
    color: '#555',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  error: {
    color: '#c0392b',
    marginBottom: 12,
  },
});
