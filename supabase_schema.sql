-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  category text not null, -- e.g., Mango, Lemon, Mixed, Gift Boxes
  ingredients text not null,
  spice_level text not null, -- Mild, Medium, Hot
  is_veg boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Variants Table (Size & Price)
create table product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  weight text not null, -- e.g., 200g, 500g, 1kg
  price numeric(10,2) not null,
  stock_quantity integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Images Table
create table product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- nullable for guest checkout
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  status text not null default 'placed', -- placed, packed, shipped, delivered, cancelled
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_at_time numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews Table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table reviews enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for public reading of products, variants, images, reviews
create policy "Public can view products" on products for select using (true);
create policy "Public can view product variants" on product_variants for select using (true);
create policy "Public can view product images" on product_images for select using (true);
create policy "Public can view reviews" on reviews for select using (true);

-- Policy for orders (authenticated users can view their own orders)
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
-- Insert policy for orders (anyone can insert, even guests, though usually handled via server API)
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Anyone can insert order items" on order_items for insert with check (true);
