import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js"; // Adjust the path to your Supabase client

function MainContent({ selectedItem }) {
	const [files, setFiles] = useState([]); // User's uploaded files
	const [logs, setLogs] = useState([]); // Action logs
	const [loading, setLoading] = useState(false); // Loading state
	const [error, setError] = useState(""); // Error state

	// Fetch user's files when the component mounts or when "All files" is selected
	useEffect(() => {
		if (selectedItem === "All files") {
			fetchUserFiles();
		}
	}, [selectedItem]);

	// Fetch user's uploaded files from Supabase storage
	const fetchUserFiles = async () => {
		setLoading(true);
		setError("");
		try {
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			// List files in the user's folder
			const { data, error } = await supabase.storage
				.from("Files") // Replace with your bucket name
				.list(user.user.id, {
					limit: 100,
					offset: 0,
					sortBy: {
						column: "name",
						order: "asc",
					},
				}); // List files in the user's directory
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

	// Render different content based on selected item
	const renderContent = () => {
		switch (selectedItem) {
			case "All files":
				return (
					<div className="flex-1 p-4 bg-white">
						<h1>To jest test</h1>
						<h2 className="text-lg font-semibold mb-4">All Files</h2>
						{loading && <p>Loading files...</p>}
						{error && <p className="text-red-500">{error}</p>}
						{!loading && files.length === 0 && !error && (
							<p>No files uploaded yet.</p>
						)}
						<div className="grid grid-cols-4 gap-4">
							{files.map((file) => (
								<div
									key={file.id}
									className="flex flex-col items-center justify-center h-24 border rounded-md cursor-pointer hover:bg-gray-100"
								>
									<span>📄 {file.name}</span>
									<div className="mt-2 flex space-x-2">
										{/* Delete button */}
										<button
											className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
											onClick={() => handleDeleteFile(file.name)}
										>
											Delete
										</button>

										{/* Download button */}
										<button
											className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
											onClick={() => handleDownloadFile(file.name)}
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
											<strong>Username:</strong> {log.username}
										</div>
										<div>
											<strong>Email:</strong> {log.email}
										</div>
										{log.file_id && (
											<div>
												<strong>File ID:</strong> {log.file_id}
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
				);
			// Add other cases for "Shared with me", "Starred", and "Trash"
			default:
				return null;
		}
	};

	const handleDeleteFile = async (fileName) => {
		setError("");
		try {
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			const filePath = `${user.user.id}/${fileName}`; // Construct the file path
			const { error } = await supabase.storage
				.from("Files") // Replace with your bucket name
				.remove([filePath]); // Delete the file

			if (error) {
				throw error;
			}

			// Refresh file list after deletion
			setFiles((prevFiles) =>
				prevFiles.filter((file) => file.name !== fileName)
			);
		} catch (err) {
			setError(err.message || "Failed to delete the file.");
		}
	};

	// Handle file download
	const handleDownloadFile = async (fileName) => {
		setError("");
		try {
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				throw new Error("User not authenticated");
			}

			const filePath = `${user.user.id}/${fileName}`; // Construct the file path
			const { data, error } = await supabase.storage
				.from("Files") // Replace with your bucket name
				.download(filePath); // Download the file

			if (error) {
				throw error;
			}

			// Create a URL for the file and download it
			const url = URL.createObjectURL(data);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", fileName);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			setError(err.message || "Failed to download the file.");
		}
	};

	return renderContent();
}

export default MainContent;
