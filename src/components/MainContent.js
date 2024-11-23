import React, { useEffect, useState } from 'react';

function MainContent({ selectedItem }) {
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (selectedItem === 'All files') {
      fetchFiles();
    } else if (selectedItem === 'Logs') {
      fetchLogs();  // Fetch logs when 'Logs' is selected
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

  // Fetch logs from the backend
  const fetchLogs = async () => {
    try {
      if (!userId) {
        console.error('User ID is not found');
        return;
      }

      const response = await fetch('http://localhost:5001/get_logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user_id': userId, // Pass the correct user ID
        },
      });

      const logsData = await response.json();

      if (response.ok) {
        setLogs(logsData);  // Set the logs data to state
      } else {
        console.error('Failed to fetch logs', logsData);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
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
        console.log(`File with ID ${fileId} deleted successfully`);
        fetchFiles(); // Refresh the file list after deletion
      } else {
        const errorData = await response.json();
        console.error('Failed to delete file', errorData);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Handle file download
  const handleDownload = (fileId) => {
    const userId = localStorage.getItem('user_id');
    const url = `http://localhost:5001/download_file/${fileId}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'user_id': userId,  // Pass the correct user ID
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('File download failed');
        }

        // Get the filename from the custom header 'X-File-Name'
        const filename = response.headers.get('X-File-Name') || 'download';  // Default to 'download' if not found

        // Create a Blob from the response
        return response.blob().then((blob) => ({ filename, blob }));
      })
      .then(({ filename, blob }) => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create an object URL for the Blob
        link.download = filename;  // Use extracted filename
        link.click(); // Trigger the download
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
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
                    <div className="mt-2 flex space-x-2">
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'Logs':
        return (
          <div className="flex-1 p-4 bg-white">
            <h2 className="text-lg font-semibold mb-4">Logs</h2>
            <div className="grid grid-cols-1 gap-4">
              {logs.length === 0 ? (
                <div>No logs available</div>
              ) : (
                logs.slice()  // Make a copy of the logs array to avoid mutating the original
                .reverse() // Reverse the order of the logs array
                .map((log) => (
                  <div key={log.id} className="flex flex-col items-start p-4 border rounded-md">
                    <div><strong>Action:</strong> {log.action}</div>
                    <div><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</div>
                    <div><strong>User ID:</strong> {log.user_id}</div>
                    <div><strong>Username:</strong> {log.username}</div> {/* Display username */}
                    <div><strong>Email:</strong> {log.email}</div>         {/* Display email */}
                    {log.file_id && <div><strong>File ID:</strong> {log.file_id}</div>}
                    {log.file_size && <div><strong>File Size:</strong> {log.file_size} bytes</div>}
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
