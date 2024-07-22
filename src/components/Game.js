import React, { useState, useEffect, useCallback } from 'react';
import { useQuestions } from '../context/QuestionContext';
import MultipleChoice from './MultipleChoice';
import FillInTheBlank from './FillInTheBank';
import { predictDifficulty } from '../ml/mlModel';
import '../tailwind.css';

const Game = () => {
  const { questions } = useQuestions();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [score, setScore] = useState(0);
  const [playerData, setPlayerData] = useState([]);
  const [actualStreak, setActualStreak] = useState(0); // Actual streak displayed to the user
  const [innerStreak, setInnerStreak] = useState(0); // Inner streak used for difficulty transitions
  const [consecutiveWrongAnswers, setConsecutiveWrongAnswers] = useState(0); // Track consecutive wrong answers
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'normal', 'hard'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState([]); // Add this state to track asked questions
  const [showModal, setShowModal] = useState(false);

  const loadNextQuestion = useCallback((difficulty) => {
    console.log(`Loading next question for difficulty: ${difficulty}`);
    const modes = ['multipleChoice', 'fillInTheBlank'];
    const selectedMode = modes[Math.floor(Math.random() * modes.length)];
    console.log(`Selected Mode: ${selectedMode}`);
  
    if (!questions[selectedMode] || !questions[selectedMode][difficulty]) {
      console.error(`Questions not found for mode: ${selectedMode} and difficulty: ${difficulty}`);
      setError(`Questions not found for mode: ${selectedMode} and difficulty: ${difficulty}`);
      setLoading(false); // Set loading to false if there is an error
      return;
    }
  
    const questionsByDifficulty = questions[selectedMode][difficulty];
  
    // Filter out questions that have already been asked
    const availableQuestions = questionsByDifficulty.filter(q => !askedQuestions.includes(q));
    if (availableQuestions.length === 0) {
      // If no more questions are available, increase the difficulty level
      let nextDifficulty;
      if (difficulty === 'easy') {
        nextDifficulty = 'normal';
      } else if (difficulty === 'normal') {
        nextDifficulty = 'hard';
      } else {
        console.error(`No more questions available for the highest difficulty: ${difficulty}`);
        setShowModal(true); // Show modal when all questions are cleared
        setLoading(false); // Set loading to false if there is an error
        return;
      }
      setDifficulty(nextDifficulty);
      setPreviousQuestions([]); // Reset previous questions when difficulty changes
      loadNextQuestion(nextDifficulty);
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const newQuestion = availableQuestions[randomIndex];
  
    setAskedQuestions(prev => [...prev, newQuestion]); // Add the new question to the list of asked questions
    setPreviousQuestions(prev => [...prev, newQuestion]);
    setGameMode(selectedMode);
    setCurrentQuestion(newQuestion);
    setLoading(false); // Reset loading flag
  }, [questions, previousQuestions, askedQuestions]);
  
  useEffect(() => {
    if (isInitialLoad) {
      loadNextQuestion(difficulty);
      setIsInitialLoad(false);
    }
  }, [difficulty, loadNextQuestion, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) {
      loadNextQuestion(difficulty);
      setIsInitialLoad(false);
    }
  }, [difficulty, loadNextQuestion, isInitialLoad]);

  const handleAnswer = async (isCorrect) => {
    let newActualStreak = actualStreak;
    let newInnerStreak = innerStreak;
    let newConsecutiveWrongAnswers = consecutiveWrongAnswers;

    if (isCorrect) {
        newActualStreak += 1;
        newInnerStreak += 1;
        newConsecutiveWrongAnswers = 0; // Reset consecutive wrong answers on correct answer

        // Calculate score increment based on the current streak
        const scoreIncrement = 1 + Math.floor(newActualStreak / 3); // Example: +1 for every 3 correct answers in a row
        setScore(score + scoreIncrement);
    } else {
        newActualStreak = 0; // Reset actual streak to 0 on a wrong answer
        newInnerStreak = 0; // Reset inner streak to 0 on a wrong answer
        newConsecutiveWrongAnswers += 1;
    }

    setActualStreak(newActualStreak);
    setInnerStreak(newInnerStreak);
    setConsecutiveWrongAnswers(newConsecutiveWrongAnswers);
    setPlayerData([...playerData, { question: currentQuestion, answer: isCorrect }]);

    const playerStats = {
        streak: newInnerStreak,
        current_difficulty: difficulty
    };

    console.log('Player Stats:', playerStats);

    try {
        let nextDifficulty = difficulty;

        if (newInnerStreak >= 3) {
            // Promote difficulty if inner streak is 3 or more
            if (difficulty === 'easy') {
                nextDifficulty = 'normal';
            } else if (difficulty === 'normal') {
                nextDifficulty = 'hard';
            }
            newInnerStreak = 0; // Reset inner streak after promotion
        } else if (difficulty === 'hard' && !isCorrect) {
            nextDifficulty = 'normal'; // Demote to normal on wrong answer
            newInnerStreak = 0; // Reset inner streak after demotion
        } else if (difficulty === 'normal' && newConsecutiveWrongAnswers >= 2) {
            nextDifficulty = 'easy'; // Demote to easy after two consecutive wrong answers
            newInnerStreak = 0; // Reset inner streak after demotion
            newConsecutiveWrongAnswers = 0; // Reset consecutive wrong answers after demotion
        } else {
            nextDifficulty = await predictDifficulty(playerStats); // Use the predictDifficulty function
        }

        console.log('Next Difficulty:', nextDifficulty);

        if (nextDifficulty !== difficulty) {
            setDifficulty(nextDifficulty);
            setPreviousQuestions([]); // Reset previous questions when difficulty changes
        }
        setLoading(true); // Set loading flag to true before loading the next question
        loadNextQuestion(nextDifficulty);
    } catch (error) {
        console.error('Error predicting difficulty:', error);
        setError('Error predicting difficulty');
    }
};

const renderGameMode = () => {
  if (!currentQuestion) {
    return <p className="text-red-500">No questions available for the selected mode and difficulty.</p>;
  }

  switch (gameMode) {
    case 'multipleChoice':
      return (
        <div className="question-container bg-white p-4 rounded shadow-md text-center">
          <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />
        </div>
      );
    case 'fillInTheBlank':
      return (
        <div className="question-container bg-white p-4 rounded shadow-md text-center">
          <FillInTheBlank question={currentQuestion} onAnswer={handleAnswer} />
        </div>
      );
    default:
      return <p className="text-red-500">No questions available for the selected mode and difficulty.</p>;
  }
};
  
const StatsModal = ({ score, streak, difficulty, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div className="bg-white p-6 rounded shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Game Over</h2>
      <p className="mb-2">Score: {score}</p>
      <p className="mb-2">Streak: {streak}</p>
      <p className="mb-4">Final Difficulty: {difficulty}</p>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="container mx-auto p-4 bg-white rounded shadow-lg text-center">
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && renderGameMode()}
      <div className="mt-4 text-left">
        <h3 className="text-xl font-bold">Score: {score}</h3>
        <h3 className="text-xl font-bold">Streak: {actualStreak}</h3> {/* Display the actual streak */}
        <h3 className="text-xl font-bold">Difficulty: {difficulty}</h3>
      </div>
    </div>
    {showModal && (
      <StatsModal
        score={score}
        streak={actualStreak}
        difficulty={difficulty}
        onClose={() => setShowModal(false)}
      />
    )}
  </div>
);
  };
  
  export default Game;