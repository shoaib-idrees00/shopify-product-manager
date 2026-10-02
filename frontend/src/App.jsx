import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editing, setEditing] = useState(false);

  async function loadProducts(cursor = null) {
    try {
      setLoading(true);
      setError("");

      const url = search
        ? `http://localhost:5000/api/products?search=${encodeURIComponent(
            search
          )}${cursor ? `&cursor=${cursor}` : ""}`
        : `http://localhost:5000/api/products${
            cursor ? `?cursor=${cursor}` : ""
          }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(data.products.edges);

      setNextCursor(
        data.products.pageInfo.hasNextPage
          ? data.products.pageInfo.endCursor
          : null
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    loadProducts();
  }

  async function loadProductDetails(id) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/products/${encodeURIComponent(id)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load product");
      }

      setSelectedProduct(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProduct(event) {
    event.preventDefault();

    const title = event.target.title.value.trim();
    const description = event.target.description.value.trim();
    const productType = event.target.productType.value.trim();
    const vendor = event.target.vendor.value.trim();

    if (!title) {
      setError("Title is required");
      return;
    }

    if (!description) {
      setError("Description is required");
      return;
    }

    if (!productType) {
      setError("Product type is required");
      return;
    }

    if (!vendor) {
      setError("Vendor is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/products/${encodeURIComponent(
          selectedProduct.id
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            status: event.target.status.value,
            productType,
            vendor,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      setSelectedProduct(data);
      setEditing(false);

      alert("Product updated successfully");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Shopify Product Manager</h1>
          <p>Manage your Shopify products from one place</p>
        </div>
      </header>

      <main className="container">
        {!selectedProduct && (
          <div className="dashboard-top">
            <div>
              <h2>Products</h2>
              <p className="subtitle">
                View and manage products from your Shopify store.
              </p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button type="submit">Search</button>
            </form>
          </div>
        )}

        {loading && (
          <div className="message loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="message error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {selectedProduct && !loading && (
          <div className="details-card">
            <div className="details-header">
              <div>
                <span className="small-label">PRODUCT DETAILS</span>
                <h2>{selectedProduct.title}</h2>
              </div>

              <span className={`status ${selectedProduct.status.toLowerCase()}`}>
                {selectedProduct.status}
              </span>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>Description</span>
                <strong>
                  {selectedProduct.description || "No description"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Product Type</span>
                <strong>
                  {selectedProduct.productType || "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Vendor</span>
                <strong>{selectedProduct.vendor || "N/A"}</strong>
              </div>
            </div>

            <h3>Variants</h3>

            <div className="variants">
              {selectedProduct.variants.nodes.map((variant) => (
                <div className="variant-card" key={variant.id}>
                  <div>
                    <span>SKU</span>
                    <strong>{variant.sku || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>${variant.price}</strong>
                  </div>

                  <div>
                    <span>Inventory</span>
                    <strong>{variant.inventoryQuantity}</strong>
                  </div>
                </div>
              ))}
            </div>

            {editing && (
              <form onSubmit={handleUpdateProduct} className="edit-form">
                <h3>Edit Product</h3>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    name="title"
                    defaultValue={selectedProduct.title}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedProduct.description}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      defaultValue={selectedProduct.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Product Type</label>
                    <input
                      name="productType"
                      defaultValue={selectedProduct.productType}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    name="vendor"
                    defaultValue={selectedProduct.vendor}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn">
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="secondary-btn cancel-btn"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!editing && (
              <button
                className="primary-btn"
                onClick={() => setEditing(true)}
              >
                Edit Product
              </button>
            )}

            <button
              className="back-btn"
              onClick={() => {
                setSelectedProduct(null);
                setEditing(false);
                setError("");
              }}
            >
              ← Back to Products
            </button>
          </div>
        )}

        {!loading && !error && !selectedProduct && (
          <>
            {products.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try searching with a different product name.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(({ node }) => {
                  const variant = node.variants.nodes[0];

                  return (
                    <div className="product-card" key={node.id}>
                      <div className="product-image">
                        {node.featuredImage ? (
                          <img
                            src={node.featuredImage.url}
                            alt={node.title}
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>

                      <div className="product-content">
                        <div className="product-title-row">
                          <h3>{node.title}</h3>

                          <span
                            className={`status ${node.status.toLowerCase()}`}
                          >
                            {node.status}
                          </span>
                        </div>

                        <div className="product-info">
                          <div>
                            <span>SKU</span>
                            <strong>{variant?.sku || "N/A"}</strong>
                          </div>

                          <div>
                            <span>Price</span>
                            <strong>${variant?.price || "0"}</strong>
                          </div>

                          <div>
                            <span>Inventory</span>
                            <strong>
                              {variant?.inventoryQuantity ?? 0}
                            </strong>
                          </div>
                        </div>

                        <button
                          className="view-btn"
                          onClick={() => loadProductDetails(node.id)}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {nextCursor && (
              <div className="pagination">
                <button
                  onClick={() => loadProducts(nextCursor)}
                  className="next-btn"
                >
                  Next Page →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;