import { useNavigate } from "react-router-dom";
import { 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Box, 
  Stack, 
  Alert, 
  CircularProgress,
  Container,
  Link
} from '@mui/material';
import axios from 'axios';
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../App"; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const Activation = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContext);

  const emailFromContext = userData?.email || "";
  const isFromLogin = userData?.isFromLogin || false; 

  const [email, setEmail] = useState(emailFromContext);
  const [activationCode, setActivationCode] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  const [loading, setLoading] = useState(false);
  const [activationCompleted, setActivationCompleted] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (emailFromContext) {
      setEmail(emailFromContext);
    }
  }, [emailFromContext]);

  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is not valid");
    }
  };

  const handleCodeBlur = () => {
    if (!activationCode) {
      setCodeError("Confirmation code is required");
    } else if (activationCode.length !== 6) {
      setCodeError("Confirmation code must be 6 characters long");
    }
  };

 
  const handleResendCode = () => {
    if (!email) {
      setEmailError("Email is required to request a new code");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is not valid");
      return;
    }

    setLoading(true);
    setGlobalError("");
    setResendSuccess("");

    axios.post("http://localhost:8081/api/v1/auth/resend-activation", { email: email })
      .then((response: any) => {
        setLoading(false);
        
       
        setResendSuccess("If the email address exists in our system, you will receive a new activation code shortly.");
        
      
        
        if (emailFromContext && isFromLogin) {
          setUserData({ email: email, isFromLogin: false });
        }
      })
      .catch((error: any) => {
        setLoading(false);
        if (error.response && error.response.data) {
          const backendMessage = typeof error.response.data === 'string'
            ? error.response.data
            : error.response.data.message || "Error resending activation code.";
          setGlobalError(backendMessage);
        } else {
          setGlobalError("Server error during code request. Please try again.");
        }
      });
  };

  const handleActivate = () => {
    let hasError = false;

    if (!email) { setEmailError("Email is required"); hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Email is not valid"); hasError = true; }

    if (!activationCode) { setCodeError("Confirmation code is required"); hasError = true; }
    else if (activationCode.length !== 6) { setCodeError("Confirmation code must be 6 characters long"); hasError = true; }

    if (hasError) {
      setGlobalError("Please fix the errors in the form before submitting.");
      return;
    }
    
    doActivation();
  };

  const doActivation = () => {
    setLoading(true);
    setGlobalError("");
    setResendSuccess("");

    const activationRequest = {
      code: activationCode,
      email: email
    };

    axios.post("http://localhost:8081/api/v1/auth/activate", activationRequest)
      .then((response: any) => {
        setActivationCompleted(true);
        setLoading(false);
        setUserData(null); 
      })
      .catch((error: any) => {
        setLoading(false);
        if (error.response && error.response.data) {
          const backendMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : error.response.data.message || "Invalid code or email.";
          setGlobalError(backendMessage);
        } else {
          setGlobalError("Server communication error. Please try again later.");
        }
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {!activationCompleted ? (
          <>
            {globalError && (
              <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
                <Alert severity='error' onClose={() => setGlobalError("")}>
                  {globalError}
                </Alert>
              </Stack>
            )}

            {resendSuccess && (
              <Stack sx={{ width: '100%', mb: 2 }} spacing={2}>
                <Alert severity='success' onClose={() => setResendSuccess("")}>
                  {resendSuccess}
                </Alert>
              </Stack>
            )}

            <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
              <Typography component="h1" variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
                Activate Account
              </Typography>
              
              <Box component="form" noValidate sx={{ mt: 1 }}>
                
                {emailFromContext ? (
                  isFromLogin ? (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'action.selected', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Account activation required for:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
                        {email}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth 
                        disabled={loading}
                        onClick={handleResendCode}
                      >
                        Request Activation Code
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'action.selected', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        We sent a 6-character code to:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {email}
                      </Typography>
                    </Box>
                  )
                ) : (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    onFocus={() => setEmailError("")}
                    error={!!emailError}
                    helperText={emailError}
                    disabled={loading}
                  />
                )}
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Activation Code"
                  placeholder="6-character code"
                  autoFocus={!!emailFromContext && !isFromLogin} 
                  inputProps={{ maxLength: 6 }}
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  onBlur={handleCodeBlur}
                  onFocus={() => setCodeError("")}
                  error={!!codeError}
                  helperText={codeError}
                  disabled={loading || (isFromLogin && !resendSuccess)}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading || (isFromLogin && !resendSuccess)}
                  sx={{ mt: 3, mb: 2, p: 1.2, fontWeight: 'bold' }}
                  onClick={handleActivate}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Verify Account"}
                </Button>

                {!emailFromContext && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      disabled={loading}
                      onClick={handleResendCode}
                      sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      Didn't receive the code? Resend email
                    </Link>
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        ) : (
          <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Account Activated!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Il tuo account è stato attivato con successo. Adesso puoi effettuare l'accesso con le tue credenziali.
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