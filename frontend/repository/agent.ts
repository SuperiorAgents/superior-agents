import axios from "axios";

interface ICreateAgent {
  user_id: string;
  name: string;
  configuration: string;
}

interface IGetAgent {
  agent_id?: string;
  user_id?: string;
  name?: string;
  configuration?: string;
}

export const createAgent = async (params: ICreateAgent) => {
  const res = await axios.post("/api/agent/create", params);
  return res;
};

export const getAgent = async (params: IGetAgent) => {
  const res = await axios.post("/api/agent/get", params);
  return res.data;
};
