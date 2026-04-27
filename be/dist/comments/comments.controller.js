"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const comments_service_1 = require("./comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const update_comment_dto_1 = require("./dto/update-comment.dto");
const vote_dto_1 = require("./dto/vote.dto");
const report_comment_dto_1 = require("./dto/report-comment.dto");
const update_report_dto_1 = require("./dto/update-report.dto");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
let CommentsController = class CommentsController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    create(createCommentDto, req) {
        return this.commentsService.create(createCommentDto, req.user.uid);
    }
    findAll(blogId, projectId, includeHidden, page = 1, limit = 100) {
        if (includeHidden === 'true') {
            return this.commentsService.findAllIncludingHidden(blogId, projectId, +page, +limit);
        }
        return this.commentsService.findAll(blogId, projectId, +page, +limit);
    }
    findOne(id) {
        return this.commentsService.findOne(id);
    }
    update(id, updateCommentDto, req) {
        return this.commentsService.update(id, updateCommentDto, req.user.uid, req.user.isAdmin || false);
    }
    remove(id, req) {
        return this.commentsService.remove(id, req.user.uid, req.user.isAdmin || false);
    }
    hide(id, req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can hide comments');
        }
        return this.commentsService.hide(id);
    }
    unhide(id, req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can unhide comments');
        }
        return this.commentsService.unhide(id);
    }
    vote(id, voteDto, req) {
        return this.commentsService.vote(id, voteDto, req.user.uid);
    }
    getUserVote(id, req) {
        return this.commentsService.getUserVote(id, req.user.uid);
    }
    getUserVotes(commentIds, req) {
        return this.commentsService.getUserVotes(commentIds, req.user.uid);
    }
    report(id, reportDto, req) {
        return this.commentsService.report(id, reportDto, req.user.uid);
    }
    getReports(status, page = 1, limit = 100, req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can view reports');
        }
        return this.commentsService.getReports(status, +page, +limit);
    }
    updateReportStatus(id, updateReportDto, req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can update report status');
        }
        return this.commentsService.updateReportStatus(id, updateReportDto);
    }
    deleteReport(id, req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can delete reports');
        }
        return this.commentsService.deleteReport(id);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('blogId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('includeHidden')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_comment_dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/hide'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "hide", null);
__decorate([
    (0, common_1.Post)(':id/unhide'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "unhide", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vote_dto_1.VoteDto, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "vote", null);
__decorate([
    (0, common_1.Get)(':id/vote'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "getUserVote", null);
__decorate([
    (0, common_1.Post)('votes/batch'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)('commentIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "getUserVotes", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, report_comment_dto_1.ReportCommentDto, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('admin/reports'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "getReports", null);
__decorate([
    (0, common_1.Patch)('admin/reports/:id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_report_dto_1.UpdateReportDto, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "updateReportStatus", null);
__decorate([
    (0, common_1.Delete)('admin/reports/:id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "deleteReport", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map