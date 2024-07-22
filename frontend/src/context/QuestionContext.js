import React, { createContext, useContext, useState } from 'react';
import questionsData from '../data/question.json';

const QuestionsContext = createContext();

export const QuestionsProvider = ({ children }) => {
  const [questions] = useState(questionsData);

  return (
    <QuestionsContext.Provider value={{ questions }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => useContext(QuestionsContext);