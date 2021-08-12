import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interfaces/user.interface';
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  // DTO - Data Transfer Object
  async create(
    createUserDto: CreateUserDto,
    roles: Array<string>,
  ): Promise<IUser> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel(
      _.assignIn(createUserDto, { password: hash, roles }),
    );

    return await createdUser.save();
  }

  async find(id: string): Promise<IUser> {
    return await (await this.userModel.findById(id)).execPopulate();
  }
}
