import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import { useNavigate } from "react-router-dom";
import "./CourseList.css";
import CourseProblemTile from "../Course/CourseProblemTile";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [niceBlueCourses, setNiceBlueCourses] = useState([]);
  const [topRowCourses, setTopRowCourses] = useState([]);
  const [bottomRowCourses, setBottomRowCourses] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [yourCoursesIndex, setYourCoursesIndex] = useState(0);
  const [coursesPerRow, setCoursesPerRow] = useState(4);
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/course/");
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateCoursesPerRow = () => {
      const width = window.innerWidth;
      const newCoursesPerRow =
        width >= 2500 ? 5 : width >= 1550 ? 4 : width >= 1200 ? 3 : 2;
      setCoursesPerRow(newCoursesPerRow);

      if (startIndex + newCoursesPerRow > Math.ceil(courses.length / 2)) {
        setStartIndex(Math.max(0, Math.ceil(courses.length / 2) - newCoursesPerRow));
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
    setNiceBlueCourses(courses.slice(yourCoursesIndex, yourCoursesIndex + coursesPerRow));
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

  const isNiceBlueLeftDisabled = yourCoursesIndex === 0;
  const isNiceBlueRightDisabled = yourCoursesIndex + coursesPerRow >= courses.length;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/problem/`);
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="full-page-container">
      <div className="page-wrapper">
        <h1 className="wrapper-h1">Jūsų kursai</h1>
        <div className="course-list-container">
          <button
            className="button-left"
            onClick={scrollNiceBlueLeft}
            disabled={isNiceBlueLeftDisabled}
          >
            {"<"}
          </button>
          <div className="course-row">
            {niceBlueCourses.map((course) => (
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
            disabled={isNiceBlueRightDisabled}
          >
            {">"}
          </button>
        </div>
      </div>
      <div className="page-wrapper">
        <h1 className="wrapper-h1">Mūsų kursai</h1>
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
      </div>
      <div className="page-wrapper">
        <h1 className="wrapper-h1">Individualios pamokos</h1>
        <div className="problems-container">
          {problems.slice(0, 3).map((problem, index) => (
            <CourseProblemTile
              key={problem.id || index}
              problem={problem}
              courseProblemsOrder={[]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseList;
