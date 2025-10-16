/**
 * Tron blockchain integration helper
 * Handles USDT (TRC20) wallet creation, balance checking, and transactions
 */

import * as crypto from 'crypto';

// USDT TRC20 contract address on Tron mainnet
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

interface TronConfig {
  apiUrl: string;
  apiKey?: string;
}

let config: TronConfig = {
  apiUrl: "https://api.trongrid.io",
};

export function initTron(apiUrl?: string, apiKey?: string) {
  if (apiUrl) config.apiUrl = apiUrl;
  if (apiKey) config.apiKey = apiKey;
}

/**
 * Generate a new Tron wallet
 * Returns address and encrypted private key
 */
export async function generateWallet(encryptionKey: string): Promise<{
  address: string;
  privateKeyEncrypted: string;
}> {
  // In production, use TronWeb library for proper wallet generation
  // This is a simplified mock implementation
  
  // Generate random private key (32 bytes)
  const privateKey = crypto.randomBytes(32).toString('hex');
  
  // Encrypt private key
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  encrypted = iv.toString('hex') + ':' + encrypted;
  
  // Mock Tron address generation (starts with T)
  const address = 'T' + crypto.randomBytes(16).toString('hex').substring(0, 33);
  
  return {
    address,
    privateKeyEncrypted: encrypted,
  };
}

/**
 * Decrypt private key
 */
export function decryptPrivateKey(encryptedKey: string, encryptionKey: string): string {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Get TRX balance for an address
 */
export async function getTRXBalance(address: string): Promise<string> {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['TRON-PRO-API-KEY'] = config.apiKey;
    }

    const response = await fetch(`${config.apiUrl}/v1/accounts/${address}`, {
      headers,
    });

    if (!response.ok) {
      return "0";
    }

    const data = await response.json();
    const balance = data.data?.[0]?.balance || 0;
    
    // Convert from sun to TRX (1 TRX = 1,000,000 sun)
    return (balance / 1000000).toString();
  } catch (error) {
    console.error("Failed to get TRX balance:", error);
    return "0";
  }
}

/**
 * Get USDT (TRC20) balance for an address
 */
export async function getUSDTBalance(address: string): Promise<string> {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['TRON-PRO-API-KEY'] = config.apiKey;
    }

    // Get TRC20 token balance
    const response = await fetch(
      `${config.apiUrl}/v1/accounts/${address}/transactions/trc20?limit=1&contract_address=${USDT_CONTRACT}`,
      { headers }
    );

    if (!response.ok) {
      return "0";
    }

    const data = await response.json();
    
    // Alternative: use account info endpoint
    const accountResponse = await fetch(`${config.apiUrl}/v1/accounts/${address}`, {
      headers,
    });

    if (!accountResponse.ok) {
      return "0";
    }

    const accountData = await accountResponse.json();
    const trc20 = accountData.data?.[0]?.trc20;
    
    if (trc20) {
      for (const [contractAddress, balance] of Object.entries(trc20)) {
        if (contractAddress === USDT_CONTRACT) {
          // USDT has 6 decimals
          return ((balance as number) / 1000000).toString();
        }
      }
    }

    return "0";
  } catch (error) {
    console.error("Failed to get USDT balance:", error);
    return "0";
  }
}

/**
 * Send USDT (TRC20) transaction
 */
export async function sendUSDT(params: {
  fromAddress: string;
  privateKey: string;
  toAddress: string;
  amount: string; // in USDT (not in smallest unit)
}): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    // Convert USDT to smallest unit (6 decimals)
    const amountInSmallestUnit = Math.floor(parseFloat(params.amount) * 1000000);

    // In production, use TronWeb library to:
    // 1. Create TRC20 transfer transaction
    // 2. Sign with private key
    // 3. Broadcast to network
    
    // Mock implementation
    const txHash = crypto.randomBytes(32).toString('hex');
    
    return {
      success: true,
      txHash,
    };
  } catch (error: any) {
    console.error("Failed to send USDT:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string): Promise<any> {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['TRON-PRO-API-KEY'] = config.apiKey;
    }

    const response = await fetch(`${config.apiUrl}/v1/transactions/${txHash}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Transaction not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get transaction:", error);
    throw error;
  }
}

/**
 * Validate Tron address
 */
export function isValidTronAddress(address: string): boolean {
  // Tron addresses start with 'T' and are 34 characters long
  return /^T[A-Za-z0-9]{33}$/.test(address);
}

/**
 * Get current USDT price in USD
 */
export async function getUSDTPrice(): Promise<number> {
  try {
    // In production, use a price oracle like CoinGecko or Chainlink
    // USDT is pegged to USD, so it's approximately 1.0
    return 1.0;
  } catch (error) {
    console.error("Failed to get USDT price:", error);
    return 1.0;
  }
}

/**
 * Estimate transaction fee
 */
export async function estimateTransactionFee(): Promise<{
  feeInTRX: string;
  feeInUSD: string;
}> {
  // TRC20 transfers typically cost around 13-15 TRX in energy/bandwidth
  // If account has enough energy, fee can be much lower
  return {
    feeInTRX: "14",
    feeInUSD: "1.5", // Approximate, depends on TRX price
  };
}

