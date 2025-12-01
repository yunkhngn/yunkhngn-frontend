BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[comments] ALTER COLUMN [blogId] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[comments] ADD [projectId] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_projectId_idx] ON [dbo].[comments]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
