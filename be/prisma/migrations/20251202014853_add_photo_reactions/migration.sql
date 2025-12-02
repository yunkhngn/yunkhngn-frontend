BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[photo_reactions] (
    [id] NVARCHAR(1000) NOT NULL,
    [photoId] NVARCHAR(1000) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [reactionType] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [photo_reactions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [photo_reactions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [photo_reactions_photoId_uid_key] UNIQUE NONCLUSTERED ([photoId],[uid])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [photo_reactions_photoId_idx] ON [dbo].[photo_reactions]([photoId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [photo_reactions_uid_idx] ON [dbo].[photo_reactions]([uid]);

-- AddForeignKey
ALTER TABLE [dbo].[photo_reactions] ADD CONSTRAINT [photo_reactions_photoId_fkey] FOREIGN KEY ([photoId]) REFERENCES [dbo].[gallery]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
