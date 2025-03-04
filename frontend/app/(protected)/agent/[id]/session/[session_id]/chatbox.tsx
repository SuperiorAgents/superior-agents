"use client";
import { FC, useEffect, useRef, useState } from "react";

interface IChatboxProps {
  agentName?: string;
}

const Chatbox: FC<IChatboxProps> = ({ agentName = "agent" }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Hello! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Handle sending message
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: `Your message has been added to ${agentName}'s inbox!`,
        },
      ]);
    }, 1000);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col max-w-md mx-auto rounded-lg shadow-lg justify-between h-[394px]">
      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 max-w-[75%] rounded-md ${
              msg.sender === "user"
                ? "ml-auto bg-[var(--primary-color)] text-background"
                : "mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-[var(--primary-color)] rounded-md bg-transparent focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-2 h-full flex items-center justify-center border text-[var(--primary-color)] border-[var(--primary-color)] border-2 rounded-md hover:bg-[var(--primary-color)] hover:bg-opacity-20 transition hover:text-background"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.2806 11.0306C19.2109 11.1003 19.1282 11.1557 19.0371 11.1934C18.9461 11.2311 18.8485 11.2506 18.7499 11.2506C18.6514 11.2506 18.5538 11.2311 18.4627 11.1934C18.3717 11.1557 18.289 11.1003 18.2193 11.0306L12.7499 5.56029V20.25C12.7499 20.4489 12.6709 20.6397 12.5303 20.7803C12.3896 20.921 12.1988 21 11.9999 21C11.801 21 11.6103 20.921 11.4696 20.7803C11.3289 20.6397 11.2499 20.4489 11.2499 20.25V5.56029L5.78055 11.0306C5.63982 11.1713 5.44895 11.2504 5.24993 11.2504C5.05091 11.2504 4.86003 11.1713 4.7193 11.0306C4.57857 10.8899 4.49951 10.699 4.49951 10.5C4.49951 10.301 4.57857 10.1101 4.7193 9.96935L11.4693 3.21935C11.539 3.14962 11.6217 3.0943 11.7127 3.05656C11.8038 3.01882 11.9014 2.99939 11.9999 2.99939C12.0985 2.99939 12.1961 3.01882 12.2871 3.05656C12.3782 3.0943 12.4609 3.14962 12.5306 3.21935L19.2806 9.96935C19.3503 10.039 19.4056 10.1217 19.4433 10.2128C19.4811 10.3038 19.5005 10.4014 19.5005 10.5C19.5005 10.5985 19.4811 10.6961 19.4433 10.7872C19.4056 10.8782 19.3503 10.961 19.2806 11.0306Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
