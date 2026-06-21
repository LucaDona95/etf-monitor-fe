import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1366ff',       // Il blu classico di Yahoo Finance per azioni e bottoni
      light: '#4d8cff',
      dark: '#0046c7',
    },
    secondary: {
      main: '#00b074',       // Il verde tipico delle quotazioni positive su Yahoo Finance
    },
    error: {
      main: '#ff334b',       // Il rosso tipico delle quotazioni negative o cancellazioni
    },
    background: {
      default: '#0f1115',    // Sfondo principale: Grigio/Blu notte morbidissimo (addio nero assoluto)
      paper: '#1d222c',      // Sfondo elementi (Navbar, Tabelle, Card): Più chiaro per dare profondità
    },
    text: {
      primary: '#f5f7fa',    // Testo principale: Bianco ghiaccio molto morbido che non stanca gli occhi
      secondary: '#95a1bb',  // Testo secondario: Grigio azzurrato che richiama i contorni
    },
    divider: '#303b4e',      // Bordi e linee: Un grigio-azzurro chiaro e visibile per staccare le righe
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    // Rendiamo i bordi dei campi di testo, delle tabelle e dei dialog staccati ed eleganti
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Ottimizzazione scrollbar per farla integrare con il tema Yahoo Finance
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: '#0f1115' },
          '&::-webkit-scrollbar-thumb': { background: '#303b4e', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#45546f' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #303b4e', // Linea sottile chiara sotto la navbar
          boxShadow: 'none',                  // Via le ombre finte, usiamo i bordi reali
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #252f3f', // Bordi chiari ma discreti tra le righe degli ETF
          padding: '12px 16px',
        },
        head: {
          backgroundColor: '#161b22',        // Intestazione tabella leggermente scura stile Yahoo Options
          color: '#95a1bb',                  // Testo dell'header meno marcato
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.8px',
          borderBottom: '2px solid #303b4e', // Linea di stacco dell'header più marcata
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid #303b4e',       // Contorno della tabella chiaro e definito
          borderRadius: 8,
          backgroundColor: '#1d222c',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1d222c',
          border: '1px solid #45546f',       // Contorno della Dialog decisamente più chiaro
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Gestione dei bordi dei TextField e delle Select quando non sono cliccati
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#303b4e',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4d8cff',          // Illumina il bordo al passaggio del mouse
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});