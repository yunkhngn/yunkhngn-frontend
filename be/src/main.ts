import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function bootstrap() {
  // Initialize Firebase Admin
  if (admin.apps.length === 0) {
    const credentials = process.env.FIREBASE_CREDENTIALS;
    if (credentials) {
      try {
        let serviceAccount;
        if (credentials.startsWith('{')) {
          serviceAccount = JSON.parse(credentials);
        } else if (fs.existsSync(credentials)) {
          serviceAccount = JSON.parse(fs.readFileSync(credentials, 'utf8'));
        }

        if (serviceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('Firebase Admin initialized.');
        }
      } catch (e) {
        console.error('Failed to parse Firebase credentials:', e);
      }
    } else {
      // Initialize with default credentials (GOOGLE_APPLICATION_CREDENTIALS or no-op for dev)
      try {
        admin.initializeApp();
        console.log('Firebase Admin initialized with default credentials.');
      } catch (e) {
        console.warn(
          'Firebase Admin initialization failed (might be expected if no creds provided):',
          e.message,
        );
      }
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontend

  const config = new DocumentBuilder()
    .setTitle('Blog Portfolio API')
    .setDescription('The Blog Portfolio API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
