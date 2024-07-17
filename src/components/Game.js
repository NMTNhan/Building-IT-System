import React, { useState, useEffect } from 'react';
import { useQuestions } from '../context/QuestionsContext';
import MultipleChoice from './MultipleChoice';
import FillInTheBlank from './FillInTheBlank';
import { loadModel, predictDifficulty } from '../ml/mlModel';

const Game = () => {
  const { questions } = useQuestions();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [score, setScore] = useState(0);
  const [playerData, setPlayerData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await loadModel();
      const prediction = predictDifficulty(playerData);
      loadNextQuestion(prediction);
    };

    fetchData();
  }, [playerData]);

  const loadNextQuestion = (difficulty) => {
    const modes = ['multipleChoice', 'fillInTheBlank'];
    const selectedMode = modes[Math.floor(Math.random() * modes.length)];
    const questionsByDifficulty = questions[selectedMode][difficulty];
    const randomIndex = Math.floor(Math.random() * questionsByDifficulty.length);
    setGameMode(selectedMode);
    setCurrentQuestion(questionsByDifficulty[randomIndex]);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    setPlayerData([...playerData, { question: currentQuestion, answer: isCorrect }]);
  };

  const renderGameMode = () => {
    switch (gameMode) {
      case 'multipleChoice':
        return <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />;
      case 'fillInTheBlank':
        return <FillInTheBlank question={currentQuestion} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderGameMode()}
      <div>
        <h3>Score: {score}</h3>
      </div>
    </div>
  );
};

export default Game;
