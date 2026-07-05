export { Colors } from './colors';

export const Fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

export const Type = {
  hero:      { fontFamily: Fonts.extrabold, fontSize: 28, lineHeight: 34 },
  title:     { fontFamily: Fonts.bold,      fontSize: 22, lineHeight: 28 },
  heading:   { fontFamily: Fonts.bold,      fontSize: 17, lineHeight: 23 },
  cardTitle: { fontFamily: Fonts.semibold,  fontSize: 14, lineHeight: 19 },
  body:      { fontFamily: Fonts.regular,   fontSize: 14, lineHeight: 21 },
  bodySmall: { fontFamily: Fonts.regular,   fontSize: 12.5, lineHeight: 18 },
  caption:   { fontFamily: Fonts.medium,    fontSize: 11, lineHeight: 15 },
  overline:  { fontFamily: Fonts.bold,      fontSize: 10.5, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  button:    { fontFamily: Fonts.bold,      fontSize: 15, lineHeight: 20 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  raised: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
  button: {
    shadowColor: '#9B7ACC',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
};
