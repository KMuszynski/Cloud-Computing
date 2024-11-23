import React, { useEffect, useState } from 'react';

function MainContent({ selectedItem }) {
  const [files, setFiles] = useState([]);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (selectedItem === 'All files') {
      fetchFiles();
    }
  }, [selectedItem]);

  // Fetch files from the backend
  const fetchFiles = async () => {
    try {
      if (!userId) {
        console.error('User ID is not found');
        return;
      }

      const response = await fetch('http://localhost:5001/get_files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId, // Pass the correct user ID
        },
      });

      const filesData = await response.json();

      if (response.ok) {
        setFiles(filesData);  // Set the files data to state
      } else {
        console.error('Failed to fetch files', filesData);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Handle file delete
  const handleDelete = async (fileId) => {
    if (!userId) {
      console.error('User ID is not found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/delete_file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId, // Pass the correct user ID
        },
      });

      if (response.ok) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId)); // Remove the deleted file from the state
        console.log(`File with ID ${fileId} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete file', errorData);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'All files':
        return (
          <div className="flex-1 p-4 bg-white">
            <h2 className="text-lg font-semibold mb-4">All Files</h2>
            <div className="grid grid-cols-4 gap-4">
              {files.length === 0 ? (
                <div>No files available</div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex flex-col items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100">
                    <span>📄 {file.filename}</span>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="mt-2 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'Shared with me':
        return <div className="flex-1 p-4 bg-white"><h2 className="text-lg font-semibold mb-4">Shared with me</h2></div>;
      case 'Starred':
        return <div className="flex-1 p-4 bg-white"><h2 className="text-lg font-semibold mb-4">Starred</h2></div>;
      case 'Trash':
        return <div className="flex-1 p-4 bg-white"><h2 className="text-lg font-semibold mb-4">Trash</h2></div>;
      default:
        return null;
    }
  };

  return renderContent();
}

export default MainContent;
