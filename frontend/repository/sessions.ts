import axios from "axios";
import { NotifType, SourceType, TradingType } from "./interface";

interface ICreateSessionParams {
  agent_id: string;
  agent_name: string;
  model: string;
  research_tools: SourceType[];
  prompts: { name: string; prompt: string }[];
  agent_type: string;
  trading_instruments: TradingType[];
  notifications: NotifType[];
  time: string;
  metric_name: string;
  role: string;
}

export const createSession = async (params: ICreateSessionParams) => {
  const res = await axios.post("/api/sessions", params);
  return res;
};
