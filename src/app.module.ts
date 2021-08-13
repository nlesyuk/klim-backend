import { Module } from '@nestjs/common';
// global
import { configureModule } from './configure.root';
import { MongooseModule } from '@nestjs/mongoose';
// local
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
@Module({
  imports: [
    UserModule,
    AuthModule,
    configureModule,
    MongooseModule.forRoot(process.env.MONGODB_WRITE_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    TokenModule,
  ],
})
export class AppModule {}
