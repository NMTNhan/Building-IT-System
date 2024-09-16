import React, { useState, useEffect, useCallback } from 'react';
import { useQuestions } from '../context/QuestionContext';
import MultipleChoice from './MultipleChoice';
import FillInTheBlank from './FillInTheBank';
import { predictDifficulty } from '../ml/mlModel';
import freezeIcon from '../assets/freeze.png'; // Update path as needed
import skipIcon from '../assets/skip.png'; // Update path as needed

import '../tailwind.css';

const Game = () => {
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
    const { questions } = useQuestions();
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [gameMode, setGameMode] = useState(null);
    const [score, setScore] = useState(0);
    const [playerData, setPlayerData] = useState([]);
    const [actualStreak, setActualStreak] = useState(0);
    const [innerStreak, setInnerStreak] = useState(0);
    const [consecutiveWrongAnswers, setConsecutiveWrongAnswers] = useState(0);
    const [difficulty, setDifficulty] = useState('easy');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previousQuestions, setPreviousQuestions] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [askedQuestions, setAskedQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [isTimerFrozen, setIsTimerFrozen] = useState(false);

    // Power-ups state
    const [skipCount, setSkipCount] = useState(3); // Start with 3 skips per session
    const [timerFreeze, setTimerFreeze] = useState(3);

    useEffect(() => {
        if (!isTimerFrozen) {
            const timer = setInterval(() => {
                setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [currentQuestion, isTimerFrozen]);

    const loadNextQuestion = useCallback((difficulty) => {
        if (currentQuestionNumber > 30) {
            setShowModal(true);
            return;
        }

        console.log(`Loading next question for difficulty: ${difficulty}`);
        const modes = ['multipleChoice', 'fillInTheBlank'];
        const selectedMode = modes[Math.floor(Math.random() * modes.length)];
        console.log(`Selected Mode: ${selectedMode}`);

        if (!questions[selectedMode] || !questions[selectedMode][difficulty]) {
            console.error(`Questions not found for mode: ${selectedMode} and difficulty: ${difficulty}`);
            setError(`Questions not found for mode: ${selectedMode} and difficulty: ${difficulty}`);
            setLoading(false);
            return;
        }

        const questionsByDifficulty = questions[selectedMode][difficulty];
        const availableQuestions = questionsByDifficulty.filter(q => !askedQuestions.includes(q));
        if (availableQuestions.length === 0) {
            let nextDifficulty;
            if (difficulty === 'easy') {
                nextDifficulty = 'normal';
            } else if (difficulty === 'normal') {
                nextDifficulty = 'hard';
            } else {
                console.error(`No more questions available for the highest difficulty: ${difficulty}`);
                setShowModal(true);
                setLoading(false);
                return;
            }
            setDifficulty(nextDifficulty);
            setPreviousQuestions([]);
            loadNextQuestion(nextDifficulty);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const newQuestion = availableQuestions[randomIndex];

        setAskedQuestions(prev => [...prev, newQuestion]);
        setPreviousQuestions(prev => [...prev, newQuestion]);
        setGameMode(selectedMode);
        setCurrentQuestion(newQuestion);
        setLoading(false);
        setTimeLeft(20);
        setIsTimerFrozen(false);
    }, [questions, previousQuestions, askedQuestions, currentQuestionNumber]);

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

        let bonus = 0;
        if (timeLeft > 15) {
            bonus = 3;
        } else if (timeLeft > 5) {
            bonus = 2;
        } else {
            bonus = 0;
        }

        if (isCorrect) {
            newActualStreak += 1;
            newInnerStreak += 1;
            newConsecutiveWrongAnswers = 0;

            const scoreIncrement = 1 + Math.floor(newActualStreak / 3);
            setScore(score + scoreIncrement + bonus);
        } else {
            newActualStreak = 0;
            newInnerStreak = 0;
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
                if (difficulty === 'easy') {
                    nextDifficulty = 'normal';
                } else if (difficulty === 'normal') {
                    nextDifficulty = 'hard';
                }
                newInnerStreak = 0;
            } else if (difficulty === 'hard' && !isCorrect) {
                nextDifficulty = 'normal';
                newInnerStreak = 0;
            } else if (difficulty === 'normal' && newConsecutiveWrongAnswers >= 2) {
                nextDifficulty = 'easy';
                newInnerStreak = 0;
                newConsecutiveWrongAnswers = 0;
            } else {
                nextDifficulty = await predictDifficulty(playerStats);
            }

            console.log('Next Difficulty:', nextDifficulty);

            if (nextDifficulty !== difficulty) {
                setDifficulty(nextDifficulty);
                setPreviousQuestions([]);
            }
            setLoading(true);
            loadNextQuestion(nextDifficulty);
        } catch (error) {
            console.error('Error predicting difficulty:', error);
            setError('Error predicting difficulty');
        }
    };

    const handleSkip = () => {
        if (skipCount > 0) {
            setSkipCount(skipCount - 1);
            loadNextQuestion(difficulty);
        }
    };

    const handleTimerFreeze = () => {
        if (timerFreeze > 0) {
            setIsTimerFrozen(true);
            setTimerFreeze(timerFreeze - 1);
        }
    };

const renderGameMode = () => {
  if (!currentQuestion) {
    return <p className="text-red-500">No questions available for the selected mode and difficulty.</p>;
  }

  switch (gameMode) {
    case 'multipleChoice':
      return (
        <div className="question-container h-[60vh] backdrop-blur-sm bg-opacity-10 bg-white p-4 rounded shadow-md text-center border-2 h-[300px] flex items-center justify-center border-5 border rounded-lg">
          <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />
        </div>
      );
    case 'fillInTheBlank':
      return (
        <div className="question-container h-[60vh] backdrop-blur-sm bg-opacity-10 bg-white p-4 rounded shadow-md text-center border-2 h-[300px] flex items-center justify-center border-5 border rounded-lg">
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
      <h2 className="text-3xl font-bold text-gray-800 mb-5">Game Over</h2>
      <p className="mb-2">Score: {score}</p>
      <p className="mb-2">Streak: {streak}</p>
      <p className="mb-4">Final Difficulty: {difficulty}</p>
      <button
        className="bg-white text-gray-700 font-semibold py-2 px-4 border border-gray-400 rounded shadow m-2 hover:bg-gray-100"
        onClick={onClose}
      >
        Close
      </button>      
    </div>
  </div>
);

return (
  <div className="bg-[url('./assets/103939.jpg')] h-64 w-full bg-cover bg-center min-h-screen">
        {/* Positioned Info Tags */}
        <div className="absolute infoTag top-20 left-22 ml-5 space-y-4">
          <h3 className="text-xl font-bold">Score: {score}</h3>
          <h3 className="text-3xl font-bold flex flex-row items-center">
          <svg
              className="w-12 h-12"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path
                fill="#FFB446"
                d="M97.103,353.103C97.103,440.86,168.244,512,256,512l0,0c87.756,0,158.897-71.14,158.897-158.897
                    c0-88.276-44.138-158.897-14.524-220.69c0,0-47.27,8.828-73.752,79.448c0,0-88.276-88.276-51.394-211.862
                    c0,0-89.847,35.31-80.451,150.069c8.058,98.406-9.396,114.759-9.396,114.759c0-79.448-62.115-114.759-62.115-114.759
                    C141.241,247.172,97.103,273.655,97.103,353.103z"
              />
              <path
                fill="#FFDC64"
                d="M370.696,390.734c0,66.093-51.033,122.516-117.114,121.241
                    c-62.188-1.198-108.457-48.514-103.512-110.321c2.207-27.586,23.172-72.276,57.379-117.517l22.805,13.793
                    C229.517,242.023,256,167.724,256,167.724C273.396,246.007,370.696,266.298,370.696,390.734z"
              />
              <path
                fill="#FFFFFF"
                d="M211.862,335.448c-8.828,52.966-26.483,72.249-26.483,105.931C185.379,476.69,216.998,512,256,512
                    l0,0c39.284,0,70.729-32.097,70.62-71.381c-0.295-105.508-61.792-158.136-61.792-158.136c8.828,52.966-17.655,79.448-17.655,79.448
                    C236.141,345.385,211.862,335.448,211.862,335.448z"
              />
            </svg>  
            <div className='p-2 text-gray-100 border bg-[#0f172a] border-0 rounded-full inline-block'>
              {actualStreak}
            </div>
          </h3>
          <h3 className="text-xl font-bold">Difficulty: {difficulty}</h3>
          <h3 className="text-xl font-bold">Time Left: {timeLeft}s</h3>
      </div>

      {/* Power-ups moved to right side */}
      <div className="absolute top-24 right-10 space-y-4">
        {/* Skip Button */}
        <div className="relative">
          <button
            onClick={handleSkip}
            disabled={skipCount === 0}
            className={`flex items-center justify-center ${skipCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <img src={skipIcon} alt="Skip Icon" className="w-24 h-24" />
          </button>
          <div className="absolute top-0 right-0 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-s">
            {skipCount}
          </div>
        </div>

        {/* Timer Freeze Button */}
        <div className="relative">
          <button
            onClick={handleTimerFreeze}
            disabled={timerFreeze === 0}
            className={`flex items-center justify-center ${timerFreeze === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <img src={freezeIcon} alt="Freeze Timer Icon" className="w-24 h-24" />
          </button>
          <div className="absolute top-0 right-0 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-s">
            {timerFreeze}
          </div>
        </div> 
      </div>

      <div className="h-64 w-full bg-cover bg-center min-h-screen flex items-center justify-center">
        <div className="container relative mx-auto-csa p-4 bg-white rounded shadow-lg text-center backdrop-blur-sm bg-opacity-10 lg:max-w-[1080px] 2xl:max-w-[1080px]">
          {loading && <p className="text-blue-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && renderGameMode()}
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
  </div>
);

};

export default Game;
