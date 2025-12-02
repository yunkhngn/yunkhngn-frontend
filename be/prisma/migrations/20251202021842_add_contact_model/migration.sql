BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[contacts] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [subject] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [contacts_status_df] DEFAULT 'new',
    [adminResponse] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [contacts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [respondedAt] DATETIME2,
    CONSTRAINT [contacts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [contacts_status_idx] ON [dbo].[contacts]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [contacts_createdAt_idx] ON [dbo].[contacts]([createdAt]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
