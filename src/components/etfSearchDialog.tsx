import {
  Button, Box, 
   Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useState } from "react";

import { NumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}


const Item = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(2),
  borderRadius: '4px',
  display: 'flex'
}));




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
        decimalScale={1}
        decimalSeparator="."
        allowNegative={false}
        isAllowed={(values: any) => {

          return values.floatValue <= 10 || !values.floatValue;
        }}
      />
    );
  },
);


export const EtfSearchDialog = (props: any) => {



const handleSearch = () => {
 
          const updatedSearchData = { 
        ...props.tmpSearchData, 
        page: 1
    };


    props.setSearchDialogOpen(false);
    props.setSearchData(updatedSearchData);
    props.handleSearch(updatedSearchData);


  }


    const handleClose = () =>{

    props.setSearchDialogOpen(false);
  }


    const mainFilterChange = (event: any) => {


       const updatedSearchData = { 
        ...props.tmpSearchData, 
        mainFilter: event.target.value as string
    };

    props.setTmpSearchData(updatedSearchData);
    console.log("Main filter selected: "+event.target.value);
  };



  return (
    <Dialog open={props.searchDialogOpen} onClose={handleClose} aria-labelledby='dialog-search-etf' aria-describedby='search-etf-content'>
            <DialogTitle id='dialog-search-etf'>Search etf</DialogTitle>
                <DialogContent id='search-etf-content'>
                     <Box sx={{ width: '100%', margin: '5% auto' }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
    
                  
                                <TextField sx={{ margin: "1rem" }} fullWidth  label="Main Filter" variant="outlined"
                              
                                    id="main-filter-id"
                                    value={props.tmpSearchData.mainFilter==null?"":props.tmpSearchData.mainFilter}
                                   
                                    onChange={mainFilterChange}
                                >
                                  
                                </TextField>
                           
                        </Grid>
                      
                     </Box>
    
                </DialogContent>
    
                 <DialogActions>
                     <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSearch}>Search</Button>
    
                    </DialogActions>
    
        </Dialog>

  )


}