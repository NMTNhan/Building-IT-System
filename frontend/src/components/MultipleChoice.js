import React from 'react';

const MultipleChoice = ({ question, onAnswer }) => {
  if (!question || !question.options) {
    return <p>Loading...</p>;
  }

  const handleAnswer = (selectedOption) => {
    onAnswer(selectedOption === question.answer);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
      <ul className="space-y-2">
        {question.options.map((option) => (
          <li key={option}>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultipleChoice;