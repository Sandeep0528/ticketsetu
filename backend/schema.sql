-- TicketSetu Database Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS ticketsetu;
USE ticketsetu;

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories: movie, bus, train, event
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES ('movie'), ('bus'), ('train'), ('event');

-- Events / Items (a movie, a bus route, a train route, a concert)
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  source VARCHAR(100),        -- for bus/train
  destination VARCHAR(100),   -- for bus/train
  language VARCHAR(50),       -- for movie
  duration_minutes INT,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Shows: a specific date/time/venue instance of an event
CREATE TABLE shows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  venue_name VARCHAR(200) NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_seats INT NOT NULL DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Seats per show
CREATE TABLE seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  show_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_type ENUM('normal', 'premium', 'sleeper') DEFAULT 'normal',
  price DECIMAL(10,2) NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  show_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (show_id) REFERENCES shows(id)
);

-- Seats attached to a booking
CREATE TABLE booking_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  seat_id INT NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id)
);

-- Payments (mock / Razorpay test mode)
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('created', 'paid', 'failed') DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Sample seed data
INSERT INTO events (category_id, title, description, image_url, source, destination, language, duration_minutes, city) VALUES
(1, 'Pushpa 3: The Rampage', 'Action drama sequel', 'https://via.placeholder.com/300x400', NULL, NULL, 'Telugu', 165, 'Hyderabad'),
(2, 'Hyderabad to Bangalore Express', 'AC Sleeper Volvo', NULL, 'Hyderabad', 'Bangalore', NULL, 480, 'Hyderabad'),
(3, 'Hyderabad to Vijayawada Intercity', 'Superfast train', NULL, 'Hyderabad', 'Vijayawada', NULL, 300, 'Hyderabad'),
(4, 'Sunburn Music Festival', 'Live EDM concert', 'https://via.placeholder.com/300x400', NULL, NULL, NULL, 240, 'Hyderabad');

INSERT INTO shows (event_id, venue_name, show_date, show_time, base_price, total_seats) VALUES
(1, 'PVR Cinemas, Banjara Hills', CURDATE() + INTERVAL 1 DAY, '19:30:00', 250.00, 40),
(2, 'Boarding: Miyapur Bus Stand', CURDATE() + INTERVAL 1 DAY, '22:00:00', 900.00, 30),
(3, 'Secunderabad Junction', CURDATE() + INTERVAL 2 DAY, '06:15:00', 400.00, 60),
(4, 'Gachibowli Stadium', CURDATE() + INTERVAL 5 DAY, '16:00:00', 1500.00, 100);
