import React, { useState } from "react";
import HomePage from "./HomePage";
import Chat from "./Chat";

export default function App() {
  const [showHomePage, setShowHomePage] = useState(true);

  const handleGetStarted = () => {
    setShowHomePage(false);
  };

  const handleBackToHome = () => {
    if (window.confirm("Are you sure you want to return to the home page? Any unsaved data will be lost.")) {
      setShowHomePage(true);
    }
  };

  return (
    <div>
      {showHomePage ? (
        <HomePage onGetStarted={handleGetStarted} />
      ) : (
        <Chat onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}