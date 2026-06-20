import { useNavigate, useLocation } from "react-router-dom"; // <-- AGGIUNTO useLocation
import { useContext, useState, useEffect } from "react";     // <-- AGGIUNTO useEffect
import { AppContext } from "../App";
import { 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Link, 
  Box, 
  Stack, 
  Alert, 
  CircularProgress,
  Container 
} from '@mui/material';
import axios from 'axios';

export const Login = () => {
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation(); // <-- Inizializziamo lo stato della navigazione attuale

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // NUOVO: Stato per gestire l'avviso di password modificata con successo
  const [successMsg, setSuccessMsg] = useState("");

  const [isAccountInactive, setIsAccountInactive] = useState(false);

  // --- NUOVO: INTERCETTAZIONE DEL REFRESH E REINDERIZZAMENTO DA CAMBIO PASSWORD ---
  useEffect(() => {
    if (location.state?.passwordChangedSuccess) {

      console.log("password changed ok");

      setSuccessMsg("Password updated successfully! Please log in again with your new credentials.");
      
      // Puliamo lo stato della cronologia per evitare che l'alert rimanga fisso facendo F5 sulla pagina
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleEmailBlur = () => {
    if (!loginEmail) {
      setEmailError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setEmailError("Please enter a valid email address");
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError("Password is required");
    }
  };

  const doSignIn = async () => {
    setLoading(true);
    setLoginError("");
    setIsAccountInactive(false); 
    const loginRequest = {
      email: loginEmail,
      password: password
    };

    axios.post("http://localhost:8081/api/v1/auth/login", loginRequest)
      .then((response: any) => {
        setLoading(false);

        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        let userData = {
          jwtToken: response.data.token 
        };

        setUserData(userData);
        navigate("/etf"); 
      })
      .catch((error: any) => {
        setLoading(false);
        console.error("Login error:", error);

        if (error.response) {
          if (error.response.status === 403) {
            setIsAccountInactive(true);
            const backendMessage = error.response.data && typeof error.response.data === 'string'
              ? error.response.data
              : error.response.data?.message || "Account is not activated";
            setLoginError(backendMessage);
          } else {
            const backendMessage = typeof error.response.data === 'string' 
              ? error.response.data 
              : error.response.data?.message || "Invalid email or password.";
            setLoginError(backendMessage);
          }
        } else {
          setLoginError("Server communication error.");
        }
      });
  };

  const signIn = () => {
    let hasError = false;

    if (!loginEmail) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (!hasError) {
      doSignIn();
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* --- NUOVO: MOSTRA IL POPUP DI SUCCESSO DEL CAMBIO PASSWORD --- */}
        {successMsg && (
          <Stack sx={{ width: '100%', mb: 2 }}>
            <Alert severity="success" onClose={() => setSuccessMsg("")}>
              {successMsg}
            </Alert>
          </Stack>
        )}

        {loginError && (
          <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
            {isAccountInactive ? (
              <Alert severity='warning' onClose={() => { setLoginError(""); setIsAccountInactive(false); }}>
                {loginError}.{" "}
                <Link 
                  component="button" 
                  type="button" 
                  onClick={() => {
                    setUserData({ email: loginEmail, isFromLogin: true });
                    navigate("/activation");
                  }} 
                  sx={{ fontWeight: 'bold', color: 'warning.dark', textDecoration: 'underline', verticalAlign: 'baseline' }}
                >
                  Verify your account here
                </Link>
              </Alert>
            ) : (
              <Alert severity='error' onClose={() => setLoginError("")}>
                {loginError}
              </Alert>
            )}
          </Stack>
        )}

        <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
            Sign In
          </Typography>
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onBlur={handleEmailBlur}
              onFocus={() => {
                setEmailError("");
                setSuccessMsg(""); // Puliamo il messaggio se l'utente inizia a digitare
              }} 
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              onFocus={() => {
                setPasswordError("");
                setSuccessMsg(""); // Puliamo il messaggio se l'utente inizia a digitare
              }}
              error={!!passwordError}
              helperText={passwordError}
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2, p: 1.2, fontWeight: 'bold' }}
              onClick={signIn}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link 
                  component="button" 
                  type="button" 
                  onClick={() => navigate("/registration")} 
                  sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};