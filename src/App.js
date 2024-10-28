// src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoginScreen from './components/LoginScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {isLoggedIn ? (
        <>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <MainContent />
          </div>
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
