import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Margin } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../App";

import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";



export const EditAlert = () => {

  // 1) ter change
  // 2) inactivation
  // 3) price over threshold
  // 4) price under threshold
  // 5) volume over threshold
  // 6) volume under threshold
  // 7) yield over threshold (by time range)
  // 8) yield over threshold (by time range)


  const shouldLoad = useRef(true);

  const { userData } = useContext(AppContext);

  const location = useLocation();

    const [alertConditionList, setAlertConditionList]  = useState([] as any[]);

      useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      let watchlistData = location.state;
      loadData(watchlistData.id);
    }
  }, []);

  const loadData = (id: number) => {
    let loadUrl = "http://localhost:8081/api/watchlist/" + id;

    axios.get(loadUrl).then((response) => {
      console.log(response);

      // Todo ordinarle di default

      setAlertConditionList(response.data.alertConditionlist);
    });
  };


    const toEditAlert = (alertData: any) =>{


      
    }


    const removeAlert = (alertData: any) => {

      let url="http://localhost:8081/api/watchlist"


      const config={
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }};

      let request={
        watchlistItemId:location.state.id,
        operationList:{
          id: alertData.id,
          operation : "DELETE"
        }
      }

      axios.put(url,request, config).then((response: any) => {
            console.log(response);

          const updatedList = alertConditionList.filter(a => a.id!==alertData.id);


        console.log(updatedList);

        setAlertConditionList(updatedList);

           
        });

    }

  
  return(
 <Paper sx={{ width: "80%", overflow: "hidden", margin: "3rem auto" }}>
      <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
        ALERT TABLE
      </Typography>
          <TableContainer sx={{ maxHeight: "35rem" }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>tipo Condizione</TableCell>
                  <TableCell>Soglia</TableCell>
                  <TableCell>Attivo</TableCell>
                  <TableCell>Ultima Notifica</TableCell>
                  <TableCell>Edit</TableCell>
                </TableRow>


            </TableHead>

             <TableBody>

              {alertConditionList.map((row, index) => (
              <TableRow key={index} tabIndex={-1}>
                <TableCell >{row.conditionType}</TableCell>
                <TableCell>{row.value}</TableCell>
                <TableCell>{row.active}</TableCell>
                <TableCell>{row.lastNotified}</TableCell>
              
                <TableCell>
                  <Button type='submit' variant='contained' color='primary' onClick={() => removeAlert(row)} >
                      Delete
                    </Button>
                     <Button type='submit' variant='contained' color='primary' onClick={() => toEditAlert(row)} >
                      Edit
                    </Button>
                    </TableCell>
              </TableRow>
            ))}
             </TableBody>


            </Table>





      </TableContainer>
  </Paper>
  );


}