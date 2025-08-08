"use client";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useAction,
} from "convex/react";
import { api } from "../convex/_generated/api";
import "../app/global.css";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useQuery } from "convex/react";

// Import the new components
import Header from "../components/Header";
import ResponsiveSidebarWrapper from "../components/ResponsiveSidebarWrapper";
import Agent from "../components/Agent";
import Research from "../components/Research";

export default function Page() {
  return (
    <main className="p-3 xl:p-6 flex flex-col h-screen overflow-hidden">
      <Header />

      <AuthLoading>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </AuthLoading>

      <Authenticated>
        <AgentDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center h-64 flex-col">
          <div className="rounded-lg p-6 flex flex-col items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <p className="text-sm max-w-xs text-center">
              Please connect to a wallet to view the agent dashboard.
            </p>
          </div>
        </div>
      </Unauthenticated>
    </main>
  );
}

function AgentDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [selectedType, setSelectedType] = useState("agent"); // "agent" or "research"
  const [agents, setAgents] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const getAllAgentsWithPnL = useAction(api.agents.getAllAgentsWithPnL);
  const researches = useQuery(api.researches.listResearches, {
    limit: 50,
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsData = await getAllAgentsWithPnL();
        setAgents(agentsData);

        // Set the first agent as default if no agent is currently selected
        if (
          agentsData.length > 0 &&
          !selectedAgent &&
          selectedType === "agent"
        ) {
          setSelectedAgent(agentsData[0]);
          setSelectedType("agent");
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchAgents();
    // Refresh agents every 30 seconds
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, [getAllAgentsWithPnL, selectedAgent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!agents || !researches) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>
          {loadingTimeout
            ? "No agents and research. Please create an agent to start."
            : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full pt-6">
      {/* Sidebar */}
      <ResponsiveSidebarWrapper
        agents={agents}
        researches={researches}
        selectedAgent={selectedAgent}
        selectedResearch={selectedResearch}
        selectedType={selectedType}
        setSelectedAgent={setSelectedAgent}
        setSelectedResearch={setSelectedResearch}
        setSelectedType={setSelectedType}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden lg:pl-6">
        {selectedType === "agent" && selectedAgent ? (
          <Agent agent={selectedAgent} />
        ) : selectedType === "research" && selectedResearch ? (
          <Research research={selectedResearch} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center"></div>
          </div>
        )}
      </div>
    </div>
  );
}
