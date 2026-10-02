require("dotenv").config();

const { shopifyGraphQL } = require("./services/shopifyService");

async function registerWebhook() {
  const query = `
    mutation webhookSubscriptionCreate(
      $topic: WebhookSubscriptionTopic!,
      $webhookSubscription: WebhookSubscriptionInput!
    ) {
      webhookSubscriptionCreate(
        topic: $topic,
        webhookSubscription: $webhookSubscription
      ) {
        webhookSubscription {
          id
          topic
          uri
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query, {
    topic: "PRODUCTS_UPDATE",
    webhookSubscription: {
      uri: "https://clash-turkey-pointed.ngrok-free.dev/webhooks/products/update",
      format: "JSON",
    },
  });

  console.log(JSON.stringify(data, null, 2));
}

registerWebhook().catch((error) => {
  console.error("WEBHOOK REGISTRATION ERROR:");
  console.error(error.message);
});
