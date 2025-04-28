import { useEffect, useState, useContext, useMemo } from "react";
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
    const [searchText, setSearchText] = useState("");
    const [toggleState, setToggleState] = useState(false);
    const [sortOption, setSortOption] = useState('');
    const navigate = useNavigate();
    const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
    const tokenCookie = cookies.get("token");
  
    const fetchData = async () => {
        try {
            const req = await fetch(`http://localhost:5000/course/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!req.ok) throw new Error(req.status);
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
  
    const handleCreate = () => navigate("/create_course");
  
    const handleCardClick = (id) => navigate(`/view_course/${id}`);
  
    const handleDelete = async (id) => {
        if (!window.confirm("Ar tikrai norite ištrinti šį kursą?")) return;
        try {
            const response = await fetch(`http://localhost:5000/course/delete?id=${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenCookie}`,
                },
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error("Nepavyko ištrinti kurso");
            showSuccessMessage("Kursas sėkmingai ištrintas!");
            fetchData();
        } catch (error) {
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
            if (!response.ok) throw new Error(data.message || "Klaida atkuriant kursą");
            showSuccessMessage("Kursas sėkmingai atkurtas!");
            fetchData();
        } catch {
            showErrorMessage("Klaida atkuriant kursą");
        }
    };

    const filteredAndSortedCourses = useMemo(() => {
        let result = [...courses];
    
        // Apply search
        if (searchText.trim()) {
            const lowerSearch = searchText.toLowerCase().trim();
            result = result.filter(course =>
                course.name.toLowerCase().includes(lowerSearch) ||
                course.description.toLowerCase().includes(lowerSearch)
            );
        }
    
        // Apply toggle (deleted / not deleted)
        result = result.filter(course => toggleState ? course.deleted : !course.deleted);
    
        // Apply sorting
        if (sortOption === 'A-Z') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'Z-A') {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortOption === 'Sukūrimo datą') {
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
    
        return result;
    }, [courses, searchText, toggleState, sortOption]);

    return (
        <div className="dashboard">
            <h1>Kursai</h1>
            <div className="admin-dash-actions">
                <Button onClick={handleCreate}>Sukurti kursą</Button>
                <SearchBar onSearch={(text) => setSearchText(text)} />
                <Dropdown placeholder="Rikiuoti" options={['A-Z', 'Z-A', 'Sukūrimo datą']} onSelect={(option) => setSortOption(option)} />
                <ToggleSwitch onToggleChange={() => setToggleState(!toggleState)}>
                    {toggleState ? 'Ištrinti kursai' : 'Esami kursai'}
                </ToggleSwitch>
            </div>

            {isLoaded ? (
                <div className="admin-dashboard">
                    {filteredAndSortedCourses.length ? (
                        filteredAndSortedCourses.map((course) => (
                            <div className="course-card-container" key={course.id}>
                                <Card
                                    title={course.name}
                                    paragraph={course.description}
                                    onClick={() => handleCardClick(course.id)}
                                    showActions={true}
                                    onDelete={() => {
                                        toggleState ? handleRecover(course.id) : handleDelete(course.id);
                                    }}
                                    isDeleted={toggleState}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Nerasta</p>
                    )}
                </div>
            ) : (
                <AnimatedLoadingText />
            )}
        </div>
    );
}

export default CourseTab;
