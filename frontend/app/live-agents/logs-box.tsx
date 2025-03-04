"use client";

import React, { useEffect, useRef, useState } from "react";

export const LogsBox = ({
  sessionId,
  agentName,
}: {
  sessionId: string;
  agentName: string;
}) => {
  const [messages, setMessages] = useState<string[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;
    let eventSource: EventSource | null = null;
    const reconnectDelay = 3000;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/sessions/${sessionId}/logs`);

        eventSource.addEventListener("logs", (event) => {
          const d = JSON.parse(event.data).logs;
          const msgs = d.split("\n");

          if (msgs.length > 0) {
            const parsedMsgs = msgs.map((m: string) => {
              if (m && m !== "") {
                const msg = JSON.parse(m).message;
                if (msg) {
                  if (msg.includes("INFO")) {
                    return msg;
                  }
                }
              }
            });
            setMessages([...parsedMsgs]);
          }
        });

        eventSource.onerror = (err) => {
          console.log(
            "SSE error, reconnecting in",
            reconnectDelay / 1000,
            "seconds...",
            err
          );
          if (eventSource) {
            eventSource.close();
          }
          if (isMounted) {
            setTimeout(connect, reconnectDelay); // Static delay before reconnecting
          }
        };
      } catch (error) {
        console.log(error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="border border-[var(--primary-color)] p-6 rounded-md relative">
      <div className="absolute left-0 top-7 w-3 h-5 bg-[var(--primary-color)] rounded-r-md"></div>
      <h1 className="text-xl font-semibold mb-4">{agentName}</h1>
      <div
        className="bg-black px-5 py-3 h-[400px] overflow-scroll shadow-[3px_6px_4px_0px_#826E3640] text-green-600"
        ref={messagesContainerRef}
      >
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="p-2 rounded font-[var(--font-mono)]">
              <pre className="whitespace-pre-wrap">{msg}</pre>
            </li>
          ))}
        </ul>
      </div>
      {/* <button className="bg-[var(--primary-color)] text-sm py-2 px-4 rounded-md mt-4 font-semibold">
        Twitter
      </button> */}
    </div>
  );
};
