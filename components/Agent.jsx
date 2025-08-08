import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronLeft, ChevronRight, ExternalLink, Link, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

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
        className={`w-2 h-2 rounded-full mr-1 ${colors[status] || "bg-gray-500"}`}
      />
      {status}
    </Badge>
  );
}

function AgentDetails({ agent }) {
  const params = useQuery(api.params.getParams, {
    agentName: agent.name,
    limit: 1,
  });

  // Get agent data which includes public keys (never private keys)
  const [agentData, setAgentData] = useState(null);
  const getAgentData = useAction(api.agents.getAgentData);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const data = await getAgentData({ agentName: agent.name });
        setAgentData(data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgentData();
  }, [agent.name, getAgentData]);

  // Get the Hyperliquid public address for Etherscan link
  const hyperliquidAddress = agentData?.publicKeys?.hyperliquid;

  return (
    <div className="bg-muted/50 rounded-lg border shadow-sm p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          {agent.name} <StatusBadge status={agent.status?.state} />
        </div>

        <div className="flex flex-row items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">{agent.model}</div>
          {agent.status?.lastRunAt && (
            <p className="text-sm text-muted-foreground">
              last run: {new Date(agent.status.lastRunAt).toLocaleString('en-US', { timeZone: 'UTC' })}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex flex-wrap gap-2">
          {params && params.length > 0 && params[0].coins ? (
            params[0].coins.map((coin, index) => (
              <Badge key={index} variant="secondary" className="uppercase">
                {coin}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Loading...</span>
          )}
          {hyperliquidAddress && (
            <a
              href={`https://hyperdash.info/trader/${hyperliquidAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row items-center gap-1 hover:text-blue-500 transition-colors text-xs"
              title={`View ${hyperliquidAddress} on Hyperdash`}
            >
              Hyperdash <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex flex-col lg:flex-row w-full gap-3">
          <div className="basis-1/2 w-full">
            <div className="bg-muted p-2 rounded-lg">
              <h5 className="text-xs font-medium mb-1 text-muted-foreground">Persona</h5>
              {!agent.persona ? (
                <p className="text-xs text-muted-foreground">
                  No persona found.
                </p>
              ) : (
                <pre className="text-xs whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {agent.persona}
                </pre>
              )}
            </div>
          </div>
          <div className="basis-1/2 w-full">
            <div className="bg-muted p-2 rounded-lg">
              <h5 className="text-xs font-medium mb-1 text-muted-foreground">Strategy</h5>
              {!params ? (
                <p className="text-xs text-muted-foreground">
                  Loading parameters...
                </p>
              ) : params.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No parameters found.
                </p>
              ) : (
                <pre className="text-xs whitespace-pre-wrap max-h-16 overflow-y-auto">
                  {JSON.stringify(params[0].params, null, 1)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LLMLogsWithTrades({ agentName }) {
  const [pageSize, setPageSize] = useState(5);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState([null]); // Array to track cursors for each page
  const [expandedExecutionIssues, setExpandedExecutionIssues] = useState({}); // Track which execution issues are expanded
  const [expandedLLMResponse, setExpandedLLMResponse] = useState({}); // Track which LLM responses are collapsed (default expanded)

  const logsResult = useQuery(
    api.llmLogs.getLLMLogsWithTradePaginated,
    agentName && pageSize && pageSize > 0 ? {
      agentName,
      paginationOpts: {
        numItems: pageSize,
        cursor: currentCursor,
      },
    } : "skip"
  );

  const logs = logsResult?.page || [];
  const hasNextPage = logsResult && !logsResult.isDone;
  const hasPreviousPage = currentPage > 1;

  const handleNextPage = () => {
    if (hasNextPage && logsResult?.continueCursor) {
      const newCursor = logsResult.continueCursor;
      const newPage = currentPage + 1;

      // Update cursors array if we're going to a new page
      if (cursors.length < newPage) {
        setCursors([...cursors, newCursor]);
      }

      setCurrentCursor(newCursor);
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newPage = currentPage - 1;
      const newCursor = cursors[newPage - 1]; // Previous page cursor (0-indexed)

      setCurrentCursor(newCursor);
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize));
    setCurrentCursor(null);
    setCurrentPage(1);
    setCursors([null]);
  };

  const toggleExecutionIssues = (logId) => {
    setExpandedExecutionIssues(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const toggleLLMResponse = (logId) => {
    setExpandedLLMResponse(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const isLLMResponseExpanded = (logId) => {
    return expandedLLMResponse[logId] !== true; // Default to expanded (true), collapsed when set to true
  };



  return (
    <div className="flex flex-col gap-6">
      {/* Pagination Controls Header */}
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs font-semibold">
              Trade Logs (Page {currentPage})
            </Badge>
          </div>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="1" className="text-xs">
                1 per page
              </SelectItem>
              <SelectItem value="5" className="text-xs">
                5 per page
              </SelectItem>
              <SelectItem value="10" className="text-xs">
                10 per page
              </SelectItem>
              <SelectItem value="20" className="text-xs">
                20 per page
              </SelectItem>
              <SelectItem value="50" className="text-xs">
                50 per page
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!logsResult ? (
        <p className="text-muted-foreground"></p>
      ) : logs.length === 0 ? (
        <div className="bg-muted/50 rounded-lg border shadow-sm p-4 h-48 flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-center">No trade logs found.</p>
        </div>
      ) : (
        <div className="space-y-4 bg-muted/50 rounded-lg border shadow-sm p-4">
          {logs.map((log) => (
            <Card key={log._id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {new Date(log._creationTime).toLocaleString('en-US', { timeZone: 'UTC' })}
                  </Badge>
                  {log.runId && (
                    <Badge variant="outline" className="text-xs">
                      {log.runId}
                    </Badge>
                  )}
                  {log.analysis?.hasTradeExecuted && (
                    <Badge variant="default" className="text-xs">
                      Trade Executed
                    </Badge>
                  )}
                </div>
                {log.usage && (
                  <div className="text-sm text-muted-foreground">
                    {log.usage.totalTokens} tokens
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Analysis Data */}
                <div className="space-y-4">
                  {log.analysis?.coinTraded && log.analysis.coinTraded.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Coins Traded:</h4>
                      <div className="flex flex-wrap gap-2">
                        {log.analysis.coinTraded.map((coinName, coinIndex) => (
                          <Badge key={coinIndex} variant="secondary" className="uppercase">
                            {coinName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.analysis?.actions && log.analysis.actions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Actions:</h4>
                      <div className="space-y-3">
                        {log.analysis.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="bg-muted p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {action.action}
                              </Badge>
                              {action.coin && action.coin.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {action.coin.map((coinName, coinIndex) => (
                                    <Badge key={coinIndex} variant="secondary" className="text-xs uppercase">
                                      {coinName}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {action.reasoning && (
                              <div className="text-xs text-muted-foreground">
                                <strong>Reasoning:</strong> {action.reasoning}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column - LLM Response */}
                {log.text && (
                  <div className="min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium">LLM Response:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLLMResponse(log._id)}
                        className="h-6 w-6 p-0"
                      >
                        {isLLMResponseExpanded(log._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {isLLMResponseExpanded(log._id) && (
                      <div className="w-full overflow-hidden">
                        <ScrollArea className="h-96 w-full">
                          <pre className="p-2 rounded text-sm whitespace-pre-wrap break-words break-all leading-relaxed bg-muted w-full">
                            {log.text}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {log.analysis?.executionIssues && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-medium">Execution Issues:</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExecutionIssues(log._id)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedExecutionIssues[log._id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {expandedExecutionIssues[log._id] && (
                    <div className="bg-muted p-3 rounded">
                      <pre className="text-xs whitespace-pre-wrap break-words break-all overflow-x-auto overflow-y-auto leading-relaxed">
                        {log.analysis.executionIssues}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <div className="h-8"></div>
    </div>
  );
}

function AgentLogs({ agentName }) {
  const [pageSize, setPageSize] = useState(1);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState([null]); // Array to track cursors for each page

  const logsResult = useQuery(api.llmLogs.getLLMLogsPaginated, {
    agentName,
    paginationOpts: {
      numItems: pageSize,
      cursor: currentCursor,
    },
  });

  const logs = logsResult?.page || [];
  const hasNextPage = logsResult && !logsResult.isDone;
  const hasPreviousPage = currentPage > 1;

  const handleNextPage = () => {
    if (hasNextPage && logsResult?.continueCursor) {
      const newCursor = logsResult.continueCursor;
      const newPage = currentPage + 1;

      // Update cursors array if we're going to a new page
      if (cursors.length < newPage) {
        setCursors([...cursors, newCursor]);
      }

      setCurrentCursor(newCursor);
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newPage = currentPage - 1;
      const newCursor = cursors[newPage - 1]; // Previous page cursor (0-indexed)

      setCurrentCursor(newCursor);
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize));
    setCurrentCursor(null);
    setCurrentPage(1);
    setCursors([null]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Pagination Controls Header */}
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs font-semibold">
              LLM Logs (Page {currentPage})
            </Badge>
          </div>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="1" className="text-xs">
                1 per page
              </SelectItem>
              <SelectItem value="5" className="text-xs">
                5 per page
              </SelectItem>
              <SelectItem value="10" className="text-xs">
                10 per page
              </SelectItem>
              <SelectItem value="20" className="text-xs">
                20 per page
              </SelectItem>
              <SelectItem value="50" className="text-xs">
                50 per page
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!logsResult ? (
        <p className="text-muted-foreground"></p>
      ) : logs.length === 0 ? (
        <div className="bg-muted/50 rounded-lg border shadow-sm p-4 h-48 flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-center">No logs found.</p>
        </div>
      ) : (
        <div className="space-y-8 divide-y bg-muted/50 rounded-lg border shadow-sm p-4">
          {logs.map((log) => (
            <div key={log._id} className="">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {new Date(log._creationTime).toLocaleString('en-US', { timeZone: 'UTC' })}
                  </Badge>
                  {log.finishReason && (
                    <Badge variant="secondary">
                      finish reason: {log.finishReason}
                    </Badge>
                  )}
                </div>
                {log.usage && (
                  <div className="text-sm text-muted-foreground">
                    {log.usage.totalTokens} tokens
                  </div>
                )}
              </div>

              {log.text && (
                <div className="mb-4 min-w-0">
                  <pre className="p-2 rounded text-sm whitespace-pre-wrap break-words break-all overflow-x-auto overflow-y-auto leading-relaxed">
                    {log.text}
                  </pre>
                </div>
              )}

              {log.toolCalls && log.toolCalls.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-2">
                    {log.toolCalls.map((call, callIndex) => {
                      const result = log.toolResults?.[callIndex];
                      return (
                        <div key={callIndex} className="flex gap-4">
                          {/* Left side - Tool Name */}
                          <div className="">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20">
                              <span className="font-medium text-xs">
                                {call.toolName}
                              </span>
                            </div>
                          </div>

                          {/* Right side - Tool Result */}
                          <div className="w-full min-w-0">
                            {result ? (
                              <pre className="bg-green-50 dark:bg-green-900/20 p-2 h-full whitespace-pre-wrap break-words break-all max-h-48 overflow-y-auto overflow-x-auto w-full text-xs leading-relaxed">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            ) : (
                              <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded text-sm h-full text-muted-foreground">
                                No result
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="h-8"></div>
    </div>
  );
}

export default function Agent({ agent }) {
  const [activeView, setActiveView] = useState("trades");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
        <AgentDetails agent={agent} />
        
        {/* Toggle between Trade Logs and LLM Logs */}
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant={activeView === "trades" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("trades")}
            className="h-8 px-4 text-xs"
          >
            Trade Logs
          </Button>
          <Button
            variant={activeView === "logs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("logs")}
            className="h-8 px-4 text-xs"
          >
            LLM Logs
          </Button>
        </div>

        {activeView === "trades" ? (
          <LLMLogsWithTrades agentName={agent.name} />
        ) : (
          <AgentLogs agentName={agent.name} />
        )}
      </div>
    </ScrollArea>
  );
}
