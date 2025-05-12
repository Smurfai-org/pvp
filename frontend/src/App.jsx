import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login/Login";
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
import CourseList from "./pages/CourseList/CourseList";
import ViewProfile from "./pages/ViewProfile/ViewProfile";
import Register from "./pages/Register/Register";
import ViewTC from "./pages/ViewTC/ViewTC";
import ViewHints from "./pages/viewHints/ViewHints";
import PremiumSelection from "./pages/PremiumPage/PremiumPage";
import PremiumArea from "./pages/PremiumPage/PremiumArea";
import SubscribePage from "./pages/PremiumPage/SubscribePage";

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
              <Route path="/view_problem/:id/testcases/" element={<ViewTC />} />
              <Route path="/view_problem/:id/hints/" element={<ViewHints />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/premium" element={<PremiumSelection />} />
              <Route path="/premium-area" element={<PremiumArea />} />
              <Route path="/subscribe" element={<SubscribePage />} />
              <Route
                path="/generate_problem/:id"
                element={<GenerateProblem />}
              />
              <Route path="/courses/:id" element={<Course />} />
              <Route path="/profile" element={<ViewProfile />} />
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
