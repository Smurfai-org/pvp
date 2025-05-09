import { useState, useEffect, useContext, useRef } from "react";
import Card from "../../components/Card";
import { useNavigate } from "react-router-dom";
import "./CourseList.css";
import CourseProblemTile from "../Course/CourseProblemTile";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import AuthContext from "../../utils/AuthContext";
import { io } from "socket.io-client";
import cookies from "js-cookie";
import { ERROR_NOT_PREMIUM } from "../Problem/Problem";
import Button from "../../components/Button";

const tokenCookie = cookies.get("token");

const CourseList = () => {
  const [isLoaded, setIsLoaded] = useState({
    course: false,
    problems: false,
  });
  const { loggedIn, user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [userStartedCourses, setUserStartedCourses] = useState([]);
  const [topRowCourses, setTopRowCourses] = useState([]);
  const [bottomRowCourses, setBottomRowCourses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [yourCoursesIndex, setYourCoursesIndex] = useState(0);
  const [coursesPerRow, setCoursesPerRow] = useState(4);
  const [problems, setProblems] = useState([]);
  const [showProblemGenerateWindow, setShowProblemGenerateWindow] =
    useState(false);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notPremium, setNotPremium] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/course/");
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        const activeCourses = data.filter((course) => course.deleted !== 1);
        setCourses(activeCourses);
        return activeCourses;
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setIsLoaded((prev) => ({ ...prev, course: true }));
      }
    };

    const fetchStartedCourses = async (coursesLocal) => {
      if (!loggedIn) return;
      try {
        const response = await fetch(
          `http://localhost:5000/enrolled/${user?.id}/`
        );
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        const startedCourses = data
          ?.map((item) => {
            return coursesLocal?.find(
              (course) => course.id === item.fk_COURSEid
            );
          })
          .filter(Boolean);
        setUserStartedCourses(startedCourses);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setIsLoaded((prev) => ({ ...prev, course: true }));
      }
    };

    const fetchProblems = async () => {
      try {
        const userId = user?.id;
        const url = userId
          ? `http://localhost:5000/problem?userId=${userId}`
          : `http://localhost:5000/problem`;

        const response = await fetch(url);

        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setIsLoaded((prev) => ({ ...prev, problems: true }));
      }
    };

    const fetchData = async () => {
      try {
        const coursesLocal = await fetchCourses();
        fetchStartedCourses(coursesLocal);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    fetchProblems();
  }, []);

  useEffect(() => {
    const updateCoursesPerRow = () => {
      const width = window.innerWidth;
      const newCoursesPerRow =
        width >= 2500 ? 5 : width >= 1550 ? 4 : width >= 1200 ? 3 : 2;
      setCoursesPerRow(newCoursesPerRow);

      if (startIndex + newCoursesPerRow > Math.ceil(courses.length / 2)) {
        setStartIndex(
          Math.max(0, Math.ceil(courses.length / 2) - newCoursesPerRow)
        );
      }
      if (yourCoursesIndex + newCoursesPerRow > courses.length) {
        setYourCoursesIndex(Math.max(0, courses.length - newCoursesPerRow));
      }
    };
    updateCoursesPerRow();
    window.addEventListener("resize", updateCoursesPerRow);
    return () => window.removeEventListener("resize", updateCoursesPerRow);
  }, [courses.length, startIndex, yourCoursesIndex]);

  useEffect(() => {
    if (courses.length > 0) {
      updateVisibleCourses();
    }
  }, [courses, startIndex, yourCoursesIndex, coursesPerRow]);

  const updateVisibleCourses = () => {
    const midIndex = Math.ceil(courses.length / 2);
    const topRowItems = courses.slice(startIndex, startIndex + coursesPerRow);
    const bottomRowItems = courses.slice(
      midIndex + startIndex,
      midIndex + startIndex + coursesPerRow
    );
    setTopRowCourses(topRowItems);
    setBottomRowCourses(bottomRowItems);
    setUserStartedCourses(
      userStartedCourses.slice(
        yourCoursesIndex,
        yourCoursesIndex + coursesPerRow
      )
    );
  };

  const handleCardClick = (course) => {
    navigate(`/courses/${course?.id}`);
  };

  const scrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const scrollRight = () => {
    const maxStartIndex = Math.max(
      0,
      Math.ceil(courses.length / 2) - coursesPerRow
    );
    if (startIndex < maxStartIndex) {
      setStartIndex(startIndex + 1);
    }
  };

  const scrollNiceBlueLeft = () => {
    if (yourCoursesIndex > 0) {
      setYourCoursesIndex(yourCoursesIndex - 1);
    }
  };

  const scrollNiceBlueRight = () => {
    const maxNiceBlueIndex = Math.max(0, courses.length - coursesPerRow);
    if (yourCoursesIndex < maxNiceBlueIndex) {
      setYourCoursesIndex(yourCoursesIndex + 1);
    }
  };

  const isLeftDisabled = startIndex === 0;
  const isRightDisabled =
    startIndex + coursesPerRow >= Math.ceil(courses.length / 2);

  const isUserStartedCoursesLeftDisabled = yourCoursesIndex === 0;
  const isUserStartedCoursesRightDisabled =
    yourCoursesIndex + coursesPerRow >= userStartedCourses.length;

  const onGenerateProblemClick = (message) => {
    socket.emit("generateProblem", {
      message: message,
    });
  };

  useEffect(() => {
    if (!loggedIn) return;

    const socketClient = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketClient.on("connect", () => {
      console.log("Prisijungta prie socket:", socketClient.id);
      setIsConnected(true);

      socketClient.emit("authenticate", tokenCookie);
    });

    socketClient.on("authenticated", (data) => {
      if (data.success) {
        console.log("Socket authenticated:", data.user);
      } else if (!data.success) {
        if (data.code === ERROR_NOT_PREMIUM) {
          setNotPremium(true);
          // setChatError(data.message);
        } else {
          console.error(data.message || "Klaida autentifikuojant socket");
          // setChatError(data.message || "Klaida autentifikuojant socket");
        }
      }
    });

    socketClient.on("disconnect", () => {
      console.log("Socket disconnected:", socketClient.id);
      setIsConnected(false);
    });

    setSocket(socketClient);

    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, [loggedIn, tokenCookie]);

  return (
    <div className="full-page-container">
      {loggedIn && userStartedCourses?.length > 0 && (
        <div className="page-wrapper">
          <h2>Pradėti kursai</h2>
          {isLoaded.course ? (
            <div className="course-list-container">
              <button
                className="button-left"
                onClick={scrollNiceBlueLeft}
                disabled={isUserStartedCoursesLeftDisabled}
              >
                {"<"}
              </button>
              <div className="course-row">
                {userStartedCourses?.map((course) => (
                  <Card
                    key={course.id}
                    title={course.name}
                    paragraph={course.description}
                    onClick={() => handleCardClick(course)}
                  />
                ))}
              </div>
              <button
                className="button-right"
                onClick={scrollNiceBlueRight}
                disabled={isUserStartedCoursesRightDisabled}
              >
                {">"}
              </button>
            </div>
          ) : (
            <AnimatedLoadingText />
          )}
        </div>
      )}
      <div className="page-wrapper">
        <h2>Paruošti kursai</h2>
        {isLoaded.course ? (
          <div className="course-list-container">
            <button
              className="button-left"
              onClick={scrollLeft}
              disabled={isLeftDisabled}
            >
              {"<"}
            </button>
            <div className="course-rows-container">
              {courses.length > 0 ? (
                <>
                  <div className="course-row">
                    {topRowCourses.map((course) => (
                      <Card
                        key={course.id}
                        title={course.name}
                        paragraph={course.description}
                        onClick={() => handleCardClick(course)}
                      />
                    ))}
                  </div>
                  <div className="course-row">
                    {bottomRowCourses.map((course) => (
                      <Card
                        key={course.id}
                        title={course.name}
                        paragraph={course.description}
                        onClick={() => handleCardClick(course)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p>Nėra prieinamų kursų</p>
              )}
            </div>
            <button
              className="button-right"
              onClick={scrollRight}
              disabled={isRightDisabled}
            >
              {">"}
            </button>
          </div>
        ) : (
          <AnimatedLoadingText />
        )}
      </div>
      <div>
        {!showProblemGenerateWindow ? (
          <Button
            extra="bright"
            onClick={() => setShowProblemGenerateWindow(true)}
          >
            Generuoti asmeninę užduotį
          </Button>
        ) : (
          <GenerateProblemWindow
            handleSend={(message) => onGenerateProblemClick(message)}
          />
        )}
      </div>
      <div className="page-wrapper">
        <h2>Užduotys</h2>
        {isLoaded.problems ? (
          <div className="problems-container">
            {problems.map((problem, index, array) => (
              <div key={problem.id || index}>
                <CourseProblemTile problem={problem} />
                {index !== array.length - 1 && <hr />}{" "}
              </div>
            ))}
          </div>
        ) : (
          <AnimatedLoadingText />
        )}
      </div>
    </div>
  );
};

export default CourseList;

const GenerateProblemWindow = ({ handleSend }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);
  return (
    <div className="page-wrapper">
      <h2>Individualios užduotys</h2>
      <textarea
        ref={textareaRef}
        className="chat-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Apibūdinkite norimą užduotį..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(message);
          }
        }}
      />
      <Button extra="small bright" onClick={() => handleSend(message)}>
        Generuoti
      </Button>
    </div>
  );
};
