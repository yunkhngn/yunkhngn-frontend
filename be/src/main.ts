import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function bootstrap() {
  // Initialize Firebase Admin
  if (admin.apps.length === 0) {
    const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized with service account.');
      } catch (e) {
        console.error('Failed to parse Firebase credentials:', e);
      }
    } else {
      // Initialize with default credentials (GOOGLE_APPLICATION_CREDENTIALS or no-op for dev)
      try {
        admin.initializeApp();
        console.log('Firebase Admin initialized with default credentials.');
      } catch (e) {
        console.warn('Firebase Admin initialization failed (might be expected if no creds provided):', e.message);
      }
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontend
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
