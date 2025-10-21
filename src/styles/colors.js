// AlingUP Liquid Glass Design System
export const alingupColors = {
  // Glass effect colors with transparency
  glass: {
    primary: 'rgba(147, 51, 234, 0.1)',
    secondary: 'rgba(14, 165, 233, 0.1)',
    surface: 'rgba(255, 255, 255, 0.1)',
    surfaceDark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    borderDark: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Primary brand colors with glass variants
  primary: {
    purple: {
      50: '#faf7ff',
      100: '#f4f0ff',
      200: '#e9e1ff',
      300: '#d6c7ff',
      400: '#b89fff',
      500: '#9333ea',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      glass: 'rgba(147, 51, 234, 0.15)',
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
      glass: 'rgba(14, 165, 233, 0.15)',
    }
  },
  
  // Liquid Glass gradients
  gradients: {
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    glassHover: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
    primary: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(14, 165, 233, 0.8) 100%)',
    primaryGlass: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundLight: 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 100%)',
  },
  
  // Semantic colors with glass variants
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      glass: 'rgba(34, 197, 94, 0.1)',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      glass: 'rgba(245, 158, 11, 0.1)',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      glass: 'rgba(239, 68, 68, 0.1)',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      glass: 'rgba(59, 130, 246, 0.1)',
    }
  }
};

// CSS custom properties for Liquid Glass theming
export const cssVariables = `
  :root {
    /* Glass effect variables */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-bg-hover: rgba(255, 255, 255, 0.15);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
    --glass-shadow-hover: 0 12px 40px rgba(31, 38, 135, 0.5);
    
    /* Backdrop blur values */
    --blur-sm: blur(4px);
    --blur-md: blur(8px);
    --blur-lg: blur(16px);
    --blur-xl: blur(24px);
    
    /* Brand colors */
    --alingup-purple-50: 250 247 255;
    --alingup-purple-100: 244 240 255;
    --alingup-purple-200: 233 225 255;
    --alingup-purple-300: 214 199 255;
    --alingup-purple-400: 184 159 255;
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