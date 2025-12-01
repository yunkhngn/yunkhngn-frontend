BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Blog] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [thumbnail] NVARCHAR(1000),
    [tags] NVARCHAR(1000),
    [contentJSON] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Blog_status_df] DEFAULT 'DRAFT',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Blog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Blog_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Blog_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [techStack] NVARCHAR(1000),
    [tags] NVARCHAR(1000),
    [repoLink] NVARCHAR(1000),
    [demoLink] NVARCHAR(1000),
    [cover] NVARCHAR(1000),
    [contentJSON] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Project_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Comment] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000),
    [hidden] BIT NOT NULL CONSTRAINT [Comment_hidden_df] DEFAULT 0,
    [upvoteCount] INT NOT NULL CONSTRAINT [Comment_upvoteCount_df] DEFAULT 0,
    [downvoteCount] INT NOT NULL CONSTRAINT [Comment_downvoteCount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Comment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [blogId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Comment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CommentVote] (
    [id] NVARCHAR(1000) NOT NULL,
    [commentId] NVARCHAR(1000) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [value] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CommentVote_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CommentVote_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CommentVote_commentId_uid_key] UNIQUE NONCLUSTERED ([commentId],[uid])
);

-- CreateTable
CREATE TABLE [dbo].[CommentReport] (
    [id] NVARCHAR(1000) NOT NULL,
    [commentId] NVARCHAR(1000) NOT NULL,
    [reporterUid] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [CommentReport_status_df] DEFAULT 'pending',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CommentReport_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CommentReport_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CommentReport_commentId_reporterUid_key] UNIQUE NONCLUSTERED ([commentId],[reporterUid])
);

-- CreateTable
CREATE TABLE [dbo].[Gallery] (
    [id] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [caption] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Gallery_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Gallery_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Settings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [settingTitle] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max),
    CONSTRAINT [Settings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Settings_settingTitle_key] UNIQUE NONCLUSTERED ([settingTitle])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'ADMIN',
    [avatarUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_uid_key] UNIQUE NONCLUSTERED ([uid]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Comment_blogId_idx] ON [dbo].[Comment]([blogId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Comment_uid_idx] ON [dbo].[Comment]([uid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommentVote_commentId_idx] ON [dbo].[CommentVote]([commentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommentVote_uid_idx] ON [dbo].[CommentVote]([uid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommentReport_commentId_idx] ON [dbo].[CommentReport]([commentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommentReport_reporterUid_idx] ON [dbo].[CommentReport]([reporterUid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CommentReport_status_idx] ON [dbo].[CommentReport]([status]);

-- AddForeignKey
ALTER TABLE [dbo].[Comment] ADD CONSTRAINT [Comment_blogId_fkey] FOREIGN KEY ([blogId]) REFERENCES [dbo].[Blog]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CommentVote] ADD CONSTRAINT [CommentVote_commentId_fkey] FOREIGN KEY ([commentId]) REFERENCES [dbo].[Comment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CommentReport] ADD CONSTRAINT [CommentReport_commentId_fkey] FOREIGN KEY ([commentId]) REFERENCES [dbo].[Comment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
