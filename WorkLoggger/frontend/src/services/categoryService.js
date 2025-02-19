import axios from 'axios';

const BASE_URL = '/api/categories';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const categoryService = {
  getAllCategories: async () => {
    const response = await axios.get(BASE_URL, getAuthHeader());
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axios.post(BASE_URL, categoryData, getAuthHeader());
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, categoryData, getAuthHeader());
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`, getAuthHeader());
    return response.data;
  }
};
