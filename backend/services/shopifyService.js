async function getShopifyAccessToken() {
  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token;
}

async function shopifyGraphQL(query, variables = {}) {
  const accessToken = await getShopifyAccessToken();

  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2026-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || data.errors) {
    throw new Error(JSON.stringify(data));
  }

  return data.data;
}

// Get products
async function getProducts(search = "", cursor = null) {
  const query = `
        query GetProducts($first: Int!, $after: String, $query: String) {
            products(first: $first, after: $after, query: $query) {
                edges {
                    cursor
                    node {
                        id
                        title
                        status
                        featuredImage {
                            url
                        }
                        variants(first: 1) {
                            nodes {
                                sku
                                price
                                inventoryQuantity
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                }
            }
        }
    `;

  return await shopifyGraphQL(query, {
    first: 10,
    after: cursor,
    query: search || null,
  });
}

// Get single product
async function getProduct(id) {
  const query = `
        query GetProduct($id: ID!) {
            product(id: $id) {
                id
                title
                description
                status
                productType
                vendor
                images(first: 10) {
                    nodes {
                        url
                    }
                }
                variants(first: 50) {
                    nodes {
                        id
                        title
                        sku
                        price
                        inventoryQuantity
                    }
                }
            }
        }
    `;

  return await shopifyGraphQL(query, { id });
}

// Update product
async function updateProduct(id, product) {
  const query = `
        mutation UpdateProduct($product: ProductUpdateInput!) {
            productUpdate(product: $product) {
                product {
                    id
                    title
                    description
                    status
                    productType
                    vendor
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

  return await shopifyGraphQL(query, {
    product: {
      id,
      title: product.title,
      descriptionHtml: product.description,
      status: product.status,
      productType: product.productType,
      vendor: product.vendor,
    },
  });
}

module.exports = {
  getShopifyAccessToken,
  getProducts,
  getProduct,
  updateProduct,
  shopifyGraphQL,
};
