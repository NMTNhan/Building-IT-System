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
    <div className='w-full'>
      <div className='border-4 bg-white border-gray-400 p-12 rounded-lg shadow-xl flex items-center justify-center min-h-[100px] mb-3'>
        <h2 className="text-2xl font-bold mb-4">{question.sentence}</h2>
      </div>
 
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-white border-2 border-gray-300 hover:border-orange-300 text-black py-5 px-6 md:text-lg rounded-md shadow-md transition-colors duration-300 w-full" // Adjusted width to half
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