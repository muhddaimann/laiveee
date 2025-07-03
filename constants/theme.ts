import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { LightColors, DarkColors } from './color';

export const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightColors,
  },
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkColors,
  },
};
