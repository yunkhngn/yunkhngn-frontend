BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[contacts] ADD [category] NVARCHAR(1000) NOT NULL CONSTRAINT [contacts_category_df] DEFAULT 'general',
[company] NVARCHAR(1000),
[phone] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [contacts_category_idx] ON [dbo].[contacts]([category]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
