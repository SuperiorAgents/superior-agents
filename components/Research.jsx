import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";

export default function Research({ research }) {
  const fullResearch = useQuery(api.researches.getRecentResearch, {
    name: research.name,
    limit: 1,
  });

  return (
    <ScrollArea className="h-full pb-12">
      <div className="space-y-6">
        {!fullResearch ? (
          <p className="text-muted-foreground">Loading research content...</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg overflow-y-auto">
              {(() => {
                try {
                  // Try to parse as JSON and format it nicely
                  const parsed = JSON.parse(
                    fullResearch.split("---")[2] || fullResearch,
                  );
                  return (
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {JSON.stringify(parsed, null, 2)}
                    </pre>
                  );
                } catch {
                  // If not JSON, display as plain text
                  return (
                    <pre className="text-sm whitespace-pre-wrap">
                      {fullResearch}
                    </pre>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
