import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoginScreen from "./components/LoginScreen";
import Options from "./components/Options";
import Upload from "./components/Upload";
import { supabase } from "./utils/supabase.js"; // Import Supabase

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedItem, setSelectedItem] = useState("All files");
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check for active session on app load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        console.log("Session found: ", session);
      } else {
        console.log("No active session found.");
      }
    };
    checkSession();
  }, []);

  // Log actions to Supabase
  const logAction = async (action, email, userId) => {
    try {
      console.log(`Logging action: ${action}, Email: ${email}, UserID: ${userId}`);
      const { error } = await supabase.from("logs").insert([
        {
          action,
          email,
          user_id: userId,
        },
      ]);
      if (error) {
        console.error("Error logging action:", error.message);
      }
    } catch (err) {
      console.error("Error logging action:", err.message);
    }
  };

  // Handle Login and Register
  const handleAuth = async (email, password, repeatPassword, isRegistering) => {
    console.log("handleAuth called with:", { email, password, repeatPassword, isRegistering });
    setLoading(true);
    setErrorMessage("");

    try {
      let user, error;

      if (isRegistering) {
        console.log("Attempting to register...");
        // Registration logic
        if (password !== repeatPassword) {
          setErrorMessage("Passwords do not match");
          setLoading(false);
          console.log("Passwords do not match");
          return;
        }

        ({ user, error } = await supabase.auth.signUp({ email, password }));
        if (error) {
          setErrorMessage(error.message);
          console.error("Signup error:", error.message);
        } else {
          alert("Registration successful! Please check your email to verify.");
          const {
			data: { session },
		} = await supabase.auth.getSession();
		const user = session?.user;
          logAction("register", email, user.id);
        }
      } else {
        console.log("Attempting to log in...");
        // Login logic
        ({ user, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));

        if (error) {
          setErrorMessage(error.message);
          console.error("Login error:", error.message);
        } else {
          alert("Welcome back!");
          setIsLoggedIn(true);
		  const {
			data: { session },
		} = await supabase.auth.getSession();
		const user = session?.user;
          logAction("login", email, user.id);  // Log login
        }
      }
    } catch (error) {
      console.error("Error during login/registration:", error);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleShowOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowUpload(false);
  };

  const handleUpload = () => {
    setShowUpload(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {isLoggedIn ? (
        <>
          <Header
            onHome={handleHome}
            onShowOptions={handleShowOptions}
            onUpload={handleUpload}
          />
          <div className="flex flex-1">
            {showSidebar && (
              <Sidebar
                selectedItem={selectedItem}
                onSelectItem={handleSelectItem}
              />
            )}
            {showUpload ? (
              <Upload />
            ) : (
              <MainContent
                selectedItem={selectedItem}
                className={`flex-1 ${showOptions ? "w-3/4" : "w-full"}`}
              />
            )}
            {showOptions && <Options onLogout={() => setIsLoggedIn(false)} />}
          </div>
        </>
      ) : (
        <LoginScreen
          onLogin={(email, password, repeatPassword, isRegistering) => {
            handleAuth(email, password, repeatPassword, isRegistering);
          }}
          errorMessage={errorMessage}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;
