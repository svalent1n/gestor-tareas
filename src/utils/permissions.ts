import { Alert, Linking } from 'react-native';

/** Los tres estados posibles de un permiso. */
export type PermissionResult = 'granted' | 'denied' | 'undetermined';

// Forma común de la respuesta de todos los módulos de Expo al pedir un permiso.
interface PermissionResponseLike {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Pide un permiso y devuelve su estado. Si fue denegado muestra un aviso claro;
 * cuando el sistema ya no deja volver a preguntar, ofrece abrir los ajustes.
 *
 * @param request función del módulo de Expo que pide el permiso.
 * @param resource nombre del recurso para el mensaje, por ejemplo "la cámara".
 */
export async function ensurePermission(
  request: () => Promise<PermissionResponseLike>,
  resource: string,
): Promise<PermissionResult> {
  const response = await request();

  if (response.granted) {
    return 'granted';
  }
  if (response.status === 'undetermined') {
    return 'undetermined';
  }

  if (response.canAskAgain) {
    Alert.alert(
      'Permiso denegado',
      `Sin permiso no se puede usar ${resource}. Puedes volver a intentarlo cuando quieras.`,
    );
  } else {
    Alert.alert(
      'Permiso denegado',
      `Sin permiso no se puede usar ${resource}. Actívalo desde los ajustes de la aplicación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
      ],
    );
  }
  return 'denied';
}
