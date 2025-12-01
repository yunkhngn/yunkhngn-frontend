import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import * as admin from 'firebase-admin';
import { UserService } from '../user/user.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
    constructor(private userService: UserService) {
        super();
    }

    async validate(token: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Sync user to DB
            const user = await this.userService.createOrUpdate(
                decodedToken.uid,
                decodedToken.email,
                decodedToken.picture,
                decodedToken.name
            );

            // Attach user role from DB to request object
            return {
                ...decodedToken,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
