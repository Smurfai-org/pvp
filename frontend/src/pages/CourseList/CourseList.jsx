import { useState, useEffect, useContext, useRef } from "react";
import Card from "../../components/Card";
import { useNavigate } from "react-router-dom";
import "./CourseList.css";
import CourseProblemTile from "../Course/CourseProblemTile";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import AuthContext from "../../utils/AuthContext";
import cookies from "js-cookie";
import Button from "../../components/Button";
import { MessageContext } from "../../utils/MessageProvider";
import addProblemIcon from "../../assets/add-problem-icon.svg";

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
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { showErrorMessage, showHintMessage } = useContext(MessageContext);
  const navigate = useNavigate();

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

  const onGenerateProblemClick = async (message) => {
    if (!loggedIn) {
      showHintMessage(
        "Užduoties generavimo funkcija pasiekiama tik prisijungusiems vartotojams."
      );
      setIsGeneratingProblem(false);
      return;
    }
    if (!message) {
      showHintMessage("Nepamirškite apibūdinti norimos užduoties.");
      setIsGeneratingProblem(false);
      return;
    }
    setIsGeneratingProblem(true);
    try {
      const checkProblems = await fetch (
        `http://localhost:5000/problem/generated`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!checkProblems.ok) {
        throw new Error(`HTTP error: ${checkProblems.status}`);
      }
      const problems = await checkProblems.json();
      if (user.premium !== 1 && problems.length >= 1) {
        showHintMessage("Nemokamas planas leidžia generuoti tik vieną užduotį.");
        setIsGeneratingProblem(false);
        return;
      }
      const response = await fetch("http://localhost:5000/generate/problem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenCookie}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          message: message,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const responseData = await response.json();

      navigate(`/problems/${responseData.problemId}`);
    } catch (error) {
      console.error("Error generating hint:", error);
      showErrorMessage("Klaida generuojant užduotį. Bandykite iš naujo.");
    }
    setIsGeneratingProblem(false);
  };

  return (
    <div className="full-page-container">
      {loggedIn && userStartedCourses?.length > 0 && (
        <div className="page-wrapper">
          <h2>Jūsų pradėti kursai</h2>
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
        <h2>Visi kursai</h2>
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
        <GenerateProblemWindow
          handleSend={(message) => onGenerateProblemClick(message)}
          isGeneratingProblem={isGeneratingProblem}
          user={user}
        />
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
const GenerateProblemWindow = ({ handleSend, isGeneratingProblem, user }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const [showProblemGenerateWindow, setShowProblemGenerateWindow] =
    useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);
  return (
    <>
      {!showProblemGenerateWindow ? (
        <Button
          extra="bright"
          onClick={() => setShowProblemGenerateWindow(true)}
          iconSrc={addProblemIcon}
        >
          Generuoti asmeninę užduotį
        </Button>
      ) : (
        <div className="page-wrapper">
          <h2>Generuoti asmeninę užduotį</h2>
          <p style={{ textAlign: "justify" }}>
            Čia galite pateikti dirbtiniam intelektui užklausą sukurti užduotį
            pagal jūsų pasirinktą temą ir aprašymą. Dirbtinis intelektas
            sugeneruos individualią užduotį, kuri bus automatiškai įtraukta į
            bendrą užduočių sąrašą. Atkreipkite dėmesį, kad ši konkreti užduotis
            bus matoma tik jums – kiti vartotojai jos nematys. Tai patogus būdas
            greitai ir paprastai gauti personalizuotą užduotį, pritaikytą jūsų
            poreikiams.
          </p>
          <p style={{ textAlign: "justify", visibility: user?.premium === 0 ? "visible" : "hidden" }}>
            Atkreipkite dėmesį, kad nemokamo plano vartotojams leidžiama
            generuoti tik vieną užduotį. Jei norite daugiau galimybių, apsvarstykite
            galimybę atnaujinti savo planą.
          </p>
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
          <div className="inline-elements" style={{ marginTop: "1rem" }}>
            <Button
              extra="small secondary"
              onClick={() => setShowProblemGenerateWindow(false)}
            >
              Atšaukti
            </Button>
            <Button
              extra="small bright"
              onClick={() => handleSend(message)}
              loading={isGeneratingProblem}
              iconSrc={addProblemIcon}
            >
              Generuoti
            </Button>
          </div>
        </div>
      )}
    </>
  );
};