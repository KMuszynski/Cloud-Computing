// src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoginScreen from './components/LoginScreen';
import Options from './components/Options';
import Upload from './components/Upload'; // Import the Upload component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedItem, setSelectedItem] = useState('All files');
  const [showUpload, setShowUpload] = useState(false); // State for upload screen

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowOptions(false);
    setSelectedItem('All files'); // Reset selected item on logout
  };

  const handleHome = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleShowOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowUpload(false); // Hide upload when selecting other items
  };

  const handleUpload = () => {
    setShowUpload(true); // Show upload component
  };

  return (
    <div className="h-screen flex flex-col">
      {isLoggedIn ? (
        <>
          <Header onHome={handleHome} onShowOptions={handleShowOptions} onUpload={handleUpload} />
          <div className="flex flex-1">
            {showSidebar && <Sidebar selectedItem={selectedItem} onSelectItem={handleSelectItem} />}
            {showUpload ? (
              <Upload /> // Show upload component when upload is triggered
            ) : (
              <MainContent selectedItem={selectedItem} className={`flex-1 ${showOptions ? 'w-3/4' : 'w-full'}`} />
            )}
            {showOptions && <Options onLogout={handleLogout} />}
          </div>
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
