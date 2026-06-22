IF COL_LENGTH('users', 'email') IS NULL
    BEGIN
        ALTER TABLE users ADD email NVARCHAR(150) NULL;
    END

IF COL_LENGTH('users', 'phone') IS NULL
    BEGIN
        ALTER TABLE users ADD phone NVARCHAR(30) NULL;
    END

IF COL_LENGTH('users', 'active') IS NULL
    BEGIN
        ALTER TABLE users ADD active BIT NOT NULL DEFAULT 1;
    END

IF COL_LENGTH('users', 'status') IS NULL
    BEGIN
        ALTER TABLE users ADD status NVARCHAR(50) NULL;
    END