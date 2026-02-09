import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Professional Blue
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f4f6f8', // Light gray background for contrast
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h6: {
            fontWeight: 500,
            fontSize: '1.25rem',
        },
    },
    components: {
        MuiToolbar: {
            styleOverrides: {
                regular: {
                    minHeight: '48px', // Compact header height
                    '@media (min-width: 600px)': {
                        minHeight: '48px',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '4px 12px', // Tighter button padding
                },
            },
            defaultProps: {
                size: 'small',
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                variant: 'outlined',
                margin: 'dense', // Default to dense margin
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingTop: '16px', // Reduced top padding
                    paddingBottom: '16px',
                }
            }
        }
    },
});

export default theme;
