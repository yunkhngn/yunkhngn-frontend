export class CreateBlogDto {
    title: string;
    slug: string;
    thumbnail?: string;
    tags?: string; // JSON string or comma-separated
    contentJSON: string;
    status?: string; // 'DRAFT' | 'PUBLISHED'
}
