import React, { useState, useEffect, useRef } from 'react';

// Main App component for the math game
function App() {
  // State variables to manage the game's progress and UI
  const [score, setScore] = useState(0); // Player's current score
  const [timeLeft, setTimeLeft] = useState(60); // Time remaining in seconds, initial 60s
  const [currentProblem, setCurrentProblem] = useState(null); // The current math problem object
  const [userAnswer, setUserAnswer] = useState(''); // User's input for the answer
  const [message, setMessage] = useState(''); // Feedback message (e.g., "Correct!", "Incorrect!")
  const [isGameOver, setIsGameOver] = useState(false); // Flag to indicate if the game is over
  const [gameStarted, setGameStarted] = useState(false); // Flag to indicate if the game has started
  const [problemType, setProblemType] = useState('random'); // Type of problem (addition, subtraction, multiplication, division, random)

  // useRef to store the timer interval ID, allowing it to be cleared
  const timerRef = useRef(null);
  // useRef to the answer input field for auto-focusing
  const answerInputRef = useRef(null);

  // useEffect hook to manage the game timer
  useEffect(() => {
    // If the game has started and is not over, set up the timer
    if (gameStarted && !isGameOver) {
      // Clear any existing timer to prevent multiple intervals
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // If time runs out (or is 1 and about to become 0), clear the interval and end the game
            clearInterval(timerRef.current);
            setIsGameOver(true);
            setGameStarted(false); // Ensure gameStarted is false when game is over
            return 0; // Set time to 0
          }
          return prevTime - 1; // Decrement time every second
        });
      }, 1000); // Update every 1000 milliseconds (1 second)
    } else if (!gameStarted || isGameOver) {
      // If game is not started or is over, ensure the timer is cleared
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null; // Reset the ref
      }
    }

    // Cleanup function: clear the interval when the component unmounts or game state changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, isGameOver]); // Dependencies: re-run effect if gameStarted or isGameOver changes

  // useEffect hook to generate a new problem when the game starts or a problem is solved
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      generateProblem(); // Generate the first problem or a new one
      // Focus on the input field after generating a problem
      if (answerInputRef.current) {
        answerInputRef.current.focus();
      }
    }
  }, [gameStarted, isGameOver, problemType]); // Dependencies: re-run if game state or problem type changes

  // Function to generate a random math problem based on selected type
  const generateProblem = () => {
    let num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    let num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    let operator;
    let answer;

    // Define available operators based on the problemType
    const operators = [];
    if (problemType === 'addition' || problemType === 'random') operators.push('+');
    if (problemType === 'subtraction' || problemType === 'random') operators.push('-');
    if (problemType === 'multiplication' || problemType === 'random') operators.push('*');
    if (problemType === 'division' || problemType === 'random') operators.push('/');

    // Select a random operator from the allowed ones
    operator = operators[Math.floor(Math.random() * operators.length)];

    // Calculate the correct answer based on the operator
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        // Ensure num1 is greater than or equal to num2 for positive subtraction results
        if (num1 < num2) {
          [num1, num2] = [num2, num1]; // Swap num1 and num2
        }
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        // For division, ensure the first number is a multiple of the second
        // to get a whole number answer
        const product = num1 * num2; // Create a product to ensure whole number division
        num1 = product; // Set num1 to the product
        answer = num1 / num2;
        break;
      default:
        // Fallback for unexpected operator, though should not happen with defined types
        operator = '+';
        answer = num1 + num2;
        break;
    }
    setCurrentProblem({ num1, num2, operator, answer });
  };

  // Function to handle the user's answer submission
  const handleAnswerSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    if (!currentProblem || !gameStarted || isGameOver) return; // Do nothing if no problem, game not active, or game over

    const parsedAnswer = parseInt(userAnswer, 10); // Parse user's answer to an integer

    // Check if the user's answer is correct
    if (parsedAnswer === currentProblem.answer) {
      setScore((prevScore) => prevScore + 1); // Increment score by 1
      setTimeLeft((prevTime) => prevTime + 30); // Add 30 seconds for correct answer
      setMessage('Correct! +30s'); // Set success message
    } else {
      setTimeLeft((prevTime) => Math.max(0, prevTime - 10)); // Deduct 10 seconds, ensure time doesn't go below 0
      setMessage(`Incorrect! -10s. The answer was ${currentProblem.answer}`); // Set error message with correct answer
    }

    setUserAnswer(''); // Clear the input field for the next problem
    generateProblem(); // Generate a new problem
    // Re-focus on the input field for continuous play
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  };

  // Function to start the game
  const startGame = () => {
    setScore(0); // Reset score to 0
    setTimeLeft(60); // Reset timer to initial 60 seconds
    setIsGameOver(false); // Clear game over flag
    setGameStarted(true); // Set game started flag to true
    setMessage(''); // Clear any previous feedback messages
    setUserAnswer(''); // Clear any previous user input
    generateProblem(); // Generate the very first problem
    // Focus on the input field when the game starts
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  };

  // Function to reset the game (after game over or to go back to start screen)
  const resetGame = () => {
    setGameStarted(false); // Stop the game
    setIsGameOver(false); // Clear game over flag
    setScore(0); // Reset score
    setTimeLeft(60); // Reset timer
    setMessage(''); // Clear message
    setUserAnswer(''); // Clear user answer
    setCurrentProblem(null); // Clear current problem
    // Ensure the timer is cleared if it's still running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center transform transition-all duration-300 hover:scale-105">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6 drop-shadow-lg">
          Math Challenge!
        </h1>

        {/* Initial screen: Game setup and Start button */}
        {!gameStarted && !isGameOver && (
          <div className="space-y-6">
            <p className="text-xl text-gray-700">
              Choose your challenge type:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {/* Buttons for selecting problem type */}
              <button
                onClick={() => setProblemType('addition')}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${problemType === 'addition' ? 'bg-green-600 text-white shadow-md' : 'bg-green-400 text-white hover:bg-green-500'}`}
              >
                Addition
              </button>
              <button
                onClick={() => setProblemType('subtraction')}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${problemType === 'subtraction' ? 'bg-red-600 text-white shadow-md' : 'bg-red-400 text-white hover:bg-red-500'}`}
              >
                Subtraction
              </button>
              <button
                onClick={() => setProblemType('multiplication')}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${problemType === 'multiplication' ? 'bg-yellow-600 text-white shadow-md' : 'bg-yellow-400 text-white hover:bg-yellow-500'}`}
              >
                Multiplication
              </button>
              <button
                onClick={() => setProblemType('division')}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${problemType === 'division' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-400 text-white hover:bg-indigo-500'}`}
              >
                Division
              </button>
              <button
                onClick={() => setProblemType('random')}
                className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105
                  ${problemType === 'random' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
              >
                Random
              </button>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-2xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game play screen: Score, Timer, Problem, Input, Submit */}
        {gameStarted && !isGameOver && (
          <div className="space-y-6">
            <div className="flex justify-around items-center mb-6">
              <div className="text-3xl font-bold text-gray-700">
                Score: <span className="text-green-600">{score}</span>
              </div>
              <div className="text-3xl font-bold text-gray-700">
                Time: <span className="text-red-600">{timeLeft}s</span>
              </div>
            </div>

            {currentProblem && (
              <div className="text-6xl font-extrabold text-blue-700 mb-8 animate-pulse">
                {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
              </div>
            )}

            <form onSubmit={handleAnswerSubmit} className="flex flex-col items-center space-y-4">
              <input
                type="number" // Use number type for numerical input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your Answer"
                className="w-full max-w-xs p-4 text-center text-3xl border-4 border-blue-400 rounded-xl focus:outline-none focus:border-blue-600 transition-all duration-300 shadow-md"
                required // Make the input required
                ref={answerInputRef} // Attach ref for auto-focus
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-4 rounded-xl text-2xl font-bold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Submit Answer
              </button>
            </form>

            {/* Feedback message display */}
            {message && (
              <p className={`text-xl font-semibold mt-4 ${message.includes('Correct') ? 'text-green-700' : 'text-red-700'}`}>
                {message}
              </p>
            )}
          </div>
        )}

        {/* Game over screen */}
        {isGameOver && (
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold text-red-600 mb-4 animate-bounce">
              Game Over!
            </h2>
            <p className="text-3xl font-bold text-gray-800">
              Your final score: <span className="text-green-600">{score}</span>
            </p>
            <button
              onClick={resetGame}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-2xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
