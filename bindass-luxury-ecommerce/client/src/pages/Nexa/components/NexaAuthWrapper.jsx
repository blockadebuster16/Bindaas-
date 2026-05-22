import React, { useState, useEffect } from "react";

/**
 * NexaAuthWrapper — System Access Mode
 * ===================================
 * This wrapper has been updated to provide "Silent Authentication" for the 
 * store administrator. It removes the redundant login screen and automatically
 * identifies you as the System Admin.
 */
export default function NexaAuthWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically set a system token if none exists
    // The AI Core is now configured to recognize 'system_access' as a valid local admin
    const token = localStorage.getItem("nexa_token");
    if (!token || token === "undefined") {
      localStorage.setItem("nexa_token", "system_access");
      localStorage.setItem("nexa_owner_id", "system_admin");
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
        <div className="animate-pulse">Connecting to NEXA Core...</div>
    </div>
  );

  // Always return children — no more login screens!
  return children;
}
