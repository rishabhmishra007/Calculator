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
        flex items-center justify-center text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-medium transition-all duration-150 ${theme.shadow}
        h-12 xs:h-14 sm:h-16 md:h-14 lg:h-16 ${className} touch-manipulation`}
    >
      {digit}
    </button>
  );

  const OperatorButton = ({ operator, label, className = "" }) => (
    <button
      onClick={() => operatorPressed(operator)}
      className={`rounded-full ${theme.operatorBg} text-white ${theme.operatorHover} ${theme.operatorActive}
        flex items-center justify-center text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl font-medium transition-all duration-150 ${theme.shadow}
        h-12 xs:h-14 sm:h-16 md:h-14 lg:h-16 ${className} touch-manipulation`}
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
        flex items-center justify-center text-sm xs:text-base sm:text-lg md:text-base lg:text-lg font-medium transition-all duration-150 ${theme.shadow}
        h-12 xs:h-14 sm:h-16 md:h-14 lg:h-16 ${className} touch-manipulation`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex items-center justify-center min-h-screen w-full ${theme.bg} select-none relative`}
      style={{ minHeight: "100vh" }}
    >
      <div
        className="flex flex-col bg-transparent rounded-2xl shadow-lg overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-full max-h-[95vh]"
        style={{ height: "95vh" }}
      >
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-1 px-2 pt-2 flex-shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium transition-all
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
              className={`px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium transition-all
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
            className={`rounded-full w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all ${
              isDarkTheme
                ? "text-white hover:bg-gray-800"
                : "text-gray-900 hover:bg-gray-200"
            }`}
          >
            {isDarkTheme ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                className="xs:w-5 xs:h-5 sm:w-6 sm:h-6"
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
                width="16"
                height="16"
                className="xs:w-5 xs:h-5 sm:w-6 sm:h-6"
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

        {/* Display */}
        <div
          className={`${theme.displayBg} rounded-xl mb-1 px-2 py-1 ${theme.shadow} w-full flex-shrink-0`}
        >
          <div className="h-4 xs:h-6 sm:h-8 md:h-10 overflow-y-auto text-right">
            {history.length > 0 && (
              <div
                className={`text-xs xs:text-sm sm:text-base ${theme.textSecondary} break-words`}
              >
                {history[history.length - 1]}
              </div>
            )}
          </div>
          {showMemory && memory !== 0 && (
            <div
              className={`text-xs xs:text-sm sm:text-base text-left mb-1 ${theme.textSecondary}`}
            >
              M = {memory}
            </div>
          )}
          <div
            className={`text-right text-sm xs:text-base sm:text-lg md:text-xl ${theme.textSecondary} overflow-x-auto break-all`}
          >
            {secondaryDisplay}
          </div>
          <div
            className={`text-right text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-semibold mt-1 overflow-x-auto whitespace-nowrap ${theme.text}`}
            style={{
              minHeight: "1.2em",
              lineHeight: "1.1",
              wordBreak: "break-all",
            }}
          >
            {display}
          </div>
        </div>

        {/* Memory Controls */}
        {showMemory && (
          <div className="grid grid-cols-4 gap-1 mb-1 px-2 flex-shrink-0">
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

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="grid grid-cols-4 gap-1 mb-1 px-2 flex-shrink-0">
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

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-4 gap-1 mb-1 px-2 flex-grow">
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
          <DigitButton
            digit="0"
            className="col-span-2 justify-start pl-4 xs:pl-6"
          />
          <DigitButton digit="." />
          <FunctionButton
            onClick={equalsPressed}
            label="="
            color={theme.equalsBg}
            hoverColor={theme.equalsHover}
            activeColor={theme.equalsActive}
          />
        </div>

        {/* Backspace Button */}
        <div className="flex justify-end px-2 pb-1 flex-shrink-0">
          <FunctionButton
            onClick={backspacePressed}
            label="⌫"
            className="w-10"
          />
        </div>

        {/* Footer */}
        <div className="w-full text-center pb-1 flex-shrink-0">
          <p className="text-xs text-gray-400">made by Rishabh @ 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
