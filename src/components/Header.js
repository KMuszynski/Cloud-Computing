// src/components/Header.js
import React from 'react';

function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      <input
        type="text"
        className="flex-1 p-2 border rounded-md"
        placeholder="Search in Drive"
      />
      <div className="ml-4 text-2xl cursor-pointer">👤</div>
    </div>
  );
}

export default Header;
