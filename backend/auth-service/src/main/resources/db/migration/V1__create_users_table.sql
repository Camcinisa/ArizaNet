CREATE TABLE users (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       full_name NVARCHAR(100) NOT NULL,
                       username NVARCHAR(50) NOT NULL UNIQUE,
                       password_hash NVARCHAR(255) NOT NULL,
                       role NVARCHAR(20) NOT NULL,
                       created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);