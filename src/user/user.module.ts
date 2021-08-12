import { Module } from '@nestjs/common';
// global
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemes/user.schema';

// local
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
