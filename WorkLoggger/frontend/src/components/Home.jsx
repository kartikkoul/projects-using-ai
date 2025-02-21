import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Statistics from './Statistics';
import Worklogs from './Worklogs';
import AdminPanel from './AdminPanel';
import UserDetails from './UserDetails';
import '../styles/variables.css';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"  element={<Navigate to="/worklogs"/>} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/worklogs" element={<Worklogs />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/user/:userId" element={<UserDetails />} />
          <Route path="*" element={<h1>Such page does not exist!!</h1>}/>
        </Routes>
      </main>
    </div>
  );
};

export default Home;