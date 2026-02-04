-- CreateColumn: Add views to blogs table
BEGIN TRY

BEGIN TRAN;

-- Add views column with default value
ALTER TABLE [dbo].[blogs] 
ADD [views] INT NULL 
CONSTRAINT [DF_blogs_views] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0
    ROLLBACK TRAN;
  
  -- Only ignore if column already exists
  IF ERROR_NUMBER() = 2705 -- Object already exists
    PRINT 'Column views already exists, skipping...';
  ELSE
    THROW;
END CATCH
