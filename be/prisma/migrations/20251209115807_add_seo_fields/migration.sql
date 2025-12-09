BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[blogs] ADD [seoDescription] NVARCHAR(160),
[seoImage] NVARCHAR(1000),
[seoTitle] NVARCHAR(60);

-- AlterTable
ALTER TABLE [dbo].[projects] ADD [seoDescription] NVARCHAR(160),
[seoImage] NVARCHAR(1000),
[seoTitle] NVARCHAR(60);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
