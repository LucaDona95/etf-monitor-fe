import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Stack, 
  Button, 
  MenuItem, 
  Box, 
  Menu, 
  IconButton,
  CircularProgress // Aggiunto per un caricamento fluido all'avvio
} from "@mui/material";
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { useContext, useState, useEffect } from "react";
import axios from 'axios';

export const MuiNavbar = () => {
  // CANCELLA o commenta questa riga:
  // const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // MODIFICA QUI: Estrai tutto dal contesto globale
  const { userData, setUserData, isCheckingAuth, setIsCheckingAuth } = useContext(AppContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // --- AUTOMAZIONE SU REFRESH PAGINA (F5) ---
  useEffect(() => {
    const restoreSession = async () => {
      const savedRefreshToken = localStorage.getItem("refreshToken");

      console.log("saved refresh token:", savedRefreshToken);

      if (!userData && savedRefreshToken) {
        try {
          console.log("F5 rilevato. Tento il ripristino della sessione...");
          const response = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            token: savedRefreshToken // Usi 'token' in base al tuo backend, perfetto
          });

          const newAccessToken = response.data.token;
          const newRefreshToken = response.data.refreshToken;

          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          setUserData({ jwtToken: newAccessToken });
          console.log("Sessione ripristinata con successo all'avvio.");
        } catch (error) {
          console.error("Refresh token scaduto o rimosso dal DB. Pulisco la sessione.");
          localStorage.clear();
        }
      }
      
      // AGGIORNA LO STATO GLOBALE ORA!
      setIsCheckingAuth(false); 
    };

    restoreSession();
  }, []);

  const toHomepage = () => {
    navigate("/");
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleLogout = async (isRetry = false) => {
    setAnchorEl(null);

    const config = {
      headers: {
        "Authorization": "Bearer " + userData?.jwtToken
      }
    };

    try {
      await axios.post("http://localhost:8081/api/v1/users/logout", null, config);
      console.log("Logout completed on backend");
    } catch (error: any) {
      console.error("Backend logout failed:", error);

      if (error.response?.status === 401 && !isRetry) {
        console.log("Token scaduto. Tento il refresh...");
        
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            refreshToken: currentRefreshToken
          });

          const newAccessToken = refreshResponse.data.token;
          const newRefreshToken = refreshResponse.data.refreshToken;

          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          
          setUserData({ ...userData, jwtToken: newAccessToken });

          console.log("Refresh riuscito. Rilancio handleLogout con il nuovo token...");
          await handleLogout(true); 
          return; // Usciamo per evitare di eseguire il finally del primo tentativo

        } catch (refreshError) {
          console.error("Anche il refresh token è scaduto o invalido. Forzo l'uscita.");
        }
      }
    } finally {
      if (!isRetry) {
        setUserData(null);
        localStorage.clear();
        navigate("/etf");
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={toHomepage}
          >
            ETF MONITOR APP
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={() => navigate("/")} color="inherit">
              Etf Table
            </Button>
            
            {/* Se stiamo verificando il token all'avvio mostriamo un piccolo loader */}
            {isCheckingAuth ? (
              <CircularProgress size={20} color="inherit" />
            ) : userData == null ? (
              <Button color='inherit' onClick={() => navigate("/login")}>
                Login
              </Button>
            ) : (
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-profile"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            )}
            
            {userData != null && (
              <Menu 
                id="menu-profile"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleLogout()}>Logout</MenuItem>
                <MenuItem onClick={showProfile}>Account</MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate("/watchlist"); }}>
                  Watchlist
                </MenuItem>
              </Menu>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};