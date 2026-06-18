CREATE TABLE fault_solutions (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 device_model_id BIGINT NOT NULL,
                                 error_code NVARCHAR(50) NOT NULL,
                                 title NVARCHAR(150) NOT NULL,
                                 description NVARCHAR(MAX),
                                 possible_causes NVARCHAR(MAX),
                                 solution_steps NVARCHAR(MAX),
                                 required_tools NVARCHAR(MAX),
                                 warnings NVARCHAR(MAX),
                                 created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                 updated_at DATETIME2,

                                 CONSTRAINT fk_fault_solutions_device_model
                                     FOREIGN KEY (device_model_id)
                                         REFERENCES device_models(id)
);