CREATE DATABASE shopify_product_manager;

USE shopify_product_manager;

CREATE TABLE product_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    productId VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);