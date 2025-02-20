import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice'; // Import the admin reducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer, // Add the admin reducer
  },
});

export default store;
