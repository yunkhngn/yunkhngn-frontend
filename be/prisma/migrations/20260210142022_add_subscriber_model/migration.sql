BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[blogs] DROP CONSTRAINT [DF_blogs_views];
ALTER TABLE [dbo].[blogs] ADD CONSTRAINT [blogs_views_df] DEFAULT 0 FOR [views];

-- CreateTable
CREATE TABLE [dbo].[subscribers] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [subscribers_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [subscribers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [subscribers_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [subscribers_token_key] UNIQUE NONCLUSTERED ([token])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
