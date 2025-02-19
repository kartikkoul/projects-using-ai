import axios from './axiosConfig';

export const checkAuthToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};
