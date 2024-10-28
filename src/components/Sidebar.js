// src/components/Sidebar.js
import React from 'react';

function Sidebar() {
  return (
    <div className="w-64 bg-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">My Drive</h2>
      <ul className="space-y-2">
        <li className="cursor-pointer hover:bg-gray-300 p-2 rounded-md">Shared with me</li>
        <li className="cursor-pointer hover:bg-gray-300 p-2 rounded-md">Recent</li>
        <li className="cursor-pointer hover:bg-gray-300 p-2 rounded-md">Starred</li>
        <li className="cursor-pointer hover:bg-gray-300 p-2 rounded-md">Trash</li>
      </ul>
    </div>
  );
}

export default Sidebar;
