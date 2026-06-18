CREATE TABLE device_models (
                               id BIGINT IDENTITY(1,1) PRIMARY KEY,
                               model_name NVARCHAR(100) NOT NULL,
                               description NVARCHAR(500),
                               created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);