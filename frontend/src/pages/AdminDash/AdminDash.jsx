import { useState } from "react";
import "./AdminDash.css";
import CourseTab from "./CourseTab";
import UserTab from "./UserTab";
import { useContext } from "react";
import AuthContext from "../../utils/AuthContext";
import LoginPrompt from "../../components/LoginPrompt";

function AdminDash() {
  const { user, loggedIn } = useContext(AuthContext);
  const [tabs, setTabs] = useState(['Kursai', 'Naudotojai']);
  const [openTab, setOpenTab] = useState('Kursai');

  if (!loggedIn || user.role != "admin") {
    return <LoginPrompt />;
  }

  const ToggleTab = (tab) => {
    setOpenTab(tab);
  }

  const renderTab = () => {
    switch (openTab) {
      case 'Kursai':
        return <CourseTab />;
      case 'Naudotojai':
        return <UserTab />;
      default:
        return <CourseTab />;
    }
  }

  return(
    <div className="admin-dash-wrapper">
      <div className="admin-nav-container">
        {
          tabs.map((tab) => (
            <div key={tab} className={`admin-dash-tab ${openTab === tab ? 'active' : ''}`} onClick={() => ToggleTab(tab)}>{tab}</div>
          ))
        }
      </div>
      <div className="admin-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default AdminDash;