// AlingUP Brand Colors Configuration
export const alingupColors = {
  // Primary brand colors
  primary: {
    purple: {
      50: '#f8f4ff',
      100: '#f0e8ff',
      200: '#e2d4ff',
      300: '#ccb3ff',
      400: '#b085ff',
      500: '#9333ea',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    indigo: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    }
  },
  
  // Gradient combinations
  gradients: {
    primary: 'from-purple-600 to-indigo-600',
    primaryHover: 'from-purple-700 to-indigo-700',
    background: 'from-purple-600 via-purple-700 to-indigo-800',
    light: 'from-purple-100 to-indigo-100',
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    }
  }
};

// CSS custom properties for dynamic theming
export const cssVariables = `
  :root {
    --alingup-purple-50: 248 244 255;
    --alingup-purple-100: 240 232 255;
    --alingup-purple-200: 226 212 255;
    --alingup-purple-300: 204 179 255;
    --alingup-purple-400: 176 133 255;
    --alingup-purple-500: 147 51 234;
    --alingup-purple-600: 124 58 237;
    --alingup-purple-700: 109 40 217;
    --alingup-purple-800: 91 33 182;
    --alingup-purple-900: 76 29 149;
    
    --alingup-indigo-50: 240 249 255;
    --alingup-indigo-100: 224 242 254;
    --alingup-indigo-200: 186 230 253;
    --alingup-indigo-300: 125 211 252;
    --alingup-indigo-400: 56 189 248;
    --alingup-indigo-500: 14 165 233;
    --alingup-indigo-600: 2 132 199;
    --alingup-indigo-700: 3 105 161;
    --alingup-indigo-800: 7 89 133;
    --alingup-indigo-900: 12 74 110;
  }
`;

export default alingupColors;