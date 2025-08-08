import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhook-b9910772af7bba4f3ac832a648f22ef7",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { data } = body;

    if (!data) return new Response(null, { status: 200 });
    if (!data.tweets) return new Response(null, { status: 400 });

    const { tweets, rule_tag } = data;
    for (const tweet of tweets) {
      const { text, author, url, createdAt } = tweet;
      const record = await ctx.runMutation(
        internal.webhooks.twitterapi_io_mutations.insert,
        {
          tag: rule_tag,
          text,
          author,
          url,
          createdAt,
        },
      );
      await ctx.runAction(internal.webhooks.twitterapi_io.process, {
        ...record,
      });
    }
    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/export-logs-sgt",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const urlObj = new URL(request.url);
    const startTime = urlObj.searchParams.get("startTime");
    const endTime = urlObj.searchParams.get("endTime");
    const agentName = urlObj.searchParams.get("agentName");

    if (!startTime || !endTime || !agentName) {
      return new Response(null, { status: 400 });
    }
    
    // Parse dates assuming they are in Asia/Singapore timezone (UTC+8)
    const startTimeObj = new Date(startTime.replaceAll("_", " ") + " +08:00");
    const endTimeObj = new Date(endTime.replaceAll("_", " ") + " +08:00");

    console.log("Exporting logs:", {
      startTime: startTimeObj.toISOString(),
      endTime: endTimeObj.toISOString(),
      agentName,
    });

    const resp = await ctx.runAction(api.llmLogs.exportTradeActionsToFiles, {
      startTime: startTimeObj.toISOString(),
      endTime: endTimeObj.toISOString(),
      agentName,
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Export Logs - ${agentName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 600px; }
            .time-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .links { margin-top: 20px; }
            .links a { display: block; margin: 10px 0; padding: 10px; background: #007cba; color: white; text-decoration: none; border-radius: 3px; }
            .links a:hover { background: #005a8b; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Export Logs - ${agentName}</h1>
            <div class="time-info">
                <p><strong>Start Time:</strong> ${startTimeObj.toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}</p>
                <p><strong>End Time:</strong> ${endTimeObj.toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}</p>
            </div>
            <div class="links">
                <a href="${resp.file1.url}" target="_blank">Download Actions File</a>
                <a href="${resp.file2.url}" target="_blank">Download COT File</a>
            </div>
        </div>
    </body>
    </html>`;

    return new Response(html, { 
      status: 200,
      headers: { "Content-Type": "text/html" }
    });
  }),
});

export default http;
