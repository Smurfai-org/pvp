import { LineChart } from "@mui/x-charts/LineChart";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../utils/AuthContext";
import { formatDate } from "./ViewProfile";

export default function UserProgressChart({
  accountCreationDate,
  setAverageRating,
}) {
  const { loggedIn, user } = useContext(AuthContext);
  const [graphData, setGraphData] = useState([]);

  const problemDifficulties = [
    { key: "all", label: "Visos", color: "#9eceff" },
    { key: "generated", label: "Asmeninės", color: "#303036" },
    { key: "hard", label: "Sunkios", color: "#fc0303" },
    { key: "medium", label: "Vidutinės", color: "#ffa600" },
    { key: "easy", label: "Lengvos", color: "#00db1a" },
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) return;

      const response = await fetch(
        `http://localhost:5000/progress/u=${user.id}`
      );
      if (!response.ok) throw new Error(response.status);

      const data = await response.json();
      const localFinishedProblems = data.filter(
        (line) => line?.status === "finished"
      );
      localFinishedProblems.sort(
        (a, b) => new Date(a.completion_date) - new Date(b.completion_date)
      );

      const sumOfCompletedProblems = {};
      const difficultiesNames = problemDifficulties.map((item) => item.key);
      const dateMap = new Map();
      let localAverageRating = 0;

      difficultiesNames.forEach((difficulty) => {
        sumOfCompletedProblems[difficulty] = 0;
      });

      function ensureDateEntry(date) {
        if (!dateMap.has(date)) {
          const entry = { date };
          difficultiesNames.forEach(
            (d) => (entry[d] = sumOfCompletedProblems[d])
          );
          dateMap.set(date, entry);
        }
      }

      ensureDateEntry(accountCreationDate);

      localFinishedProblems.forEach((element) => {
        const formattedDate = formatDate(element.completion_date, true);

        ensureDateEntry(formattedDate);
        difficultiesNames.forEach((difficulty) => {
          if (element.difficulty === difficulty || difficulty === "all") {
            sumOfCompletedProblems[difficulty]++;
            dateMap.get(formattedDate)[difficulty] =
              sumOfCompletedProblems[difficulty];
          }
        });

        localAverageRating += element.score;
      });

      ensureDateEntry(formatDate(new Date(), true));

      const localGraphData = Array.from(dateMap.values());
      localGraphData.forEach((d) => {
        const dateObj = new Date(d.date);
        dateObj.setHours(0, 0, 0, 0);
        d.date = dateObj;
      });
      localAverageRating = (
        localAverageRating / localFinishedProblems.length
      ).toFixed(2);

      setGraphData(localGraphData);
      setAverageRating(localAverageRating);
    };

    fetchProgress();
  }, [user?.id, accountCreationDate]);

  if (!loggedIn) return null;

  return (
    <>
      <br />
      <br />
      <LineChart
        dataset={graphData}
        xAxis={[
          {
            id: "Years",
            dataKey: "date",
            scaleType: "time",
            label: "Data",
          },
        ]}
        yAxis={[
          {
            label: "Išspręstų užduočių kiekis",
            min: 0,
            max:
              Math.max(
                ...graphData.map((d) =>
                  Math.max(
                    ...problemDifficulties.map((diff) => d[diff.key] || 0)
                  )
                )
              ) + 1,
          },
        ]}
        series={problemDifficulties?.map((diff) => ({
          id: diff.label,
          label: diff.label,
          dataKey: diff.key,
          showMark: false,
          color: diff.color,
          curve: "linear",
        }))}
        height={300}
      />
    </>
  );
}
