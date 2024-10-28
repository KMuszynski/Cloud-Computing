// src/components/MainContent.js
import React from 'react';

function MainContent() {
  return (
    <div className="flex-1 p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Files</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100">
          📁 Folder 1
        </div>
        <div className="flex items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100">
          📁 Folder 2
        </div>
        <div className="flex items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100">
          📄 File 1
        </div>
        <div className="flex items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100">
          📄 File 2
        </div>
      </div>
    </div>
  );
}

export default MainContent;
