import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js"; // Adjust path to your Supabase client

function Upload() {
	const [dragging, setDragging] = useState(false); // Track dragging state
	const [files, setFiles] = useState([]); // Store selected files
	const [uploadStatus, setUploadStatus] = useState(""); // Track upload status
	const [userId, setUserId] = useState(""); // Store the user's ID

	// Fetch the logged-in user's ID
	React.useEffect(() => {
		const fetchUser = async () => {
			const { data, error } = await supabase.auth.getUser();
			if (error) {
				console.error("Error fetching user:", error.message);
				setUploadStatus("Error fetching user details.");
			} else {
				setUserId(data?.id || ""); // Get the user ID
			}
		};

		fetchUser();
	}, []);

	// Handle when files are dragged over the drop zone
	const handleDragOver = (event) => {
		event.preventDefault(); // Prevent default behavior
		setDragging(true); // Set dragging state to true
	};

	// Handle when files are dragged away from the drop zone
	const handleDragLeave = () => {
		setDragging(false); // Reset dragging state
	};

	// Handle when files are dropped
	const handleDrop = (event) => {
		event.preventDefault(); // Prevent default behavior
		setDragging(false); // Reset dragging state

		const droppedFiles = Array.from(event.dataTransfer.files); // Get dropped files

		// Update files state, ensuring no duplicates
		setFiles((prevFiles) => [
			...prevFiles,
			...droppedFiles.filter(
				(file) => !prevFiles.some((prevFile) => prevFile.name === file.name)
			),
		]);
	};

	// Handle file selection through the file input
	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files); // Get selected files

		// Update files state, ensuring no duplicates
		setFiles((prevFiles) => [
			...prevFiles,
			...selectedFiles.filter(
				(file) => !prevFiles.some((prevFile) => prevFile.name === file.name)
			),
		]);
	};

	// Handle file upload to Supabase
	const handleUpload = async () => {
		if (files.length === 0) {
			setUploadStatus("No files to upload.");
			return;
		}

		// Ensure the user is authenticated
		const { data: user, error } = await supabase.auth.getUser();
		if (error || !user) {
			setUploadStatus("User not authenticated.");
			return;
		}

		setUserId(user.id); // Ensure user ID is available
		setUploadStatus("Uploading...");

		try {
			const uploadPromises = files.map(async (file) => {
				const { data, error } = await supabase.storage
					.from("Files") // Replace with your storage bucket name
					.upload(`${user.id}/${file.name}`, file, {
						cacheControl: "3600", // Optional: Cache control
						upsert: false, // Prevent overwriting files
					});

				if (error) {
					throw new Error(`Failed to upload ${file.name}: ${error.message}`);
				}
				return data;
			});

			// Wait for all files to upload
			await Promise.all(uploadPromises);

			setUploadStatus("Files uploaded successfully!");
			setFiles([]); // Clear files after successful upload
		} catch (error) {
			setUploadStatus(`Upload failed: ${error.message}`);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
			<h2 className="text-2xl font-bold mb-4">Upload Files</h2>
			<div
				onDragOver={handleDragOver} // Handle drag over event
				onDragLeave={handleDragLeave} // Handle drag leave event
				onDrop={handleDrop} // Handle drop event
				className={`border-dashed border-4 p-10 rounded-md ${
					dragging ? "border-blue-500" : "border-gray-400"
				}`}
			>
				<p className="text-lg">Drag and drop your files here</p>
				<p className="text-gray-500">or</p>
				<input
					type="file"
					multiple
					onChange={handleFileChange} // Handle file selection
					className="hidden"
					id="file-upload"
				/>
				<label htmlFor="file-upload" className="cursor-pointer text-blue-500">
					Browse Files
				</label>
			</div>
			{files.length > 0 && (
				<div className="mt-4">
					<h3 className="font-semibold">Selected Files:</h3>
					<ul>
						{files.map((file, index) => (
							<li key={index} className="text-sm">
								{file.name}
							</li>
						))}
					</ul>
				</div>
			)}
			<button
				onClick={handleUpload}
				className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Upload Files
			</button>
			{uploadStatus && <p className="mt-2 text-sm">{uploadStatus}</p>}
		</div>
	);
}

export default Upload;
