import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [theme, setTheme] = useState('light');

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const selectMood = (mood) => {
    setCurrentMood(mood);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{ user, login, currentMood, selectMood, currentPlaylist, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}