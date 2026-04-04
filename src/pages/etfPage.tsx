import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../App";
import { styled } from "@mui/material/styles";
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

export const EtfPage = () => {
  const navigate = useNavigate();

    const { userData } = useContext(AppContext);

  const [orderBy, setOrderBy] = useState("fundSize");
  const [order, setOrder] = useState("desc");

  const [pageNumber, setPageNumber] = useState(0);
  const [currentPage,setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(100);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);

  const [tableData, setTableData] = useState([] as any[]);

  const shouldLoad = useRef(true);

  const buttonContainer = { display: "flex", float: "right" };

  let [searchData, setSearchData] = useState({
    mainFilter: "",
  });

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      loadData(1, "fundSize", "desc");
    }
  }, []);

  const loadData = (
    pageNumSearch: number,
    orderByParam: string,
    orderParam: string,
  ) => {
    const loadUrl = "http://localhost:8081/api/etf/search";

    console.log("searchData:");
    console.log(searchData);

    console.log(loadUrl);
    setOrderBy(orderByParam);
    setOrder(orderParam);

    const searchRequest = {
      sortField: orderByParam,
      sortDirection: orderParam,
      page: pageNumSearch,
      itemsPerPage: 10,
    };

    const config=userData!=null?{
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }}:{};

  

    axios.post(loadUrl, searchRequest,config).then(
      (response) => {
        console.log(response);
        setTableData(response.data.etfList);
        setPageNumber(response.data.pages);
        setTotalItems(response.data.total);
        setFromItem(response.data.fromItem);
        setToItem(response.data.toItem);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  const changePage = (num: number) => {
    console.log("PAGE NUMBER: " + num);

    const newPageNum= currentPage+num;
    setCurrentPage(newPageNum);
    loadData(newPageNum, orderBy, order);
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
    loadData(pageNumber, orderByParam, orderParam);
  };

  const openSearchDialog = () => {
    //setSearchDialogOpen(true);
    console.log("open search dialog");
  };

  const showEtf = (etfData: any) => {
    console.log("selezionato record con id: " + etfData.id);
    navigate("/etfDetail", { state: etfData });
  };




  const removeFromWatchlist = (etfData: any) => {

    let loadUrl = "http://localhost:8081/api/watchlist";

      let config = {
                headers: {
                    'Authorization': "Bearer " + userData.jwtToken
                },
                data:{
                  idList: [etfData.watchlistId]
                }
            };

      
          axios.delete(loadUrl, config).then((response: any) => {
            console.log(response);

          const updatedList = tableData.map(m => {
          if (m.id === etfData.id) {
            return { ...m, watchlistId: null };
          }
          return m;
          });


      console.log(updatedList);

      setTableData(updatedList);

           
        });


  }



  const addToWatchlist = (etfData: any) => {
    let loadUrl = "http://localhost:8081/api/watchlist"

    const config = {
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }
    };

    let json={
      etfId:etfData.id,
      userId:userData.userId
    }

    axios.post(loadUrl, json, config).then((response) => {
      console.log(response);

      const updatedList = tableData.map(m => {
        if (m.id === etfData.id) {
          return { ...m, watchlistId: response.data };
        }
        return m;
      });


      console.log(updatedList);

      setTableData(updatedList);

    });

  }



  return (
    <Paper sx={{ width: "80%", overflow: "hidden", margin: "3rem auto" }}>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
        ETF SEARCH TABLE
      </Typography>
      <Box sx={{ margin: "0 10% 5% 10%" }}>
        <Box sx={buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={openSearchDialog}
          >
            SEARCH MOVIE
          </Button>
        </Box>

        <Typography>
          {fromItem} - {toItem} of {totalItems} titles. |{" "}
          {currentPage !== 1 ? (
            <Link component="button" onClick={() => changePage(-1)}>
              Previous
            </Link>
          ) : null}
          {currentPage !== pageNumber ? (
            <Link component="button" onClick={() => changePage(1)}>
              Next
            </Link>
          ) : null}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: "35rem" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Nome del Fondo</TableCell>
              <TableCell>Dim. del fondo</TableCell>
              <TableCell>TER</TableCell>
              <TableCell>1A in %</TableCell>
              <TableCell>Distribuzione</TableCell>
              <TableCell>ISIN</TableCell>
              <TableCell>Ticker</TableCell>
                        {
                userData != null ? <TableCell>Add to Watchlist</TableCell> : null
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} tabIndex={-1}>
                <TableCell role="checkbox" sx={{ cursor: 'pointer' }}
                    onClick={() => showEtf(row)}>{row.name}</TableCell>
                <TableCell>{row.fundSize}</TableCell>
                <TableCell>{row.ter}</TableCell>
                <TableCell>{row.annualYield}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.isin}</TableCell>
                <TableCell>{row.ticker}</TableCell>

                  {
                    row.watchlistId === null && userData != null ? <TableCell><Button type='submit' variant='contained' color='primary' onClick={() => addToWatchlist(row)} >
                      ADD
                    </Button></TableCell> : row.watchlistId != null && userData != null ? <TableCell><Button type='submit' variant='contained' color='primary' onClick={() => removeFromWatchlist(row)} >
                      REMOVE
                    </Button></TableCell> : null
                  }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
