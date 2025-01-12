export interface Message {
  type: "user" | "bot";
  content: string;
}

export interface ChatBotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}
