export const spacing = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const shadows = {
    soft: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    medium: {
        shadowColor: "#0984E3",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    }
};

export const lightTheme = {
    dark: false,
    colors: {
        background: '#F5F7FA',
        card: '#FFFFFF',
        text: '#2D3436',
        subtext: '#636E72',
        primary: '#0984E3',
        secondary: '#00CEC9',
        success: '#00B894',
        error: '#FF7675',
        warning: '#FDCB6E',
        border: '#DFE6E9',
        shadow: '#B2BEC3',
        notification: '#FF7675', // For badges etc
    }
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#1e1e1e',
        card: '#2d2d2d',
        text: '#ffffff',
        subtext: '#b3b3b3',
        primary: '#4fa3e3', // Slightly lighter blue for dark mode
        secondary: '#00CEC9',
        success: '#00B894',
        error: '#FF7675',
        warning: '#FDCB6E',
        border: '#444444',
        shadow: '#000000',
        notification: '#FF7675',
    }
};

// Default export for backward compatibility initially, but should be replaced by usage of useTheme
export const colors = lightTheme.colors;
