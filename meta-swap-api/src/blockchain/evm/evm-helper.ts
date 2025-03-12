import BigNumber   from "bignumber.js";
import { ChainId } from "../../swap/interfaces/swap.interface";
import { ethers }  from "ethers";

export class EvmHelper {
    /**
     * Returns the appropriate provider URL for the specified chain
     * @param chain - The blockchain network identifier
     * @returns The RPC URL for the specified chain
     * @throws Error if ETH_RPC_URL is not set or chain is unsupported
     */
    static getProviderUrl(chain: ChainId): string {
        if (!process.env.ETH_RPC_URL) {
            throw new Error('ETH_RPC_URL not set');
        }
        switch (chain) {
            case ChainId.ETHEREUM:
                return process.env.ETH_RPC_URL;
            default:
                throw new Error(`Unsupported chain ID: ${chain}`);
        }
    }

    /**
     * Fetches the number of decimals for a given ERC20 token
     * @param tokenAddress - The contract address of the token
     * @param chain - The blockchain network identifier
     * @returns The number of decimals used by the token
     */
    static async getDecimals({
        tokenAddress,
        chain,
    }: {
        tokenAddress: string
        chain: ChainId,
    }) {
        // Get the token contract interface to fetch decimals
        const provider = new ethers.JsonRpcProvider(EvmHelper.getProviderUrl(chain));
        const tokenContract = new ethers.Contract(
            tokenAddress,
            ["function decimals() view returns (uint8)"],
            provider
        );

        // Get token decimals
        const decimals = await tokenContract.decimals();

        return decimals;
    }

    /**
     * Converts a raw/scaled token amount to a human-readable format
     * Uses the token's decimals to properly format the value
     * 
     * @param scaledAmount - The amount in the smallest unit of the token (e.g., wei)
     * @param tokenAddress - The contract address of the token
     * @param chain - The blockchain network identifier
     * @returns A human-readable string representing the token amount
     * @throws Error if the conversion process fails
     */
    static async scaleAmountToHumanable({
        scaledAmount,
        tokenAddress,
        chain
    } :{
        scaledAmount: BigNumber | string
        tokenAddress: string
        chain: ChainId,
    }): Promise<string> {
        try {
            // Get the token contract interface to fetch decimals
            const provider = new ethers.JsonRpcProvider(EvmHelper.getProviderUrl(chain));
            const tokenContract = new ethers.Contract(
                tokenAddress,
                ["function decimals() view returns (uint8)"],
                provider
            );

            // Get token decimals
            const decimals = await tokenContract.decimals();

            // Convert BigNumber to ethers.BigNumber
            const ethersScaledAmount = new BigNumber(scaledAmount.toString());
            // Format the amount with proper decimals
            return ethers.formatUnits(ethersScaledAmount.toString(10), decimals);
        } catch (error) {
            // @ts-expect-error
            throw new Error(`Failed to scale amount: ${error.message}`);
        }
    }
}
