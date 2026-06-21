import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../App"; // <-- AGGIUNTO IMPORT CONTESTO
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star"; // Icona per Remove
import StarBorderIcon from "@mui/icons-material/StarBorder"; // Icona per Add

export const EtfDetail = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  // Estrazione variabili globali
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [currentEtf, setEtf] = useState<any>(null);
  
  // Stato locale per gestire il caricamento durante l'aggiunta/rimozione
  const [actionLoading, setActionLoading] = useState(false);

  // --- CARICAMENTO DETTAGLIO ETF ---
  const loadData = async (etfId: string) => {
    setLoading(true);


    
    const loadUrl = import.meta.env.VITE_API_URL+`/api/v1/etfs/${etfId}`;
    
    // Usiamo il token del contesto globale
    const config = userData?.jwtToken
      ? { headers: { Authorization: `Bearer ${userData.jwtToken}` } }
      : {};

    try {
      const response = await axios.get(loadUrl, config);
      setEtf(response.data);
    } catch (err) {
      console.error("Errore nel caricamento del dettaglio ETF", err);
    } finally {
      setLoading(false);
    }
  };

  // Carica i dati appena l'ID è disponibile e l'app ha terminato i controlli auth di avvio
  useEffect(() => {
    if (!isCheckingAuth && id) {
      loadData(id);
    }
  }, [id, isCheckingAuth]);

  const forceGlobalLogout = () => {
    setUserData(null);
    localStorage.clear();
    navigate("/login");
  };

  // --- FUNZIONE AGGIUNTA WATCHLIST ---
  const addToWatchlist = async (isRetry = false) => {
    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    const loadUrl = "http://localhost:8081/api/v1/watchlists";
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };
    const json = { etfId: currentEtf.id };

    try {
      const response = await axios.post(loadUrl, json, config);
      // Aggiorniamo lo stato locale inserendo il watchlistId restituito dal backend
      setEtf({ ...currentEtf, watchlistId: response.data });
    } catch (error: any) {
      console.error("Error adding to watchlist:", error);

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
          await addToWatchlist(true);
        } catch (refreshError) {
          forceGlobalLogout();
        }
      }
    } finally {
      if (!isRetry) setActionLoading(false);
    }
  };

  // --- FUNZIONE RIMOZIONE WATCHLIST ---
  const removeFromWatchlist = async (isRetry = false) => {
    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    const loadUrl = "http://localhost:8081/api/v1/watchlists?ids=" + currentEtf.watchlistId;
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };

    try {
      await axios.delete(loadUrl, config);
      // Aggiorniamo lo stato locale impostando il watchlistId a null
      setEtf({ ...currentEtf, watchlistId: null });
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);

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
          await removeFromWatchlist(true);
        } catch (refreshError) {
          forceGlobalLogout();
        }
      }
    } finally {
      if (!isRetry) setActionLoading(false);
    }
  };

  // Helper per colorare i rendimenti (Verde se positivo, Rosso se negativo)
  const renderYield = (value: number | null) => {
    if (value === null || value === undefined) return "N/A";
    const color = value >= 0 ? "success.main" : "error.main";
    const sign = value > 0 ? "+" : "";
    return (
      <Typography variant="body1" sx={{ color, fontWeight: "bold" }}>
        {sign}
        {value.toFixed(2)}%
      </Typography>
    );
  };

  // Mostra il loader globale durante il caricamento o i controlli iniziali dell'auth
  if (isCheckingAuth || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentEtf) {
    return (
      <Box sx={{ width: "50%", margin: "5% auto", textAlign: "center" }}>
        <Typography variant="h5" color="error">
          ETF non trovato o ID non valido.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Torna indietro
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: { xs: "95%", md: "75%", lg: "60%" }, margin: "3rem auto" }}>
      {/* Bottone di ritorno */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }} variant="text">
        Back to Search
      </Button>

      {/* HEADER PRINCIPALE: Nome ETF e info chiave */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              {currentEtf.longName || currentEtf.shortName || "N/A"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip label={currentEtf.symbol} color="primary" variant="outlined" size="small" sx={{ fontWeight: "bold" }} />
              <Typography variant="body2" color="text.secondary">
                ISIN: <strong>{currentEtf.isin}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Box Prezzo grande e Bottone Watchlist */}
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
              {currentEtf.regularMarketPrice
                ? `${currentEtf.regularMarketPrice.toFixed(2)} ${currentEtf.currency || "EUR"}`
                : "N/A"}
            </Typography>
            
            {/* PULSANTE DINAMICO WATCHLIST */}
            <Box sx={{ mb: 1 }}>
              {currentEtf.watchlistId == null ? (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={actionLoading ? <CircularProgress size={16} /> : <StarBorderIcon />}
                  onClick={() => addToWatchlist()}
                  disabled={actionLoading}
                >
                  Add to Watchlist
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <StarIcon />}
                  onClick={() => removeFromWatchlist()}
                  disabled={actionLoading}
                >
                  Remove from Watchlist
                </Button>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Exchange: {currentEtf.exchangeCode || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* SEZIONE 1: Dettagli del Fondo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}>
                Fund Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Instrument Type</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.instrumentType || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">TER</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.ter != null ? `${currentEtf.ter}%` : "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Fund Size</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.fundSize != null ? `${currentEtf.fundSize} M` : "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Inception Date</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.firstQuoteDate || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Distribution Type</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.type || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Sustainable (ESG)</Typography></Grid>
                <Grid size={6}><Chip label={currentEtf.sustainable ? "Yes" : "No"} color={currentEtf.sustainable ? "success" : "default"} size="small" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 2: Dati di Mercato */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}>
                Market Data
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Daily Volume</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.regularMarketVolume?.toLocaleString() || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Market Day High</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500, color: "success.dark" }}>{currentEtf.regularMarketDayHigh || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Market Day Low</Typography></Grid>
                <Grid size={6}><Typography variant="body1" sx={{ fontWeight: 500, color: "error.dark" }}>{currentEtf.regularMarketDayLow || "N/A"}</Typography></Grid>
                <Grid size={6}><Typography variant="body2" color="text.secondary">Status</Typography></Grid>
                <Grid size={6}><Chip label={currentEtf.active ? "Active" : "Inactive"} color={currentEtf.active ? "success" : "error"} variant="filled" size="small" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 3: Rendimenti Performance */}
        <Grid size={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}>
                Performance & Yields
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">Daily</Typography>{renderYield(currentEtf.dailyYield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">1 Month</Typography>{renderYield(currentEtf.m1yield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">3 Months</Typography>{renderYield(currentEtf.m3yield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">6 Months</Typography>{renderYield(currentEtf.m6yield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">1 Year</Typography>{renderYield(currentEtf.y1Yield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">3 Years</Typography>{renderYield(currentEtf.y3Yield)}</Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">5 Years</Typography>{renderYield(currentEtf.y5Yield)}</Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 4, mb: 2, color: "text.secondary" }}>
                Historical Calendar Year Performance
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Previous 1 Year</Typography>{renderYield(currentEtf.previous1YearYield)}</Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Previous 2 Years</Typography>{renderYield(currentEtf.previous2YearYield)}</Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Previous 3 Years</Typography>{renderYield(currentEtf.previous3yearYield)}</Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};