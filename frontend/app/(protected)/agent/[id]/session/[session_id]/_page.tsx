"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { IAgentData } from "@/repository/interface";
import Image from "next/image";
import { getAgent } from "@/repository/agent";
import { useUserContext } from "@/provider/user-provider";

const agentPicture = "";

export const AgentDetailPage = () => {
  const { session_id, id: agent_id } = useParams();
  // const [messages, setMessages] = useState<string[]>([]);
  const [agent, setAgent] = useState<IAgentData | null>(null);
  const [streamMsg, setStreamMsg] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { address } = useAccount();
  const { userData } = useUserContext();

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await getAgent({ agent_id: agent_id as string });
        if (response.status === "success") {
          const agentData = response.data;
          const parsedConfig = JSON.parse(agentData.configuration);
          setAgent({
            ...agentData,
            configuration: parsedConfig,
          });
        } else {
          throw new Error("Failed to fetch agent data.");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAgent();
  }, [agent_id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [streamMsg]);

  useEffect(() => {
    if (!session_id || !agent_id) return;

    let isMounted = true;
    let eventSource: EventSource | null = null;
    const reconnectDelay = 3000;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/sessions/${session_id}/logs`);

        eventSource.addEventListener("logs", (event) => {
          const d = JSON.parse(event.data).logs;
          setStreamMsg(d);
          // const msgs = d.split("\n");

          // if (msgs.length > 0) {
          //   const parsedMsgs = msgs.map((m: string) => {
          //     if (m && m !== "") {
          //       const msg = JSON.parse(m).message;
          //       if (msg) {
          //         if (msg.includes("INFO")) {
          //           return msg;
          //         }
          //       }
          //     }
          //   });
          //   setMessages([...parsedMsgs]);
          // }
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

  return (
    <div className="pb-20 md:px-20 px-5 pt-10 bg-[linear-gradient(180deg,_rgba(23,20,7,1)_78%,_rgba(74,61,23,1)_89%,_rgba(130,110,54,1)_100%)] relative min-h-screen">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
        repeating-linear-gradient(transparent 0px, transparent 79px, rgba(255,255,255,0.1) 80px),
        repeating-linear-gradient(90deg, transparent 0px, transparent 79px, rgba(255,255,255,0.1) 80px)
      `,
          backgroundSize: "80px 80px",
        }}
      ></div>

      <div className="relative">
        <div className="flex justify-end">
          {address && (
            <div className="text-xl font-medium text-white my-2">{`${address?.slice(
              0,
              6
            )}...${address?.slice(-6)}`}</div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 border-[var(--primary-color)]">
              <Image
                src={
                  agentPicture
                    ? URL.createObjectURL(agentPicture)
                    : process.env.NEXT_PUBLIC_DEV_ENV == "1"
                    ? "/agent-2-default-pfp.jpg"
                    : "/agent-default-pfp.jpg"
                }
                alt="Agent Avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {agent?.name || "Agent Name"}
              </h2>
              <div className="flex gap-2 mt-1">
                {agent?.configuration.research_tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1 text-sm bg-[var(--primary-color)] bg-opacity-75 rounded-md"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 justify-between">
            <button className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md hover:bg-opacity-80 hover:brightness-110 disabled:bg-gray-500 disabled:opacity-50">
              Feed me!
            </button>
            {agent?.user_id && userData.user_id === agent?.user_id && (
              <>
                <button className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md hover:bg-opacity-80 hover:brightness-110 disabled:bg-gray-500 disabled:opacity-50">
                  Pause Inference
                </button>
                <button className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md hover:bg-opacity-80 hover:brightness-110 disabled:bg-gray-500 disabled:opacity-50">
                  Withdraw Funds
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-6 mb-6 w-full">
          <div className="flex flex-col md:w-[70%] h-[500px] border border-[var(--primary-color)] p-6 rounded-md bg-background relative w-full">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
        repeating-linear-gradient(transparent 0px, transparent 9px, rgba(255,255,255,0.1) 10px),
        repeating-linear-gradient(90deg, transparent 0px, transparent 9px, rgba(255,255,255,0.1) 10px)
      `,
                backgroundSize: "10px 10px",
              }}
            ></div>

            <div className="absolute left-0 top-7 w-3 h-5 bg-[var(--primary-color)] rounded-r-md"></div>
            <h2 className="text-2xl font-semibold mb-6">Chain Of Thought</h2>
            <div
              className="h-full overflow-scroll bg-black px-3 rounded-md shadow-[3px_6px_4px_rgba(130,110,54,0.25)] text-green-600 relative"
              ref={messagesContainerRef}
            >
              <pre className="whitespace-pre-wrap">{streamMsg}</pre>
              {/* <ul>
              {messages.map((msg, index) => (
                <li key={index} className="p-2 rounded font-[var(--font-mono)]">
                  <pre className="whitespace-pre-wrap">{msg}</pre>
                </li>
              ))}
            </ul> */}
            </div>
          </div>

          <div className="md:flex h-[500px] border border-[var(--primary-color)] p-6 rounded-md bg-background relative w-full hidden"></div>
        </div>
      </div>
    </div>
  );
};
