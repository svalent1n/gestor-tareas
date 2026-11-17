import { Alert, Linking } from 'react-native';
import { ensurePermission } from '../permissions';

describe('ensurePermission', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve "granted" y no muestra ningún aviso si el permiso fue concedido', async () => {
    const request = jest
      .fn()
      .mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true });

    const result = await ensurePermission(request, 'la cámara');

    expect(result).toBe('granted');
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('devuelve "denied" y avisa con un mensaje que nombra el recurso', async () => {
    const request = jest
      .fn()
      .mockResolvedValue({ status: 'denied', granted: false, canAskAgain: true });

    const result = await ensurePermission(request, 'la cámara');

    expect(result).toBe('denied');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message] = alertSpy.mock.calls[0];
    expect(title).toBe('Permiso denegado');
    expect(message).toContain('la cámara');
  });

  it('ofrece abrir los ajustes cuando el sistema ya no deja volver a preguntar', async () => {
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue(undefined);
    const request = jest
      .fn()
      .mockResolvedValue({ status: 'denied', granted: false, canAskAgain: false });

    await ensurePermission(request, 'la ubicación');

    const buttons = alertSpy.mock.calls[0][2];
    const settingsButton = buttons.find(
      (button: { text: string }) => button.text === 'Abrir ajustes',
    );
    expect(settingsButton).toBeDefined();
    settingsButton.onPress();
    expect(openSettings).toHaveBeenCalled();
  });

  it('devuelve "undetermined" sin avisar si el usuario todavía no respondió', async () => {
    const request = jest.fn().mockResolvedValue({
      status: 'undetermined',
      granted: false,
      canAskAgain: true,
    });

    const result = await ensurePermission(request, 'los contactos');

    expect(result).toBe('undetermined');
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
