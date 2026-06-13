import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
} from "@mui/material";

import { useState, useEffect } from "react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import * as React from "react";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TerFormat = React.forwardRef<HTMLInputElement, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref} // MUI v6 passerà il ref qui
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value || "", // Evita di passare stringa vuota come null
            },
          });
        }}
        valueIsNumericString
        decimalScale={2} // Impostato a 2 decimali come avevi chiesto prima
        decimalSeparator="."
        allowNegative={false}
        isAllowed={(values) => {
          const { floatValue } = values;
          return floatValue === undefined ? true : floatValue <= 10;
        }}
      />
    );
  },
);

export const EtfSearchDialog = ({
  open,
  onClose,
  currentFilters,
  onApplyFilters,
}: any) => {
  const [localFilters, setLocalFilters] = useState<any>({ ...currentFilters });

  useEffect(() => {
    if (open) {
      setLocalFilters({ ...currentFilters });
    }
  }, [open, currentFilters]);

  const handleSearchSubmit = () => {
    const finalFilters: any = {
      ...localFilters,
      page: 1,
    };

    onApplyFilters(finalFilters);
    onClose();
  };

  const handleInputChange = (field: keyof any, value: any) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="dialog-search-etf"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="dialog-search-etf">Search ETF</DialogTitle>

        <DialogContent id="search-etf-content">
          <Box sx={{ width: "100%", mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Main Filter"
                  variant="outlined"
                  id="main-filter-id"
                  value={
                    localFilters.mainFilter != null
                      ? localFilters.mainFilter
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("mainFilter", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="First Trade Date From"
                  value={
                    localFilters.firstTradeDateFrom
                      ? dayjs(localFilters.firstTradeDateFrom)
                      : null
                  }
                  onChange={(newValue: Dayjs | null) => {
                    const formattedDate = newValue
                      ? newValue.format("YYYY-MM-DD")
                      : null;
                    handleInputChange("firstTradeDateFrom", formattedDate);
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="First Trade Date To"
                  value={
                    localFilters.firstTradeDateTo
                      ? dayjs(localFilters.firstTradeDateTo)
                      : null
                  }
                  onChange={(newValue: Dayjs | null) => {
                    const formattedDate = newValue
                      ? newValue.format("YYYY-MM-DD")
                      : null;
                    handleInputChange("firstTradeDateTo", formattedDate);
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="TER From (%)"
                  name="terFrom"
                  value={localFilters.terFrom}
                  onChange={(e) => handleInputChange("terFrom", e.target.value)}
                  // Questo è il modo corretto e moderno in MUI v6 per iniettare TerFormat
                  slotProps={{
                    input: {
                      inputComponent: TerFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="TER To (%)"
                  name="terTo"
                  value={localFilters.terTo}
                  onChange={(e) => handleInputChange("terTo", e.target.value)}
                  slotProps={{
                    input: {
                      inputComponent: TerFormat as any,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSearchSubmit}
            variant="contained"
            color="primary"
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
