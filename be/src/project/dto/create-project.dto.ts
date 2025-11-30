export class CreateProjectDto {
    title: string;
    description: string;
    techStack?: string; // JSON string
    tags?: string;
    repoLink?: string;
    demoLink?: string;
    cover?: string;
    contentJSON?: string;
}
