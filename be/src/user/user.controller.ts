import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

interface RequestWithUser extends Request {
  user: {
    uid: string;
    email: string;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('firebase'))
  @Get('me')
  async getProfile(@Request() req: RequestWithUser) {
    const uid = req.user.uid;
    const user = await this.userService.findByUid(uid);
    if (!user) {
      return { uid, email: req.user.email };
    }
    return user;
  }

  @UseGuards(AuthGuard('firebase'))
  @Patch('me')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    console.log('Update Profile Body:', body);
    const uid = req.user.uid;
    const email = req.user.email;
    return this.userService.createOrUpdate(
      uid,
      email,
      body.avatarUrl,
      body.name,
    );
  }

  @UseGuards(AuthGuard('firebase'))
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('firebase'))
  @Post()
  create(
    @Body()
    body: {
      email: string;
      password?: string;
      name?: string;
      role?: string;
    },
  ) {
    return this.userService.create(
      body.email,
      body.password,
      body.name,
      body.role,
    );
  }

  @UseGuards(AuthGuard('firebase'))
  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() body: { name?: string; role?: string; password?: string },
  ) {
    return this.userService.update(uid, body);
  }

  @UseGuards(AuthGuard('firebase'))
  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.userService.delete(uid);
  }
}
