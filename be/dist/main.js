"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();
async function bootstrap() {
    if (admin.apps.length === 0) {
        const credentials = process.env.FIREBASE_CREDENTIALS;
        if (credentials) {
            try {
                let serviceAccount;
                if (credentials.startsWith('{')) {
                    serviceAccount = JSON.parse(credentials);
                }
                else if (fs.existsSync(credentials)) {
                    serviceAccount = JSON.parse(fs.readFileSync(credentials, 'utf8'));
                }
                if (serviceAccount) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                    });
                    console.log('Firebase Admin initialized.');
                }
            }
            catch (e) {
                console.error('Failed to parse Firebase credentials:', e);
            }
        }
        else {
            try {
                admin.initializeApp();
                console.log('Firebase Admin initialized with default credentials.');
            }
            catch (e) {
                console.warn('Firebase Admin initialization failed (might be expected if no creds provided):', e.message);
            }
        }
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Blog Portfolio API')
        .setDescription('The Blog Portfolio API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map