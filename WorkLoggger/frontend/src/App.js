import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import Login from './components/Login';
import Home from './components/Home';
import './App.css';
import UserDetails from './components/UserDetails';
import AdminPanel from './components/AdminPanel';
import Loader from './components/Loader';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, dispatch]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  } 

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route path="/*" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
