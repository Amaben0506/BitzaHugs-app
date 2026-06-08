import React, { createContext, useContext } from "react";

const lightTheme = {
  isDark: false,
  background: "#FFF9F2",
  card: "#FFFFFF",
  cardShadowColor: "#BFA99D",
  cardShadowOpacity: 0.06,
  textPrimary: "#2B2463",
  textSecondary: "#5B5672",
  textMuted: "#837E96",
  textPlaceholder: "#B0A8C8",
  accent: "#7548D8",
  accentLight: "#F0E2FF",
  accentBorder: "#E3D2F8",
  border: "#EFE4DC",
  inputBg: "#F6ECFF",
};

const ThemeContext = createContext(lightTheme);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
