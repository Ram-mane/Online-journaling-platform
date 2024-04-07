import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './Navbar';
import Story from './Story';
import './App.css';
import StoryInfo from './components/StoryInfo';

function App() {
  return (
    <Router>
      <div className="header">
        <ToastContainer />
        <Navbar />
        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={<Story />} />
          
          {/* Route for category pages */}
          <Route path="/:category" element={<Story/>} />
          <Route path="/:category/:story" element={<Story />} />
{/* hi this is venom */}
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
