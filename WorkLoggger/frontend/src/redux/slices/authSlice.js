import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Create login thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Login failed'); 
    }
  }
);

// Create a thunk for fetching the current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/auth/me', getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch user');
    }
  }
);

// Create change password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/change-password', { currentPassword, newPassword }, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Password change failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Password change failed';
      });
  }
});

export const { logout, clearError } = authSlice.actions;

// Add selector
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
