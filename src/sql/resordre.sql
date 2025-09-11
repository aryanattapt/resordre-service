CREATE TABLE business (
  business_id UUID PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_address TEXT,
  business_phone_num VARCHAR(20),
  register_date DATE NOT NULL,
  soft_opening_date DATE,
  close_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE menu_category (
  category_id UUID PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
);

CREATE INDEX idx_category_business_id ON menu_category (business_id);

CREATE TABLE menu_item (
  item_id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  category_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (business_id) REFERENCES business(business_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_category(category_id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_item_business_id ON menu_item (business_id);
CREATE INDEX idx_menu_item_category_id ON menu_item (category_id);
CREATE INDEX idx_menu_item_is_available ON menu_item (is_available);


CREATE TABLE menu_item_option (
  option_id UUID PRIMARY KEY,
  item_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (item_id) REFERENCES menu_item(item_id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_item_option_item_id ON menu_item_option (item_id);

CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  table_id VARCHAR(50),
  customer_id VARCHAR(50),
  type VARCHAR(20) NOT NULL CHECK (type IN ('dine-in', 'delivery')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in-progress', 'ready', 'completed', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL,
  tax NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  grand_total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (business_id) REFERENCES business(business_id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_business_id ON orders (business_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_type ON orders (type);

CREATE TABLE order_item (
  order_item_id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
);

CREATE INDEX idx_order_item_order_id ON order_item (order_id);

CREATE TABLE order_item_option (
  id UUID PRIMARY KEY,
  order_item_id UUID NOT NULL,
  option_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (order_item_id) REFERENCES order_item(order_item_id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES menu_item_option(option_id)
);

CREATE INDEX idx_order_item_option_order_item_id ON order_item_option (order_item_id);

CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
);

CREATE INDEX idx_users_is_active ON users (is_active);
CREATE INDEX idx_users_role ON users (role);
