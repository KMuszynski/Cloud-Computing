import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import LoginScreen from './components/LoginScreen';
import Options from './components/Options';
import Upload from './components/Upload'; // Import the Upload component
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedItem, setSelectedItem] = useState('All files');
  const [showUpload, setShowUpload] = useState(false); // State for upload screen

  // Handle login
  const handleLogin = (userId) => {
    //localStorage.setItem('user_id', userId);
    setIsLoggedIn(true);
  };
  
  
  //App.js
  // Handle logout and pass the userId to the Options component
  const handleLogout = async () => {
    const storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) {
      console.error('No user ID found in localStorage');
      return;
    }
    
    // Call the API to log the user out
    try {
      const response = await axios.post('http://localhost:5001/logout', {}, {
        headers: {
          'user_id': storedUserId,  // Pass user_id in headers
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        console.log('Logout successful:', response.data.message);
        localStorage.removeItem('user_id'); // Clear user ID from localStorage
        setIsLoggedIn(false); // Update state to reflect user is logged out
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
