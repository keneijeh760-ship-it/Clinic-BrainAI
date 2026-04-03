CREATE TABLE app.users (
    id BIGSERIAL PRIMARY KEY,
    chew_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255)
);