import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/Register";
import Examples from "./pages/Examples";
import Navbar from "./components/NavBar";
import AdminDash from "./pages/adminDash/adminDash";
import CourseCreate from "./pages/CourseCreate/CourseCreate";
import Main from "./pages/Main/Main";
import ViewCourse from "./pages/ViewCourse/ViewCourse";
import AddProblem from "./pages/AddProblem/AddProblem";
import Problem from "./pages/Problem/Problem";
import ViewProblem from "./pages/ViewProblem/ViewProblem";
import GenerateProblem from "./pages/GenerateProblem/GenerateProblem";
import Course from "./pages/Course/Course";

function AppRoutes() {
  const location = useLocation();
  const hideNavbarRoutes = ["/problems/:id"];

  const shouldShowNavbar = !hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route.replace(":id", ""))
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/exam" element={<Examples />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin_dash" element={<AdminDash />} />
        <Route path="/create_course" element={<CourseCreate />} />
        <Route path="/view_course/:id" element={<ViewCourse />} />
        <Route path="/problems/:id" element={<Problem />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route path="/add_problem/:id" element={<AddProblem />} />
        <Route path="/view_problem/:id" element={<ViewProblem />} />
        <Route path="/generate_problem/:id" element={<GenerateProblem />} />
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
