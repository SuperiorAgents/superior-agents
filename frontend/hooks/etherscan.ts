import { getWalletTxList } from "@/repository/etherscan";
import { useQuery } from "@tanstack/react-query";

export const useGetWalletTxs = (address: string) => {
  return useQuery({
    queryKey: ["wallet-txs"],
    queryFn: async () => await getWalletTxList(address),
    staleTime: Infinity,
  });
};
