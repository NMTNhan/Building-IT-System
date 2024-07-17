import React, { useState } from 'react';

const FillInTheBlank = ({ question, onAnswer }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAnswer = () => {
    onAnswer(inputValue.toLowerCase() === question.answer.toLowerCase());
  };

  return (
    <div>
      <h2>{question.sentence}</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleAnswer}>Submit</button>
    </div>
  );
};

export default FillInTheBlank;
