import React from 'react';
import axios from 'axios';

function Options({ onLogout }) {
  //Options
  // Function to call logout API when the user clicks 'Log Off'
  const handleLogoutClick = async () => {
    // Call the onLogout function passed from the parent (App.js)
    onLogout();
  };

  return (
    <div className="flex flex-col items-left p-6 bg-gray-100 h-full w-1/6">
      <h1 className="text-3xl font-semibold mb-8">Krzysztof Muszyński</h1>
      <h2 className="text-2xl mb-6">Options</h2>
      <div className="grid grid-cols-1 gap-4 w-full">
        <button
          onClick={handleLogoutClick} // Trigger the logout function
          className="mt-2 h-12 w-full border rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200"
        >
          Log Off
        </button>
      </div>
    </div>
  );
}

export default Options;
