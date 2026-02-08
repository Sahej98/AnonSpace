import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('anonTheme') || 'dark',
  );
  const [font, setFont] = useState(
    () => localStorage.getItem('anonFont') || 'inter',
  );
  const [fontSize, setFontSize] = useState(
    () => parseFloat(localStorage.getItem('anonFontSize')) || 1,
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
    document.documentElement.style.setProperty('--font-scale', fontSize);

    localStorage.setItem('anonTheme', theme);
    localStorage.setItem('anonFont', font);
    localStorage.setItem('anonFontSize', fontSize);
  }, [theme, font, fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeTheme = (newTheme) => setTheme(newTheme);
  const changeFont = (newFont) => setFont(newFont);
  const changeFontSize = (newSize) => setFontSize(newSize);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        font,
        fontSize,
        toggleTheme,
        changeTheme,
        changeFont,
        changeFontSize,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
