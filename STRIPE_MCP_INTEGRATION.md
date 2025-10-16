# Stripe MCP Integration Guide

This project is configured to work with the Stripe MCP (Model Context Protocol) server that you have enabled.

## Available Stripe MCP Tools

The following Stripe operations are available through the MCP integration:

### Customer Management
- `create_customer` - Create a new customer
- `list_customers` - List all customers

### Subscription Management
- `create_subscription` - Create a new subscription
- `update_subscription` - Update an existing subscription
- `cancel_subscription` - Cancel a subscription
- `list_subscriptions` - List all subscriptions

### Invoice Management
- `create_invoice` - Create a new invoice
- `list_invoices` - List all invoices
- `create_invoice_item` - Add an item to an invoice

### Payment Processing
- `create_payment_intent` - Create a payment intent
- `create_refund` - Process a refund
- `create_payment_link` - Generate a payment link

### Product & Pricing
- `create_product` - Create a new product
- `list_products` - List all products
- `create_price` - Create a price for a product
- `list_prices` - List all prices

### Promotions
- `create_coupon` - Create a discount coupon
- `list_coupons` - List all coupons

### Disputes
- `list_disputes` - List payment disputes

### Account Information
- `get_account` - Get account details
- `get_balance` - Get account balance

## Integration with Daur Finance

### Using MCP for Card Issuing

While the Stripe MCP doesn't directly expose Issuing API, you can use it for related operations:

1. **Customer Creation**: Create Stripe customers before issuing cards
2. **Balance Management**: Check account balance before operations
3. **Subscription Billing**: Set up recurring billing for card fees

### Example: Create Customer Before Card Issuance

```typescript
// In server/routers.ts, before creating a card:

// 1. Create Stripe customer via MCP
const customer = await createStripeCustomer({
  email: user.email,
  name: user.name,
  metadata: {
    userId: user.id,
  }
});

// 2. Then create cardholder and card using Stripe Issuing API
const cardholder = await stripe.createCardholder({
  name: user.name,
  email: user.email,
  // ... other details
});
```

### Accessing MCP Tools

Use the `manus-mcp-cli` utility to interact with Stripe MCP:

```bash
# List available Stripe tools
manus-mcp-cli tool list --server stripe

# Create a customer
manus-mcp-cli tool call create_customer --server stripe --input '{
  "email": "customer@example.com",
  "name": "John Doe"
}'

# Get account balance
manus-mcp-cli tool call get_balance --server stripe --input '{}'
```

### Integration Points

1. **User Registration**: Create Stripe customer when user signs up
2. **Card Fees**: Use subscriptions for monthly card fees
3. **Transaction Fees**: Create invoice items for transaction fees
4. **Refunds**: Process refunds through MCP
5. **Analytics**: Use account and balance data for dashboards

## Production Considerations

1. **Error Handling**: Always wrap MCP calls in try-catch blocks
2. **Rate Limiting**: Respect Stripe API rate limits
3. **Idempotency**: Use idempotency keys for critical operations
4. **Logging**: Log all MCP interactions for audit trails
5. **Testing**: Use Stripe test mode during development

## Next Steps

1. Review available MCP tools: `manus-mcp-cli tool list --server stripe`
2. Test customer creation in development
3. Integrate with existing card issuance flow
4. Set up webhook handlers for Stripe events
5. Implement subscription billing for premium features

---

For more information about the Stripe MCP server, refer to the Manus MCP documentation.
