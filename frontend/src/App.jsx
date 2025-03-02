import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import Navbar from "./components/NavBar";
import AdminDash from "./pages/adminDash/adminDash";
import CourseCreate from "./pages/CourseCreate/CourseCreate";

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin_dash" element={<AdminDash/>}/>
          <Route path="/create_course" element={<CourseCreate />}/>
        </Routes>
      </Router>

  );
}

export default App;
