import { UserService } from '../user/user.service';
declare const FirebaseStrategy_base: new (...args: any) => any;
export declare class FirebaseStrategy extends FirebaseStrategy_base {
    private userService;
    constructor(userService: UserService);
    validate(token: string): Promise<{
        role: string;
        isAdmin: boolean;
        aud: string;
        auth_time: number;
        email?: string;
        email_verified?: boolean;
        exp: number;
        firebase: {
            identities: {
                [key: string]: any;
            };
            sign_in_provider: string;
            sign_in_second_factor?: string;
            second_factor_identifier?: string;
            tenant?: string;
            [key: string]: any;
        };
        iat: number;
        iss: string;
        phone_number?: string;
        picture?: string;
        sub: string;
        uid: string;
    }>;
}
export {};
