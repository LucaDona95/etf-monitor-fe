import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Margin } from "@mui/icons-material";
import { Button } from "@mui/material";

export const EtfDetail = () => {
  const shouldLoad = useRef(true);

  const location = useLocation();

  const [currentEtf, setEtf] = useState({
    id: null,
    isin: "",
    ticker: "",
    instrumentType: "",
    ter: null,
    price: null,
    fundSize: null,
    firstTradeDate: null,
    type: "",
    sustainable: false,
    volume: null,
    active: false,
    name: "",
    marketDayHigh: null,
    marketDayLow: null,
    currency: "",
    exchangeCode: "",
    dailyYield: null,
    m1yield: null,
    m3yield: null,
    m6yield: null,
    y1Yield: null,
    y3Yield: null,
    y5Yield: null,
    previous1YearYield: null,
    previous2YearYield: null,
    previous3yearYield: null,
  });

  useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      let currentEtf = location.state;
      loadData(currentEtf.id);
    }
  }, []);

  const loadData = (id: number) => {
    let loadUrl = "http://localhost:8081/api/etf/" + id;

    axios.get(loadUrl).then((response) => {
      console.log(response);
      setEtf(response.data);
    });
  };

  return (
    <Box sx={{ width: "50%", margin: "5% auto" }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid size={6}>
          <div>
            <Typography variant="h6">ISIN</Typography>
            <Typography variant="h6">{currentEtf.isin}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">TICKER</Typography>
            <Typography variant="h6">{currentEtf.ticker}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">INSTRUMENT TYPE</Typography>
            <Typography variant="h6">{currentEtf.instrumentType}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">TER</Typography>
            <Typography variant="h6">{currentEtf.ter}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">PRICE</Typography>
            <Typography variant="h6">{currentEtf.price}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">FUND SIZE</Typography>
            <Typography variant="h6">{currentEtf.fundSize}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">FIRST TRADE DATE</Typography>
            <Typography variant="h6">{currentEtf.firstTradeDate}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">TYPE</Typography>
            <Typography variant="h6">{currentEtf.type}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">SUSTAINABLE</Typography>
            <Typography variant="h6">{currentEtf.sustainable}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">VOLUME</Typography>
            <Typography variant="h6">{currentEtf.volume}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">ACTIVE</Typography>
            <Typography variant="h6">{currentEtf.active}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">NAME</Typography>
            <Typography variant="h6">{currentEtf.name}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">MARKET DAY HIGH</Typography>
            <Typography variant="h6">{currentEtf.marketDayHigh}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">MARKET DAY LOW</Typography>
            <Typography variant="h6">{currentEtf.marketDayLow}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">CURRENCY</Typography>
            <Typography variant="h6">{currentEtf.currency}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">EXCHANGE CODE</Typography>
            <Typography variant="h6">{currentEtf.exchangeCode}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">DAILY YIELD</Typography>
            <Typography variant="h6">{currentEtf.dailyYield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">1 MONTH YIELD</Typography>
            <Typography variant="h6">{currentEtf.m1yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">3 MONTH YIELD</Typography>
            <Typography variant="h6">{currentEtf.m3yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">6 MONTH YIELD</Typography>
            <Typography variant="h6">{currentEtf.m6yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">1 YEAR YIELD</Typography>
            <Typography variant="h6">{currentEtf.y1Yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">3 YEAR YIELD</Typography>
            <Typography variant="h6">{currentEtf.y3Yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">5 YIEAR YIELD</Typography>
            <Typography variant="h6">{currentEtf.y5Yield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">PREVIOUS 1 YIEAR YIELD</Typography>
            <Typography variant="h6">
              {currentEtf.previous1YearYield}
            </Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">PREVIOUS 2 YIEAR YIELD</Typography>
            <Typography variant="h6">{currentEtf.previous2YearYield}</Typography>
          </div>
        </Grid>
        <Grid size={6}>
          <div>
            <Typography variant="h6">PREVIOUS 3 YIEAR YIELD</Typography>
            <Typography variant="h6">{currentEtf.previous3yearYield}</Typography>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
