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
            console.error('Firebase token verification failed:', error);
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('Token payload (aud/iss):', { aud: payload.aud, iss: payload.iss });
                    // console.log('Backend Config:', admin.app().options); 
                }
            } catch (e) {
                console.error('Failed to decode token for debugging:', e);
            }
            throw new UnauthorizedException('Invalid token');
        }
    }
}
