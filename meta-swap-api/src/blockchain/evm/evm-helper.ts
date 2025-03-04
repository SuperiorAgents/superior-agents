import BigNumber from "bignumber.js";
import { ChainId } from "../../swap/interfaces/swap.interface";
import { ethers } from "ethers";

export class EvmHelper {
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