BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[notifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [link] NVARCHAR(1000),
    [read] BIT NOT NULL CONSTRAINT [notifications_read_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notifications_read_idx] ON [dbo].[notifications]([read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notifications_createdAt_idx] ON [dbo].[notifications]([createdAt]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
