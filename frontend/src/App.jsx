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
import AdminDash from "./pages/AdminDash/AdminDash";
import CourseCreate from "./pages/CourseCreate/CourseCreate";
import Main from "./pages/Main/Main";
import ViewCourse from "./pages/ViewCourse/ViewCourse";
import AddProblem from "./pages/AddProblem/AddProblem";
import Problem from "./pages/Problem/Problem";
import ViewProblem from "./pages/ViewProblem/ViewProblem";
import GenerateProblem from "./pages/GenerateProblem/GenerateProblem";
import { GoogleOAuthProvider } from "@react-oauth/google";
import NotFound from "./pages/NotFound/NotFound";
import MessageProvider from "./utils/MessageProvider";
import Profile from "./pages/AuthTest";
import { AuthProvider } from "./utils/AuthContext";
import Course from "./pages/Course/Course";
import CourseList from "./pages/CourseList/CourseList"

function AppRoutes() {
  const location = useLocation();
  const hideNavbarRoutes = ["/problems/:id"];

  const shouldShowNavbar = !hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route.replace(":id", ""))
  );

  return (
    <>
      <AuthProvider>
        <MessageProvider>
          <GoogleOAuthProvider clientId="280766696047-1u5pgobckg0qgi6crngv11gsqur7p25p.apps.googleusercontent.com">
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
              <Route path="/courses" element={<CourseList />} />
              <Route
                path="/generate_problem/:id"
                element={<GenerateProblem />}
              />
              <Route path="/courses/:id" element={<Course />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/*" element={<NotFound />} />
 
            </Routes>
          </GoogleOAuthProvider>
        </MessageProvider>
      </AuthProvider>
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
