BEGIN TRY

BEGIN TRAN;

-- CreateTable: albums
CREATE TABLE [dbo].[albums] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [coverPhotoId] NVARCHAR(1000),
    [sortOrder] INT NOT NULL CONSTRAINT [albums_sortOrder_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [albums_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [albums_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [albums_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- AlterTable: gallery - add new columns
ALTER TABLE [dbo].[gallery] ADD [albumId] NVARCHAR(1000);
ALTER TABLE [dbo].[gallery] ADD [tags] NVARCHAR(1000);
ALTER TABLE [dbo].[gallery] ADD [views] INT NOT NULL CONSTRAINT [gallery_views_df] DEFAULT 0;
ALTER TABLE [dbo].[gallery] ADD [sortOrder] INT NOT NULL CONSTRAINT [gallery_sortOrder_df] DEFAULT 0;
ALTER TABLE [dbo].[gallery] ADD [exifData] NVARCHAR(MAX);
ALTER TABLE [dbo].[gallery] ADD [blurHash] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [gallery_albumId_idx] ON [dbo].[gallery]([albumId]);

-- AddForeignKey
ALTER TABLE [dbo].[gallery] ADD CONSTRAINT [gallery_albumId_fkey] FOREIGN KEY ([albumId]) REFERENCES [dbo].[albums]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
