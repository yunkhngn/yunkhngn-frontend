/*
  Warnings:

  - You are about to drop the `Blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Comment] DROP CONSTRAINT [Comment_blogId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[CommentReport] DROP CONSTRAINT [CommentReport_commentId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[CommentVote] DROP CONSTRAINT [CommentVote_commentId_fkey];

-- DropTable
DROP TABLE [dbo].[Blog];

-- DropTable
DROP TABLE [dbo].[Comment];

-- DropTable
DROP TABLE [dbo].[CommentReport];

-- DropTable
DROP TABLE [dbo].[CommentVote];

-- DropTable
DROP TABLE [dbo].[Gallery];

-- DropTable
DROP TABLE [dbo].[Project];

-- DropTable
DROP TABLE [dbo].[Settings];

-- DropTable
DROP TABLE [dbo].[User];

-- CreateTable
CREATE TABLE [dbo].[blogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [thumbnail] NVARCHAR(1000),
    [tags] NVARCHAR(1000),
    [contentJSON] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [blogs_status_df] DEFAULT 'DRAFT',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [blogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [blogs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [blogs_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[projects] (
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [projects_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [projects_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [projects_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[comments] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000),
    [hidden] BIT NOT NULL CONSTRAINT [comments_hidden_df] DEFAULT 0,
    [upvoteCount] INT NOT NULL CONSTRAINT [comments_upvoteCount_df] DEFAULT 0,
    [downvoteCount] INT NOT NULL CONSTRAINT [comments_downvoteCount_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [comments_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [blogId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [comments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[comment_votes] (
    [id] NVARCHAR(1000) NOT NULL,
    [commentId] NVARCHAR(1000) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [value] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [comment_votes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [comment_votes_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [comment_votes_commentId_uid_key] UNIQUE NONCLUSTERED ([commentId],[uid])
);

-- CreateTable
CREATE TABLE [dbo].[comment_reports] (
    [id] NVARCHAR(1000) NOT NULL,
    [commentId] NVARCHAR(1000) NOT NULL,
    [reporterUid] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [comment_reports_status_df] DEFAULT 'pending',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [comment_reports_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [comment_reports_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [comment_reports_commentId_reporterUid_key] UNIQUE NONCLUSTERED ([commentId],[reporterUid])
);

-- CreateTable
CREATE TABLE [dbo].[gallery] (
    [id] NVARCHAR(1000) NOT NULL,
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [caption] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [gallery_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [gallery_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[settings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [settingTitle] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max),
    CONSTRAINT [settings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [settings_settingTitle_key] UNIQUE NONCLUSTERED ([settingTitle])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [uid] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'ADMIN',
    [avatarUrl] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_uid_key] UNIQUE NONCLUSTERED ([uid]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_blogId_idx] ON [dbo].[comments]([blogId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comments_uid_idx] ON [dbo].[comments]([uid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_votes_commentId_idx] ON [dbo].[comment_votes]([commentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_votes_uid_idx] ON [dbo].[comment_votes]([uid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_reports_commentId_idx] ON [dbo].[comment_reports]([commentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_reports_reporterUid_idx] ON [dbo].[comment_reports]([reporterUid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [comment_reports_status_idx] ON [dbo].[comment_reports]([status]);

-- AddForeignKey
ALTER TABLE [dbo].[comments] ADD CONSTRAINT [comments_blogId_fkey] FOREIGN KEY ([blogId]) REFERENCES [dbo].[blogs]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[comment_votes] ADD CONSTRAINT [comment_votes_commentId_fkey] FOREIGN KEY ([commentId]) REFERENCES [dbo].[comments]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[comment_reports] ADD CONSTRAINT [comment_reports_commentId_fkey] FOREIGN KEY ([commentId]) REFERENCES [dbo].[comments]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
