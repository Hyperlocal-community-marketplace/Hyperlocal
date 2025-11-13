-- Hyperlocal Marketplace Database Setup
DROP DATABASE hyperlocal_marketplace;

CREATE DATABASE IF NOT EXISTS hyperlocal_marketplace;

USE hyperlocal_marketplace;

CREATE TABLE IF NOT EXISTS Locations (
    zipCode VARCHAR(20) PRIMARY KEY,
    city VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    phoneNumber VARCHAR(50) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    zipCode VARCHAR(20) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    FOREIGN KEY (zipCode) REFERENCES Locations(zipCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins table
CREATE TABLE IF NOT EXISTS Admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    phoneNumber VARCHAR(50) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shops (Sellers) table
CREATE TABLE IF NOT EXISTS Shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    phoneNumber VARCHAR(50) DEFAULT NULL,
    zipCode VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    FOREIGN KEY (zipCode) REFERENCES Locations(zipCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    tags TEXT DEFAULT NULL,
    originalPrice DECIMAL(10, 2) NOT NULL,
    discountPrice DECIMAL(10, 2) DEFAULT NULL,
    stock INT DEFAULT 0,
    ratings DECIMAL(3, 2) DEFAULT 0.00,
    shopId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shopId) REFERENCES Shops(id) ON DELETE CASCADE,
    INDEX idx_shopId (shopId),
    INDEX idx_category (category),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ProductImages table
CREATE TABLE IF NOT EXISTS ProductImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    INDEX idx_productId (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ProductReviews table
CREATE TABLE IF NOT EXISTS ProductReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    userId INT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_productId (productId),
    INDEX idx_userId (userId),
    UNIQUE KEY unique_user_product_review (productId, userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ORDERS table
CREATE TABLE IF NOT EXISTS ORDERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart JSON NOT NULL,
    shippingAddress JSON NOT NULL,
    user JSON NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    paymentInfo JSON DEFAULT NULL,
    shopId INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    deliveredAt DATETIME DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shopId) REFERENCES Shops(id) ON DELETE CASCADE,
    INDEX idx_shopId (shopId),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CONVERSATION table
CREATE TABLE IF NOT EXISTS CONVERSATION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    groupTitle VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    sellerId INT NOT NULL,
    lastMessage TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (sellerId) REFERENCES Shops(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_sellerId (sellerId),
    INDEX idx_groupTitle (groupTitle),
    INDEX idx_updatedAt (updatedAt),
    UNIQUE KEY unique_conversation (groupTitle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MESSAGES table
CREATE TABLE IF NOT EXISTS MESSAGES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    sender INT NOT NULL,
    senderRole ENUM('user', 'seller') DEFAULT NULL,
    text TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId) REFERENCES CONVERSATION(id) ON DELETE CASCADE,
    INDEX idx_conversationId (conversationId),
    INDEX idx_sender (sender),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: Admin123! (hashed with bcrypt)
INSERT INTO Admins (name, email, password) 
VALUES ('Admin User', 'admin@hyperlocal.com', '$2b$10$PT5spBTDr7xyBlJaE11DtONqr18.jgcLBAoi39BEeZOZSwBjOy6vi')
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$PT5spBTDr7xyBlJaE11DtONqr18.jgcLBAoi39BEeZOZSwBjOy6vi',
  name = 'Admin User';
