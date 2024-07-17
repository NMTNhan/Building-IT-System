import React from 'react';

const MultipleChoice = ({ question, onAnswer }) => {
  const handleAnswer = (selectedOption) => {
    onAnswer(selectedOption === question.answer);
  };

  return (
    <div>
      <h2>{question.question}</h2>
      <ul>
        {question.options.map((option) => (
          <li key={option} onClick={() => handleAnswer(option)}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultipleChoice;
