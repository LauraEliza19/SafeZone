import { MD3LightTheme } from 'react-native-paper';

export const CORES = {
  primaria: '#F8FAFC',
  secundaria: '#3B82F6',
  destaque: '#10B981',
  fundo: '#111827',
  textoPrincipal: '#1F2937',
  textoSecundario: '#6B7280',
};

export const tema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CORES.primaria,
    secondary: CORES.secundaria,
    tertiary: CORES.destaque,
    background: CORES.fundo,
    surface: '#FFFFFF',
    onSurface: CORES.textoPrincipal,
    onBackground: CORES.textoPrincipal,
  },
};

export const segmentedTheme = {
  colors: {
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: CORES.fundo,
  },
};
