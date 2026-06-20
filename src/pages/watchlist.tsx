import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../App";
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Box,
  TableRow,
  TableSortLabel,
  Typography,
  Checkbox, // <-- AGGIUNTO
  Button,   // <-- AGGIUNTO
  Stack,    // <-- AGGIUNTO
  CircularProgress
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import DeleteIcon from '@mui/material/Icon';

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

export const Watchlist = () => {
  const navigate = useNavigate();
  const { userData, setUserData, isCheckingAuth } = useContext(AppContext);

  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState([] as any[]);
  const [searchParams, setSearchParams] = useSearchParams();

  // STRE-NUOVO: Stato per collezionare gli ID degli elementi selezionati della watchlist
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const searchData = {
    sortField: searchParams.get("sortField") || "fundSize",
    sortDirection: searchParams.get("sortDirection") || "DESC",
  };

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!searchParams.get("sortField")) {
      updateUrlParams(searchData);
      return;
    }

    loadData(searchData);
  }, [searchParams, isCheckingAuth]);

  const updateUrlParams = (newFilters: any) => {
    const params: Record<string, string> = {};
    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = String(value);
      }
    });
    setSearchParams(params);
  };

  const loadData = async (searchData: any, isRetry = false) => {
    const loadUrl = "http://localhost:8081/api/v1/watchlists";
    const config: any = { params: { ...searchData } };

    if (userData?.jwtToken) {
      config.headers = { Authorization: "Bearer " + userData.jwtToken };
    }

    try {
      const response = await axios.get(loadUrl, config);
      setTableData(response.data.watchlistItemList);
      setTotalItems(response.data.watchlistItemList.length);
    } catch (error: any) {
      console.error("Error loading ETF list:", error);
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
          await loadData(searchData, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          await loadData(searchData, true);
        }
      }
    }
  };

  const handleSortRequest = (columnName: string) => {
    const nextDirection =
      columnName === searchData.sortField && searchData.sortDirection === "ASC"
        ? "DESC"
        : "ASC";

    updateUrlParams({
      ...searchData,
      sortField: columnName,
      sortDirection: nextDirection
    });
  };

  const showEtf = (etfData: any) => {
    navigate(`/etf/${etfData.id}`);
  };

  
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
     
      const newSelecteds = tableData.map((n) => n.watchlistId).filter(id => id != null);
      setSelectedIds(newSelecteds);
      return;
    }
    setSelectedIds([]);
  };

  const handleSelectRow = (watchlistId: number) => {
    const selectedIndex = selectedIds.indexOf(watchlistId);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedIds, watchlistId];
    } else {
      newSelected = selectedIds.filter(id => id !== watchlistId);
    }

    setSelectedIds(newSelected);
  };

  // --- METODO REMOVE FROM WATCHLIST SISTEMATO ---
  const removeFromWatchlist = async (watchlistIdList: number[], isRetry = false) => {
    if (isCheckingAuth) return;

    if (!userData?.jwtToken) {
      navigate("/login");
      return;
    }

    setActionLoading(true);

    // Trasforma l'array [1, 2, 3] nella stringa separata da virgole "1,2,3"
    const idsCommaSeparated = watchlistIdList.join(",");
    let loadUrl = "http://localhost:8081/api/v1/watchlists?ids=" + idsCommaSeparated;

    const config = {
      headers: { Authorization: "Bearer " + userData.jwtToken },
    };

    try {
      await axios.delete(loadUrl, config);
      
      // Filtra i dati rimuovendo localmente gli elementi il cui watchlistId è stato eliminato
      const updatedList = tableData.filter((m: any) => !watchlistIdList.includes(m.watchlistId));

      setTableData(updatedList);
      setTotalItems(updatedList.length);
      setSelectedIds([]); // Ripulisce la selezione dopo l'eliminazione
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);

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
          await removeFromWatchlist(watchlistIdList, true);
        } catch (refreshError) {
          setUserData(null);
          localStorage.clear();
          navigate("/login");
        }
      }
    } finally {
      if (!isRetry) setActionLoading(false);
    }
  };

  const isSelected = (watchlistId: number) => selectedIds.indexOf(watchlistId) !== -1;

  if (isCheckingAuth) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "80%", overflow: "hidden", margin: "3rem auto", p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            WATCHLIST ITEMS
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {totalItems} items in your watchlist.
          </Typography>
        </Box>

        {/* BOTTONE DI RIMOZIONE ATTIVO SOLO SE CI SONO SELEZIONI */}
        <Button
          variant="contained"
          color="error"
          disabled={selectedIds.length === 0 || actionLoading}
          onClick={() => removeFromWatchlist(selectedIds)}
          startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {selectedIds.length > 0 
            ? `Remove from watchlist (${selectedIds.length})` 
            : "Remove from watchlist"}
        </Button>
      </Stack>

      <TableContainer sx={{ maxHeight: "35rem" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {/* NUOVA COLONNA HEADER PER IL SELEZIONA TUTTI */}
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedIds.length > 0 && selectedIds.length < tableData.length}
                  checked={tableData.length > 0 && selectedIds.length === tableData.length}
                  onChange={handleSelectAllClick}
                  disabled={tableData.length === 0}
                />
              </TableCell>

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
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => {
              const isItemSelected = isSelected(row.watchlistId);
              return (
                <TableRow 
                  key={index} 
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                >
                  {/* CELLA CHECKBOX PER LA SINGOLA RIGA */}
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.watchlistId)}
                    />
                  </TableCell>
                  
                  <TableCell
                    sx={{ cursor: "pointer", color: "primary.main", fontWeight: 500 }}
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};