export class CreateCommentDto {
    content: string;
    uid: string; // Firebase UID (Anonymous)
    displayName?: string;
    blogId: string;
}
