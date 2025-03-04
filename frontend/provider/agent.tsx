"use client";

import { createContext, Dispatch, SetStateAction, useContext, ReactNode, useState, useEffect } from "react";
import { AgentType } from "@/repository/interface";

export const agentTypeList: AgentType[] = ["trading", "marketing"];

interface AgentContextProps {
  agentType: AgentType;
  setAgentType: Dispatch<SetStateAction<AgentType>>;
}

const defaultContextValue: AgentContextProps = {
  agentType: agentTypeList[0],
  setAgentType: () => { },
};


const AgentContext = createContext<AgentContextProps>(defaultContextValue);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [agentType, setAgentType] = useState<AgentType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("agentType") as AgentType) || agentTypeList[0];
    }
    return agentTypeList[0];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agentType", agentType);
    }
  }, [agentType]);

  return (
    <AgentContext.Provider value={{ agentType, setAgentType }}>
      {children}
    </AgentContext.Provider>
  )
}

export const useAgentContext = () => {
  const context = useContext(AgentContext)

  return context;
}