import axios from 'axios';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const userService = {
  getAllUsers: async () => {
    const response = await axios.get('/api/public/users', getAuthHeader());
    return response.data;
  },
  getStatistics: async () => {
    const response = await axios.get('/api/public/stats', getAuthHeader());
    return response.data;
  },
  getAllCategories: async (userId) => {
    const response = await axios.get('/api/public/userCategories/' + userId, getAuthHeader());
    return response.data;
  }
};
