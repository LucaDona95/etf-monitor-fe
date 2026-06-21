import {
  Button, Box, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
  Grid, TextField, FormControl, InputLabel, Select
} from '@mui/material';
import { FormControlLabel, Switch } from '@mui/material';
import * as React from 'react';
import { NumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const yieldIntervalList = [
  { value: "D1", label: "1 giorno" },
  { value: "M1", label: "1 mese" },
  { value: "M3", label: "3 mesi" },
  { value: "M6", label: "6 mesi" },
  { value: "Y1", label: "1 anno" },
  { value: "Y3", label: "3 anni" },
  { value: "Y5", label: "5 anni" },
];

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
        allowNegative={true}
        isAllowed={(values) => {
          const { floatValue } = values;
          return floatValue === undefined ? true : floatValue <= 100 && floatValue >=-100;
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
          
          return true;
        }}
      />
    );
  },
);

export const AlertDialog = (props: any) => {

  const handleAlertTypeChange = (event: any) => {
    const updatedAlert = { 
      ...props.editingAlert, 
      alertType: event.target.value as string 
    };
    props.setEditingAlert(updatedAlert);
  };

  const handleYieldIntervalChange = (event: any) => {
    const updatedAlert = { 
      ...props.editingAlert, 
      yieldInterval: event.target.value as string 
    };
    props.setEditingAlert(updatedAlert);
  };

  // FISSA-CORREZIONE: Allineato all'uso di .active invece di .isActive
  const handleSetActive = (event: any) => {
    const updatedAlert = { 
      ...props.editingAlert, 
      active: event.target.checked as boolean 
    };
    props.setEditingAlert(updatedAlert);
  };

  const handleClose = () => {
    props.setAlertDialogOpen(false);
  };

  const handleSave = () => {
    let threshold = 
      props.editingAlert.alertType === 'PRICE_ABOVE' || props.editingAlert.alertType === 'PRICE_UNDER' ? props.editingAlert.price :
      props.editingAlert.alertType === 'VOLUME_ABOVE' || props.editingAlert.alertType === 'VOLUME_UNDER' ? props.editingAlert.volume :
      props.editingAlert.alertType === 'YIELD_ABOVE' || props.editingAlert.alertType === 'YIELD_UNDER' ? props.editingAlert.etfYield : null;

    let data = {
      id: props.editingAlert.id,
      action: props.editingAlert.id === null ? "INSERT" : "UPDATE",
      active: !!props.editingAlert.active, // Forza il cast a booleano sicuro
      checkInterval: props.editingAlert.yieldInterval,
      conditionType: props.editingAlert.alertType,
      threshold: threshold
    };

    handleClose();
    props.handleSaveAlert(data);
  };

  // UX Fix per etichette leggibili nella select se in modalità Modifica
  const displayAlertTypeList = [...props.availableAlertTypeList];
  if (props.editingAlert?.alertType && !displayAlertTypeList.some(item => item.value === props.editingAlert.alertType)) {
    displayAlertTypeList.push({
      value: props.editingAlert.alertType,
      label: props.editingAlert.alertType.replace('_', ' ').toLowerCase()
    });
  }

  return (
    <Dialog 
      open={props.alertDialogOpen} 
      onClose={handleClose} 
      aria-labelledby='dialog-edit-alert' 
      aria-describedby='alert-edit-content'
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id='dialog-edit-alert'>
        {props.editingAlert?.id ? "Edit Alert" : "Add New Alert"}
      </DialogTitle>
      
      <DialogContent id='alert-edit-content'>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="alert-type-label">Alert Type</InputLabel>
                <Select
                  labelId="alert-type-label"
                  id="alert-type-id"
                  value={props.editingAlert.alertType || ''}
                  label="Alert Type"
                  onChange={handleAlertTypeChange}
                  disabled={props.editingAlert?.id !== null}
                >
                  {displayAlertTypeList.map((row: any, index: number) => (
                    <MenuItem key={index} value={row.value}>{row.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={!!props.editingAlert.active} 
                    color="primary" 
                    onChange={handleSetActive} 
                  />
                } 
                label="Is Active" 
              />
            </Grid>

            {/* --- SEZIONE PREZZO --- */}
            {(props.editingAlert.alertType === 'PRICE_ABOVE' || props.editingAlert.alertType === 'PRICE_UNDER') && (
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label='Price Threshold' 
                  variant="outlined"
                  slotProps={{ input: { inputComponent: AmountFormat as any } }}
                  value={props.editingAlert.price || ''} 
                  onChange={(e: any) => {
                    props.setEditingAlert({ ...props.editingAlert, price: e.target.value });
                  }}
                />
              </Grid>
            )}
            
            {/* --- SEZIONE VOLUME --- */}
            {(props.editingAlert.alertType === 'VOLUME_ABOVE' || props.editingAlert.alertType === 'VOLUME_UNDER') && (
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label='Volume Threshold' 
                  variant="outlined"
                  slotProps={{ input: { inputComponent: AmountFormat as any } }}
                  value={props.editingAlert.volume || ''} 
                  onChange={(e: any) => {
                    props.setEditingAlert({ ...props.editingAlert, volume: e.target.value });
                  }}
                />
              </Grid>
            )}

            {/* --- SEZIONE RENDIMENTO (YIELD) --- */}
            {(props.editingAlert.alertType === 'YIELD_ABOVE' || props.editingAlert.alertType === 'YIELD_UNDER') && (
              <>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label='Yield % Threshold' 
                    variant="outlined"
                    slotProps={{ input: { inputComponent: PercentageFormat as any } }}
                    value={props.editingAlert.etfYield || ''} 
                    onChange={(e: any) => {
                      props.setEditingAlert({ ...props.editingAlert, etfYield: e.target.value });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel id="yield-interval-label">Interval</InputLabel>
                    <Select
                      labelId="yield-interval-label"
                      id="yield-interval-id"
                      value={props.editingAlert.yieldInterval || ''}
                      label="Interval"
                      onChange={handleYieldIntervalChange}
                    >
                      {yieldIntervalList.map((row: any, index: number) => (
                        <MenuItem key={index} value={row.value}>{row.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!props.editingAlert.alertType}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};