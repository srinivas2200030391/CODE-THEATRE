"use client";

import { useEffect, useState, useCallback } from "react";
import ChatBotPanel from "./ChatBotPanel";
import Header from "./Header";
import EditorPanel from "./EditorPanel";
import OutputPanel from "./OutputPanel";

interface ClientPageProps {
  userData: {
    userId?: string;
    userEmail?: string;
  };
}

export default function ClientPage({ userData }: ClientPageProps) {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("");

  // Memoize the update function to prevent unnecessary recreations
  const updateFromLocalStorage = useCallback(() => {
    const savedLanguage = localStorage.getItem("editor-language");
    const savedCode = localStorage.getItem(`editor-code-${savedLanguage}`);

    if (savedLanguage !== null && savedLanguage !== language) {
      setLanguage(savedLanguage);
    }

    if (savedCode !== null && savedCode !== code) {
      setCode(savedCode);
    }

    // Only log if there were actual changes
    if (savedLanguage !== language || savedCode !== code) {
      console.log("Storage Updated:", {
        newLanguage: savedLanguage,
        newCode: savedCode,
        timestamp: new Date().toISOString(),
      });
    }
  }, [language, code]);

  // Combine both effects into one to reduce render cycles
  useEffect(() => {
    // Initial update
    updateFromLocalStorage();

    // Handle storage events from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "editor-language" || e.key?.startsWith("editor-code-")) {
        updateFromLocalStorage();
      }
    };

    // Handle custom events for local changes
    const handleLocalUpdate = () => {
      updateFromLocalStorage();
    };

    // Create an interval to check localStorage
    const intervalId = setInterval(() => {
      const currentLanguage = localStorage.getItem("editor-language");
      const currentCode = localStorage.getItem(
        `editor-code-${currentLanguage}`
      );

      // Only update if there are actual changes
      if (currentLanguage !== language || currentCode !== code) {
        updateFromLocalStorage();
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleLocalUpdate);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdate", handleLocalUpdate);
    };
  }, [language, code, updateFromLocalStorage]);

  return (
    <div className="min-h-screen">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isChatOpen ? "mr-96" : ""
        }`}>
        <div className="max-w-[1800px] mx-auto p-4">
          <Header
            userId={userData.userId}
            userEmail={userData.userEmail}
            onChatToggle={setIsChatOpen}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EditorPanel />
            <OutputPanel />
          </div>
          <ChatBotPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            code={code}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
