import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setUser, setLoading, setError, clearAuth } = authSlice.actions;

// Thunk for initializing auth state
export const initializeAuth = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    dispatch(setLoading(false));
    return;
  }

  try {
    const response = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch(setUser(response.data));
  } catch (error) {
    localStorage.removeItem('token');
    dispatch(setError(error.response?.data?.message || 'Authentication failed'));
  }
};

// Thunk for logging in
export const login = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    dispatch(setUser(user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    dispatch(setError(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Thunk for logging out
export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch(clearAuth());
};

export default authSlice.reducer;
