import {
  TableContainer, Paper, Table, TableBody, TableCell, Button, TableHead, Box, TableRow, TableSortLabel, Typography, Link, MenuItem,Checkbox,ListItemText
  , Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, TextField, FormControl, InputLabel, Input, OutlinedInput, Autocomplete, Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect, useRef } from 'react';
import * as React from 'react';

import { NumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';
import { FormControlLabel, Switch } from '@mui/material';


interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}


  const yieldIntervalList=[
    {value:"1d",label:"1 giorno"},
    {value:"1wk",label:"1 settimana"},
    {value:"1m",label:"1 mese"},
    {value:"3m",label:"3 mesi"},
    {value:"6m",label:"6 mesi"},
    {value:"1y",label:"1 anno"},
  ];


const TerFormat = React.forwardRef<NumericFormatProps, CustomProps>(
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
              value: values.value,
            },
          });
        }}
        valueIsNumericString
        decimalScale={3}
        decimalSeparator="."
        allowNegative={false}
        isAllowed={(values: any) => {

          return values.floatValue >= 0 || !values.floatValue;
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
    console.log("Alert type selected: "+event.target.value);
  };

  const handleYieldIntervalChange = (event: any) => {


       const updatedAlert = { 
        ...props.editingAlert, 
        yieldInterval: event.target.value as string
    };

    props.setEditingAlert(updatedAlert);
    console.log("Yield interval selected: "+event.target.value);
  };

  const handleSetIsActive = (event: any) => {

       const updatedAlert = { 
        ...props.editingAlert, 
        isActive: event.target.checked as boolean 
    };

    props.setEditingAlert(updatedAlert);
    console.log("is active selected: "+event.target.value);
  };


  const handleClose = () =>{

    props.setAlertDialogOpen(false);
  }


  const handleSave=()=>{

    let threshold=props.editingAlert.alertType==='PRICE_ABOVE' || props.editingAlert.alertType==='PRICE_UNDER' ? props.editingAlert.price:
                  props.editingAlert.alertType==='VOLUME_ABOVE' || props.editingAlert.alertType==='VOLUME_UNDER' ? props.editingAlert.volume:
                  props.editingAlert.alertType==='YIELD_ABOVE' || props.editingAlert.alertType==='YIELD_UNDER' ? props.editingAlert.etfYield: null;

    let data={
      id:props.editingAlert.id,
      action:props.editingAlert.id===null?"INSERT":"UPDATE",
      active:props.editingAlert.isActive,
      checkInterval:props.editingAlert.yieldInterval,
      conditionType:props.editingAlert.alertType,
      threshold:threshold
    }

      handleClose();

      props.handleSaveAlert(data);

  }

  return (
    <Dialog open={props.alertDialogOpen} onClose={handleClose} aria-labelledby='dialog-edit-alert' aria-describedby='alert-edit-content'>
        <DialogTitle id='dialog-edit-alert'>Edit alert</DialogTitle>
            <DialogContent id='alert-edit-content'>
                 <Box sx={{ width: '100%', margin: '5% auto' }}>
                    <Grid size={{ xs: 12, sm: 6 }}>

                        <FormControl fullWidth>
                        
                            <InputLabel id="alert-type-label">Alert Type</InputLabel>
                            <Select
                                labelId="alert-type-label"
                                id="alert-type-id"
                                value={props.editingAlert.alertType}
                                label="Alert Type"
                                onChange={handleAlertTypeChange}
                            >
                                {
                                    props.availableAlertTypeList.map((row:any,index:number)=>(

                                    <MenuItem key={index} value={row.value}>{row.label}</MenuItem>

                                    ))
                                }

        
                            </Select>
                        </FormControl>
                   

                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                             <FormControlLabel control={<Switch checked={props.editingAlert.isActive} color="primary" onChange={handleSetIsActive} />} label="Is Active" />


                        </Grid>

                    {props.editingAlert.alertType=='PRICE_ABOVE' || props.editingAlert.alertType=='PRICE_UNDER' ?

                     <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField sx={{ margin: "1rem" }} fullWidth label='Price' variant="outlined"
                            slotProps={{
                                input:{
                                    inputComponent: TerFormat as any
                                    }
                                          
                                }}
                                value={props.editingAlert.price} onChange={(e: any) => {
                                const { value } = e.target;

                               
                                       const updatedAlert = { 
                                        ...props.editingAlert, 
                                          price: value as number 
                                        };
                                
                                props.setEditingAlert(updatedAlert);

                    
                        
                        }}></TextField>


                     </Grid>:null}
                    
                
                    { props.editingAlert.alertType=='VOLUME_ABOVE' || props.editingAlert.alertType=='VOLUME_UNDER'?

                    <Grid size={{ xs: 12, sm: 6 }}>

                         <TextField sx={{ margin: "1rem" }} fullWidth label='Volume' variant="outlined"
                            slotProps={{
                                input:{
                                    inputComponent: TerFormat as any
                                    }
                                          
                                }}
                                value={props.editingAlert.volume} onChange={(e: any) => {
                                const { value } = e.target;

                  
                                 const updatedAlert = { 
                                        ...props.editingAlert, 
                                          volume: value as number 
                                        };

                                props.setEditingAlert(updatedAlert);
                               
  
                      
                        }}></TextField>


                    </Grid>


                    :null
                    
    
                    }

                    {
                         props.editingAlert.alertType=='YIELD_ABOVE' ||  props.editingAlert.alertType=='YIELD_UNDER' ?

                         <Grid size={{ xs: 12, sm: 6 }}>
                            
                         <TextField sx={{ margin: "1rem" }} fullWidth label='Yield' variant="outlined"
                            slotProps={{
                                input:{
                                    inputComponent: TerFormat as any
                                    }
                                          
                                }}
                                value={props.editingAlert.etfYield} onChange={(e: any) => {
                                const { value } = e.target;

                              
                                 const updatedAlert = { 
                                        ...props.editingAlert, 
                                          etfYield: value as number 
                                        };                                

                                props.setEditingAlert(updatedAlert);

              
  
                        }}></TextField>


                        <FormControl fullWidth>
                        
                            <InputLabel id="yield-interval-label">Interval</InputLabel>
                            <Select
                                labelId="yield-interval-label"
                                id="yield-interval-id"
                                value={ props.editingAlert.yieldInterval}
                                label="Interval"
                                onChange={handleYieldIntervalChange}
                            >
                                {
                                    yieldIntervalList.map((row:any,index:number)=>(

                                    <MenuItem key={index} value={row.value}>{row.label}</MenuItem>

                                    ))
                                }

        
                            </Select>
                        </FormControl>
                            
                         </Grid>

                        :null
                    }


                 </Box>

            </DialogContent>

             <DialogActions>
                 <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}
                disabled={props.editingAlert.alertType==='' || 
                props.editingAlert.alertType===null}
                >Save</Button>

                </DialogActions>

    </Dialog>
  );

}

