import axios from 'axios';

const BASE_URL = '/api/workitems';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const workItemService = {
  getAllWorkItems: async () => {
    const response = await axios.get(BASE_URL, getAuthHeader());
    return response.data;
  },

  getWorkItemsByCategory: async (categoryId) => {
    const response = await axios.get(`${BASE_URL}?category=${categoryId}`, getAuthHeader());
    return response.data;
  },

  createWorkItem: async (workItemData) => {
    const response = await axios.post(BASE_URL, workItemData, getAuthHeader());
    return response.data;
  },

  updateWorkItem: async (id, workItemData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, workItemData, getAuthHeader());
    return response.data;
  },

  deleteWorkItem: async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  addSubItem: async (workItemId, subItemData) => {
    const response = await axios.post(
      `${BASE_URL}/${workItemId}/subitems`,
      subItemData,
      getAuthHeader()
    );
    return response.data;
  },

  updateSubItem: async (workItemId, subItemId, subItemData) => {
    const response = await axios.put(
      `${BASE_URL}/${workItemId}/subitems/${subItemId}`,
      subItemData,
      getAuthHeader()
    );
    return response.data;
  },

  deleteSubItem: async (workItemId, subItemId) => {
    const response = await axios.delete(
      `${BASE_URL}/${workItemId}/subitems/${subItemId}`,
      getAuthHeader()
    );
    return response.data;
  }
};
