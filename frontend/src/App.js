import React from 'react';
import { QuestionsProvider } from './context/QuestionContext';
import Game from './components/Game';

const App = () => {
  return (
    <QuestionsProvider>
      <div>
        <Game />
      </div>
    </QuestionsProvider>
  );
};

export default App;