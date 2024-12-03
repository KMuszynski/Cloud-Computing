import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase.js"; // Adjust path to your Supabase client
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip"; // Add this library for handling zip files

// List of forbidden file extensions
const restrictedExtensions = [
  ".exe", ".bat", ".sh", ".msi", ".cmd", ".app", ".js", ".vbs", ".php", 
  ".pl", ".cgi", ".dll", ".scr", ".wsf", ".jar", ".apk", ".iso"
];

// Function to check if a file is restricted based on its extension
const isRestrictedFile = (fileName) => {
  const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  return restrictedExtensions.includes(`.${fileExtension}`);
};

// Function to validate zip files (check if they contain restricted file types)
const validateZipFiles = async (file) => {
  const zip = await JSZip.loadAsync(file);
  const filesInZip = Object.keys(zip.files);
  for (let fileName of filesInZip) {
    if (isRestrictedFile(fileName)) {
      return false; // Found a restricted file inside the zip
    }
  }
  return true; // No restricted files found in the zip
};

function Upload() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [userId, setUserId] = useState("");

  // Fetch the logged-in user's ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        setUploadStatus("Error fetching user details.");
      } else {
        setUserId(data?.user.id || "");
      }
    };

    fetchUser();
  }, []);

  // Log file upload action
  const logFileUpload = async (fileName, fileId, fileSize) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("logs").insert([
      {
        action: "upload",
        email: user.user.email,
        user_id: user.user.id,
        file_id: fileId,
        file_name: fileName,
        file_size: fileSize,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("Error logging file upload action:", error.message);
    }
  };

  // Handle when files are dragged over the drop zone
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  // Handle when files are dragged away from the drop zone
  const handleDragLeave = () => {
    setDragging(false);
  };

  // Handle when files are dropped
  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prevFiles) => [
      ...prevFiles,
      ...droppedFiles.filter((file) => !prevFiles.some((prevFile) => prevFile.name === file.name)),
    ]);
  };

  // Handle file selection through the file input
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [
      ...prevFiles,
      ...selectedFiles.filter((file) => !prevFiles.some((prevFile) => prevFile.name === file.name)),
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

    setUploadStatus("Uploading...");

    try {
      const uploadPromises = files.map(async (file) => {
        // Check if the file or zip contains restricted file types
        if (isRestrictedFile(file.name)) {
          throw new Error(`File type not allowed: ${file.name}`);
        }

        // If the file is a zip, check its contents
        if (file.name.endsWith(".zip")) {
          const isValid = await validateZipFiles(file);
          if (!isValid) {
            throw new Error(`The zip file contains a restricted file.`);
          }
        }

        const fileId = uuidv4();
        const { data, error } = await supabase.storage
          .from("Files")
          .upload(`${userId}/${file.name}`, file);

        if (error) {
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        await logFileUpload(file.name, fileId, file.size);

        return data;
      });

      await Promise.all(uploadPromises);

      setUploadStatus("Files uploaded successfully!");
      setFiles([]);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Upload Files</h2>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-dashed border-4 p-10 rounded-md ${
          dragging ? "border-blue-500" : "border-gray-400"
        }`}
      >
        <p className="text-lg">Drag and drop your files here</p>
        <p className="text-gray-500">or</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
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
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
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
