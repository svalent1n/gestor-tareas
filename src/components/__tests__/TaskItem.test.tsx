import { render, screen } from '@testing-library/react-native';
import { Task } from '../../types';
import { TaskItem } from '../TaskItem';

const baseTask: Task = { id: '1', title: 'Comprar pan', completed: false };

async function renderItem(task: Task) {
  await render(<TaskItem task={task} onToggle={jest.fn()} onDelete={jest.fn()} />);
}

describe('TaskItem', () => {
  it('no muestra datos adjuntos si la tarea no tiene ninguno', async () => {
    await renderItem(baseTask);

    expect(screen.getByText('Comprar pan')).toBeTruthy();
    expect(screen.queryByText(/Ubicación/)).toBeNull();
    expect(screen.queryByText(/Responsable/)).toBeNull();
    expect(screen.queryByText('Evento en el calendario')).toBeNull();
    expect(screen.queryByLabelText('Foto de la tarea')).toBeNull();
  });

  it('muestra foto, dirección, responsable y evento cuando están adjuntos', async () => {
    await renderItem({
      ...baseTask,
      photoUri: 'file:///foto.jpg',
      location: { latitude: -34.6, longitude: -58.38, address: 'Av. Corrientes 1234' },
      contact: { name: 'Ana Pérez' },
      calendarEventId: 'evento-1',
    });

    expect(screen.getByLabelText('Foto de la tarea')).toBeTruthy();
    expect(screen.getByText('Ubicación: Av. Corrientes 1234')).toBeTruthy();
    expect(screen.getByText('Responsable: Ana Pérez')).toBeTruthy();
    expect(screen.getByText('Evento en el calendario')).toBeTruthy();
  });

  it('muestra las coordenadas cuando no hay dirección', async () => {
    await renderItem({
      ...baseTask,
      location: { latitude: -34.6, longitude: -58.38 },
    });

    expect(screen.getByText('Ubicación: -34.60000, -58.38000')).toBeTruthy();
  });
});
