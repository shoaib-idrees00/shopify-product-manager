require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const pool = require("./config/database");

const {
  getProducts,
  getProduct,
  updateProduct,
} = require("./services/shopifyService");

const app = express();

app.use(cors());

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Test
app.get("/", (req, res) => {
  res.send("Shopify Product Manager Backend is running");
});

// Products
app.get("/api/products", async (req, res) => {
  try {
    const search = req.query.search || "";
    const cursor = req.query.cursor || null;

    const data = await getProducts(search, cursor);

    res.json(data);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// Single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const data = await getProduct(req.params.id);

    if (!data.product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(data.product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const oldData = await getProduct(productId);

    if (!oldData.product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const oldProduct = oldData.product;

    const data = await updateProduct(productId, req.body);

    if (data.productUpdate.userErrors.length > 0) {
      return res.status(400).json({
        message: "Shopify validation error",
        errors: data.productUpdate.userErrors,
      });
    }

    const updatedProduct = data.productUpdate.product;

    await pool.execute(
      `INSERT INTO product_activity
      (shop, productId, action, oldValue, newValue)
      VALUES (?, ?, ?, ?, ?)`,
      [
        process.env.SHOPIFY_SHOP,
        productId,
        "product_update",
        JSON.stringify(oldProduct),
        JSON.stringify(updatedProduct),
      ],
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// Shopify Webhook
// Shopify Webhook
app.post("/webhooks/products/update", async (req, res) => {
  try {
    const hmac = req.headers["x-shopify-hmac-sha256"];

    console.log("Raw body exists:", !!req.rawBody);
    console.log(
      "Secret loaded:",
      !!process.env.SHOPIFY_WEBHOOK_SECRET,
      "Length:",
      process.env.SHOPIFY_WEBHOOK_SECRET?.length
    );

    const digest = crypto
      .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest();

    const hmacBuffer = Buffer.from(hmac, "base64");

    console.log("Digest length:", digest.length);
    console.log("HMAC length:", hmacBuffer.length);

    const valid =
      digest.length === hmacBuffer.length &&
      crypto.timingSafeEqual(digest, hmacBuffer);

    console.log("HMAC valid:", valid);

    if (!valid) {
      return res.status(401).send("Invalid HMAC");
    }

    console.log("HMAC received from Shopify");
    console.log("Webhook received successfully");

    const payload = req.body;

    const shop =
      req.headers["x-shopify-shop-domain"] || process.env.SHOPIFY_SHOP;

    const productId = String(payload.id);

    await pool.execute(
      `INSERT INTO product_activity
      (shop, productId, action, oldValue, newValue)
      VALUES (?, ?, ?, ?, ?)`,
      [
        shop,
        productId,
        "webhook_products_update",
        null,
        JSON.stringify(payload),
      ]
    );

    res.status(200).send("Webhook received");

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    res.status(500).send("Webhook failed");
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
