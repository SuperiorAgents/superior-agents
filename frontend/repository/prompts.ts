import axios from "axios";

export const getPrompts = async () => {
  const res = await axios.get("/api/prompts");
  return res.data;
};
