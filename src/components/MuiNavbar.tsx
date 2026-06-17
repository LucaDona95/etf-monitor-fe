import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Stack, 
  Button, 
  MenuItem, 
  Box, 
  Menu, 
  IconButton 
} from "@mui/material";
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { useContext, useState } from "react";
import axios from 'axios';

export const MuiNavbar = () => {
  
  const { userData, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toHomepage = () => {
    navigate("/");
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  
  const handleLogout = async () => {
    setAnchorEl(null);

    const config = {
      headers: {
        "Authorization": "Bearer " + userData?.jwtToken
      }
    };

    try {
     
      await axios.post("http://localhost:8081/api/v1/users/logout", null, config);
      console.log("Logout completed on backend");
    } catch (error) {
     
      console.error("Backend logout failed or user not found:", error);
    } finally {

      setUserData(null);
      localStorage.clear();
      
      
      navigate("/etf");
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
            
            {userData == null ? (
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
                // Spostato su 'bottom' così la tendina scende sotto l'icona senza coprirla
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
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
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