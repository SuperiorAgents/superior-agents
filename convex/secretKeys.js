"use node";

import { internalAction } from "./_generated/server.js";
import { v } from "convex/values";
import { ethers } from "ethers";
import crypto from "node:crypto";

// Helper function to extract private key from new format "0xPublicKey:0xPrivateKey" or old format
function extractPrivateKey(keyString) {
  if (!keyString) {
    throw new Error("Key string is required");
  }

  // Check if it's the new format with colon separator
  if (keyString.includes(":")) {
    const parts = keyString.split(":");
    if (parts.length !== 2) {
      throw new Error(
        "Invalid key format. Expected 'publicKey:privateKey' or just 'privateKey'",
      );
    }
    return parts[1]; // Return the private key part
  }

  // Return as-is for old format
  return keyString;
}

// Internal action to convert private key to public address
export const ethPrivateToPublicKey = internalAction({
  args: {
    privateKey: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, { privateKey }) => {
    try {
      // Extract private key from format if needed
      const extractedPrivateKey = extractPrivateKey(privateKey);

      // Create wallet from private key
      const wallet = new ethers.Wallet(extractedPrivateKey);

      // Return the public address
      return wallet.address;
    } catch (error) {
      throw new Error(`Invalid private key: ${error.message}`);
    }
  },
});

// Helper action to extract private key from format
export const extractPrivateKeyFromFormat = internalAction({
  args: {
    keyString: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, { keyString }) => {
    try {
      return extractPrivateKey(keyString);
    } catch (error) {
      throw new Error(`Failed to extract private key: ${error.message}`);
    }
  },
});


export const getPseudoRandomHex32 = internalAction({
  args: {},
  returns: v.string(),
  handler: async () => {
    // Generate a pseudo-random 32-byte hex string
    return "0x" + crypto.randomBytes(32).toString("hex");
  },
})