-- HOW TO RUN:
-- docker-compose exec be npx prisma migrate deploy

BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[journals] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [mood] NVARCHAR(1000) NOT NULL CONSTRAINT [journals_mood_df] DEFAULT 'coding',
    [tags] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [journals_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [journals_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [journals_createdAt_idx] ON [dbo].[journals]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [journals_mood_idx] ON [dbo].[journals]([mood]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
