import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import axios from "axios";

export const ChangePassword = () => {
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);
  const navigate = useNavigate();

  // Stati del form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stati di gestione UI e errori
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // NUOVO: Stato specifico per l'errore di formato della nuova password
  const [passwordFormatError, setPasswordFormatError] = useState("");

  // Definizione della tua espressione regolare
  // Nota: in JS togliamo il doppio escaping dello slash (\\d diventa \d) rispetto alle stringhe Java/JSON
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,30}$/;

  const forceGlobalLogout = () => {
    setUserData(null);
    localStorage.clear();
    navigate("/login");
  };

  // Protezione della pagina all'avvio (F5)
  useEffect(() => {
    if (!isCheckingAuth && !userData?.jwtToken) {
      forceGlobalLogout();
    }
  }, [isCheckingAuth, userData]);

  // --- NUOVO: VALIDAZIONE ON BLUR (Quando l'utente finisce di editare) ---
  const handlePasswordBlur = () => {
    if (!newPassword) {
      setPasswordFormatError(""); // Se è vuoto non mostriamo l'errore di formato (ci penserà il required)
      return;
    }

    if (!passwordRegex.test(newPassword)) {
        setPasswordFormatError("Password must be between 8 and 30 characters long and contain at least one letter, one number, and one special character (@$!%*#?&).");    } else {
      setPasswordFormatError(""); // Formato corretto, puliamo l'errore
    }
  };

  // --- CHIAMATA API CON RICORSIONE ---
  const handleSubmit = async (e: React.FormEvent, isRetry = false) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Controllo preliminare sul formato (se l'utente clicca invio senza triggerare il blur)
    if (!passwordRegex.test(newPassword)) {
      setErrorMsg("The new password does not meet the security requirements.");
      setPasswordFormatError("Password must contain at least one letter, one number, and one special character (@$!%*#?&).");
      return;
    }

    // 2. Validazione Frontend: Controllo corrispondenza nuova password
    if (newPassword !== confirmPassword) {
      setErrorMsg("The new passwords do not match!");
      return;
    }

    // 3. Validazione Frontend minima
    if (!oldPassword || !newPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    setSaving(true);

    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken }
    };

    const requestBody = {
      oldPassword,
      newPassword
    };

    try {
      await axios.patch("http://localhost:8081/api/v1/users/password", requestBody, config);
      
      setSuccessMsg("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFormatError("");

        setUserData(null);
        localStorage.clear();

        navigate("/login", { 
    state: { passwordChangedSuccess: true } 
  });

    } catch (error: any) {
      console.error("Error changing password:", error);

      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            token: currentRefreshToken
          });

          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }

          setUserData({ ...userData, jwtToken: newAccessToken });

          setSaving(false);
          await handleSubmit(e, true);
        } catch (refreshError) {
          forceGlobalLogout();
        }
      } else {
        const backendMessage = error.response?.data?.message || "Failed to change password. Please check your credentials.";
        setErrorMsg(backendMessage);
      }
    } finally {
      if (!isRetry) setSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate("/profile")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
            Change Password
          </Typography>
        </Box>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <Box component="form" onSubmit={(e) => handleSubmit(e, false)} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            name="oldPassword"
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={saving}
          />

          {/* CAMPO NUOVA PASSWORD CON INTERCETTAZIONE BLUR ED ERRORE INTEGRATO */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={handlePasswordBlur} // <-- Attiva la validazione quando l'utente esce dal campo
            error={Boolean(passwordFormatError)} // Colorerà il campo di rosso se c'è un errore
            helperText={passwordFormatError} // Mostra il testo dell'errore sotto il campo
            disabled={saving}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/profile")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving || Boolean(passwordFormatError)} // Disabilita il tasto se la regex fallisce
            >
              Update Password
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};