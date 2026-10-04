import { fireEvent, render, screen } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
 it('muestra el título recibido', async () => {
  await render(<PrimaryButton title="Guardar" onPress={jest.fn()} />);

  expect(screen.getByText('Guardar')).toBeTruthy();
 });

 it('llama a onPress al tocarlo', async () => {
  const onPress = jest.fn();
  await render(<PrimaryButton title="Guardar" onPress={onPress} />);

  await fireEvent.press(screen.getByText('Guardar'));

  expect(onPress).toHaveBeenCalledTimes(1);
 });
});