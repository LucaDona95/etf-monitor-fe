import { AppBar, Toolbar, Typography, Stack, Button } from "@mui/material";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const MuiNavbar = () => {
  const navigate = useNavigate();

  const toHomepage = () => {
    navigate("/");
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
            <Button onClick={() => navigate("/etf")} color="inherit">
              Etf Table
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
