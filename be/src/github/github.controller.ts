import { Controller, Get, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Github')
@Controller('admin/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) { }

  @Get('repos')
  @ApiOperation({ summary: 'Get public repositories' })
  getPublicRepos() {
    return this.githubService.getPublicRepos();
  }

  @Get('deployments')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get deployment status (workflow runs)' })
  getDeployments() {
    return this.githubService.getWorkflowRuns();
  }

  @Get('latest-activity')
  @ApiOperation({ summary: 'Get latest public activity' })
  getLatestActivity() {
    return this.githubService.getLatestActivity();
  }
}
