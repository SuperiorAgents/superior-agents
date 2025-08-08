import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

const isDevelopment = process.env.NODE_ENV === "development";

function getSchedule(isDev, prodSchedule, devSchedule) {
  return isDev ? devSchedule : prodSchedule;
}

// Market-aware scheduling function
function getMarketAwareSchedule(
  isDev,
  marketOpenSchedule,
  marketClosedSchedule,
) {
  if (isDev) {
    // In development, use reduced frequency regardless of market hours
    return marketClosedSchedule;
  }

  // Determine market state
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  if (today === "Saturday" || today === "Sunday") {
    return marketClosedSchedule;
  } else {
    // Market trading hours: 2:30 pm to 9:00 pm UTC
    const hour = new Date().getUTCHours();
    const isMarketOpen = hour >= 14 && hour <= 21;
    return isMarketOpen ? marketOpenSchedule : marketClosedSchedule;
  }
}

// Check agents - every minute in prod, every 6 minutes in dev
crons.cron(
  "check agents",
  getSchedule(isDevelopment, "* * * * *", "*/6 * * * *"),
  internal.workflows.runAgents.runAgents,
  {},
);

// Market research - market-aware scheduling
crons.cron(
  "market research",
  getMarketAwareSchedule(
    isDevelopment,
    "0 */2 * * *", // Every hour during market open
    "0 */4 * * *", // Every 2 hours during market closed/weekends
  ),
  internal.llm.generateMarketResearch.generateMarketResearch,
  {},
);

// Coin research - market-aware scheduling
crons.cron(
  "coin research",
  getMarketAwareSchedule(
    isDevelopment,
    "0 */3 * * *", // Every 3 hours during market open
    "0 */6 * * *", // Every 4 hours during market closed/weekends
  ),
  internal.llm.generateCoinResearch
    .generateCoinResearchFromAgentsWithConcurrency,
  { maxConcurrency: 3 },
);

// crons.daily(
//   "30 mins before market opens",
//   { hourUTC: 14, minuteUTC: 0 },
//   internal.webhooks.twitterapi_io.setupFilterRules,
// );
// crons.daily(
//   "on market closes",
//   {
//     hourUTC: 21,
//     minuteUTC: 0,
//   },
//   internal.webhooks.twitterapi_io.setupFilterRules,
// );

export default crons;
