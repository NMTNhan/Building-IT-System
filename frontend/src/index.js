import React from 'react';
import ReactDOM from 'react-dom';
import { QuestionsProvider } from './context/QuestionContext';
import Game from './components/Game';
import './styles.css';  // Ensure styles are imported
import './tailwind.css';

ReactDOM.render(
  <QuestionsProvider>
    <Game />
  </QuestionsProvider>,
  document.getElementById('root')
);