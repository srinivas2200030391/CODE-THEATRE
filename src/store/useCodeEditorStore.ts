import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";
import { CodeEditorState } from "@/types";

const getInitialState = () => {
  // if we're on the server we would like to default to python
  if (typeof window === "undefined") {
    return {
      language: "python",
      fontSize: 14,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bcz local storage is browser api, It can't be accessed from server
  const savedLanguage = localStorage.getItem("language") || "python";
  const savedTheme = localStorage.getItem("theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("fontSize") || 14;
  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();
  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    setEditor: (editor: Monaco) => {
      const savedCode =
        localStorage.getItem(`code-${get().language}`) ||
        LANGUAGE_CONFIG[get().language].defaultCode;
      editor.setValue(savedCode);
      set({ editor });
    },
    getCode: () => get().editor?.getValue() || "",
    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue() || "";
      if (currentCode) {
        localStorage.setItem(`code-${get().language}`, currentCode);
      }
      localStorage.setItem("language", language);
      set({
        language,
        output: "",
        error: null,
      });
    },
    setTheme: (theme: string) => {
      localStorage.setItem("theme", theme);
      set({ theme });
    },
    setFontSize: (fontSize: number) => {
      localStorage.setItem("fontSize", String(fontSize));
      set({ fontSize });
    },
    runCode: async () => {
      set({ isRunning: true, error: null });
      const code = get().editor?.getValue();
      if (!code) {
        set({ isRunning: false, error: "No code to run" });
        return;
      }
      const languageConfig = LANGUAGE_CONFIG[get().language];
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}).toString(),
      });
      const executionResult = await response.json();
      set({ isRunning: false, executionResult });
    },
  };
});
