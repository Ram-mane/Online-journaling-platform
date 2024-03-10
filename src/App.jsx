import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './Navbar'; // Adjust the path based on your project structure
import Story from './Story'; // Adjust the path based on your project structure

function App() {
  return (
    <Router>
      <div className="header">
        <ToastContainer />
        <Navbar />
        {/* Add the routes for different categories */}
        <Routes>
          <Route path="/" element={<Story/>} />
          <Route path="category/:category" element={<Story/>} />
          {/* Additional routes can be added as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
