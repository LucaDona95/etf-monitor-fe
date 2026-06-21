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
  Checkbox,
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

import { useParams, useLocation, useNavigate } from "react-router-dom";

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

  const buttonContainer = { display: "flex", float: "right", gap: "1rem" };

  const [alertConditionList, setAlertConditionList] = useState([] as any[]);
  const [watchlistInfo, setWatchlistInfo] = useState<any>(null);

  const [availableAlertTypeList, setAvailableAlertTypeList] = useState([] as any[]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState({});
  const [loading, setLoading] = useState(true);

  // STR-NUOVO: Stato per memorizzare gli ID degli alert selezionati
  const [selectedAlertIds, setSelectedAlertIds] = useState<number[]>([]);

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


  const loadData = async (watchlistId: number, isRetry = false) => {
    setLoading(true);
    const loadUrl = "http://localhost:8081/api/v1/watchlists/" + watchlistId;
    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken },
    };

  	try {
      const response = await axios.get(loadUrl, config);
      console.log("Watchlist data loaded:", response.data);

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
      setSelectedAlertIds([]); // Svuota la selezione ad ogni caricamento pulito
    } catch (error: any) {
      console.error("Error loading watchlist details:", error);

      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post(
            "http://localhost:8081/api/v1/auth/refresh-token",
            { token: currentRefreshToken },
          );

          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }

          setUserData({ ...userData, jwtToken: newAccessToken });
          await loadData(watchlistId, true);
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

  // --- GESTIONE SELEZIONE CHECKBOX ---
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = alertConditionList.map((n) => n.id);
      setSelectedAlertIds(newSelecteds);
      return;
    }
    setSelectedAlertIds([]);
  };

  const handleSelectRowClick = (id: number) => {
    const selectedIndex = selectedAlertIds.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedAlertIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedAlertIds.slice(1));
    } else if (selectedIndex === selectedAlertIds.length - 1) {
      newSelected = newSelected.concat(selectedAlertIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedAlertIds.slice(0, selectedIndex),
        selectedAlertIds.slice(selectedIndex + 1)
      );
    }
    setSelectedAlertIds(newSelected);
  };

  // --- APERTURA DIALOG NUOVO ALERT ---
  const toNewAlert = () => {
    let tmp = {
      id: null,
      alertType: "",
      isActive: false,
      price: 0,
      volume: 0,
      etfYield: 0,
      yieldInterval: "",
    };

    let tmpMap = new Map();
    let tmpList = [];

    for (let condition of alertConditionList) {
      if (alertTypeMap.has(condition.conditionType)) {
        tmpMap.set(condition.conditionType, alertTypeMap.get(condition.conditionType));
      }
    }

    for (const [a, b] of alertTypeMap) {
      if (!tmpMap.has(a)) {
        tmpList.push({ value: a, label: b });
      }
    }

    setAvailableAlertTypeList(tmpList);
    setEditingAlert(tmp);
    setAlertDialogOpen(true);
  };

  // --- SALVATAGGIO / AGGIORNAMENTO UN SIGNOLO ALERT (POST / PUT) ---
  const handleSaveAlert = async (alertData: any, isRetry = false) => {
    let url = `http://localhost:8081/api/v1/watchlists/${id}/alerts`;
    if (alertData.id != null) {
      url += "/" + alertData.id;
    }

    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken },
    };

    let request = {
      active: alertData.active,
      threshold: alertData.threshold,
      conditionType: alertData.conditionType,
      checkInterval: alertData.checkInterval!=""?alertData.checkInterval:null
    };

    try {
      if (alertData.id != null) {
        await axios.put(url, request, config);
      } else {
        await axios.post(url, request, config);
      }
      console.log("Alert saved successfully");
      if (id) await loadData(Number(id));
    } catch (error: any) {
      console.error("Error saving alert:", error);
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            token: currentRefreshToken,
          });
          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }
          setUserData({ ...userData, jwtToken: newAccessToken });
          await handleSaveAlert(alertData, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    }
  };

  // --- CANCELLAZIONE DI GRUPPO / SINGOLA DI N ALERT (DELETE) ---
  const handleDeleteAlerts = async (ids: number[], isRetry = false) => {
    if (ids.length === 0) return;
    
    // Uniamo gli ID separati da virgola per la query string
    let url = `http://localhost:8081/api/v1/watchlists/${id}/alerts?ids=${ids.join(",")}`;
    const config = {
      headers: { Authorization: "Bearer " + userData?.jwtToken },
    };

    try {
      await axios.delete(url, config);
      console.log("Alerts deleted successfully");
      if (id) await loadData(Number(id));
    } catch (error: any) {
      console.error("Error deleting alerts:", error);
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", {
            token: currentRefreshToken,
          });
          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }
          setUserData({ ...userData, jwtToken: newAccessToken });
          await handleDeleteAlerts(ids, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    }
  };

  // --- APERTURA DIALOG APERTURA MODIFICA ALERT ---
  const toEditAlert = (alertData: any) => {
    let tmp = {
      id: alertData.id,
      alertType: alertData.conditionType,
      active: alertData.active,
      price: alertData.conditionType === "PRICE_UNDER" || alertData.conditionType === "PRICE_ABOVE" ? alertData.threshold : 0,
      volume: alertData.conditionType === "VOLUME_UNDER" || alertData.conditionType === "VOLUME_ABOVE" ? alertData.threshold : 0,
      etfYield: alertData.conditionType === "YIELD_UNDER" || alertData.conditionType === "YIELD_ABOVE" ? alertData.threshold : 0,
      yieldInterval: alertData.checkInterval || "",
    };

    let tmpMap = new Map();
    let tmpList = [];

    for (let condition of alertConditionList) {
      if (alertTypeMap.has(condition.conditionType)) {
        if (condition.conditionType !== alertData.conditionType) {
          tmpMap.set(condition.conditionType, alertTypeMap.get(condition.conditionType));
        }
      }
    }

    for (const [a, b] of alertTypeMap) {
      if (!tmpMap.has(a)) {
        tmpList.push({ value: a, label: b });
      }
    }

    setAvailableAlertTypeList(tmpList);
    setEditingAlert(tmp);
    setAlertDialogOpen(true);
  };

  if (isCheckingAuth || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "80%", margin: "3rem auto" }}>
      {watchlistInfo && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: "background.paper" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
                {watchlistInfo.longName || watchlistInfo.shortName || "N/A"}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`ETF ID: ${watchlistInfo.etfId}`} color="secondary" size="small" sx={{ fontWeight: "bold" }} />
                <Typography variant="body2" color="text.secondary">
                  ISIN: <strong>{watchlistInfo.isin}</strong>
                </Typography>
                <Chip label={watchlistInfo.type} variant="outlined" size="small" />
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
                  <Typography variant="caption" color="text.secondary" display="block">FUND SIZE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {watchlistInfo.fundSize != null ? `${watchlistInfo.fundSize} M` : "N/A"}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">TER</Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "primary.main" }}>
                    {watchlistInfo.ter != null ? `${watchlistInfo.ter}%` : "N/A"}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" display="block">1Y YIELD</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: watchlistInfo.y1Yield >= 0 ? "success.main" : "error.main",
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

      <Paper sx={{ p: 3, overflow: "hidden" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
              ALERT CONDITIONS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {alertConditionList.length} of 8 alerts active.
            </Typography>
          </Box>

          <Box sx={buttonContainer}>
            {/* STR-NUOVO: Il bottone COMPARE solo se ci sono elementi selezionati nella lista */}
            {selectedAlertIds.length > 0 && (
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteAlerts(selectedAlertIds)}
              >
                Delete Selected ({selectedAlertIds.length})
              </Button>
            )}
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
                {/* STR-NUOVO: Checkbox per selezionare/deselezionare tutto */}
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedAlertIds.length > 0 && selectedAlertIds.length < alertConditionList.length}
                    checked={alertConditionList.length > 0 && selectedAlertIds.length === alertConditionList.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Tipo Condizione</TableCell>
                <TableCell>Soglia</TableCell>
                <TableCell>Attivo</TableCell>
                <TableCell>Ultima Notifica</TableCell>
                <TableCell align="center">Azioni</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {alertConditionList.map((row, index) => {
                const isItemSelected = selectedAlertIds.indexOf(row.id) !== -1;
                return (
                  <TableRow key={index} hover selected={isItemSelected}>
                    {/* STR-NUOVO: Checkbox di riga */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={() => handleSelectRowClick(row.id)}
                      />
                    </TableCell>
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
                        
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {alertConditionList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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