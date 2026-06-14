import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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

export const EtfDetail = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [currentEtf, setEtf] = useState<any>(null);

  useEffect(() => {
    const loadData = (etfId: string) => {
      const loadUrl = `http://localhost:8081/api/v1/etfs/${etfId}`;
      const token = localStorage.getItem("jwtToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      axios
        .get(loadUrl, config)
        .then((response) => {
          setEtf(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Errore nel caricamento del dettaglio ETF", err);
          setLoading(false);
        });
    };

    if (id) {
      loadData(id);
    }
  }, [id]);

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

  if (loading) {
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

  if (!currentEtf) {
    return (
      <Box sx={{ width: "50%", margin: "5% auto", textAlign: "center" }}>
        <Typography variant="h5" color="error">
          ETF non trovato o ID non valido.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Torna indietro
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ width: { xs: "95%", md: "75%", lg: "60%" }, margin: "3rem auto" }}
    >
      {/* Bottone di ritorno */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        variant="text"
      >
        Back to Search
      </Button>

      {/* HEADER PRINCIPALE: Nome ETF e info chiave */}
      <Paper
        elevation={3}
        sx={{ p: 4, mb: 4, borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              {currentEtf.longName || currentEtf.shortName || "N/A"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={currentEtf.symbol}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: "bold" }}
              />
              <Typography variant="body2" color="text.secondary">
                ISIN: <strong>{currentEtf.isin}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Box Prezzo grande */}
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {currentEtf.regularMarketPrice
                ? `${currentEtf.regularMarketPrice.toFixed(2)} ${currentEtf.currency || "EUR"}`
                : "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exchange: {currentEtf.exchangeCode || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* SEZIONE 1: Dettagli del Fondo (Anagrafica) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
              >
                Fund Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Instrument Type
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.instrumentType || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    TER
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.ter != null ? `${currentEtf.ter}%` : "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fund Size
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.fundSize != null
                      ? `${currentEtf.fundSize} M`
                      : "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Inception Date
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.firstQuoteDate || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Distribution Type
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.type || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Sustainable (ESG)
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Chip
                    label={currentEtf.sustainable ? "Yes" : "No"}
                    color={currentEtf.sustainable ? "success" : "default"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 2: Dati di Mercato Odierni */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
              >
                Market Data
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Volume
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentEtf.regularMarketVolume?.toLocaleString() || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Market Day High
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: "success.dark" }}
                  >
                    {currentEtf.regularMarketDayHigh || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Market Day Low
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: "error.dark" }}
                  >
                    {currentEtf.regularMarketDayLow || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Chip
                    label={currentEtf.active ? "Active" : "Inactive"}
                    color={currentEtf.active ? "success" : "error"} // "success" (verde) è ancora meglio di "info" per lo stato Active!
                    variant="filled" // Oppure "outlined" se preferisci solo il bordo colorato
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* SEZIONE 3: Rendimenti (Yields) Performance */}
        <Grid size={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
              >
                Performance & Yields
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Daily
                  </Typography>
                  {renderYield(currentEtf.dailyYield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    1 Month
                  </Typography>
                  {renderYield(currentEtf.m1yield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    3 Months
                  </Typography>
                  {renderYield(currentEtf.m3yield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    6 Months
                  </Typography>
                  {renderYield(currentEtf.m6yield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    1 Year
                  </Typography>
                  {renderYield(currentEtf.y1Yield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    3 Years
                  </Typography>
                  {renderYield(currentEtf.y3Yield)}
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    5 Years
                  </Typography>
                  {renderYield(currentEtf.y5Yield)}
                </Grid>
              </Grid>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  mt: 4,
                  mb: 2,
                  color: "text.secondary",
                }}
              >
                Historical Calendar Year Performance
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3} sx={{ textAlign: "center" }}>
                <Grid size={{ xs: 4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Previous 1 Year
                  </Typography>
                  {renderYield(currentEtf.previous1YearYield)}
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Previous 2 Years
                  </Typography>
                  {renderYield(currentEtf.previous2YearYield)}
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Previous 3 Years
                  </Typography>
                  {renderYield(currentEtf.previous3yearYield)}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
