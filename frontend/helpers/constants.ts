export const tradingPrompts = [
  {
    name: "system_prompt",
    prompt: `You are a {role} crypto trader\nYour goal is to maximize {metric_name} within {time}\nYou are currently at {metric_state}`,
  },
  {
    name: "strategy_prompt_first",
    prompt: `You know nothing about your environment.\nWhat do you do now?\nYou can use the following API to do research or run code to interact with the world:\n<APIs>\n{apis_str}\n</APIs>\nPlease explain your approach.`,
  },
  {
    name: "strategy_prompt",
    prompt: `Here is what is going on in your environment right now: {cur_environment}.\nHere is what you just tried: {prev_strategy}.\nIt {prev_strategy_result}.\nWhat do you do now?\nYou can pursue or modify your current approach or try a new one.\nYou can use the following APIs to do further research or run code to interact with the world:\n<APIs>\n{apis_str}\n</APIs>\nPlease explain your approach.`,
  },
  {
    name: "address_research_code_prompt",
    prompt: `You are a degen speculative tokens trading agent, your goal is to be richer in 24 hrs than now.\nAbove is the result of your market research.\nFor the coins mentioned above, please generate some code to get the actual Ethereum address of those tokens or the wrapped equivalent.\nUse the Dexscreener API to find the token contract addresses if you do not know them.\nYou are to generate code like the format below:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\nload_dotenv()\n\ndef main():\n    ....\n\nmain()\n\`\`\`\nPlease generate the code, and make sure the output is short and concise, only showing a list of tokens and their addresses.`,
  },
  {
    name: "trading_code_prompt",
    prompt: `Please write code to implement this strategy:\n<Strategy>\n{strategy_output}\n</Strategy>\nYou have the following APIs:\n<APIs>\n{apis_str}\n</APIs>\nYou may use the information on these contract addresses:\n<AddressResearch>\n{address_research}\n</AddressResearch>\nAnd you may use these local services as trading instruments to perform your task:\n<TradingInstruments>\n{trading_instruments_str}\n</TradingInstruments>\nFormat the code as follows:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\ndef main():\n    ....\n\nmain()\n\`\`\``,
  },
  {
    name: "trading_code_non_address_prompt",
    prompt: `Please write code to implement this strategy:\n<Strategy>\n{strategy_output}\n</Strategy>\nYou have the following APIs:\n<APIs>\n{apis_str}\n</APIs>\nAnd you may use these local services as trading instruments to perform your task:\n<TradingInstruments>\n{trading_instruments_str}\n</TradingInstruments>\nFormat the code as follows:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\ndef main():\n    ....\n\nmain()\n\`\`\``,
  },
  {
    name: "regen_code_prompt",
    prompt: `Given these errors:\n<Errors>\n{errors}\n</Errors>\nAnd the code it's from:\n<Code>\n{previous_code}\n</Code>\nYou are to generate code that fixes the errors but doesn't stray too much from the original code, in this format:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\nload_dotenv()\n\ndef main():\n    ....\n\nmain()\n\`\`\`\nPlease generate the code.`,
  },
];

export const tradingRequiredPrompts = {
  system_prompt: ["{role}", "{metric_name}", "{time}", "{metric_state}"],
  strategy_prompt_first: ["{apis_str}"],
  strategy_prompt: [
    "{cur_environment}",
    "{prev_strategy}",
    "{prev_strategy_result}",
    "{apis_str}",
  ],
  trading_code_prompt: [
    "{strategy_output}",
    "{apis_str}",
    "{address_research}",
    "{trading_instruments_str}",
  ],
  trading_code_non_address_prompt: [
    "{strategy_output}",
    "{apis_str}",
    "{trading_instruments_str}",
  ],
  regen_code_prompt: ["{errors}", "{previous_code}"],
};

export const marketingPrompts = [
  {
    name: "system_prompt",
    prompt: `You are a {role}.\nYou are also a social media influencer.\nYour goal is to maximize {metric_name} within {time}\nYou are currently at {metric_state}`,
  },
  {
    name: "strategy_prompt_first",
    prompt: `You know nothing about your environment.\nWhat do you do now?\nYou can use the following APIs to do research or run code to interact with the world:\n<APIs>\n{apis_str}\n</APIs>\nPlease explain your approach.`,
  },
  {
    name: "strategy_prompt",
    prompt: `Here is what is going on in your environment right now: {cur_environment}.\nHere is what you just tried: {prev_strategy}.\nIt {prev_strategy_result}.\nWhat do you do now?\nYou can pursue or modify your current approach or try a new one.\nYou can use the following APIs to do further research or run code to interact with the world:\n<APIs>\n{apis_str}\n</APIs>\nPlease explain your approach.`,
  },
  {
    name: "marketing_code_prompt",
    prompt: `Please write code to implement this strategy:\n<Strategy>\n{strategy_output}\n</Strategy>\nYou have the following APIs:\n<APIs>\n{apis_str}\n</APIs>\nFormat the code as follows:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\nload_dotenv()\n\ndef main():\n    ....\n\nmain()\n\`\`\``,
  },
  {
    name: "regen_code_prompt",
    prompt: `Given these errors:\n<Errors>\n{errors}\n</Errors>\nAnd the code it's from:\n<Code>\n{previous_code}\n</Code>\nYou are to generate code that fixes the errors but doesn't stray too much from the original code, in this format:\n\
\`\`\`python\nfrom dotenv import load_dotenv\nimport ...\n\nload_dotenv()\n\ndef main():\n    ....\n\nmain()\n\`\`\`\nPlease generate the code.`,
  },
];

export const marketingRequiredPrompts = {
  system_prompt: ["{role}", "{metric_name}", "{time}", "{metric_state}"],
  strategy_prompt_first: ["{apis_str}"],
  strategy_prompt: [
    "{cur_environment}",
    "{prev_strategy}",
    "{prev_strategy_result}",
    "{apis_str}",
  ],
  marketing_code_prompt: ["{strategy_output}", "{apis_str}"],
  regen_code_prompt: ["{errors}", "{previous_code}"],
};

export const COOKIE_AUTH_USER = "auth-user";

export const TEST_USER_ID = "72c43865-b12b-49fb-9021-7cda484dc8a4";

export const AGENT_247_WALLET = "0x7cFB26d59015058871b31f0F4d54142776702527";

export const AGENT_247_ID =
  process.env.NEXT_PUBLIC_DEV_ENV == "1"
    ? "single_agent_dev"
    : "single_agent_2";

export const SINGLE_AGENT_2_API_URL =
  process.env.NEXT_PUBLIC_DEV_ENV == "1"
    ? "http://34.2.24.98:4999"
    : "http://34.87.43.255:5030";
