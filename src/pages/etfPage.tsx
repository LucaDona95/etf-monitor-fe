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
import { useSearchParams } from 'react-router-dom';

interface ColumnConfig {
  id: string;
  label: string;
  sortKey?: string; // Se presente, la colonna è ordinabile
}

const COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Nome del Fondo" }, // Non ordinabile
  { id: "fundSize", label: "Dim. del fondo", sortKey: "fundSize" },
  { id: "ter", label: "TER", sortKey: "ter" },
  { id: "y1Yield", label: "1A in %", sortKey: "y1Yield" },
  { id: "price", label: "Price", sortKey: "regularMarketPrice" },
  { id: "distribution", label: "Distribuzione" }, // Non ordinabile
  { id: "isin", label: "ISIN", sortKey: "isin" },
  { id: "symbol", label: "Ticker", sortKey: "symbol" },
];

export const EtfPage = () => {
  const navigate = useNavigate();

  const { userData } = useContext(AppContext);

  const [pageNumber, setPageNumber] = useState(0);
  const [totalItems, setTotalItems] = useState(100);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);

  const [tableData, setTableData] = useState([] as any[]);

  const buttonContainer = { display: "flex", float: "right" };

  const [searchParams, setSearchParams] = useSearchParams();

const searchData = {
    mainFilter: searchParams.get('mainFilter') || "",
    firstTradeDateFrom: searchParams.get('firstTradeDateFrom') || null,
    firstTradeDateTo: searchParams.get('firstTradeDateTo') || null,
    terFrom: searchParams.get('terFrom') || "",
    terTo: searchParams.get('terTo') || "",
    priceFrom: searchParams.get('priceFrom') || "",
    priceTo: searchParams.get('priceTo') || "",
    sustainable: searchParams.get('sustainable') || "",
    typeFilter: searchParams.get('typeFilter') || "",
    d1YieldFrom: searchParams.get('d1YieldFrom') || "",
    d1YieldTo: searchParams.get('d1YieldTo') || "",
    m1YieldFrom: searchParams.get('m1YieldFrom') || "",
    m1YieldTo: searchParams.get('m1YieldTo') || "",
    y1YieldFrom:  searchParams.get('y1YieldFrom') || "",
    y1YieldTo: searchParams.get('y1YieldTo') || "",
    fundSizeFrom: searchParams.get('fundSizeFrom') || "",
    fundSizeTo: searchParams.get('fundSizeTo') || "",
    marketVolumeFrom: searchParams.get('marketVolumeFrom') || "",
    marketVolumeTo: searchParams.get('marketVolumeTo') || "",
    page: parseInt(searchParams.get('page') || "1", 10), 
    itemsPerPage: parseInt(searchParams.get('itemsPerPage') || "10", 10),
    sortField: searchParams.get('sortField') || "fundSize",
    sortDirection: searchParams.get('sortDirection') || "DESC",
  };

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  useEffect(() => {

    if (!searchParams.get('page') || !searchParams.get('sortField')) {
      updateUrlParams(searchData);
      return; 
    }
    
    loadData(searchData);
    
  }, [searchParams]);


  const updateUrlParams = (newFilters: any) => {
   const params: Record<string, string> = {};

    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
     
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = String(value);
      }
    });

    setSearchParams(params);
  };

  const loadData = (searchData: any) => {
    const loadUrl = "http://localhost:8081/api/v1/etfs";

    console.log("searchData:");
    console.log(searchData);

    console.log(loadUrl);

    const paramsForBackend = {
      ...searchData,

      sustainable:
        searchData.sustainable === ""
          ? null
          : searchData.sustainable === "true",
      typeFilter: searchData.typeFilter === "" ? null : searchData.typeFilter,
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

    axios
      .get(loadUrl, {
        params: {
          ...paramsForBackend,
        },
      })
      .then(
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
   // setSearchData(newFilters);

  updateUrlParams({
      ...searchData,
      ...newFilters,
      page: 1
    });


    //loadData(newFilters);
  };

  const changePage = (num: number) => {
    console.log("PAGE NUMBER: " + num);

   updateUrlParams({
      ...searchData,
      page: searchData.page + num, // Semplice operazione matematica
    });

    //setSearchData(updatedSearchData);
    //loadData(updatedSearchData);
  };

  const handleSortRequest = (columnName: string) => {
  
  const nextDirection = columnName === searchData.sortField && searchData.sortDirection === 'ASC' 
      ? 'DESC' 
      : 'ASC';

    updateUrlParams({ 
      ...searchData, 
      sortField: columnName,
      sortDirection: nextDirection,
      page: 1 // Resetta alla prima pagina quando cambia l'ordinamento
    });
  };

  const showEtf = (etfData: any) => {
    console.log("selezionato record con id: " + etfData.id);
    navigate("/etfDetail", { state: etfData });
  };

  const removeFromWatchlist = (etfData: any) => {
    let loadUrl = "http://localhost:8081/api/watchlist";

    let config = {
      headers: {
        Authorization: "Bearer " + userData.jwtToken,
      },
      data: {
        idList: [etfData.watchlistId],
      },
    };

    axios.delete(loadUrl, config).then((response: any) => {
      console.log(response);

      const updatedList = tableData.map((m) => {
        if (m.id === etfData.id) {
          return { ...m, watchlistId: null };
        }
        return m;
      });

      console.log(updatedList);

      setTableData(updatedList);
    });
  };

  const addToWatchlist = (etfData: any) => {
    let loadUrl = "http://localhost:8081/api/watchlist";

    const config = {
      headers: {
        Authorization: "Bearer " + userData.jwtToken,
      },
    };

    let json = {
      etfId: etfData.id,
      userId: userData.userId,
    };

    axios.post(loadUrl, json, config).then((response) => {
      console.log(response);

      const updatedList = tableData.map((m) => {
        if (m.id === etfData.id) {
          return { ...m, watchlistId: response.data };
        }
        return m;
      });

      console.log(updatedList);

      setTableData(updatedList);
    });
  };

    const openSearchDialog = () => {
    //setSearchDialogOpen(true);
    console.log("open search dialog");

    setSearchDialogOpen(true);
  };


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
          <EtfSearchDialog
            open={searchDialogOpen}
            onClose={() => setSearchDialogOpen(false)}
            currentFilters={searchData}
            onApplyFilters={handleApplyFilters}
          ></EtfSearchDialog>
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
              {COLUMNS.map((column) => (
                <TableCell key={column.id}>
                  {column.sortKey ? (
                    <TableSortLabel
                      active={searchData.sortField === column.sortKey}
                      direction={
                        searchData.sortField === column.sortKey &&
                        searchData.sortDirection === "ASC"
                          ? "asc"
                          : "desc"
                      }
                      onClick={() => handleSortRequest(column.sortKey!)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                 
                    column.label
                  )}
                </TableCell>
              ))}

              
              {userData != null && <TableCell>Add to Watchlist</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} tabIndex={-1}>
                <TableCell
                  role="checkbox"
                  sx={{ cursor: "pointer" }}
                  onClick={() => showEtf(row)}
                >
                  {row.longName != null ? row.longName : row.shortName}
                </TableCell>
                <TableCell>{row.fundSize}</TableCell>
                <TableCell>{row.ter}</TableCell>
                <TableCell>{row.y1Yield}</TableCell>
                <TableCell>{row.regularMarketPrice}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.isin}</TableCell>
                <TableCell>{row.symbol}</TableCell>

                {row.watchlistId === null && userData != null ? (
                  <TableCell>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={() => addToWatchlist(row)}
                    >
                      ADD
                    </Button>
                  </TableCell>
                ) : row.watchlistId != null && userData != null ? (
                  <TableCell>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={() => removeFromWatchlist(row)}
                    >
                      REMOVE
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
