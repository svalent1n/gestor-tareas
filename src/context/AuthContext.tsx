import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { userRepository } from '../storage/userRepository';
import { validatePassword, validateUsername } from '../utils/validators';

interface AuthContextValue {
 currentUser: string | null;
 loading: boolean;
 register: (username: string, password: string) => Promise<string | null>;
 login: (username: string, password: string) => Promise<string | null>;
 logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Comparte con toda la app quién tiene la sesión abierta y las acciones
 * para registrarse, entrar y salir.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
 const [currentUser, setCurrentUser] = useState<string | null>(null);
 // Arranca en true: hasta leer la sesión guardada no sabemos si hay alguien adentro.
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const restoreSession = async () => {
   try {
    setCurrentUser(await userRepository.getSession());
   } catch {
    // Si no se puede leer la sesión, se trata como si no hubiera ninguna.
    setCurrentUser(null);
   } finally {
    setLoading(false);
   }
  };
  restoreSession();
 }, []);

 /** Registra un usuario nuevo. Devuelve un mensaje de error o null si salió bien. */
 const register = async (username: string, password: string) => {
  const validationError =
   validateUsername(username) ?? validatePassword(password);
  if (validationError) {
   return validationError;
  }

  const name = username.trim();
  const users = await userRepository.getAll();
  // Se compara sin distinguir mayúsculas: "Ana" y "ana" serían confusos como cuentas distintas.
  const exists = users.some(
   (user) => user.username.toLowerCase() === name.toLowerCase(),
  );
  if (exists) {
   return 'Ese usuario ya está registrado.';
  }

  await userRepository.saveAll([...users, { username: name, password }]);
  return null;
 };

 /** Inicia sesión si las credenciales coinciden. Devuelve un error o null. */
 const login = async (username: string, password: string) => {
  const name = username.trim();
  const users = await userRepository.getAll();
  const match = users.find(
   (user) =>
    user.username.toLowerCase() === name.toLowerCase() &&
    user.password === password,
  );
  // Mensaje único para ambos casos: no revela cuál de los dos datos falló.
  if (!match) {
   return 'Usuario o contraseña incorrectos.';
  }

  await userRepository.saveSession(match.username);
  setCurrentUser(match.username);
  return null;
 };

 /** Cierra la sesión actual. */
 const logout = async () => {
  await userRepository.clearSession();
  setCurrentUser(null);
 };

 return (
  <AuthContext.Provider
   value={{ currentUser, loading, register, login, logout }}
  >
   {children}
  </AuthContext.Provider>
 );
}

/**
 * Da acceso al estado de autenticación compartido.
 * Falla con un mensaje claro si se usa fuera de un AuthProvider.
 */
export function useAuth(): AuthContextValue {
 const context = useContext(AuthContext);
 if (!context) {
  throw new Error('useAuth debe usarse dentro de un AuthProvider.');
 }
 return context;
}