import React, { useState } from 'react';

const FillInTheBlank = ({ question, onAnswer }) => {
  const [inputValue, setInputValue] = useState('');

  if (!question) {
    return <p>Loading...</p>;
  }

  const handleAnswer = () => {
    onAnswer(inputValue.toLowerCase() === question.answer.toLowerCase());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{question.sentence}</h2>
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/2 mb-4" // Adjusted width to half
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2"
          onClick={handleAnswer}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default FillInTheBlank;