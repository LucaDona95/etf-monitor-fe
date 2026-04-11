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
import { AlertDialog } from "../components/alertDialog";

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


  const alertTypeMap=new Map([
    ['TER_CHANGE','Ter Change'],
    ['INACTIVATION','Inactivation'],
    ['PRICE_ABOVE','Price Above'],
    ['PRICE_UNDER','Price Under'],
    ['VOLUME_ABOVE','Volume Above'],
    ['VOLUME_UNDER','Volume Under'],
    ['YIELD_ABOVE','Yield abobe'],
    ['YIELD_UNDER','Yield Under']
  ]);

    const buttonContainer = { display: "flex", float: "right" };

  const { userData } = useContext(AppContext);

  const location = useLocation();

    const [alertConditionList, setAlertConditionList]  = useState([] as any[]);

    const [availableAlertTypeList,setAvailableAlertTypeList]= useState([] as any[]);

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);

    const [editingAlert,setEditingAlert]= useState({});



      useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      let watchlistData = location.state;
      loadData(watchlistData.id);
    }
  }, []);

  const loadData = (id: number) => {
    let loadUrl = "http://localhost:8081/api/watchlist/" + id;

    let config = {
            headers: {
              'Authorization': "Bearer " + userData.jwtToken
          }
                
      };


    axios.get(loadUrl,config).then((response) => {
      console.log(response);

      // Todo ordinarle di default

    
      setAlertConditionList(response.data.alertConditionlist);
    });
  };


    const toNewAlert = () =>{

    let tmp={
      id:null,
      alertType:'',
      isActive:false,
      price:0,
      volume:0,
      etfYield:0,
      yieldInterval:''
    }


      let tmpMap=new Map();

      let tmpList=[];

     for(let condition of alertConditionList){

      if(alertTypeMap.has(condition.conditionType)){
          tmpMap.set(condition.conditionType,alertTypeMap.get(condition.conditionType));
      }

     }


     for( const [a,b] of alertTypeMap){

      if(!tmpMap.has(a)){
          tmpList.push({value:a,label:b});
      }
     }

     console.log("available type lsit:");
     console.log(tmpList);

      setAvailableAlertTypeList(tmpList);

      setEditingAlert(tmp);
      setAlertDialogOpen(true);
      
    }


    const handleSaveAlert = (alertData: any) => {
      
      let url="http://localhost:8081/api/watchlist"


      const config={
      headers: {
        'Authorization': "Bearer " + userData.jwtToken
      }};


        let request={
        watchlistItemId:location.state.id,
        operationList:[{
          id: alertData.id,
          operation : alertData.action,
          alertOperationContent:{
            active: alertData.active,
            threshold: alertData.threshold,
            conditionType: alertData.conditionType,
            checkInterval: alertData.checkInterval

          }
        }]
      }

      console.log(request);


      axios.put(url,request, config).then((response: any) => {
            console.log(response);


        loadData(location.state.id)

        });



    }



    const toEditAlert = (alertData: any) =>{

      let tmp={
      id:alertData.id,
      alertType:alertData.conditionType,
      isActive:alertData.active,
      price:alertData.conditionType==='PRICE_UNDER' || alertData.conditionType==='PRICE_ABOVE'?alertData.threshold:0 ,
      volume:alertData.conditionType==='VOLUME_UNDER' || alertData.conditionType==='VOLUME_ABOVE'?alertData.threshold:0,
      etfYield:alertData.conditionType==='YIELD_UNDER' || alertData.conditionType==='YIELD_ABOVE'?alertData.threshold:0,
      yieldInterval:alertData.checkInterval
    }

   
     let tmpMap=new Map();

      let tmpList=[];

     for(let condition of alertConditionList){

      if(alertTypeMap.has(condition.conditionType)){

        if(condition.conditionType!==alertData.conditionType){
          tmpMap.set(condition.conditionType,alertTypeMap.get(condition.conditionType));
          }
        }
          

     }


     for( const [a,b] of alertTypeMap){

      if(!tmpMap.has(a)){
          tmpList.push({value:a,label:b});
      }
     }

     console.log("available type lsit:");
     console.log(tmpList);

      setAvailableAlertTypeList(tmpList);




      setEditingAlert(tmp);

      setAlertDialogOpen(true);


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

      <Box sx={buttonContainer}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={alertConditionList.length>=8}
            onClick={toNewAlert}
          >
            ADD ALERT
          </Button>
            <AlertDialog availableAlertTypeList={availableAlertTypeList} alertDialogOpen={alertDialogOpen} setAlertDialogOpen={setAlertDialogOpen} 
            handleSaveAlert={handleSaveAlert} editingAlert={editingAlert} setEditingAlert={setEditingAlert}></AlertDialog>
        </Box>

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
                <TableCell >{alertTypeMap.get(row.conditionType)}</TableCell>
                <TableCell>{row.threshold}</TableCell>
                <TableCell>{row.active?"YES":"NO"}</TableCell>
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