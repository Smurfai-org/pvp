import { useState } from "react";
import "./AdminDash.css";
import CourseTab from "./CourseTab";
import UserTab from "./UserTab";
import { useContext } from "react";
import AuthContext from "../../utils/AuthContext";
import LoginPrompt from "../../components/LoginPrompt";
import ExitIcon from '../../assets/leave-icon.svg';
import { useNavigate } from "react-router-dom";

function AdminDash() {
  const { user, loggedIn } = useContext(AuthContext);
  const [tabs, setTabs] = useState(['Kursai', 'Naudotojai']);
  const [openTab, setOpenTab] = useState('Kursai');
  const navigate = useNavigate();

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

  const handleExit = () => {
    navigate('/');
  }

  return(
    <div className="admin-dash-wrapper">
      <div className="admin-nav-container">
        <div className="admin-dash-tab exit-btn"  onClick={() => handleExit()}><img src={ExitIcon} className="admin-exit-icon"/>Išeiti</div>
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