import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Statistics from './Statistics';
import Worklogs from './Worklogs';
import AdminControl from './AdminControl';
import '../styles/variables.css';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="mainContent">
        <Routes>
          <Route path="/" element={<Statistics />} />
          <Route path="/worklogs" element={<Worklogs />} />
          <Route path="/admin" element={<AdminControl />} />
          <Route path="*" element={<h1>Such page does not exist!!</h1>}/>
        </Routes>
      </main>
    </div>
  );
};

export default Home;