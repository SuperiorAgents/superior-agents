"use client";

import { useAccount } from "wagmi";
import { LogsBox } from "./logs-box";
import { useEffect, useState } from "react";
import { createSession } from "@/repository/sessions";
import { getPrompts } from "@/repository/prompts";

const liveAgents = [
  {
    name: "Ape AI",
    systemPrompt: "degen memecoin speculator",
  },
  {
    name: "Conservative AI",
    systemPrompt: "careful investor aiming for a balanced portfolio",
  },
  {
    name: "SOL-Focused AI",
    systemPrompt: "interested in wrapped SOL coins on ETH",
  },
  {
    name: "AI Agent AI",
    systemPrompt: "investor in AI agent coins",
  },
];

interface AgentSession {
  name: string;
  sessionId: string;
}

export const LiveAgentsPage = () => {
  const { address } = useAccount();
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([]);

  useEffect(() => {
    const getSessions = async () => {
      try {
        const defaultPrompts = await getPrompts();

        const prompts = Object.entries(defaultPrompts.trading).map(
          ([name, prompt]) => {
            return { name, prompt: prompt as string };
          }
        );

        const agents: AgentSession[] = [];
        for await (const l of liveAgents) {
          const res = await createSession({
            agent_id: l.name,
            agent_name: l.name,
            model: "claude",
            research_tools: ["Twitter", "DuckDuckGo"],
            prompts,
            agent_type: "trading",
            trading_instruments: ["1inch"],
            notifications: ["twitter_feed"],
            time: "12hr",
            metric_name: "walet",
            role: l.systemPrompt,
          });

          agents.push({
            name: l.name,
            sessionId: res.data.sessionId,
          });
        }

        setAgentSessions(agents);
      } catch (error) {
        console.log(error);
      }
    };

    getSessions();
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
          backgroundSize: "100px 80px",
        }}
      ></div>

      <div className="flex justify-end mb-8">
        <div className="text-xl font-medium">{`${address?.slice(
          0,
          6
        )}...${address?.slice(36)}`}</div>
      </div>

      <h2 className="text-2xl font-semibold mb-8">Live Superior Agents</h2>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        {agentSessions.length > 0 &&
          agentSessions.map((ag, idx) => (
            <LogsBox sessionId={ag.sessionId} key={idx} agentName={ag.name} />
          ))}
      </div>
    </div>
  );
};
