/**
 * Theme configuration for K12 ERP
 * Centralized color and styling configuration
 */

export const theme = {
    colors: {
        accent: {
            // Blue color palette - easily configurable
            50: '#EFF6FF',   // lightest
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',  // main blue
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',  // darkest
            950: '#172554',  // very dark
        },
        semantic: {
            primary: '#3B82F6',      // accent-500
            primaryHover: '#2563EB', // accent-600
            primaryLight: '#DBEAFE', // accent-100
            primaryDark: '#1D4ED8',  // accent-700
        }
    },

    // Spacing and sizing
    spacing: {
        containerPadding: '1rem',
        inputHeight: '2.75rem',
        buttonHeight: '2.75rem',
        borderRadius: '0.5rem',
    },

    // Typography
    typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
        }
    },

    // Animation and transitions
    animation: {
        transition: '0.2s ease-in-out',
        duration: {
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
        }
    }
} as const;

// Helper function to get CSS variable format
export const cssVar = (colorPath: string): string => {
    return `rgb(var(--${colorPath.replace('.', '-')}) / <alpha-value>)`;
};

// Theme utilities
export const getAccentColor = (shade: keyof typeof theme.colors.accent = 500) => {
    return theme.colors.accent[shade];
};

export const getPrimaryColor = (variant: keyof typeof theme.colors.semantic = 'primary') => {
    return theme.colors.semantic[variant];
};

export type Theme = typeof theme;
export type AccentShade = keyof typeof theme.colors.accent;
export type SemanticColor = keyof typeof theme.colors.semantic;