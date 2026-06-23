CREATE TABLE solution_tracking (
                                   id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                   user_id BIGINT NOT NULL,
                                   username NVARCHAR(50) NOT NULL,

                                   fault_solution_id BIGINT NOT NULL,
                                   error_code NVARCHAR(50) NOT NULL,
                                   device_model NVARCHAR(100) NOT NULL,

                                   result_status NVARCHAR(20) NOT NULL,
                                   note NVARCHAR(500),

                                   created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);