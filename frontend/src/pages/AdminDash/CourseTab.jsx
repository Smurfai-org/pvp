import { useEffect, useState, useContext } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "../../utils/MessageProvider";
import AuthContext from "../../utils/AuthContext";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import LoginPrompt from "../../components/LoginPrompt";
import cookies from "js-cookie";
import { SearchBar } from "../../components/SearchBar";
import Dropdown from "../../components/Dropdown";
import ToggleSwitch from "../../components/Toggle";

function CourseTab() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
    const [filteredCourses, setFilteredCourses] = useState(courses);
    const [toggleState, setToggleState] = useState(false);
    const [finalCourses, setFinalCourses] = useState([]);
    const [selectOptions, setSelectOptions] = useState(['A-Z', 'Z-A', 'Sukūrimo datą']);

  
    const tokenCookie = cookies.get("token");
  
  
    const fetchData = async () => {
      try {
        const req = await fetch(`http://localhost:5000/course/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!req.ok) {
          throw new Error(res.status);
        }
        const res = await req.json();
  
        setCourses(res);
      } catch {
        showErrorMessage("Nepavyko rasti kursų");
      } finally {
        setIsLoaded(true);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const handleCreate = () => {
      navigate("/create_course");
    };
  
    const handleCardClick = (id) => {
      navigate(`/view_course/${id}`);
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm("Ar tikrai norite ištrinti šį kursą?")) return;
  
      try {
        const response = await fetch(
          `http://localhost:5000/course/delete?id=${id}`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${tokenCookie}`,
            },
            credentials: "include",
            body: JSON.stringify({ id }),
          }
        );
  
        if (!response.ok) {
          throw new Error("Nepavyko ištrinti kurso");
        }
  
        showSuccessMessage("Kursas sėkmingai ištrintas!");
  
        fetchData();
      } catch (error) {
        console.error("Klaida:", error);
        showErrorMessage(error.message || "Nepavyko ištrinti kurso");
      }
    };
  
    const handleRecover = async (id) => {
      if (!window.confirm("Ar tikrai norite atkurti šį kursą?")) return;
  
      try {
        const response = await fetch(`http://localhost:5000/course/restore?`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenCookie}`,
          },
          body: JSON.stringify({ id }),
          credentials: "include",
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Klaida atkuriant kursą");
        }
  
        showSuccessMessage("Kursas sėkmingai atkurtas!");
        window.location.reload();
      } catch {
        showErrorMessage("Klaida atkuriant kursą");
      }
    };

    useEffect(() => {
        const temp = toggleState 
          ? filteredCourses.filter(c => c.deleted) 
          : filteredCourses.filter(c => !c.deleted);
      
        setFinalCourses(temp);
      }, [toggleState, filteredCourses]);

    const handleSearch = (searchText) => {
        if (!searchText.trim()) {
          setFilteredCourses(courses);
          return;
        }
      
        const lowerSearch = searchText.toLowerCase().trim();
    
        const filtered = courses.filter(course => {
          return course.name.toLowerCase().includes(lowerSearch) || 
                 course.description.toLowerCase().includes(lowerSearch);
        });
      
        setFilteredCourses(filtered);
    };
    
    const nonDeletedCourses = filteredCourses.filter((course) => !course.deleted);
    const deletedCourses = filteredCourses.filter((course) => course.deleted);

    const handleSort = (option) => {
        const temp = toggleState ? deletedCourses : nonDeletedCourses;
        switch (option) {
            case 'A-Z':
                setFinalCourses([...temp].sort((a, b) => a.name.localeCompare(b.name)));
                break;
            case 'Z-A':
                setFinalCourses([...temp].sort((a, b) => b.name.localeCompare(a.name)));
                break;
            case 'Sukūrimo datą':
                setFinalCourses([...temp].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
                break;
            default:
                setFinalCourses(temp);
                break;
        }
    }

    const handleToggleChange = () => {
        setToggleState(!toggleState);
    }

    return (
        <div className="dashboard">
          <h2>Administratoriaus skydelis</h2>
          <div className="admin-dash-actions">
            <Button onClick={handleCreate}>Sukurti kursą</Button>
            <SearchBar onSearch={handleSearch} />
            <Dropdown placeholder="Rikiuoti" options={selectOptions} onSelect={handleSort}/>
            <ToggleSwitch onToggleChange={handleToggleChange}>{toggleState ? 'Ištrinti kursai' : 'Esami kursai'}</ToggleSwitch>
          </div>
      
          <h2>Kursai</h2>
          {isLoaded ? (
            <>
              <div className="admin-dashboard">
                {finalCourses.length ? (
                  finalCourses.map((course) => (
                    <div className="course-card-container" key={course.id}>
                      <Card
                        title={course.name}
                        paragraph={course.description}
                        onClick={() => handleCardClick(course.id)}
                        showActions={true}
                        onDelete={() => {
                            toggleState ?
                            handleRecover(course.id)
                            :
                            handleDelete(course.id);
                        }}
                        isDeleted={toggleState}
                      />
                    </div>
                  ))
                ) : (
                  <p>Nerasta</p>
                )}
              </div>
            </>
          ) : (
            <AnimatedLoadingText />
          )}
        </div>
      );      
}

export default CourseTab