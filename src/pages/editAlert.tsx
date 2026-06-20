import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import {
  Typography,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import { AppContext } from "../App";
import { AlertDialog } from "../components/alertDialog";

import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { useParams, useLocation, useNavigate } from "react-router-dom"; // <-- AGGIUNGI useParams

export const EditAlert = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();



  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);

  const alertTypeMap = new Map([
    ["TER_CHANGE", "Ter Change"],
    ["INACTIVATION", "Inactivation"],
    ["PRICE_ABOVE", "Price Above"],
    ["PRICE_UNDER", "Price Under"],
    ["VOLUME_ABOVE", "Volume Above"],
    ["VOLUME_UNDER", "Volume Under"],
    ["YIELD_ABOVE", "Yield Above"],
    ["YIELD_UNDER", "Yield Under"],
  ]);

  const buttonContainer = { display: "flex", float: "right" };

  const [alertConditionList, setAlertConditionList] = useState([] as any[]);
  // STR-NUOVO: Stato per memorizzare le informazioni anagrafiche dell'ETF collegate alla watchlist
  const [watchlistInfo, setWatchlistInfo] = useState<any>(null);

  const [availableAlertTypeList, setAvailableAlertTypeList] = useState(
    [] as any[],
  );
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState({});
  const [loading, setLoading] = useState(true);

useEffect(() => {
   
    if (isCheckingAuth) return;

    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }

    if (id) {
      loadData(Number(id));
    } else {
      console.error("Nessun ID trovato nell'URL della pagina.");
      setLoading(false);
    }
  }, [isCheckingAuth, userData?.jwtToken, id]);



  const loadData = async (id: number, isRetry = false) => {
    setLoading(true);
    const loadUrl = "http://localhost:8081/api/v1/watchlists/" + id;
    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken },
    };

    try {
      const response = await axios.get(loadUrl, config);
      console.log("Watchlist data loaded:", response.data);

      // Salviamo l'anagrafica completa dell'ETF (tutto il record tranne la lista di alert)
      setWatchlistInfo({
        id: response.data.id,
        etfId: response.data.etfId,
        isin: response.data.isin,
        currency: response.data.currency,
        shortName: response.data.shortName,
        longName: response.data.longName,
        fundSize: response.data.fundSize,
        ter: response.data.ter,
        y1Yield: response.data.y1Yield,
        type: response.data.type,
      });

      setAlertConditionList(response.data.alertConditionList || []);
    } catch (error: any) {
      console.error("Error loading watchlist details:", error);

      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post(
            "http://localhost:8081/api/v1/auth/refresh-token",
            {
              token: currentRefreshToken,
            },
          );

          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem(
              "refreshToken",
              refreshResponse.data.refreshToken,
            );
          }

          setUserData({ ...userData, jwtToken: newAccessToken });
          await loadData(id, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    } finally {
      if (!isRetry) setLoading(false);
    }
  };

  // Funzioni ausiliarie (toNewAlert, handleSaveAlert, toEditAlert, removeAlert rimangono inalterate)
  const toNewAlert = () => {
    /* ... identica a prima ... */
  };
  const handleSaveAlert = (alertData: any) => {
    /* ... identica a prima ... */
  };
  const toEditAlert = (alertData: any) => {
    /* ... identica a prima ... */
  };
  const removeAlert = (alertData: any) => {
    /* ... identica a prima ... */
  };

  if (isCheckingAuth || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "80%", margin: "3rem auto" }}>
      {watchlistInfo && (
        <Paper
          elevation={3}
          sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: "background.paper" }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {watchlistInfo.longName || watchlistInfo.shortName || "N/A"}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`ETF ID: ${watchlistInfo.etfId}`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
                <Typography variant="body2" color="text.secondary">
                  ISIN: <strong>{watchlistInfo.isin}</strong>
                </Typography>
                <Chip
                  label={watchlistInfo.type}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack
                direction="row"
                spacing={3}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                divider={<Divider orientation="vertical" flexItem />}
              >
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    FUND SIZE
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {watchlistInfo.fundSize != null
                      ? `${watchlistInfo.fundSize} M`
                      : "N/A"}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    TER
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {watchlistInfo.ter != null
                      ? `${watchlistInfo.ter}%`
                      : "N/A"}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    1Y YIELD
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color:
                        watchlistInfo.y1Yield >= 0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {watchlistInfo.y1Yield != null
                      ? `${watchlistInfo.y1Yield > 0 ? "+" : ""}${watchlistInfo.y1Yield.toFixed(2)}%`
                      : "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* 2. TABELLA ALERTS ORIGINALE */}
      <Paper sx={{ p: 3, overflow: "hidden" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
              ALERT CONDITIONS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {alertConditionList.length} of 8 alerts active.
            </Typography>
          </Box>

          <Box sx={buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={alertConditionList.length >= 8}
              onClick={toNewAlert}
            >
              ADD ALERT
            </Button>
            <AlertDialog
              availableAlertTypeList={availableAlertTypeList}
              alertDialogOpen={alertDialogOpen}
              setAlertDialogOpen={setAlertDialogOpen}
              handleSaveAlert={handleSaveAlert}
              editingAlert={editingAlert}
              setEditingAlert={setEditingAlert}
            />
          </Box>
        </Stack>

        <TableContainer sx={{ maxHeight: "35rem" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Tipo Condizione</TableCell>
                <TableCell>Soglia</TableCell>
                <TableCell>Attivo</TableCell>
                <TableCell>Ultima Notifica</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {alertConditionList.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {alertTypeMap.get(row.conditionType) || row.conditionType}
                  </TableCell>
                  <TableCell>{row.threshold}</TableCell>
                  <TableCell>{row.active ? "YES" : "NO"}</TableCell>
                  <TableCell>{row.lastNotified || "Never"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => toEditAlert(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => removeAlert(row)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {alertConditionList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No alert conditions configured for this item.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
