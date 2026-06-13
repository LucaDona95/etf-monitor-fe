import { AppBar, Toolbar, Typography, Stack, Button ,MenuItem} from "@mui/material";
import { Box ,Menu, IconButton} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { useContext,useState } from "react";
import { AccountCircle } from '@mui/icons-material';

export const MuiNavbar = () => {

  const { userData } = useContext(AppContext);

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

  

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            style={{ cursor: "pointer" }}
            onClick={toHomepage}
          >
            ETF MONITOR APP
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button onClick={() => navigate("/")} color="inherit">
              Etf Table
            </Button>
            {userData == null ? <Button color='inherit' onClick={() => navigate("/login")}>Login</Button> :
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

            }
            
            {userData != null ?
              <Menu id="menu-profile"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
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
                <MenuItem onClick={handleClose}>Logout</MenuItem>
                <MenuItem onClick={() => navigate("/watchlist")}>Watchlist</MenuItem>
              </Menu> : null}

          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
