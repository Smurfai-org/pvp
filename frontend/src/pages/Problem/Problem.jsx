import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Hyperlink from "../../components/Hyperlink";
import CodeEditor from "./CodeEditor";
import Dropdown from "../../components/Dropdown";
import OutputSection from "./Output";
import "./problem.css";
import { difficulty_dictionary } from "../../constants";
import AuthContext from "../../utils/AuthContext";
import cookies from "js-cookie";
import {
  determineOutputType,
  getStartingCodeFromVariables,
  getTestCaseVariables,
  problemCodeFullCpp,
  problemCodeFullPython,
} from "./problemCodeUtilities";
import { MessageContext } from "../../utils/MessageProvider";
import AnimatedLoadingText from "../../components/AnimatedLoadingText";
import LoginPrompt from "../../components/LoginPrompt";
import ReactMarkdown from "react-markdown";
import VoiceToText from "../../components/VoiceToText";
import playIcon from "../../assets/play-icon.svg";
import evaluateIcon from "../../assets/evaluate-icon.svg";
import chevronIcon from "../../assets/Chevron-icon.png";
import hintIconMinimal from "../../assets/hint-icon-minimal.svg";
import surrenderIcon from "../../assets/surrender-icon.svg";
import Joyride, { STATUS } from "react-joyride";

const tokenCookie = cookies.get("token");
const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const languages = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python" },
];

export const ERROR_NOT_PREMIUM = 111;

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outputRef = useRef(null);
  const location = useLocation();
  const originalCourseId = location.state?.courseId;
  const { showSuccessMessage, showErrorMessage, showHintMessage } =
    useContext(MessageContext);

  const [isLoaded, setIsLoaded] = useState(false);
  const loadingText = "Įkeliama...";
  // Atėjus iš kurso pateikiamas kurso problemų id sąrašas pagal order_index. Pvz: [14, 13, 15, 16, 18]. Skirtas nurodyti previousProblemId ir nextProblemId
  const courseProblemsOrder = location.state?.courseProblemsOrder;
  const { loggedIn, user } = useContext(AuthContext);

  const [isOutputWindowMaximised, setIsOutputWindowMaximised] = useState(false);
  const [showAiWindow, setShowAiWindow] = useState(false);

  const [problem, setProblem] = useState("");
  const [previousProblemId, setPreviousProblemId] = useState(null);
  const [nextProblemId, setNextProblemId] = useState(null);
  const [selectedLanguageValue, setSelectedLanguageValue] = useState(
    languages[0]?.value
  );

  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState(null);
  const [notPremium, setNotPremium] = useState(false);

  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRunningTestCase, setIsRunningTestCase] = useState({});
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [isGeneratingChatAnswer, setIsGeneratingChatAnswer] = useState(false);
  const [isSolvedByAI, setIsSolvedByAI] = useState(false);
  const [isUndoingAISolution, setIsUndoingAISolution] = useState(false);

  // SĄRAŠAS testavimo atveju. Vieno jų tipas pvz toks:
  // {id: 1, input: {cpp: 'const int num1 = 5;\nconst int num2 = 10;', python: 'num1 = 5\nnum2 = 10'}, expected_output: '15', fk_PROBLEMid: 18}
  const [testCases, setTestCases] = useState([]);

  // SĄRAŠAS pirmo testo kintamųjų. Tikimės, kad visų vienos problemos testų kintamųjų tipai ir pavadinimai tie patys. Vieno pavyzdys toks:
  // {type: 'int', name: 'num1'}
  const [testCaseVariables, setTestCaseVariables] = useState([]);

  // Basic pradinis kodas, sugeneruojamas pagal kintamuosius. Jis būna rodomas kai useris neturi jokio progreso. Pvz:
  // {cpp: 'int Sprendimas(int num1, int num2) {\n  return 0;\n}', python: 'def Sprendimas(num1, num2):\n  return 0\n'}
  const [inputCodeEmpty, setInputCodeEmpty] = useState({});

  // Tas pats kaip inputCodeEmpty, bet yra rodomas useriui ir gali būti keičiamas
  const [inputCode, setInputCode] = useState({});

  // Visa kurso informacija, naudojam tik courseInfo.id ir courseInfo.name, kad pateikti nuorodą į problemos kursą
  const [courseInfo, setCourseInfo] = useState(null);

  // Output lange atvaizduojamas tesktas
  const [outputText, setOutputText] = useState("");

  // Kai praeina bent vienas testas nustatom passScore ir saugom duomazėj "progress" lentelėj, taip pat pakeičiam statusą į "finished"
  const [passScore, setPassScore] = useState(null);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [hints, setHints] = useState([]);
  const [countOfSolutions, setCountOfSolutions] = useState(0);

  const steps = [
    {
      target: "body",
      placement: "center",
      content: (
        <div>
          <h2>Labas!</h2>
          <p>Štai greitas turas kaip naudotis LearnCode.</p>
          <p>Spauskite „Kitas“, jog pradėtumėte.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".problem-info-navigation-bar",
      content: "Čia galite perjungti tarp užduoties aprašymo ir DI pagalbos.",
      disableBeacon: true,
    },
    {
      target: ".problem-related-courses",
      content: "Ši dalis rodo, kuriam kursui priklauso ši užduotis.",
      disableBeacon: true,
    },
    {
      target: ".test-cases-list",
      content:
        "Tai yra testavimo atvejai, kuriuos galite naudoti savo kodui patikrinti.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: ".code-editor-area",
      content: "Čia galite rašyti ir redaguoti savo kodą.",
      disableBeacon: true,
      placement: "left",
    },
    {
      target: ".output-window",
      content: "Čia matysite savo kodo rezultatus.",
      disableBeacon: true,
    },
    {
      target: ".problem-page-right button:nth-child(1)",
      content: "Paspauskite čia, kad paleistumėte savo kodą.",
      disableBeacon: true,
    },
    {
      target: ".problem-page-right button:nth-child(2)",
      content: "Paspauskite čia, kad įvertintumėte savo sprendimą.",
      disableBeacon: true,
    },
    {
      target: ".problem-page-right .dropdown",
      content: "Pasirinkite programavimo kalbą, kuria norite dirbti.",
      disableBeacon: true,
    },
    {
      target: ".problem-ai-window",
      content: "Čia galite gauti pagalbą iš DI sprendimo lango.",
      placement: "right",
      disableBeacon: true,
      spotlightClicks: true,
    },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(null);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState(null);

  const onDropdownSelect = (selectedLabel) => {
    const selectedLang = languages.find((lang) => lang.label === selectedLabel);
    if (selectedLang) {
      setSelectedLanguageValue(selectedLang.value);
    }
  };

  const handleArrowNavigationButtonClick = (id) => {
    navigate(`/problems/${id}`, {
      state: {
        courseId: originalCourseId,
        courseProblemsOrder: courseProblemsOrder,
      },
    });
  };

  const handleProblemInfoButtonClick = () => {
    setShowAiWindow(false);
  };

  const handleAiHelpButtonClick = () => {
    setShowAiWindow(true);
  };

  const handleBackToListButtonClick = () => {
    if (originalCourseId) {
      navigate(`/courses/${originalCourseId}`);
      return;
    }
    navigate("/courses");
  };

  const handleResetCodeButtonClick = () => {
    setInputCode({
      ...inputCode,
      [selectedLanguageValue]: inputCodeEmpty?.[selectedLanguageValue],
    });
  };

  const handleTestButtonClick = async (
    index = null,
    dontPrint = false,
    skipEvaluation = false
  ) => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (index !== null && !dontPrint && !skipEvaluation) {
      setIsRunningTestCase({ ...isRunningTestCase, [index]: true });
    }
    const sourceCode =
      selectedLanguageValue === "cpp"
        ? problemCodeFullCpp(
            testCases[index],
            testCaseVariables,
            inputCode?.cpp,
            !skipEvaluation
          )
        : problemCodeFullPython(
            testCases[index],
            testCaseVariables,
            inputCode?.python,
            !skipEvaluation
          );

    if (outputRef.current) {
      try {
        const resultNotFormatted = await outputRef.current.runCode(sourceCode);

        if (skipEvaluation) {
          setOutputText(resultNotFormatted);
          setIsOutputWindowMaximised(true);
        }

        let didPass = false;

        const lines = resultNotFormatted.split("\n");
        const lastLine = lines[lines.length - 2];

        let coloredLastLine = lastLine;
        if (lastLine === "Testas nepraeitas.") {
          coloredLastLine = `<span style="color: #fc0303; font-family: 'Consolas';">${lastLine}</span>`;
        } else if (lastLine === "Testas įveiktas!") {
          coloredLastLine = `<span style="color: #00db1a; font-family: 'Consolas';">${lastLine}</span>`;
          didPass = true;
        }

        lines[lines.length - 2] = coloredLastLine;
        const result = lines.join("\n");

        if (!dontPrint) setOutputText(result);
        setIsOutputWindowMaximised(true);

        if (index !== null && !dontPrint && !skipEvaluation) {
          setIsRunningTestCase({});
        }

        return { result, didPass };
      } catch (error) {
        console.error("Error running test case:", error);
        setOutputText(error.message);
        if (index !== null && !dontPrint && !skipEvaluation) {
          setIsRunningTestCase({});
        }
      }
    }
  };

  const handleRunButtonClick = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setIsRunningCode(true);

    if (testCases.length < 1) {
      await handleTestButtonClick(null, true, true);
      setIsRunningCode(false);
      return;
    }

    const { result } = await handleTestButtonClick(0, true, true);
    setIsRunningCode(false);
    setOutputText(result);
  };

  const handleRunTestCases = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (testCases.length < 1) {
      await handleTestButtonClick();
      return;
    }

    setOutputText([]);

    let countOfPasses = 0;
    for (const [index] of testCases.entries()) {
      const { result, didPass } = await handleTestButtonClick(index, true);
      if (didPass) countOfPasses++;
      setOutputText((prevOutput) => {
        return (
          prevOutput + `<strong>Testas ${index + 1}</strong>\n\n${result}\n`
        );
      });
    }

    setPassScore(null);
    if (countOfPasses > 0) {
      const score = Math.round((countOfPasses * 100) / testCases.length);
      setPassScore(score);
      showSuccessMessage(`Užduotis išlaikyta ${score}%`);
      return score;
    }
  };

  const handleCheckclick = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (isSolvedByAI) {
      showErrorMessage("Užduotis jau išspręsta DI");
      return;
    }
    setIsEvaluating(true);

    //Paleisti, kad praeitu testus
    const score = await handleRunTestCases();

    //AI CALLAS KAD IVERTINTU BUS CIA

    // Kodo saugojimo dalis
    const sourceCode =
      selectedLanguageValue === "cpp" ? inputCode?.cpp : inputCode?.python;
    console.log({ code: sourceCode, userId: user?.id, probId: id });
    try {
      const res = await fetch(`${serverUrl}/problem/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenCookie}`,
        },
        body: JSON.stringify({
          code: inputCode,
          userId: user?.id,
          probId: id,
          score: score ? score : 0,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        showErrorMessage("Nepavyko įkelti sprendimo");
      }

      showSuccessMessage("Kodas sėkmingai įvertintas");
    } catch {
      showErrorMessage("Klaida įkeliant sprendimą");
    } finally {
      setIsEvaluating(false);
    }

    try {
      const response = await fetch(
        `${serverUrl}/enrolled/${user?.id}/${courseInfo?.id}`
      );
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();

      try {
        const completed_problems =
          passScore === null && score > 0
            ? Number((data[0]?.completed_problems ?? 0) + 1)
            : passScore > 0 && score === undefined
            ? Number((data[0]?.completed_problems ?? 0) - 1)
            : data[0]?.completed_problems ?? 0;

        await fetch(`${serverUrl}/enrolled/${user?.id}/${courseInfo?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenCookie}`,
          },
          body: JSON.stringify({
            completed_problems: completed_problems,
            language: selectedLanguageValue,
          }),
          credentials: "include",
        });
      } catch {
        console.error("Nepavyko pakeisti kurso progreso");
      }
    } catch {
      try {
        await fetch(`${serverUrl}/enrolled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenCookie}`,
          },
          body: JSON.stringify({
            courseId: courseInfo?.id,
            userId: user?.id,
            completed_problems: score ? 1 : 0,
            language: selectedLanguageValue,
          }),
          credentials: "include",
        });
      } catch {
        console.error("Nepavyko pradėti kurso");
      }
    }
  };

  const handleGenerateHintClick = async () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (isSolvedByAI) {
      showErrorMessage("Užduotis jau išspręsta DI");
      return;
    }
    try {
      setIsGeneratingHint(true);
      const response = await fetch(`${serverUrl}/generate/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenCookie}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          problemId: id,
          language: selectedLanguageValue,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.hint) {
        showHintMessage(data.hint);
      } else {
        showErrorMessage("Nepavyko sugeneruoti užuominos");
      }
    } catch (error) {
      console.error("Error generating hint:", error);
      showErrorMessage("Klaida generuojant užuominą");
    }
    setIsGeneratingHint(false);
  };

  const handleSendAiMessageClick = async (message) => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (!message.trim()) return;
    function getLocalSQLTimestamp() {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
    
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
    
      return `${year}-${month}-${day} ${hours-3}:${minutes}:${seconds}`;
    }    
    setIsGeneratingChatAnswer(true);
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: "user",
        text: message,
        timestamp: getLocalSQLTimestamp(),
      },
    ]);
    try {
      const res = await fetch(`${serverUrl}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          message,
          convoHist: chatMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          problemContext: {
            problemId: id,
            problemName: problem?.name,
            problemDescription: problem?.description,
            difficulty: problem?.difficulty,
            language: selectedLanguageValue,
            code: inputCode[selectedLanguageValue],
            testCases:
              testCases.length > 0
                ? testCases
                    .map((tc) => ({
                      input: tc.input[selectedLanguageValue],
                      expected_output: tc.expected_output,
                    }))
                    .slice(0, 2)
                : [],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "ai",
            text: data.message,
            timestamp: data.timestamp,
          },
        ]);
      } else {
        setChatError(data.details || "Klaida bendraujant su DI asistentu");
      }
    } catch {
      setChatError("Klaida bendraujant su DI asistentu");
    }
    setIsGeneratingChatAnswer(false);
  };
  useEffect(() => {
    if (!loggedIn) return;

    async function checkPremium() {
      try {
        const res = await fetch(`${serverUrl}/chat/authenticate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenCookie }),
        });
        const data = await res.json();
        if (!data.success) {
          setNotPremium(true);
          setChatError(data.message);
        }
      } catch {
        setChatError("Nepavyko autentifikuoti pokalbio.");
      }
    }
    checkPremium();
  }, [loggedIn, tokenCookie]);

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const res = await fetch(`${serverUrl}/chat/history/${user.id}`);
        const history = await res.json();
        setChatMessages(
          history.map((msg) => ({
            sender: msg.role === "user" ? "user" : "ai",
            text: msg.content,
            timestamp: msg.timestamp,
          }))
        );
      } catch {
        setChatError("Nepavyko gauti pokalbio istorijos.");
      }
    }
    fetchChatHistory();
  }, [loggedIn, user?.id]);

  useEffect(() => {
    const fetchProblem = async (automaticallyGeneratedInputCode) => {
      setProblem("");
      setPassScore(null);

      try {
        const baseProblemFetchUrl = `${serverUrl}/problem?id=${id}`;
        const fullProblemFetchUrl =
          loggedIn && user?.id
            ? `${baseProblemFetchUrl}&userId=${user.id}`
            : baseProblemFetchUrl;

        const [problemRes, userCodeRes] = await Promise.all([
          fetch(fullProblemFetchUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          loggedIn
            ? fetch(`${serverUrl}/progress/${user?.id}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              })
            : null,
        ]);

        if (!problemRes.ok) throw new Error(`HTTP error: ${problemRes.status}`);
        const problemData = await problemRes.json();

        if (!problemData || !problemData[0]) {
          setIsLoaded(true);
          return;
        }

        const parsedStartingCode = JSON.parse(
          problemData[0]?.starting_code || "{}"
        );

        problemData[0] = {
          ...problemData[0],
          starting_code: parsedStartingCode,
        };
        setProblem(problemData[0]);

        if (loggedIn && userCodeRes?.ok) {
          const userData = await userCodeRes.json();
          if (userData[0]?.score) setPassScore(userData[0]?.score);

          if (userData[0]?.status === "ai solved") {
            setIsSolvedByAI(true);
          }

          const parsedUserCode = JSON.parse(userData[0]?.code || "{}");

          setInputCode({
            cpp: parsedUserCode?.cpp
              ? parsedUserCode?.cpp
              : automaticallyGeneratedInputCode?.cpp,
            python: parsedUserCode?.python
              ? parsedUserCode?.python
              : automaticallyGeneratedInputCode?.python,
          });
          setIsLoaded(true);
          return;
        }

        setInputCode({
          cpp: automaticallyGeneratedInputCode?.cpp,
          python: automaticallyGeneratedInputCode?.python,
        });
        setIsLoaded(true);
      } catch (error) {
        console.error(error.message);
        setIsLoaded(true);
      }
    };

    const fetchTestCases = async () => {
      const starting_code_empty = getStartingCodeFromVariables();
      setTestCases([]);
      setTestCaseVariables([]);

      setInputCodeEmpty({
        cpp: starting_code_empty?.cpp,
        python: starting_code_empty?.python,
      });

      try {
        const res = await fetch(`${serverUrl}/test_cases?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          return {
            cpp: starting_code_empty?.cpp,
            python: starting_code_empty?.python,
          };
        }

        const data = (await res.json()).filter((tc) => tc.visibility === 1);
        const formatedInput = data?.map((element) => {
          return JSON.parse(element?.input || "{}");
        });
        const formatedData = data?.map((element, index) => ({
          ...element,
          input: formatedInput[index],
        }));
        setTestCases(formatedData);
        const testCaseVariablesLocal = getTestCaseVariables(formatedData[0]);
        setTestCaseVariables(testCaseVariablesLocal);
        const result_type = determineOutputType(
          formatedData[0]?.expected_output
        );
        const starting_code = getStartingCodeFromVariables(
          testCaseVariablesLocal,
          result_type
        );

        setInputCodeEmpty({
          cpp: starting_code?.cpp,
          python: starting_code?.python,
        });

        return {
          cpp: starting_code?.cpp,
          python: starting_code?.python,
        };
      } catch {
        console.error("Problema pavyzdžių neturi");
      }
    };

    const fetchHints = async () => {
      setHints([]);
      try {
        const response = await fetch(`${serverUrl}/hint?id=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        setHints(data);
      } catch (err) {
        console.error(err);
      }
    };

    const updateProblemNavigation = () => {
      const currentIndex = courseProblemsOrder?.indexOf(Number(id));

      if (currentIndex <= 0) {
        setPreviousProblemId(null);
      } else {
        setPreviousProblemId(
          courseProblemsOrder?.length > 0 && currentIndex > 0
            ? courseProblemsOrder[currentIndex - 1]
            : null
        );
      }

      if (currentIndex >= courseProblemsOrder?.length - 1) {
        setNextProblemId(null);
      } else {
        setNextProblemId(
          courseProblemsOrder?.length > 0 &&
            currentIndex < courseProblemsOrder.length - 1
            ? courseProblemsOrder[currentIndex + 1]
            : null
        );
      }
    };

    const fetchData = async () => {
      try {
        const automaticallyGeneratedInputCode = await fetchTestCases();
        fetchProblem(automaticallyGeneratedInputCode);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    fetchHints();
    updateProblemNavigation();
    setIsOutputWindowMaximised(false);
  }, [id, courseProblemsOrder]);

  useEffect(() => {
    if (!problem) return;
    const fetchCourse = async () => {
      setCourseInfo(null);
      try {
        const res = await fetch(
          `${serverUrl}/course/?id=${problem?.fk_COURSEid}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.length > 0) {
          setCourseInfo(data[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };
    const fetchProgress = async () => {
      setCountOfSolutions(0);
      try {
        const res = await fetch(
          `${serverUrl}/progress/countOfCompleted/p=${problem?.id}`
        );
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        setCountOfSolutions(data?.count);
      } catch (error) {
        console.error("Error fetching count of solutions:", error);
      }
    };

    fetchCourse();
    fetchProgress();
  }, [problem]);

  const handleGiveUpClick = () => {
    if (!loggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (user?.premium === 0) {
      showErrorMessage("Ši funkcija prieinama tik premium vartotojams");
      return;
    }
    if (isSolvedByAI) {
      showErrorMessage("Užduotis jau išspręsta DI");
      return;
    } else {
      setShowGiveUpModal(true);
    }
  };

  const handleConfirmGiveUp = async () => {
    try {
      setIsGeneratingSolution(true);

      const response = await fetch(`${serverUrl}/generate/solution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          problemId: id,
          language: selectedLanguageValue,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP klaida: ${response.status}`);
      }

      const data = await response.json();
      if (data.solution) {
        setInputCode({
          ...inputCode,
          [selectedLanguageValue]: data.solution,
        });

        setIsSolvedByAI(true);
        showSuccessMessage("Sprendimas sugeneruotas sėkmingai");
      } else {
        showErrorMessage("Sprendimo sugeneruoti nepavyko");
      }
    } catch (error) {
      console.error("Klaida generuojant sprendimą:", error);
      showErrorMessage("Klaida generuojant sprendimą");
    } finally {
      setIsGeneratingSolution(false);
      setShowGiveUpModal(false);
    }
  };
  const handleUndoAISolution = async () => {
    if (!loggedIn) {
      showErrorMessage("Prašome prisijungti");
      return;
    }
    try {
      if (!window.confirm("Ar tikrai norite panaikinti DI sprendimą?")) {
        return;
      }
      setIsUndoingAISolution(true);
      const response = await fetch(`${serverUrl}/progress/${user?.id}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP klaida: ${response.status}`);
      }
      showSuccessMessage("DI sprendimas panaikintas");
      setInputCode({});
      setPassScore(null);
      setIsSolvedByAI(false);
    } catch (error) {
      console.error("Klaida panaikinant DI sprendimą:", error);
      showErrorMessage("Klaida panaikinant DI sprendimą");
    } finally {
      setIsUndoingAISolution(false);
      window.location.reload();
    }
  };

  const handleDeleteMessages = async (timestamp) => {
    try {
      const res = await fetch(`${serverUrl}/chat/deleteMessages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, timestamp }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(
          data.updatedHistory.map((msg) => ({
            sender: msg.role === "user" ? "user" : "ai",
            text: msg.content,
            timestamp: msg.timestamp,
          }))
        );
      } else {
        setChatError(data.message || "Nepavyko ištrinti žinučių");
      }
    } catch {
      setChatError("Klaida tryniant žinutes");
    }
  };
  const ConfirmGiveUpModal = ({ onClose, onConfirm, isLoading }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Pasiduoti užduočiai</h2>
          <p>
            DI sugeneruos jums pilną sprendimą, tačiau Jums rekomenduojama
            savarankiškai pasimokyti iš DI sugeneruoto kodo. Užduotis bus
            įvertinta 0 taškų ir pažymėta kaip &quot;Išspręsta DI&quot;.
          </p>
          <p style={{ fontWeight: "bold", marginTop: "15px" }}>
            Ar tikrai norite pasiduoti?
          </p>
          <div className="modal-actions">
            <Button onClick={onClose} disabled={isLoading} extra="secondary">
              Ne, aš dar galiu!
            </Button>
            <Button onClick={onConfirm} loading={isLoading}>
              Taip, pasiduodu
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const handleJoyrideCallback = async (data) => {
    const { index, status, type, action } = data;

    if (type === "step:after") {
      if (action === "next") {
        const nextIndex = index + 1;

        if (nextIndex === steps.length - 1) {
          setPaused(true);
          handleAiHelpButtonClick();
        } else {
          setStepIndex(nextIndex);
        }
      } else if (action === "prev") {
        setStepIndex(index - 1);
      }
    }

    if (status === STATUS.SKIPPED || status === STATUS.FINISHED) {
      try {
        await fetch(`${serverUrl}/user/seenTutorial`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ id: user.id }),
        });
      } catch (err) {
        console.error("Klaida siunčiant seenTutorial:", err);
      }

      setTimeout(() => {
        setRun(false);
        setStepIndex(0);
      }, 0);

      handleProblemInfoButtonClick();
    }
  };

  useEffect(() => {
    if (!paused) return;

    const interval = setInterval(() => {
      const el = document.querySelector(".problem-ai-window");
      if (el) {
        clearInterval(interval);
        setPaused(false);
        setStepIndex(steps.length - 1);
        setRun(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (!loggedIn) return;
    const fetchSeen = async () => {
      try {
        const response = await fetch(
          `${serverUrl}/user/seenTutorial?id=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSeen(data.seen_tutorial);
        } else {
          console.error("Failed to fetch seen status", response.status);
        }
      } catch (err) {
        console.error("Error fetching seen status:", err);
      }
    };

    fetchSeen();
  }, [user?.id]);

  useEffect(() => {
    if (seen === null || seen === undefined) return;

    console.log(seen);

    if (!seen) {
      setRun(true);
    } else {
      setRun(false);
    }
  }, [seen]);

  return (
    <div className="relative">
      {seen !== null && (
        <Joyride
          steps={steps}
          run={run}
          stepIndex={stepIndex}
          continuous={true}
          showSkipButton={true}
          showProgress={false}
          disableOverlayClose={true}
          disableCloseOnEsc={true}
          hideCloseButton={true}
          scrollToFirstStep={true}
          spotlightClicks={true}
          locale={{
            back: "Atgal",
            close: "Uždaryti",
            last: "Baigti",
            next:
              stepIndex < steps.length - 1
                ? `Kitas (${stepIndex + 1} iš ${steps.length})`
                : "Baigti",
            skip: "Praleisti",
          }}
          styles={{
            options: {
              primaryColor: "var(--bright)",
              textColor: "var(--text)",
              backgroundColor: "var(--light)",
            },
            buttonNext: {
              backgroundColor: "var(--dark)",
              color: "var(--light)",
            },
            buttonBack: {
              color: "var(--text)",
            },
            buttonSkip: {
              color: "var(--text)",
            },
          }}
          callback={handleJoyrideCallback}
        />
      )}
      {showGiveUpModal && (
        <ConfirmGiveUpModal
          onClose={() => setShowGiveUpModal(false)}
          onConfirm={handleConfirmGiveUp}
          isLoading={isGeneratingSolution}
        />
      )}
      <>
        {showLoginPrompt ? (
          <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
        ) : (
          ""
        )}
        <div
          className={`full-screen-container transition duration-300 ${
            showLoginPrompt ? "blur-effect" : ""
          }`}
        >
          <div className="problem-page-left">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  extra="small secondary"
                  onClick={handleBackToListButtonClick}
                  iconSrc={chevronIcon}
                  iconRotationDegrees={90}
                  iconHeight="8px"
                >
                  Atgal į sąrašą
                </Button>
                {previousProblemId !== null && (
                  <Button
                    extra="small secondary"
                    onClick={() =>
                      handleArrowNavigationButtonClick(previousProblemId)
                    }
                    iconSrc={chevronIcon}
                    iconRotationDegrees={90}
                    iconHeight="8px"
                  ></Button>
                )}
                {nextProblemId !== null && (
                  <Button
                    extra="small secondary"
                    onClick={() =>
                      handleArrowNavigationButtonClick(nextProblemId)
                    }
                    iconSrc={chevronIcon}
                    iconRotationDegrees={-90}
                    iconHeight="8px"
                  ></Button>
                )}
              </div>
              {isLoaded && passScore && (
                <div>
                  Išspręsta <strong>{passScore}%</strong>
                </div>
              )}

              {isLoaded && isSolvedByAI && (
                <div>
                  <strong>Išspręsta DI</strong>
                </div>
              )}
            </div>

            <div className="problem-info-screen">
              <div className="problem-info-navigation-bar">
                <div
                  className={
                    !showAiWindow
                      ? "problem-info-navigation-bar-button-selected"
                      : ""
                  }
                  onClick={handleProblemInfoButtonClick}
                >
                  <svg
                    width="18"
                    height="16"
                    viewBox="0 0 22 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.139 18.487C12.5303 17.4667 16.3703 16.0383 20.5999 18.487V3.1826M1.3999 2.90434V18.487C2.79121 17.4667 6.63121 16.0383 10.8608 18.487V3.46086M1.3999 2.86508C2.79121 1.84479 6.63121 0.416387 10.8608 2.86508M11.139 2.86508C12.5303 1.84479 16.3703 0.416387 20.5999 2.86508"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Užduotis
                </div>
                <div
                  className={
                    showAiWindow
                      ? "problem-info-navigation-bar-button-selected"
                      : ""
                  }
                  onClick={handleAiHelpButtonClick}
                >
                  <svg
                    width="12"
                    height="18"
                    viewBox="0 0 14 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.4 13.0001V17.2001C9.4 17.8628 8.86274 18.4001 8.2 18.4001H5.8C5.13726 18.4001 4.6 17.8628 4.6 17.2001V13.0001M13 7.6001C13 10.9138 10.3137 13.6001 7 13.6001C3.68629 13.6001 1 10.9138 1 7.6001C1 4.28639 3.68629 1.6001 7 1.6001C10.3137 1.6001 13 4.28639 13 7.6001Z"
                      stroke="black"
                      strokeWidth="2"
                    />
                  </svg>
                  DI pagalba
                </div>
              </div>
              {!showAiWindow ? (
                <>
                  <h2>{isLoaded ? problem?.name : <AnimatedLoadingText />}</h2>
                  {isLoaded && (
                    <div className="problem-related-courses">
                      {courseInfo ? (
                        <Hyperlink href={`/courses/${courseInfo?.id}`}>
                          {courseInfo?.name}
                        </Hyperlink>
                      ) : (
                        <span>Nepriklauso kursui</span>
                      )}
                      <div className="problem-info-divider">|</div>
                      <strong className={problem?.difficulty}>
                        {difficulty_dictionary[problem?.difficulty]}
                      </strong>
                      <div className="problem-info-divider">|</div>
                      <span>
                        Įveikė <strong>{countOfSolutions}</strong>
                      </span>
                    </div>
                  )}

                  {isLoaded && (
                    <div className="problem-related-courses">
                      {problem?.courses?.map((course) => (
                        <Hyperlink
                          key={course?.id}
                          href={`/course/${course.id}`}
                        >
                          {course?.name}
                        </Hyperlink>
                      ))}
                    </div>
                  )}

                  {isLoaded && (
                    <div>
                      <ReactMarkdown>{problem?.description}</ReactMarkdown>
                    </div>
                  )}

                  {isLoaded && (
                    <div className="test-cases-list">
                      {testCases?.map((item, index) => (
                        <div key={index} className="test-case">
                          <div className="test-case-header">
                            <p style={{ fontWeight: "600", margin: 0 }}>
                              Testas {index + 1}
                            </p>
                            <Button
                              extra="small"
                              onClick={() => handleTestButtonClick(index)}
                              loading={isRunningTestCase[index]}
                              disabled={
                                Object.keys(isRunningTestCase).length !== 0 ||
                                isRunningCode ||
                                isEvaluating
                              }
                              iconSrc={playIcon}
                              width="50px"
                              height="35px"
                            ></Button>
                          </div>
                          <pre>
                            <code
                              style={{
                                padding: 0,
                              }}
                            >
                              {selectedLanguageValue === "cpp"
                                ? item?.input?.cpp
                                : item?.input?.python}
                            </code>
                          </pre>
                          <pre>
                            <strong>Rezultatas:</strong> <br />
                            {item?.expected_output}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLoaded && (
                    <div className="test-cases-list">
                      {hints?.map((item, index) => (
                        <div key={index} className="hint-tile">
                          <details>
                            <summary
                              style={{
                                fontWeight: "600",
                                margin: 0,
                                cursor: "pointer",
                              }}
                            >
                              Užuomina {index + 1}
                            </summary>
                            <p>{item?.hint}</p>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="problem-ai-window">
                  <div className="problem-ai-help-text-window">
                    <ChatTranscript
                      messages={chatMessages}
                      handleDeleteMessages={handleDeleteMessages}
                    />
                    {chatError && (
                      <div className="chat-error-message">{chatError}</div>
                    )}
                  </div>
                  <div className="problem-ai-help-interaction-window">
                    <ChatInput
                      onGenerateHint={handleGenerateHintClick}
                      onSend={(message) => handleSendAiMessageClick(message)}
                      notPremium={notPremium}
                      onGiveUp={handleGiveUpClick}
                      isGeneratingHint={isGeneratingHint}
                      isGeneratingChatAnswer={isGeneratingChatAnswer}
                      isSolvedByAI={isSolvedByAI}
                      isUndoingAISolution={isUndoingAISolution}
                      onUndoAISolution={handleUndoAISolution}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="problem-page-right">
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                extra="small"
                onClick={handleRunButtonClick}
                loading={isRunningCode}
                disabled={
                  isEvaluating || Object.keys(isRunningTestCase).length !== 0
                }
                iconSrc={playIcon}
                width="75px"
              ></Button>
              <Button
                extra="small bright"
                onClick={handleCheckclick}
                disabled={
                  isRunningCode || Object.keys(isRunningTestCase).length !== 0
                }
                loading={isEvaluating}
                iconSrc={evaluateIcon}
              >
                Įvertinti
              </Button>
              <Dropdown
                options={languages?.map((language) => language?.label)}
                placeholder={languages[0]?.label}
                onSelect={(value) => {
                  onDropdownSelect(value);
                }}
              />
            </div>
            <div
              className="code-editor-area"
              onClick={() => setIsOutputWindowMaximised(false)}
            >
              <CodeEditor
                language={selectedLanguageValue}
                value={
                  isLoaded
                    ? selectedLanguageValue === "cpp"
                      ? inputCode?.cpp
                      : inputCode?.python
                    : loadingText
                }
                setValue={(value) => {
                  setInputCode({
                    ...inputCode,
                    [selectedLanguageValue]: value,
                  });
                }}
                onResetClick={handleResetCodeButtonClick}
              />
            </div>
            <div
              style={{
                height: isOutputWindowMaximised ? "50%" : "15%",
              }}
              className="output-window"
              onClick={() => setIsOutputWindowMaximised(true)}
            >
              <OutputSection
                ref={outputRef}
                outputText={outputText}
                language={selectedLanguageValue}
                isOutputWindowMaximised={isOutputWindowMaximised}
                setIsOutputWindowMaximised={setIsOutputWindowMaximised}
              />
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default Problem;

const ChatInput = ({
  onGenerateHint,
  onSend,
  notPremium,
  onGiveUp,
  isGeneratingHint,
  isGeneratingChatAnswer,
  onUndoAISolution,
  isUndoingAISolution,
  isSolvedByAI,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend?.(message);
    setMessage("");
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Klauskite dirbtinio intelekto..."
          rows={1}
          disabled={notPremium}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          extra="small"
          onClick={handleSend}
          disabled={!message}
          loading={isGeneratingChatAnswer}
          iconSrc={chevronIcon}
          iconRotationDegrees={-90}
          iconHeight="8px"
          iconInvertColor={true}
          height="48px"
          width="48px"
        ></Button>
      </div>
      <div className="chat-input-actions">
        <div className="inline-elements">
          <Button
            loading={isGeneratingHint}
            extra="small bright"
            onClick={() => onGenerateHint?.()}
            iconSrc={hintIconMinimal}
            iconHeight="16px"
          >
            Generuoti užuominą
          </Button>
          <Button
            extra="small bright"
            onClick={() => onGiveUp?.()}
            iconSrc={surrenderIcon}
          >
            Pasiduoti
          </Button>
          <Button
            extra="small bright"
            onClick={() => onUndoAISolution?.()}
            loading={isUndoingAISolution}
            visibility={isSolvedByAI ? "visible" : "hidden"}
          >
            Panaikinti DI sprendimą
          </Button>
        </div>
        <VoiceToText setMessage={setMessage} className="chat-voice-input" />
      </div>
    </div>
  );
};

const ChatTranscript = ({ messages = [], handleDeleteMessages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);
  return (
    <div className="chat-transcript">
      {messages.length === 0 ? (
        <div className="chat-empty-state">
          <p>Klauskite DI asistento...</p>
        </div>
      ) : (
        messages?.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "user" ? "user" : "ai"}`}
          >
            <div className="chat-message-content">
              {msg.sender === "user" ? (
                <>
                  {msg.text}
                  <button
                    className="chat-delete-button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Ar tikrai norite ištrinti šią žinutę ir visas po jos?"
                        )
                      ) {
                        handleDeleteMessages(msg.timestamp);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
