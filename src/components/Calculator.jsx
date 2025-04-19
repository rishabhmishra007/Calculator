import { useState, useEffect } from "react";
import * as math from "mathjs";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [secondaryDisplay, setSecondaryDisplay] = useState("");
  const [memory, setMemory] = useState(0);
  const [waitingForOperand, setWaitingForOperand] = useState(true);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [lastValue, setLastValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showMemory, setShowMemory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (/^[0-9]$/.test(key)) {
        digitPressed(key);
        return;
      }

      switch (key) {
        case "+":
          operatorPressed("+");
          break;
        case "-":
          operatorPressed("-");
          break;
        case "*":
          operatorPressed("×");
          break;
        case "/":
          operatorPressed("÷");
          break;
        case "Enter":
        case "=":
          equalsPressed();
          break;
        case ".":
        case ",":
          decimalPressed();
          break;
        case "Escape":
          allClearPressed();
          break;
        case "Backspace":
          backspacePressed();
          break;
        case "%":
          percentPressed();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [display, lastValue, pendingOperator, waitingForOperand]);

  const digitPressed = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const decimalPressed = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const backspacePressed = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setWaitingForOperand(true);
    }
  };

  const operatorPressed = (operator) => {
    const operand = parseFloat(display);

    if (pendingOperator) {
      try {
        const result = calculateResult(lastValue, operand, pendingOperator);
        setDisplay(String(result));
        setLastValue(result);
        addToHistory(`${lastValue} ${pendingOperator} ${operand} = ${result}`);
        setSecondaryDisplay(`${result} ${operator}`);
      } catch (error) {
        setDisplay("Error");
        setSecondaryDisplay("");
      }
    } else {
      setLastValue(operand);
      setSecondaryDisplay(`${operand} ${operator}`);
    }

    setPendingOperator(operator);
    setWaitingForOperand(true);
  };

  const calculateResult = (leftOperand, rightOperand, operator) => {
    switch (operator) {
      case "+":
        return leftOperand + rightOperand;
      case "-":
        return leftOperand - rightOperand;
      case "×":
        return leftOperand * rightOperand;
      case "÷":
        if (rightOperand === 0) throw new Error("Division by zero");
        return leftOperand / rightOperand;
      case "^":
        return Math.pow(leftOperand, rightOperand);
      default:
        return rightOperand;
    }
  };

  const equalsPressed = () => {
    if (!pendingOperator) return;

    const operand = parseFloat(display);

    try {
      const result = calculateResult(lastValue, operand, pendingOperator);
      setDisplay(String(result));
      setSecondaryDisplay(`${lastValue} ${pendingOperator} ${operand}`);
      addToHistory(`${lastValue} ${pendingOperator} ${operand} = ${result}`);

      setLastValue(result);
      setPendingOperator(null);
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay("Error");
      setSecondaryDisplay("");
    }
  };

  const addToHistory = (entry) => {
    setHistory((prev) => [...prev.slice(-4), entry]);
  };

  const clearPressed = () => {
    setDisplay("0");
    setWaitingForOperand(true);
  };

  const allClearPressed = () => {
    setDisplay("0");
    setSecondaryDisplay("");
    setPendingOperator(null);
    setLastValue(0);
    setWaitingForOperand(true);
  };

  const percentPressed = () => {
    const value = parseFloat(display);
    const result = value / 100;
    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const changeSignPressed = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const sqrtPressed = () => {
    const value = parseFloat(display);
    if (value < 0) {
      setDisplay("Error");
    } else {
      const result = Math.sqrt(value);
      setDisplay(String(result));
      setWaitingForOperand(true);
    }
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
    setWaitingForOperand(true);
    setShowMemory(true);
  };

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display));
    setWaitingForOperand(true);
    setShowMemory(true);
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(false);
  };

  const memoryClear = () => {
    setMemory(0);
    setShowMemory(false);
  };

  const evaluateExpression = () => {
    try {
      const result = math.evaluate(display.replace("×", "*").replace("÷", "/"));
      setDisplay(String(result));
      addToHistory(`${display} = ${result}`);
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay("Error");
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const getThemeColors = () => {
    return isDarkTheme
      ? {
          bg: "bg-gray-900",
          text: "text-white",
          textSecondary: "text-gray-300",
          displayBg: "bg-gray-800",
          buttonBg: "bg-gray-800",
          buttonText: "text-white",
          buttonHover: "hover:bg-gray-700",
          buttonActive: "active:bg-gray-600",
          operatorBg: "bg-red-500",
          operatorHover: "hover:bg-red-600",
          operatorActive: "active:bg-red-700",
          functionBg: "bg-gray-700",
          functionHover: "hover:bg-gray-600",
          functionActive: "active:bg-gray-500",
          memoryBg: "bg-blue-700",
          memoryHover: "hover:bg-blue-800",
          memoryActive: "active:bg-blue-900",
          advancedBg: "bg-purple-700",
          advancedHover: "hover:bg-purple-800",
          advancedActive: "active:bg-purple-900",
          equalsBg: "bg-green-600",
          equalsHover: "hover:bg-green-700",
          equalsActive: "active:bg-green-800",
          shadow: "shadow-lg shadow-gray-800/50",
        }
      : {
          bg: "bg-gray-100",
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          displayBg: "bg-white",
          buttonBg: "bg-white",
          buttonText: "text-gray-900",
          buttonHover: "hover:bg-gray-50",
          buttonActive: "active:bg-gray-200",
          operatorBg: "bg-red-400",
          operatorHover: "hover:bg-red-500",
          operatorActive: "active:bg-red-600",
          functionBg: "bg-gray-300",
          functionHover: "hover:bg-gray-400",
          functionActive: "active:bg-gray-500",
          memoryBg: "bg-blue-500",
          memoryHover: "hover:bg-blue-600",
          memoryActive: "active:bg-blue-700",
          advancedBg: "bg-purple-500",
          advancedHover: "hover:bg-purple-600",
          advancedActive: "active:bg-purple-700",
          equalsBg: "bg-green-500",
          equalsHover: "hover:bg-green-600",
          equalsActive: "active:bg-green-700",
          shadow: "shadow-md shadow-gray-300/50",
        };
  };

  const theme = getThemeColors();

  const DigitButton = ({ digit, className = "" }) => (
    <button
      onClick={() => digitPressed(digit)}
      className={`rounded-full ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover} ${theme.buttonActive} 
        flex items-center justify-center text-xl md:text-2xl font-medium transition-all duration-150 ${theme.shadow}
        h-14 sm:h-16 md:h-20 ${className}`}
    >
      {digit}
    </button>
  );

  const OperatorButton = ({ operator, label, className = "" }) => (
    <button
      onClick={() => operatorPressed(operator)}
      className={`rounded-full ${theme.operatorBg} text-white ${theme.operatorHover} ${theme.operatorActive}
        flex items-center justify-center text-xl md:text-2xl font-medium transition-all duration-150 ${theme.shadow}
        h-14 sm:h-16 md:h-20 ${className}`}
    >
      {label || operator}
    </button>
  );

  const FunctionButton = ({
    onClick,
    label,
    color = theme.functionBg,
    hoverColor = theme.functionHover,
    activeColor = theme.functionActive,
    className = "",
  }) => (
    <button
      onClick={onClick}
      className={`rounded-full ${color} text-white ${hoverColor} ${activeColor}
        flex items-center justify-center text-lg md:text-xl font-medium transition-all duration-150 ${theme.shadow}
        h-14 sm:h-16 md:h-20 ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-300 w-full ${theme.bg} select-none`}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto p-2 sm:p-3 md:p-4 flex flex-col flex-1"
        style={{ minHeight: "unset", maxHeight: "95vh" }}
      >
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all
              ${
                isDarkTheme
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {showAdvanced ? "Basic" : "Advanced"}
            </button>
            <button
              onClick={() => setShowMemory(!showMemory)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all
              ${
                isDarkTheme
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {showMemory ? "Hide M" : "Show M"}
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className={`rounded-full w-8 h-8 flex items-center justify-center ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            {isDarkTheme ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
        <div
          className={`${theme.displayBg} rounded-2xl mb-5 p-3 sm:p-4 md:p-6 ${theme.shadow} w-full max-w-full`}
        >
          <div className="h-8 sm:h-10 overflow-y-auto text-right">
            {history.length > 0 && (
              <div className={`text-xs sm:text-sm ${theme.textSecondary}`}>
                {history[history.length - 1]}
              </div>
            )}
          </div>
          {showMemory && memory !== 0 && (
            <div
              className={`text-xs sm:text-sm text-left mb-1 ${theme.textSecondary}`}
            >
              M = {memory}
            </div>
          )}
          <div
            className={`text-right text-base sm:text-lg ${theme.textSecondary} overflow-x-auto break-all`}
          >
            {secondaryDisplay}
          </div>
          <div
            className={`text-right text-3xl sm:text-4xl md:text-5xl font-semibold mt-1 overflow-x-auto whitespace-nowrap break-all ${theme.text}`}
          >
            {display}
          </div>
        </div>
        {showMemory && (
          <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 mb-3">
            <FunctionButton
              onClick={memoryClear}
              label="MC"
              color={theme.memoryBg}
              hoverColor={theme.memoryHover}
              activeColor={theme.memoryActive}
            />
            <FunctionButton
              onClick={memoryRecall}
              label="MR"
              color={theme.memoryBg}
              hoverColor={theme.memoryHover}
              activeColor={theme.memoryActive}
            />
            <FunctionButton
              onClick={memoryAdd}
              label="M+"
              color={theme.memoryBg}
              hoverColor={theme.memoryHover}
              activeColor={theme.memoryActive}
            />
            <FunctionButton
              onClick={memorySubtract}
              label="M-"
              color={theme.memoryBg}
              hoverColor={theme.memoryHover}
              activeColor={theme.memoryActive}
            />
          </div>
        )}
        {showAdvanced && (
          <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 mb-3">
            <FunctionButton
              onClick={sqrtPressed}
              label="√"
              color={theme.advancedBg}
              hoverColor={theme.advancedHover}
              activeColor={theme.advancedActive}
            />
            <FunctionButton
              onClick={() => {
                operatorPressed("^");
              }}
              label="x^y"
              color={theme.advancedBg}
              hoverColor={theme.advancedHover}
              activeColor={theme.advancedActive}
            />
            <FunctionButton
              onClick={() => setDisplay(String(Math.PI))}
              label="π"
              color={theme.advancedBg}
              hoverColor={theme.advancedHover}
              activeColor={theme.advancedActive}
            />
            <FunctionButton
              onClick={evaluateExpression}
              label="="
              color={theme.advancedBg}
              hoverColor={theme.advancedHover}
              activeColor={theme.advancedActive}
            />
          </div>
        )}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
          <FunctionButton onClick={allClearPressed} label="AC" />
          <FunctionButton onClick={changeSignPressed} label="+/-" />
          <FunctionButton onClick={percentPressed} label="%" />
          <OperatorButton operator="÷" label="÷" />
          <DigitButton digit="7" />
          <DigitButton digit="8" />
          <DigitButton digit="9" />
          <OperatorButton operator="×" label="×" />
          <DigitButton digit="4" />
          <DigitButton digit="5" />
          <DigitButton digit="6" />
          <OperatorButton operator="-" label="-" />
          <DigitButton digit="1" />
          <DigitButton digit="2" />
          <DigitButton digit="3" />
          <OperatorButton operator="+" label="+" />
          <DigitButton digit="0" className="col-span-2 pl-6 justify-start" />
          <DigitButton digit="." />
          <FunctionButton
            onClick={equalsPressed}
            label="="
            color={theme.equalsBg}
            hoverColor={theme.equalsHover}
            activeColor={theme.equalsActive}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <FunctionButton
            onClick={backspacePressed}
            label="⌫"
            className="w-14 sm:w-16"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-center text-gray-400">
        made by Rishabh @ 2025
      </p>
    </div>
  );
};

export default Calculator;
