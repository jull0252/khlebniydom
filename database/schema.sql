-- ============================================================
-- Хлебный дом — схема базы данных MySQL
-- Запустите этот SQL-файл в phpMyAdmin (вкладка SQL)
-- или выполните: mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS khlebniy_dom
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE khlebniy_dom;

-- -----------------------------------------------------------
-- 1. ПОЛЬЗОВАТЕЛИ
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(50)  DEFAULT '',
  password    VARCHAR(255) NOT NULL,               -- хеш пароля
  role        ENUM('b2c','b2b','admin') DEFAULT 'b2c',
  company_name VARCHAR(255) DEFAULT '',
  inn         VARCHAR(50)  DEFAULT '',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Администратор по умолчанию (пароль: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Администратор', 'admin@khlebniydom.ru', '$2y$10$EaZEssymEchwDzmq/vu.7uczLDkYonlXexU8a6sqgiqM05BU/zMPK', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- -----------------------------------------------------------
-- 2. КАТЕГОРИИ ТОВАРОВ
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE,
  slug  VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, slug) VALUES
('Хлеб',  'hleb'),
('Сдоба', 'sdoba'),
('Пироги','pirogi')
ON DUPLICATE KEY UPDATE id=id;

-- -----------------------------------------------------------
-- 3. ТОВАРЫ
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT         DEFAULT '',
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  weight      DECIMAL(10,3) NOT NULL DEFAULT 0.5 COMMENT 'вес в кг',
  category_id INT          DEFAULT NULL,
  image       VARCHAR(255) DEFAULT '',
  icon        VARCHAR(10)  DEFAULT '🍞',
  popular     TINYINT(1)   DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_popular (popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO products (name, description, price, weight, category_id, icon, popular) VALUES
('Хлеб Бородинский',     'Традиционный ржаной хлеб на закваске с кориандром.',  90,   0.5,  1, '🍞', 1),
('Круассан классический','Воздушный слоеный круассан на настоящем фермерском масле.', 120, 0.15, 2, '🥐', 1),
('Пирог с вишней',       'Сладкий закрытый пирог с сочной вишневой начинкой.',   450,  0.8,  3, '🥧', 1),
('Багет французский',    'Хрустящая корочка и нежный пористый мякиш внутри.',     85,   0.3,  1, '🥖', 0),
('Улитка с корицей',     'Ароматная выпечка с корицей, политая сахарной глазурью.',110, 0.12, 2, '🍥', 0),
('Пирог с мясом',        'Сытный пирог с начинкой из фермерской говядины и свинины.',600, 1.0, 3, '🥩', 0);

-- -----------------------------------------------------------
-- 4. ЗАКАЗЫ
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          DEFAULT NULL,
  customer_name   VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(50)  NOT NULL,
  customer_email  VARCHAR(255) NOT NULL,
  address         TEXT         NOT NULL,
  delivery_method ENUM('delivery','pickup') DEFAULT 'delivery',
  payment_method  ENUM('card','cash','invoice') DEFAULT 'card',
  comment         TEXT         DEFAULT '',
  subtotal        DECIMAL(10,2) DEFAULT 0,
  delivery_cost   DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) DEFAULT 0,
  status          ENUM('new','processing','delivered','cancelled') DEFAULT 'new',
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. СОСТАВ ЗАКАЗА
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT          DEFAULT NULL,
  product_name VARCHAR(255) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  quantity    INT          NOT NULL DEFAULT 1,
  icon        VARCHAR(10)  DEFAULT '🍞',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. B2B-ЗАЯВКИ
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS b2b_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company     VARCHAR(255) NOT NULL,
  inn         VARCHAR(50)  DEFAULT '',
  contact_name VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  volume      VARCHAR(100) DEFAULT '',
  comment     TEXT         DEFAULT '',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
