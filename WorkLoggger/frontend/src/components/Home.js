import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Home = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Welcome to Home</h1>
      <button onClick={() => dispatch(logout())}>Logout</button>
    </div>
  );
};

export default Home;
