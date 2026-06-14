import { useNavigate } from "react-router-dom";
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
import { useState } from "react";

export const Registration = () => {
  const navigate = useNavigate();

  // Stati per i valori dei campi
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");

  // Stati per gli errori (diventano rossi solo onBlur)
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [reEnterPasswordError, setReEnterPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  // --- CONTROLLI ON BLUR (Quando l'utente abbandona il campo) ---
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
    }
  };

  const handleFirstNameBlur = () => {
    if (!firstName) setFirstNameError("First name is required");
  };

  const handleLastNameBlur = () => {
    if (!lastName) setLastNameError("Last name is required");
  };

const handlePasswordBlur = () => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/;

    if (!password) {
      setPasswordError("Password is required");
    } else if (password.length < 8 || password.length > 30) {
      setPasswordError("Password must be between 8 and 30 characters long");
    } else if (!passwordPattern.test(password)) {
      setPasswordError("Password must contain at least one letter, one number, and one special character (@$!%*#?&)");
    } else {
      setPasswordError("");
    }
  };

  const handleReEnterPasswordBlur = () => {
    if (password && reEnterPassword !== password) {
      setReEnterPasswordError("Passwords do not match");
    }
  };

  // --- VALIDAZIONE FINALE AL SUBMIT ---
  const checkRegistration = () => {
    let hasError = false;

    // Forziamo il controllo su tutti i campi come se l'utente li avesse abbandonati tutti
    if (!email) { setEmailError("Email is required"); hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Please enter a valid email address"); hasError = true; }

    if (!firstName) { setFirstNameError("First name is required"); hasError = true; }
    if (!lastName) { setLastNameError("Last name is required"); hasError = true; }
    
    if (!password) { setPasswordError("Password is required"); hasError = true; }
    else if (password.length < 6) { setPasswordError("Password should be at least 6 characters long"); hasError = true; }
    
    if (password !== reEnterPassword) {
      setReEnterPasswordError("Passwords do not match");
      hasError = true;
    }

    if (!hasError) {
      setRegistrationError("");
      doRegistration();
    } else {
      setRegistrationError("Please fix the errors in the form before submitting.");
    }
  };

  const doRegistration = async () => {
    setLoading(true);
    setRegistrationError("");

    const registrationRequest = { firstName, lastName, email, password };

    axios.post("http://localhost:8081/api/v1/auth/register", registrationRequest)
      .then((response: any) => {
        setRegistrationCompleted(true);
        setLoading(false);
      })
      .catch((error: any) => {
        setLoading(false);
        if (error.response && error.response.data) {
          const backendMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : error.response.data.message || "Registration failed.";
          setRegistrationError(backendMessage);
        } else {
          setRegistrationError("Server communication error.");
        }
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {!registrationCompleted ? (
          <>
            {registrationError && (
              <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
                <Alert severity='error' onClose={() => setRegistrationError("")}>
                  {registrationError}
                </Alert>
              </Stack>
            )}

            <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
              <Typography component="h1" variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
                Create account
              </Typography>
              
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal" required fullWidth label="Email Address" autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  onFocus={() => setEmailError("")} // Toglie il rosso appena ci clicca dentro per correggere
                  error={!!emailError}
                  helperText={emailError}
                />
                
                <TextField
                  margin="normal" required fullWidth label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={handleFirstNameBlur}
                  onFocus={() => setFirstNameError("")}
                  error={!!firstNameError}
                  helperText={firstNameError}
                />
                
                <TextField
                  margin="normal" required fullWidth label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={handleLastNameBlur}
                  onFocus={() => setLastNameError("")}
                  error={!!lastNameError}
                  helperText={lastNameError}
                />
                
                <TextField
                  margin="normal" required fullWidth label="Password" type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  onFocus={() => setPasswordError("")}
                  error={!!passwordError}
                  helperText={passwordError}
                />
                
                <TextField
                  margin="normal" required fullWidth label="Re-enter Password" type="password"
                  value={reEnterPassword}
                  onChange={(e) => setReEnterPassword(e.target.value)}
                  onBlur={handleReEnterPasswordBlur}
                  onFocus={() => setReEnterPasswordError("")}
                  error={!!reEnterPasswordError}
                  helperText={reEnterPasswordError}
                />

                <Button
                  fullWidth variant="contained" color="primary" disabled={loading}
                  sx={{ mt: 3, mb: 2, p: 1.2, fontWeight: 'bold' }}
                  onClick={checkRegistration}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link component="button" type="button" onClick={() => navigate("/login")} sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </>
        ) : (
          <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 2, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2, justifyContent: 'center' }}>
              Registration Completed!
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              La registrazione è avvenuta con successo. È stata inviata una mail di conferma all'indirizzo specificato.
            </Typography>
            <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};