import React from 'react';

function Sidebar({ selectedItem, onSelectItem }) {
  const items = ['All files', 'Logs'];

  return (
    <div className="w-64 bg-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">My Drive</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            onClick={() => onSelectItem(item)} // Call onSelectItem when clicked
            className={`cursor-pointer p-2 rounded-md ${
              selectedItem === item ? 'bg-gray-300' : 'hover:bg-gray-300'
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
