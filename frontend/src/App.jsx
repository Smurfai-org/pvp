import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import Navbar from "./components/NavBar";
import AdminDash from "./pages/adminDash/adminDash";
import CourseCreate from "./pages/CourseCreate/CourseCreate";
import ViewCourse from "./pages/ViewCourse/ViewCourse";
import AddProblem from "./pages/AddProblem/AddProblem";
import Problem from "./pages/Problem/Problem";

function AppRoutes() {
  const location = useLocation();
  const hideNavbarRoutes = ["/problem/:id"];

  const shouldShowNavbar = !hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route.replace(":id", ""))
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin_dash" element={<AdminDash />} />
        <Route path="/create_course" element={<CourseCreate />} />
        <Route path="/view_course/:id" element={<ViewCourse />} />
        <Route
          path="/problem/:id"
          element={<Problem previousProblemId={0} nextProblemId={2} />}
        />
        <Route path="/add_problem" element={<AddProblem />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
