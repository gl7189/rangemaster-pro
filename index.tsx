
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent to uniwersalny sposób rejestracji głównego komponentu.
// Expo automatycznie mapuje go na odpowiedni kontener (np. 'root' w przeglądarce
// lub widok natywny na telefonie).
registerRootComponent(App);
