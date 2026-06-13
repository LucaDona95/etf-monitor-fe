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
} from "@mui/material";
import { EtfSearchDialog } from "../components/etfSearchDialog";

export const EtfPage = () => {
  const navigate = useNavigate();

    const { userData } = useContext(AppContext);


  const [pageNumber, setPageNumber] = useState(0);
  const [totalItems, setTotalItems] = useState(100);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);

  const [tableData, setTableData] = useState([] as any[]);

  const shouldLoad = useRef(true);

  const buttonContainer = { display: "flex", float: "right" };

  let [searchData, setSearchData] = useState({
    mainFilter: "",
    firstTradeDateFrom:null,
    firstTradeDateTo:null,
    terFrom:"",
    terTo:"",
    priceFrom:"",
    priceTo:"",
    sustainable:"",
    typeFilter:"",
    d1YieldFrom:"",
    d1YieldTo:"",
    m1YieldFrom:"",
    m1YieldTo:"",
    y1YieldFrom:"",
    y1YieldTo:"",
    fundSizeFrom:"",
    fundSizeTo:"",
    marketVolumeFrom:"",
    marketVolumeTo:"",
    page : 1,
    itemsPerPage : 10,
    sortField : "fundSize",
    sortDirection : "DESC"


  });


  const [searchDialogOpen, setSearchDialogOpen] = useState(false);


  useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      loadData(searchData);
    }
  }, []);

  const loadData = (
    searchData:any
  ) => {
    const loadUrl = "http://localhost:8081/api/v1/etfs";

    console.log("searchData:");
    console.log(searchData);

    console.log(loadUrl);

       const paramsForBackend = {
    ...searchData,
    
    sustainable: searchData.sustainable === "" ? null : searchData.sustainable === "true",
    typeFilter: searchData.typeFilter === "" ? null : searchData.typeFilter
  };


      Object.keys(paramsForBackend).forEach((key) => {
    const value = paramsForBackend[key];
    if (value === "" || value === null || value === undefined) {
      delete paramsForBackend[key];
    }
  });


    /*
    const config=userData!=null?{
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }}:{}; */

  

    axios.get(loadUrl,
      {
        params:{
          ...paramsForBackend
        }
      }
    ).then(
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

  const handleApplyFilters = (newFilters: any) => {
    setSearchData(newFilters);

 



    loadData(newFilters);
  
};

  const changePage = (num: number) => {
    console.log("PAGE NUMBER: " + num);

    const updatedSearchData = { 
        ...searchData, 
        page: searchData.page+num
    };

    setSearchData(updatedSearchData);
    loadData(updatedSearchData);
  };

  const handleSortRequest = (columnName: string) => {
    let orderParam = "";

   
    if (columnName === searchData.sortField) {
      orderParam = searchData.sortDirection === "ASC" ? "DESC" : "ASC";

      console.log("order param: "+orderParam);


    } else {
   
      orderParam = "ASC";
    
  }

        const  updatedSearchData = { 
        ...searchData, 
        sortField: columnName,
        sortDirection: orderParam
    };

    setSearchData(updatedSearchData);

    console.log(updatedSearchData);

    loadData(updatedSearchData); 
  };

  const openSearchDialog = () => {
    //setSearchDialogOpen(true);
    console.log("open search dialog");

    
      setSearchDialogOpen(true);
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
            SEARCH ETF
          </Button>
          <EtfSearchDialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} 
            currentFilters={searchData} onApplyFilters={handleApplyFilters}></EtfSearchDialog>
        </Box>

        <Typography>
          {fromItem} - {toItem} of {totalItems} titles. |{" "}
          {searchData.page !== 1 ? (
            <Link component="button" onClick={() => changePage(-1)}>
              Previous
            </Link>
          ) : null}
          {searchData.page !== pageNumber ? (
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
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("fundSize") }}
                direction={searchData.sortField === 'fundSize' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'fundSize'}>Dim. del fondo</TableSortLabel></TableCell>
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("ter") }}
                direction={searchData.sortField === 'ter' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'ter'}>TER</TableSortLabel></TableCell>
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("y1Yield") }}
                direction={searchData.sortField === 'y1Yield' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'y1Yield'}>1A in %</TableSortLabel></TableCell>
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("regularMarketPrice") }}
                direction={searchData.sortField === 'regularMarketPrice' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'regularMarketPrice'}>Price</TableSortLabel></TableCell>
              <TableCell>Distribuzione</TableCell>
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("isin") }}
                direction={searchData.sortField === 'isin' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'isin'}>ISIN</TableSortLabel></TableCell>
              <TableCell><TableSortLabel onClick={() => { handleSortRequest("symbol") }}
                direction={searchData.sortField === 'symbol' && searchData.sortDirection === 'ASC' ? 'asc' : 'desc'}
                active={searchData.sortField === 'symbol'}>Ticker</TableSortLabel></TableCell>
                        {
                userData != null ? <TableCell>Add to Watchlist</TableCell> : null
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} tabIndex={-1}>
                <TableCell role="checkbox" sx={{ cursor: 'pointer' }}
                    onClick={() => showEtf(row)}>{row.longName!=null?row.longName:row.shortName}</TableCell>
                <TableCell>{row.fundSize}</TableCell>
                <TableCell>{row.ter}</TableCell>
                <TableCell>{row.y1Yield}</TableCell>
                <TableCell>{row.regularMarketPrice}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.isin}</TableCell>
                <TableCell>{row.symbol}</TableCell>
              
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
