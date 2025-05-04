export const colors = {
  primary: '#3B82F6', // Blue
  secondary: '#6366F1', // Indigo
  accent: '#F97316', // Orange
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#0EA5E9', // Light Blue
  
  background: '#F9FAFB', // Very light gray
  card: '#FFFFFF', // White
  cardAlt: '#F3F4F6', // Light gray
  border: '#E5E7EB', // Gray
  
  white: '#FFFFFF',
  black: '#000000',
  
  text: {
    primary: '#1F2937', // Very dark gray
    secondary: '#6B7280', // Medium gray
    disabled: '#9CA3AF', // Gray
    inverse: '#FFFFFF', // White
  },
};

export const spacing = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

export const typography = {
  h1: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 28,
    color: colors.text.primary,
  },
  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    color: colors.text.primary,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: colors.text.primary,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
  },
  bodyBold: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  buttonSmall: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
};