import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtS} https://www.youtube.com/watch?v=PvZtd327YiI&list=PL6nKq4UB9xc56eoWJmwqEIJd03RIuqU7l&index=8
@Module({
  imports: [

  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
