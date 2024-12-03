import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js"; // Adjust the path to your Supabase client

function MainContent({ selectedItem }) {
  const [files, setFiles] = useState([]); // User's uploaded files
  const [logs, setLogs] = useState([]); // Action logs
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    if (selectedItem === "All files") {
      fetchUserFiles();
    } else if (selectedItem === "Logs") {
      fetchLogs(); // Fetch logs when "Logs" is selected
    }
  }, [selectedItem]);

  const fetchUserFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.storage
        .from("Files") // Replace with your bucket name
        .list(user.user.id, {
          limit: 100,
          offset: 0,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });
      if (error) {
        throw error;
      }

      setFiles(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", user.user.id)
        .order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  const logFileAction = async (action, fileName, fileId, fileSize, fileVersion = 1) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("logs").insert([
      {
        action,
        email: user.user.email,
        user_id: user.user.id,
        file_id: fileId,
        file_name: fileName,
        file_size: fileSize,
        file_version: fileVersion,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("Error logging file action:", error.message);
    }
  };

  const handleDeleteFile = async (fileName, fileId) => {
    setError("");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const filePath = `${user.user.id}/${fileName}`;
      const { error } = await supabase.storage.from("Files").remove([filePath]);

      if (error) {
        throw error;
      }

      // Log the delete action
      const file = files.find((f) => f.id === fileId);
      await logFileAction("delete", fileName, fileId, file.size);

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (err) {
      setError(err.message || "Failed to delete the file.");
    }
  };

  const handleDownloadFile = async (fileName, fileId) => {
    setError("");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const filePath = `${user.user.id}/${fileName}`;
      const { data, error } = await supabase.storage.from("Files").download(filePath);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Log the download action
      const file = files.find((f) => f.id === fileId);
      await logFileAction("download", fileName, fileId, file.size);
    } catch (err) {
      setError(err.message || "Failed to download the file.");
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
		case "All files":
		  return (
			<div className="flex-1 p-4 bg-white">
			  <h2 className="text-lg font-semibold mb-4">All Files</h2>
			  {loading && <p>Loading files...</p>}
			  {error && <p className="text-red-500">{error}</p>}
			  {!loading && files.length === 0 && !error && <p>No files uploaded yet.</p>}
			  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{files.map((file) => (
				  <div
					key={file.id}
					className="flex flex-col items-center justify-between h-24 min-w-[180px] border rounded-md cursor-pointer hover:bg-gray-100 p-2 overflow-hidden"
				  >
					<div className="flex items-center space-x-2 w-full">
					  <span className="text-gray-700 text-sm truncate w-full" title={file.name}>
						📄 {file.name}
					  </span>
					</div>
					<div className="mt-2 flex space-x-2">
					  <button
						className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
						onClick={() => handleDeleteFile(file.name, file.id)}
					  >
						Delete
					  </button>
					  <button
						className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
						onClick={() => handleDownloadFile(file.name, file.id)}
					  >
						Download
					  </button>
					</div>
				  </div>
				))}
			  </div>
			</div>
		  );	  
      case "Logs":
        return (
          <div className="flex-1 p-4 bg-white">
            <h2 className="text-lg font-semibold mb-4">Logs</h2>
            <div className="grid grid-cols-1 gap-4">
              {logs.length === 0 ? (
                <div>No logs available</div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col items-start p-4 border rounded-md"
                  >
                    <div>
                      <strong>Action:</strong> {log.action}
                    </div>
                    <div>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div>
                      <strong>User ID:</strong> {log.user_id}
                    </div>
                    <div>
                      <strong>Email:</strong> {log.email}
                    </div>
                    {log.file_id && (
                      <div>
                        <strong>File ID:</strong> {log.file_id}
                      </div>
                    )}
                    {log.file_name && (
                      <div>
                        <strong>File Name:</strong> {log.file_name}
                      </div>
                    )}
                    {log.file_size && (
                      <div>
                        <strong>File Size:</strong> {log.file_size} bytes
                      </div>
                    )}
                    {log.file_version && (
                      <div>
                        <strong>File Version:</strong> {log.file_version}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return renderContent();
}

export default MainContent;
