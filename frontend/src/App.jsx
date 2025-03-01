import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import Navbar from "./components/NavBar";
import AdminDash from "./pages/adminDash/adminDash";

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin_dash" element={<AdminDash/>}/>
        </Routes>
      </Router>

  );
}

export default App;
