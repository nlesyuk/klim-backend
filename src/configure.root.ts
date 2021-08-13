import { ConfigModule } from '@nestjs/config';
const environment = process.env.NODE_ENV || 'development';

export const configureModule = ConfigModule.forRoot({
  envFilePath: `.env.${environment}`,
  isGlobal: true,
});
