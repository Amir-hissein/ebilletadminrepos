import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initialiser depuis localStorage ou 'light' par défaut
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('ebillet-theme');
        return saved || 'light';
    });

    // Appliquer le thème au document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('ebillet-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setLightMode = () => setTheme('light');
    const setDarkMode = () => setTheme('dark');

    const value = {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightMode,
        setDarkMode,
        setTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
