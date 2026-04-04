import {
  TableContainer, Paper, Table, TableBody, TableCell, Button, TableHead, Box, TableRow, TableSortLabel, Typography, Link, MenuItem,Checkbox,ListItemText
  , Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, TextField, FormControl, InputLabel, Input, OutlinedInput, Autocomplete, Select, SelectChangeEvent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect, useRef } from 'react';
import * as React from 'react';

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



export const MovieSearchDialog = (props: any) => {


      const shouldLoad = useRef(true);



    
const doSearchRequest = () => {
    props.dialogOpenFunc(false);
    props.pageNumFunc(1);

    props.loadDataFunc(1, props.orderBy, props.order);


  }


  return (
    <Dialog open={props.dialogOpen} onClose={() => props.dialogOpenFunc(false)} aria-labelledby='dialog-search-etf' aria-describedby='etf-search-content'>
             <DialogTitle id='dialog-search-etf'>Search etf</DialogTitle>
      <DialogContent id='etf-search-content'>

        <Box sx={{ width: '50%', margin: '5% auto' }}>
             <Grid size={{ xs: 12, sm: 6 }}>
                <Item>
                    <TextField sx={{ margin: "1rem" }} fullWidth label='Testo' variant="outlined" value={props.searchData.mainFilter} onChange={(e: any) => {

                const { value } = e.target;
                props.setSearchData({
                  ...props.searchData,
                  mainFilter: value
                });

              }}></TextField>

                </Item>


            </Grid>
            <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Ter' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minTer} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minTer: value
                  });

                }}></TextField>

                </Item>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max Ter' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxTer} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxTer: value
                  });

                }}></TextField>

                </Item>


            </Grid>



            <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Price' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minPrice} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minPrice: value
                  });

                }}></TextField>

                </Item>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max Price' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxPrice} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxPrice: value
                  });

                }}></TextField>

                </Item>


            </Grid>



            <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Year yield' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minYearYield} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minYearYield: value
                  });

                }}></TextField>

                </Item>


                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max PyiearYield' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxYiearYield} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxYiearYield: value
                  });

                }}></TextField>

                </Item>

                 <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Year yield' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minYearYield} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minYearYield: value
                  });

                }}></TextField>

                </Item>


                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max Year Yield' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxYiearYield} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxYiearYield: value
                  });

                }}></TextField>

                </Item>


            </Grid>

                <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Fund Size' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minFundSize} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minFundSize: value
                  });

                }}></TextField>

                </Item>


                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max Fund Size' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxFundSize} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxFundSize: value
                  });

                }}></TextField>

                </Item>


            </Grid>


            </Grid>

                <Grid  size={{ xs: 6, sm: 3 }}>

                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Min Market Volume' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.minMarketVolume} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    minMarketVolume: value
                  });

                }}></TextField>

                </Item>


                <Item>
                     <TextField sx={{ margin: "1rem" }} fullWidth label='Max Market Volume' variant="outlined"
                slotProps={{
                    input:{
                        inputComponent: TerFormat as any
                    }
                  
                }}
                value={props.searchData.maxMarketVolume} onChange={(e: any) => {
                  const { value } = e.target;
                  props.setSearchData({
                    ...props.searchData,
                    maxMarketVolume: value
                  });

                }}></TextField>

                </Item>


            </Grid>




        </Box>



      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.dialogOpenFunc(false)}>Cancel</Button>
        <Button autoFocus onClick={doSearchRequest}>Search</Button>

      </DialogActions>

    </Dialog>

  )


}