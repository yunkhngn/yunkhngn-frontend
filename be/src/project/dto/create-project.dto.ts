export class CreateProjectDto {
    title: string;
    description: string;
    techStack?: string; // JSON string
    images?: string; // JSON string
    tags?: string;
    repoLink?: string;
    demoLink?: string;
}
