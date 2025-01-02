import { create } from "zustand";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";

// Define the store state type
export interface CodeEditorState {
  language: string;
  theme: string;
  fontSize: number;
  output: string;
  isRunning: boolean;
  error: string | null;
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  executionResult: {
    code: string;
    output: string;
    error: string | null;
  } | null;

  // Methods
  getCode: () => string;
  setEditor: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setLanguage: (language: string) => void;
  runCode: (userInput?: string) => Promise<void>;
}

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || "16";

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

    getCode: () => get().editor?.getModel()?.getValue() || "",

    setEditor: (editor: Monaco.editor.IStandaloneCodeEditor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) {
        const model = editor.getModel();
        if (model) {
          model.setValue(savedCode);
        }
      }
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().getCode();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async (userInput = "") => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        console.error("Error: Please enter some code");
        return;
      }

      const requiresInput =
        code.includes("input") ||
        code.includes("Scanner") ||
        code.includes("cin");

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
            stdin: requiresInput ? userInput : "",
          }),
        });

        const data = await response.json();

        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          console.error("Error:", data.message);
          return;
        }

        const output = data.run.output;

        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code,
            output: output.trim(),
            error: null,
          },
        });
      } catch (error) {
        const errorMessage = "Error running code";
        set({
          error: errorMessage,
          executionResult: { code, output: "", error: errorMessage },
        });
        console.error("Error:", errorMessage);
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useCodeEditorStore.getState().executionResult;
