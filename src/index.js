import React from 'react';
import ReactDOM from 'react-dom';
import { QuestionsProvider } from './context/QuestionsContext';
import Game from './components/Game';

ReactDOM.render(
  <QuestionsProvider>
    <Game />
  </QuestionsProvider>,
  document.getElementById('root')
);
