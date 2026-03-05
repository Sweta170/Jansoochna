import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <SocketProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SocketProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
