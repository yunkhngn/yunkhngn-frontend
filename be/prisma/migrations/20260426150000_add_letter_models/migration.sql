BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[letters] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [password] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [letters_status_df] DEFAULT 'processing',
    [isActive] BIT NOT NULL CONSTRAINT [letters_isActive_df] DEFAULT 1,
    [views] INT NOT NULL CONSTRAINT [letters_views_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [letters_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [letters_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [letters_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [letters_code_idx] ON [dbo].[letters]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [letters_isActive_idx] ON [dbo].[letters]([isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [letters_status_idx] ON [dbo].[letters]([status]);

-- CreateTable
CREATE TABLE [dbo].[letter_pages] (
    [id] NVARCHAR(1000) NOT NULL,
    [letterId] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(2048) NOT NULL,
    [revealMapUrl] NVARCHAR(2048),
    [width] INT,
    [height] INT,
    [sortOrder] INT NOT NULL CONSTRAINT [letter_pages_sortOrder_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [letter_pages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [letter_pages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [letter_pages_letterId_idx] ON [dbo].[letter_pages]([letterId]);

-- AddForeignKey
ALTER TABLE [dbo].[letter_pages] ADD CONSTRAINT [letter_pages_letterId_fkey] FOREIGN KEY ([letterId]) REFERENCES [dbo].[letters]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
