import React, { useState } from 'react';

const MultipleChoice = ({ question, onAnswer }) => {


  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);


  if (!question || !question.options) {
    return <p>Loading...</p>;
  }


  const handleAnswer = (selectedOption) => {
    setSelectedOption(selectedOption);
    const isCorrect = selectedOption === question.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedOption(null);
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="w-full">
      <div className="border-4 bg-white border-gray-400 p-12 rounded-lg shadow-xl flex items-center justify-center min-h-[100px] mb-3">
        <h2 className="text-3xl font-bold">{question.question}</h2>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-8 mt-16">
        {question.options.map((option) => {
          let buttonClass = "bg-white border-2 border-gray-300 hover:bg-orange-300 text-black py-5 px-6 md:text-lg rounded-md shadow-md transition-colors duration-300 w-full";

          if (feedback) {
            if (option === question.answer) {
              buttonClass = feedback === 'correct' && selectedOption === option
                ? 'bg-green-400 text-white rounded-md shadow-md' 
                : 'bg-green-400 text-white rounded-md shadow-md';
            } else if (selectedOption === option) {
              buttonClass = 'bg-red-400 text-white rounded-md shadow-md';
            }
          }

          return (
            <button
              key={option}
              className={buttonClass}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback} 
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoice;