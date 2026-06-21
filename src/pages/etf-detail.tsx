import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../App";
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
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export const EtfDetail = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [currentEtf, setEtf] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async (etfId: string) => {
    setLoading(true);
    const loadUrl = `${import.meta.env.VITE_API_URL}/api/v1/etfs/${etfId}`;
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

  const addToWatchlist = async (isRetry = false) => {
    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }
    setActionLoading(true);
    // Sostituito localhost con la variabile d'ambiente .env
    const loadUrl = `${import.meta.env.VITE_API_URL}/api/v1/watchlists`;
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };
    const json = { etfId: currentEtf.id };

    try {
      const response = await axios.post(loadUrl, json, config);
      setEtf({ ...currentEtf, watchlistId: response.data });
    } catch (error: any) {
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`, {
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

  const removeFromWatchlist = async (isRetry = false) => {
    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }
    setActionLoading(true);
    const loadUrl = `${import.meta.env.VITE_API_URL}/api/v1/watchlists?ids=${currentEtf.watchlistId}`;
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };

    try {
      await axios.delete(loadUrl, config);
      setEtf({ ...currentEtf, watchlistId: null });
    } catch (error: any) {
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`, {
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

  const renderYield = (value: number | null) => {
    if (value === null || value === undefined) return "N/A";
    const color = value >= 0 ? "secondary.main" : "error.main"; // Sincronizzato con il nuovo tema
    const sign = value > 0 ? "+" : "";
    return (
      <Typography variant="body1" sx={{ color, fontWeight: "bold" }}>
        {sign}{value.toFixed(2)}%
      </Typography>
    );
  };

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
    <Box sx={{ width: { xs: "92%", md: "85%", lg: "70%" }, margin: "2rem auto" }}>
      {/* Bottone di ritorno */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }} variant="text">
        Back to Search
      </Button>

      {/* HEADER PRINCIPALE REFORMATTATO PER MOBILE */}
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 2, border: '1px solid #303b4e', bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 3 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", mb: 1, lineHeight: 1.2 }}>
              {currentEtf.longName || currentEtf.shortName || "N/A"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Chip label={currentEtf.symbol} color="primary" variant="outlined" size="small" sx={{ fontWeight: "bold" }} />
              <Typography variant="body2" color="text.secondary">
                ISIN: <strong>{currentEtf.isin}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Allineamento dinamico del prezzo */}
          <Box sx={{ textAlign: { xs: "left", sm: "right" }, width: { xs: "100%", sm: "auto" } }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
              {currentEtf.regularMarketPrice
                ? `${currentEtf.regularMarketPrice.toFixed(2)} ${currentEtf.currency || "EUR"}`
                : "N/A"}
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              {currentEtf.watchlistId == null ? (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  fullWidth={isCheckingAuth} // Diventa largo interamente solo se necessario su mobile
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
          <Card elevation={0} sx={{ height: "100%", border: '1px solid #303b4e', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Fund Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Instrument Type</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.instrumentType || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">TER</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.ter != null ? `${currentEtf.ter}%` : "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Fund Size</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.fundSize != null ? `${currentEtf.fundSize} M` : "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Inception Date</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.firstQuoteDate || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Distribution Type</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.type || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Sustainable (ESG)</Typography></Grid>
                <Grid size={{ xs: 6 }}><Chip label={currentEtf.sustainable ? "Yes" : "No"} color={currentEtf.sustainable ? "success" : "default"} size="small" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 2: Dati di Mercato */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ height: "100%", border: '1px solid #303b4e', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Market Data
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Daily Volume</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{currentEtf.regularMarketVolume?.toLocaleString() || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Market Day High</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500, color: "secondary.main" }}>{currentEtf.regularMarketDayHigh || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Market Day Low</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body1" sx={{ fontWeight: 500, color: "error.main" }}>{currentEtf.regularMarketDayLow || "N/A"}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Status</Typography></Grid>
                <Grid size={{ xs: 6 }}><Chip label={currentEtf.active ? "Active" : "Inactive"} color={currentEtf.active ? "success" : "error"} size="small" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 3: Rendimenti Performance (Breakpoints ricalibrati per mobile) */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid #303b4e', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Performance & Yields
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">Daily</Typography>{renderYield(currentEtf.dailyYield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">1 Month</Typography>{renderYield(currentEtf.m1yield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">3 Mos</Typography>{renderYield(currentEtf.m3yield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">6 Mos</Typography>{renderYield(currentEtf.m6yield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">1 Year</Typography>{renderYield(currentEtf.y1Yield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">3 Years</Typography>{renderYield(currentEtf.y3Yield)}</Grid>
                <Grid size={{ xs: 4, sm: 3, md: 1.71 }}><Typography variant="caption" color="text.secondary" display="block">5 Years</Typography>{renderYield(currentEtf.y5Yield)}</Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 4, mb: 2, color: "text.secondary" }}>
                Historical Calendar Year Performance
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Prev 1 Year</Typography>{renderYield(currentEtf.previous1YearYield)}</Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Prev 2 Years</Typography>{renderYield(currentEtf.previous2YearYield)}</Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary" display="block">Prev 3 Years</Typography>{renderYield(currentEtf.previous3yearYield)}</Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};