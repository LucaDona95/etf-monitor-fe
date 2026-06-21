import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { EtfSearchDialog } from "../components/etfSearchDialog";
import { useSearchParams } from 'react-router-dom';

interface ColumnConfig {
  id: string;
  label: string;
  sortKey?: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Nome del Fondo" },
  { id: "fundSize", label: "Dim. del fondo", sortKey: "fundSize" },
  { id: "ter", label: "TER", sortKey: "ter" },
  { id: "y1Yield", label: "1A in %", sortKey: "y1Yield" },
  { id: "price", label: "Price", sortKey: "regularMarketPrice" },
  { id: "distribution", label: "Distribuzione" },
  { id: "isin", label: "ISIN", sortKey: "isin" },
  { id: "symbol", label: "Ticker", sortKey: "symbol" },
];

export const EtfPage = () => {
  const navigate = useNavigate();
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);

  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);
  const [tableData, setTableData] = useState([] as any[]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
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
    y1YieldFrom: searchParams.get('y1YieldFrom') || "",
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

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!searchParams.get('page') || !searchParams.get('sortField')) {
      updateUrlParams(searchData);
      return;
    }
    loadData(searchData);
  }, [searchParams, isCheckingAuth]);

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

  const loadData = async (searchData: any, isRetry = false) => {
    const loadUrl = import.meta.env.VITE_API_URL + "/api/v1/etfs";
    const paramsForBackend = {
      ...searchData,
      sustainable: searchData.sustainable === "" ? null : searchData.sustainable === "true",
      typeFilter: searchData.typeFilter === "" ? null : searchData.typeFilter,
    };

    Object.keys(paramsForBackend).forEach((key) => {
      const value = paramsForBackend[key];
      if (value === "" || value === null || value === undefined) {
        delete paramsForBackend[key];
      }
    });

    const config: any = { params: { ...paramsForBackend } };
    if (userData?.jwtToken) {
      config.headers = { Authorization: "Bearer " + userData.jwtToken };
    }

    try {
      const response = await axios.get(loadUrl, config);
      setTableData(response.data.etfList);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
      setFromItem(response.data.fromItem);
      setToItem(response.data.toItem);
    } catch (error: any) {
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
          await loadData(searchData, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          await loadData(searchData, true);
        }
      }
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    updateUrlParams({ ...searchData, ...newFilters, page: 1 });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== searchData.page) {
      updateUrlParams({ ...searchData, page: page });
    }
  };

  const handleSortRequest = (columnName: string) => {
    const nextDirection = columnName === searchData.sortField && searchData.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    updateUrlParams({
      ...searchData,
      sortField: columnName,
      sortDirection: nextDirection,
      page: 1
    });
  };

  const showEtf = (etfData: any) => {
    navigate(`/etf/${etfData.id}`);
  };

  const removeFromWatchlist = async (etfData: any, isRetry = false) => {
    if (isCheckingAuth || !userData?.jwtToken) return;
    let loadUrl = "http://localhost:8081/api/v1/watchlists?ids=" + etfData.watchlistId;
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };

    try {
      await axios.delete(loadUrl, config);
      const updatedList = tableData.map((m: any) => m.id === etfData.id ? { ...m, watchlistId: null } : m);
      setTableData(updatedList);
    } catch (error: any) {
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", { token: currentRefreshToken });
          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          setUserData({ ...userData, jwtToken: newAccessToken });
          await removeFromWatchlist(etfData, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    }
  };

  const addToWatchlist = async (etfData: any, isRetry = false) => {
    if (isCheckingAuth || !userData?.jwtToken) return;
    let loadUrl = "http://localhost:8081/api/v1/watchlists";
    const config = { headers: { Authorization: "Bearer " + userData.jwtToken } };
    let json = { etfId: etfData.id };

    try {
      const response = await axios.post(loadUrl, json, config);
      const updatedList = tableData.map((m: any) => m.id === etfData.id ? { ...m, watchlistId: response.data } : m);
      setTableData(updatedList);
    } catch (error: any) {
      if (error.response?.status === 401 && !isRetry) {
        try {
          const currentRefreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post("http://localhost:8081/api/v1/auth/refresh-token", { token: currentRefreshToken });
          const newAccessToken = refreshResponse.data.token;
          if (refreshResponse.data.refreshToken) localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          setUserData({ ...userData, jwtToken: newAccessToken });
          await addToWatchlist(etfData, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    }
  };

  const fetchPageNumbers = () => {
    const currentPage = searchData.page;
    const total = totalPages;
    const siblingCount = 1;
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (total > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(total - 1, currentPage + siblingCount);
      let pages: (number | string)[] = [];
      const hasLeftSpill = startPage > 2;
      const hasRightSpill = (total - endPage) > 1;
      const spillOffset = totalNumbers - (endPage - startPage + 1);

      switch (true) {
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = Array.from({ length: spillOffset }, (_, i) => startPage - i - 1);
          pages = [1, '...', ...extraPages.reverse(), ...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i), total];
          break;
        }
        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = Array.from({ length: spillOffset }, (_, i) => endPage + i + 1);
          pages = [1, ...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i), ...extraPages, '...', total];
          break;
        }
        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = [1, '...', ...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i), '...', total];
          break;
        }
      }
      return pages;
    }
    return Array.from({ length: total }, (_, i) => i + 1);
  };

  const paginationRange = fetchPageNumbers();

  return (
    <Paper sx={{ width: "80%", overflow: "hidden", margin: "3rem auto", paddingBottom: "1rem" }}>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1, padding: "1rem" }}>
        ETF SEARCH TABLE
      </Typography>
      
      {/* Box Superiore: Adesso c'è solo il pulsante di ricerca, allineato a destra */}
      <Box sx={{ margin: "0 10% 1rem 10%", display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => setSearchDialogOpen(true)}
        >
          SEARCH ETF
        </Button>
        <EtfSearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          currentFilters={searchData}
          onApplyFilters={handleApplyFilters}
        />
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
                      direction={searchData.sortField === column.sortKey && searchData.sortDirection === "ASC" ? "asc" : "desc"}
                      onClick={() => handleSortRequest(column.sortKey!)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              <TableCell>Add to Watchlist</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} tabIndex={-1} hover>
                <TableCell
                  role="checkbox"
                  sx={{ cursor: "pointer", color: 'primary.main', fontWeight: 'bold' }}
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
                <TableCell>
                  {row.watchlistId === null ? (
                    <Button type="submit" variant="outlined" color="primary" size="small" onClick={() => addToWatchlist(row)}>
                      ADD
                    </Button>
                  ) : (
                    <Button type="submit" variant="contained" color="secondary" size="small" onClick={() => removeFromWatchlist(row)}>
                      REMOVE
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- BLOCCO DI PAGINAZIONE IN BASSO RE-INGEGNERIZZATO --- */}
      {totalPages > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
          
          {/* CONTEGGIO ELEMENTI IN BASSO A SINISTRA */}
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Visualizzati {fromItem} - {toItem} di {totalItems} titoli.
          </Typography>

          {/* PULSANTI NUMERICI IN BASSO A DESTRA */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => goToPage(1)}
                disabled={searchData.page === 1}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                {"<<"}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => goToPage(searchData.page - 1)}
                disabled={searchData.page === 1}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                {"<"}
              </Button>

              {paginationRange.map((pageNumber, index) => {
                if (pageNumber === '...') {
                  return <Typography key={index} sx={{ padding: '0 4px' }}>...</Typography>;
                }
                return (
                  <Button
                    key={index}
                    variant={pageNumber === searchData.page ? "contained" : "outlined"}
                    size="small"
                    onClick={() => goToPage(pageNumber as number)}
                    sx={{
                      minWidth: '32px',
                      padding: '4px',
                      ...(pageNumber === searchData.page && {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'primary.dark' },
                      })
                    }}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                variant="outlined"
                size="small"
                onClick={() => goToPage(searchData.page + 1)}
                disabled={searchData.page === totalPages}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                {">"}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => goToPage(totalPages)}
                disabled={searchData.page === totalPages}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                {">>"}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};