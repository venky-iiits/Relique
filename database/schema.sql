-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'buyer',  -- buyer, seller, admin
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,   -- Painting, Sculpture, Jewelry etc
  description TEXT
);

-- LISTINGS TABLE
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  images TEXT[],                 -- Array of image URLs
  starting_price DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,2),
  reserve_price DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'active',  -- active, sold, expired
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP NOT NULL,
  seller_id INT REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  winner_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- BIDS TABLE
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROVENANCE TABLE
CREATE TABLE provenance (
  id SERIAL PRIMARY KEY,
  listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
  owner_name VARCHAR(150) NOT NULL,
  acquisition_date DATE,
  notes TEXT,
  year INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VALUATIONS TABLE
CREATE TABLE valuations (
  id SERIAL PRIMARY KEY,
  listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
  expert_name VARCHAR(150),
  min_value DECIMAL(12,2),
  max_value DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);