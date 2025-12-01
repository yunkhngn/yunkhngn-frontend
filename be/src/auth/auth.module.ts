import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy } from './firebase.strategy';

import { UserModule } from '../user/user.module';

@Module({
    imports: [PassportModule, UserModule],
    providers: [FirebaseStrategy],
    exports: [PassportModule],
})
export class AuthModule { }
