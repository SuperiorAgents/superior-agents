import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import Footer from "./Footer";

function StatusBadge({ status }) {
  if (!status) {
    return <Badge variant="secondary">Unknown</Badge>;
  }
  const colors = {
    CREATED: "bg-gray-500",
    PAUSED: "bg-yellow-500",
    ERROR: "bg-red-500",
    SLEEPING: "bg-blue-500",
    RUNNING: "bg-green-500",
    TIMEOUT: "bg-red-500",
  };

  return (
    <Badge variant="secondary" className="ml-2">
      <div
        className={`w-2 h-2 rounded-full ${colors[status] || "bg-gray-500"}`}
      />
      {status}
    </Badge>
  );
}

export default function Sidebar({
  agents,
  researches,
  selectedAgent,
  selectedResearch,
  selectedType,
  setSelectedAgent,
  setSelectedResearch,
  setSelectedType,
}) {
  // Get unique researches by name, keeping the most recent for each
  const uniqueResearches = researches
    .filter((research) => research.name !== "market")
    .reduce((acc, research) => {
      if (
        !acc[research.name] ||
        research._creationTime > acc[research.name]._creationTime
      ) {
        acc[research.name] = research;
      }
      return acc;
    }, {});

  const uniqueResearchList = Object.values(uniqueResearches);

  return (
    <ScrollArea className="w-full lg:w-80 flex flex-col h-full">
      <div className="">
        <div className="flex flex-col p-4 rounded-lg bg-muted/50 max-h-[88vh] border shadow-sm">
          {/* Agents Section */}
          <div className="font-semibold mb-2">Agents ({agents.length})</div>
          <div className="h-68 space-y-2 overflow-y-auto">
            {agents.length === 0 && (
              <div className="text-sm text-center h-10/12 flex items-center justify-center text-muted-foreground">
                No agents found.
                <br />
                Create an agent to get started.
              </div>
            )}
            {agents.map((agent) => (
              <Button
                key={agent._id}
                variant={
                  selectedType === "agent" && selectedAgent?._id === agent._id
                    ? "default"
                    : "ghost"
                }
                className="w-full justify-start h-auto p-3"
                onClick={() => {
                  setSelectedAgent(agent);
                  setSelectedResearch(null);
                  setSelectedType("agent");
                }}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{agent.name}</span>
                      {agent.weekPnL !== undefined && (
                        <span
                          className={`text-xs ${agent.weekPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {agent.weekPnL >= 0 ? "+" : ""}
                          {agent.weekPnL.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={agent.status?.state} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {agent.model}
                  </span>
                </div>
              </Button>
            ))}
          </div>

          {/* Separator */}
          <Separator className="my-4" />

          {/* Research Section */}
          <div className="font-semibold mb-2">
            Researches ({uniqueResearchList.length})
          </div>
          <div className="h-40 space-y-2 overflow-y-auto">
            {(() => {
              return (
                <>
                  {uniqueResearchList.length === 0 && (
                    <div className="text-sm text-center h-10/12 flex items-center justify-center text-muted-foreground">
                      No researches found.
                      <br />
                      Create an agent to get started.
                    </div>
                  )}
                  {uniqueResearchList.map((research) => (
                    <Button
                      key={research._id}
                      variant={
                        selectedType === "research" &&
                        selectedResearch?._id === research._id
                          ? "default"
                          : "ghost"
                      }
                      className="w-full justify-start h-auto p-3"
                      onClick={() => {
                        setSelectedResearch(research);
                        setSelectedAgent(null);
                        setSelectedType("research");
                      }}
                    >
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium uppercase">
                            ${research.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(
                              research._creationTime,
                            ).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </ScrollArea>
  );
}
