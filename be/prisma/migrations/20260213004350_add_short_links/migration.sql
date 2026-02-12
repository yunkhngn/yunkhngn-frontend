BEGIN TRY

BEGIN TRAN;


-- CreateTable
CREATE TABLE [dbo].[short_links] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [targetUrl] NVARCHAR(2048) NOT NULL,
    [title] NVARCHAR(1000),
    [clicks] INT NOT NULL CONSTRAINT [short_links_clicks_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [short_links_isActive_df] DEFAULT 1,
    [expiresAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [short_links_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [short_links_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [short_links_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [short_links_code_idx] ON [dbo].[short_links]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [short_links_isActive_idx] ON [dbo].[short_links]([isActive]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
