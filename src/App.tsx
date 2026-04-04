import { MainPage } from "./pages/mainPage";
import { EtfPage } from "./pages/etfPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MuiNavbar } from "./components/MuiNavbar";
import {EtfDetail} from "./pages/etf-detail";
import {Registration} from "./pages/registration";
import {useState,createContext} from 'react';
import {Login} from './pages/login';
import {EditAlert} from './pages/editAlert';
import {UserData} from './store/user-data';
import {Watchlist} from './pages/watchlist';
import { Alert } from "@mui/material";


export const AppContext=createContext<any>({});

function App() {


  const [userData,setUserData]=useState(null);

  return (
    <div>
     
      <AppContext.Provider value={{userData,setUserData}}>
      
      <Router>
        <MuiNavbar />
        <Routes> 
          <Route path="/" element={<MainPage />} />
          <Route path="/etf" element={<EtfPage />}></Route>
          <Route path="/etfDetail" element={<EtfDetail />}></Route>
          <Route path="/registration" element={<Registration />}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/watchlist" element={<Watchlist/>}></Route>
          <Route path="/alert" element={<Alert/>}></Route>
        </Routes>
      </Router>
      </AppContext.Provider>
      
    </div>
  );
}

export default App;
