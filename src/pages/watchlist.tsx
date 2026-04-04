import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../App";

import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  Button,
  TableHead,
  Box,
  TableRow,
  TableSortLabel,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  TextField,
} from "@mui/material";


export const Watchlist = () => {

  const navigate = useNavigate();

       const { userData } = useContext(AppContext);

  const [orderBy, setOrderBy] = useState("fundSize");
  const [order, setOrder] = useState("desc");

    const [tableData, setTableData] = useState([] as any[]);

  const shouldLoad = useRef(true);

  const buttonContainer = { display: "flex", float: "right" };


    useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      loadData( "fundSize", "desc");
    }
  }, []);


    const loadData = (
    orderByParam: string,
    orderParam: string,
  ) => {
    const loadUrl = "http://localhost:8081/api/watchlist/search";


     const config=userData!=null?{
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }}:{};


    console.log(loadUrl);
    setOrderBy(orderByParam);
    setOrder(orderParam);

    const searchRequest = {
      sortField: orderByParam,
      sortDirection: orderParam,
      userId: userData.userId
    };

    axios.post(loadUrl, searchRequest,config).then(
      (response) => {
        console.log(response);
        setTableData(response.data.watchlistDtoList);

      },
      (error) => {
        console.log(error);
      },
    );
  };


    const handleSortRequest = (columnName: string) => {
    let orderParam = "";

    // inverto l'ordine
    if (columnName === orderBy) {
      orderParam = order === "asc" ? "desc" : "asc";
      setOrder(orderParam);
    } else {
      // setto asc
      orderParam = "asc";
      setOrder("asc");
    }

    const orderByParam = columnName;
    setOrderBy(columnName);
    loadData( orderByParam, orderParam);
  };



  const showEtf = (etfData: any) => {
    console.log("selezionato record con id: " + etfData.id);
    navigate("/etfDetail", { state: etfData });
  };

  const toAlertConfig = (watchlsitData: any)=>{

    navigate("/alert",{state: watchlsitData});
  }



    const removeFromWatchlist = (watchlistData: any) => {

          let loadUrl = "http://localhost:8081/api/watchlist";

      let config = {
                headers: {
                    'Authorization': "Bearer " + userData.jwtToken
                },
                data:{
                  idList: [watchlistData.id]
                }
            };

        axios.delete(loadUrl, config).then((response: any) => {
            console.log(response);

          const updatedList = tableData.filter(w => w.id!==watchlistData.id);


        console.log(updatedList);

        setTableData(updatedList);

           
        });



  };

  return (
    <Paper sx={{ width: "80%", overflow: "hidden", margin: "3rem auto" }}>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
        WATCHLIST TABLE
      </Typography>
     
      <TableContainer sx={{ maxHeight: "35rem" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Nome del Fondo</TableCell>
              <TableCell>Valuta del fondo</TableCell>
              <TableCell>Dim. del fondo</TableCell>
              <TableCell>TER</TableCell>
              <TableCell>1A in %</TableCell>
              <TableCell>Distribuzione</TableCell>
              <TableCell>ISIN</TableCell>
              <TableCell>Ticker</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} tabIndex={-1}>
                <TableCell role="checkbox" sx={{ cursor: 'pointer' }}
                    onClick={() => showEtf(row)}>{row.etfName}</TableCell>
                <TableCell>{row.fundSize}</TableCell>
                <TableCell>{row.fundSize}</TableCell>
                <TableCell>{row.ter}</TableCell>
                <TableCell>{row.y1Yield}</TableCell>
                <TableCell>{row.etfType}</TableCell>
                <TableCell>{row.isin}</TableCell>
                <TableCell>{row.ticker}</TableCell>
                <TableCell>
                  <Button type='submit' variant='contained' color='primary' onClick={() => removeFromWatchlist(row)} >
                      Delete
                    </Button>
                     <Button type='submit' variant='contained' color='primary' onClick={() => toAlertConfig(row)} >
                      Edit
                    </Button>
                    </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

}