/**
 * Stripe Issuing integration helper
 * Handles card creation, management, and authorization webhooks
 */

interface StripeConfig {
  apiKey: string;
  webhookSecret: string;
}

let config: StripeConfig | null = null;

export function initStripe(apiKey: string, webhookSecret: string) {
  config = { apiKey, webhookSecret };
}

export function getStripeConfig(): StripeConfig {
  if (!config) {
    throw new Error("Stripe not initialized. Call initStripe first.");
  }
  return config;
}

/**
 * Create a Stripe cardholder
 */
export async function createCardholder(params: {
  name: string;
  email: string;
  phoneNumber?: string;
  billing: {
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}) {
  const { apiKey } = getStripeConfig();
  
  const response = await fetch("https://api.stripe.com/v1/issuing/cardholders", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      name: params.name,
      email: params.email,
      type: "individual",
      ...(params.phoneNumber && { phone_number: params.phoneNumber }),
      "billing[address][line1]": params.billing.address.line1,
      "billing[address][city]": params.billing.address.city,
      "billing[address][state]": params.billing.address.state,
      "billing[address][postal_code]": params.billing.address.postal_code,
      "billing[address][country]": params.billing.address.country,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create cardholder: ${error}`);
  }

  return await response.json();
}

/**
 * Create a Stripe Issuing card
 */
export async function createIssuingCard(params: {
  cardholderId: string;
  currency: string;
  type: "virtual" | "physical";
  spendingControls?: {
    spending_limits?: Array<{
      amount: number;
      interval: "per_authorization" | "daily" | "weekly" | "monthly" | "yearly" | "all_time";
    }>;
  };
}) {
  const { apiKey } = getStripeConfig();
  
  const body: any = {
    cardholder: params.cardholderId,
    currency: params.currency.toLowerCase(),
    type: params.type,
    status: "active",
  };

  if (params.spendingControls?.spending_limits) {
    params.spendingControls.spending_limits.forEach((limit, index) => {
      body[`spending_controls[spending_limits][${index}][amount]`] = limit.amount;
      body[`spending_controls[spending_limits][${index}][interval]`] = limit.interval;
    });
  }

  const response = await fetch("https://api.stripe.com/v1/issuing/cards", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create card: ${error}`);
  }

  return await response.json();
}

/**
 * Get card details
 */
export async function getCard(cardId: string) {
  const { apiKey } = getStripeConfig();
  
  const response = await fetch(`https://api.stripe.com/v1/issuing/cards/${cardId}`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get card: ${error}`);
  }

  return await response.json();
}

/**
 * Update card status
 */
export async function updateCardStatus(cardId: string, status: "active" | "inactive" | "canceled") {
  const { apiKey } = getStripeConfig();
  
  const response = await fetch(`https://api.stripe.com/v1/issuing/cards/${cardId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      status,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update card status: ${error}`);
  }

  return await response.json();
}

/**
 * Approve or decline an authorization
 */
export async function respondToAuthorization(authorizationId: string, approved: boolean) {
  const { apiKey } = getStripeConfig();
  
  const endpoint = approved ? "approve" : "decline";
  
  const response = await fetch(
    `https://api.stripe.com/v1/issuing/authorizations/${authorizationId}/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to ${endpoint} authorization: ${error}`);
  }

  return await response.json();
}

/**
 * List transactions for a card
 */
export async function listCardTransactions(cardId: string, limit: number = 10) {
  const { apiKey } = getStripeConfig();
  
  const response = await fetch(
    `https://api.stripe.com/v1/issuing/transactions?card=${cardId}&limit=${limit}`,
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list transactions: ${error}`);
  }

  return await response.json();
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const { webhookSecret } = getStripeConfig();
  
  // In production, use Stripe's SDK for proper signature verification
  // This is a simplified version
  try {
    // Stripe webhook signature verification logic would go here
    // For now, we'll accept if signature exists
    return signature.length > 0;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

