export const theme = {
  colors: {
    background: '#EFE6D5',
    primary: '#7ED957',
    secondary: '#5DA5DB',
    accent: '#F2A65A',
    terracotta: '#C1604A',
    darkGreen: '#4A7C24',
    darkBlue: '#3A7CA5',
    brown: '#5D4037',
    text: {
      primary: '#2C1810',
      secondary: '#5D4037',
      light: '#8D7B68'
    }
  },
  shadows: {
    sm: '0 2px 8px rgba(92, 64, 55, 0.1)',
    md: '0 4px 16px rgba(92, 64, 55, 0.15)',
    lg: '0 8px 32px rgba(92, 64, 55, 0.2)',
    xl: '0 12px 48px rgba(92, 64, 55, 0.25)'
  },
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms'
  }
}

export const seasonColors = {
  spring: { 
    bg: '#FFB7D5', 
    active: '#FF69B4', 
    text: '#8B0045',
    emoji: '🌸'
  },
  summer: { 
    bg: '#7ED957', 
    active: '#4CAF50', 
    text: '#1B5E20',
    emoji: '☀️'
  },
  fall: { 
    bg: '#FF8C42', 
    active: '#F4511E', 
    text: '#651D00',
    emoji: '🍂'
  },
  winter: { 
    bg: '#8D6E63', 
    active: '#5D4037', 
    text: '#3E2723',
    emoji: '❄️'
  }
} as const

