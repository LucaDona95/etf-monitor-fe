import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem
} from "@mui/material";

import { useState, useEffect } from "react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

import { NumericFormat } from "react-number-format";
import * as React from "react";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PercentageFormat = React.forwardRef<HTMLInputElement, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value || "",
            },
          });
        }}
        valueIsNumericString
        decimalScale={2}
        decimalSeparator="."
        allowNegative={false}
        isAllowed={(values) => {
          const { floatValue } = values;
          return floatValue === undefined ? true : floatValue <= 100;
        }}
      />
    );
  },
);

const AmountFormat = React.forwardRef<HTMLInputElement, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value || "",
            },
          });
        }}
        valueIsNumericString
        decimalScale={2}
        decimalSeparator="."
        allowNegative={false}
        isAllowed={(values) => {
          const { floatValue } = values;
          return floatValue === undefined;
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
                    localFilters.mainFilter
                  }
                  onChange={(e) =>
                    handleInputChange("mainFilter", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Distribution Type"
                  value={localFilters.typeFilter}
                  onChange={(e) =>
                    handleInputChange("typeFilter", e.target.value)
                  }
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>All (No filter)</em>
                  </MenuItem>

                  <MenuItem value="ACC">Accumulation</MenuItem>
                  <MenuItem value="DIST">Distribution</MenuItem>
                </TextField>
              </Grid>

               <Grid size={{ xs: 12 }}>
                  <TextField
                  fullWidth
                  select
                  label="Sustainable"
                  value={localFilters.sustainable}
                  onChange={(e) =>
                    handleInputChange("sustainable", e.target.value)
                  }
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>All (No filter)</em>
                  </MenuItem>

                  <MenuItem value="true">YES</MenuItem>
                  <MenuItem value="false">NO</MenuItem>
                </TextField>
                
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
                      inputComponent: PercentageFormat as any,
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
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Price From"
                  name="priceFrom"
                  value={localFilters.priceFrom}
                  onChange={(e) =>
                    handleInputChange("priceFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Price To"
                  name="priceTo"
                  value={localFilters.priceTo}
                  onChange={(e) => handleInputChange("priceTo", e.target.value)}
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="d1 yield From (%)"
                  name="d1YieldFrom"
                  value={localFilters.d1YieldFrom}
                  onChange={(e) =>
                    handleInputChange("d1YieldFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="d1 yield To (%)"
                  name="d1YieldTo"
                  value={localFilters.d1YieldTo}
                  onChange={(e) =>
                    handleInputChange("d1YieldTo", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="m1 yield From (%)"
                  name="m1YieldFrom"
                  value={localFilters.m1YieldFrom}
                  onChange={(e) =>
                    handleInputChange("m1YieldFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="m1 yield To (%)"
                  name="m1YieldTo"
                  value={localFilters.m1YieldTo}
                  onChange={(e) =>
                    handleInputChange("m1YieldTo", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="y1 yield From (%)"
                  name="y1YieldFrom"
                  value={localFilters.y1YieldFrom}
                  onChange={(e) =>
                    handleInputChange("y1YieldFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="y1 yield To (%)"
                  name="y1YieldTo"
                  value={localFilters.y1YieldTo}
                  onChange={(e) =>
                    handleInputChange("y1YieldTo", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: PercentageFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Fund size from"
                  name="fundSizeFrom"
                  value={localFilters.fundSizeFrom}
                  onChange={(e) =>
                    handleInputChange("fundSizeFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Fund size to"
                  name="fundSizeTo"
                  value={localFilters.fundSizeTo}
                  onChange={(e) =>
                    handleInputChange("fundSizeTo", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Market volume from"
                  name="marketVolumeFrom"
                  value={localFilters.marketVolumeFrom}
                  onChange={(e) =>
                    handleInputChange("marketVolumeFrom", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Market volume to"
                  name="marketVolumeTo"
                  value={localFilters.marketVolumeTo}
                  onChange={(e) =>
                    handleInputChange("marketVolumeTo", e.target.value)
                  }
                  slotProps={{
                    input: {
                      inputComponent: AmountFormat as any,
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
