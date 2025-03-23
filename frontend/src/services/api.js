// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

export const login = (data) => API.post('/auth/login', data);
export const getQuestions = () => API.get('/questions');
export const createQuestion = (data) => API.post('/questions', data);
