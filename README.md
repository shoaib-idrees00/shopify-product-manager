# Shopify Product Manager

A simple Shopify Product Management application built with React, Node.js, Express, MySQL, and Shopify Admin GraphQL API.

## Features

* Shopify authentication
* Product listing with pagination
* Product search
* Product details
* Edit product information
* MySQL activity logging
* Shopify product update webhook
* API and form error handling

## Technologies

* React + Vite
* Node.js + Express
* MySQL
* Shopify Admin GraphQL API
* ngrok

## Project Structure

```text
product_maneger_app/
├── frontend/
├── backend/
├── database.sql
├── README.md
└── .gitignore
```

## Setup

### 1. Clone the project

```bash
git clone <github-repository-url>
cd product_maneger_app
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and add your Shopify and database credentials.

Start backend:

```bash
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Database

Create the database and table using:

```text
database.sql
```

Make sure MySQL is running.

### 4. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Webhook Testing

Start ngrok:

```bash
ngrok http 5000
```

The Shopify webhook should point to:

```text
https://YOUR-NGROK-URL/webhooks/products/update
```

To test:

1. Start the backend.
2. Start ngrok.
3. Update a product in Shopify Admin.
4. Shopify sends the webhook to the backend.
5. The event is verified and saved in the `product_activity` table.

## Architecture

The React frontend communicates with the Node.js/Express backend.
The backend communicates with Shopify using the Admin GraphQL API.
MySQL stores application activity logs. Shopify remains the main source of product data.

## Technical Decisions

* Shopify is used as the source of truth for product data.
* Access tokens are kept on the backend and are not exposed in the frontend.
* GraphQL is used for Shopify product queries and updates.
* MySQL is used for activity logging.
* Shopify webhooks are used to receive product update events.
