import axios from "axios";

export const getWalletTxList = async (address: string) => {
  const res = await axios.post("/api/etherscan/txlist", { address });
  return res;
};
