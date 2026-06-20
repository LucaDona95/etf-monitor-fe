import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset'; // <-- AGGIUNTO ICONA PASSWORD
import axios from "axios";

export const UserProfile = () => {
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);
  const navigate = useNavigate();

  // Stati per i dati del form
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mailNotifications, setMailNotifications] = useState(false);
  const [appNotifications, setAppNotifications] = useState(false);

  const [profileBackup, setProfileBackup] = useState<any>(null);
  const [isEditable, setIsEditable] = useState(false);

  // Stati di gestione UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const forceGlobalLogout = () => {
    setUserData(null);
    localStorage.clear();
    navigate("/login");
  };

  // --- 1) CHIAMATA GET: CARICAMENTO DATI ---
  const fetchProfileData = async (isRetry = false) => {
    setLoading(true);
    setGlobalError("");

    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken }
    };

    try {
      const response = await axios.get("http://localhost:8081/api/v1/users/profile", config);
      
      setEmail(response.data.email);
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName);
      setMailNotifications(response.data.mailNotifications);
      setAppNotifications(response.data.appNotifications);
    } catch (error: any) {
      console.error("Error fetching profile:", error);

      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            refreshToken: currentRefreshToken
          });

          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }

          setUserData({ ...userData, jwtToken: newAccessToken });
          await fetchProfileData(true);
        } catch (refreshError) {
          forceGlobalLogout();
        }
      } else {
        setGlobalError("Failed to load profile data.");
      }
    } finally {
      if (!isRetry) setLoading(false);
    }
  };

  useEffect(() => {
    if (isCheckingAuth) return;

    if (userData?.jwtToken) {
      fetchProfileData();
    } else {
      forceGlobalLogout();
    }
  }, [isCheckingAuth, userData?.jwtToken]);


  // --- ATTIVAZIONE MODALITÀ MODIFICA E BACKUP ---
  const handleEnableEdit = () => {
    setProfileBackup({ firstName, lastName, mailNotifications, appNotifications });
    setSuccessMessage("");
    setGlobalError("");
    setIsEditable(true);
  };

  const handleCancelEdit = () => {
    if (profileBackup) {
      setFirstName(profileBackup.firstName);
      setLastName(profileBackup.lastName);
      setMailNotifications(profileBackup.mailNotifications);
      setAppNotifications(profileBackup.appNotifications);
    }
    setIsEditable(false);
    setGlobalError("");
  };

  // --- 2) CHIAMATA PATCH: SALVATAGGIO MODIFICHE ---
  const handleSaveChanges = async (isRetry = false) => {
    setSaving(true);
    setGlobalError("");
    setSuccessMessage("");

    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken }
    };

    const patchBody = { firstName, lastName, mailNotifications, appNotifications };

    try {
      await axios.patch("http://localhost:8081/api/v1/users/profile", patchBody, config);
      setSuccessMessage("Profile updated successfully!");
      setIsEditable(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);

      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            refreshToken: currentRefreshToken
          });

          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }

          setUserData({ ...userData, jwtToken: newAccessToken });
          await handleSaveChanges(true);
        } catch (refreshError) {
          forceGlobalLogout();
        }
      } else {
        setGlobalError("Failed to update profile settings.");
      }
    } finally {
      if (!isRetry) setSaving(false);
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        {/* INTESTAZIONE MODIFICATA CON STACK ORIZZONTALE PER I PULSANTI */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
            Profile Settings
          </Typography>
          
          {/* Se non siamo in modalità edit, mostriamo entrambi i bottoni di navigazione/azione */}
          {!isEditable && (
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                color="warning" 
                startIcon={<LockResetIcon />}
                onClick={() => navigate("/change-password")}
                size="small"
              >
                Change Password
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleEnableEdit} 
                size="small"
              >
                Edit Profile
              </Button>
            </Stack>
          )}
        </Box>

        {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Box component="form" noValidate>
          <TextField margin="normal" fullWidth label="Email Address" value={email} disabled />
          <TextField margin="normal" required fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditable || saving} />
          <TextField margin="normal" required fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditable || saving} />
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>Notification Preferences</Typography>
          <Stack direction="column" spacing={1}>
            <FormControlLabel control={<Checkbox checked={mailNotifications} onChange={(e) => setMailNotifications(e.target.checked)} disabled={!isEditable || saving} />} label="Receive Email Notifications" />
            <FormControlLabel control={<Checkbox checked={appNotifications} onChange={(e) => setAppNotifications(e.target.checked)} disabled={!isEditable || saving} />} label="Receive In-App Notifications" />
          </Stack>

          {isEditable && (
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button fullWidth variant="outlined" color="secondary" startIcon={<CloseIcon />} onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
              <Button fullWidth variant="contained" color="primary" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={() => handleSaveChanges(false)} disabled={saving}>Save</Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
};