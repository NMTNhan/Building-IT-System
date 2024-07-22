import axios from 'axios';

export const predictDifficulty = async (playerData) => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', playerData);
    return response.data.next_difficulty;
  } catch (error) {
    console.error('Error predicting difficulty:', error);
    return 'easy'; // Default difficulty (easy) in case of error
  }
};