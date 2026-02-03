BEGIN TRY

BEGIN TRAN;

-- 1. Safely add Settings table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[settings] (
        [id] INT NOT NULL IDENTITY(1,1),
        [settingTitle] NVARCHAR(1000) NOT NULL,
        [content] NVARCHAR(max),
        CONSTRAINT [settings_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [settings_settingTitle_key] UNIQUE NONCLUSTERED ([settingTitle])
    );
END

-- 2. Safely add views column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[blogs]') AND name = 'views')
BEGIN
    ALTER TABLE [dbo].[blogs] ADD [views] INT NOT NULL CONSTRAINT [blogs_views_df] DEFAULT 0;
END

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
