import { MainPage } from "./pages/mainPage";
import { EtfPage } from "./pages/etfPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MuiNavbar } from "./components/MuiNavbar";

function App() {
  return (
    <div>
      <Router>
        <MuiNavbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/etf" element={<EtfPage />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
