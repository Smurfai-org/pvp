import { useEffect, useState } from "react";

const AnimatedLoadingText = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return <span>{`Įkeliama${".".repeat(dots)}`}</span>;
};

export default AnimatedLoadingText;
