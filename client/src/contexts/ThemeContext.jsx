import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('anonTheme') || 'dark',
  );
  const [font, setFont] = useState(
    () => localStorage.getItem('anonFont') || 'inter',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem('anonTheme', theme);
    localStorage.setItem('anonFont', font);
  }, [theme, font]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeTheme = (newTheme) => setTheme(newTheme);
  const changeFont = (newFont) => setFont(newFont);

  return (
    <ThemeContext.Provider
      value={{ theme, font, toggleTheme, changeTheme, changeFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
