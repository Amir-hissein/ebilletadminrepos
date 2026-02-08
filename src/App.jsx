import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Router from './Router';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
