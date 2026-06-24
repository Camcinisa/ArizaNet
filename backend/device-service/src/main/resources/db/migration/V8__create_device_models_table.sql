IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'device_models'
)
    BEGIN
        CREATE TABLE device_models (
                                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                       model_name NVARCHAR(150) NOT NULL,
                                       description NVARCHAR(500) NULL,
                                       external_model_id INT NULL,
                                       active BIT NOT NULL DEFAULT 1,
                                       created_at DATETIME2 NOT NULL DEFAULT GETDATE()
        );
    END;

IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'device_models'
      AND COLUMN_NAME = 'external_model_id'
)
    BEGIN
        ALTER TABLE device_models
            ADD external_model_id INT NULL;
    END;

IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'device_models'
      AND COLUMN_NAME = 'active'
)
    BEGIN
        ALTER TABLE device_models
            ADD active BIT NOT NULL DEFAULT 1;
    END;

IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'device_models'
      AND COLUMN_NAME = 'description'
)
    BEGIN
        ALTER TABLE device_models
            ADD description NVARCHAR(500) NULL;
    END;