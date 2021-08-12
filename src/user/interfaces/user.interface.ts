import { Document } from 'mongoose';
import { IAddress } from './address.interface';

/*
  email: { type: String, required: true },
  avatar: { type: String, default: null },
  avatarId: { type: String, default: null },
  firstName: { type: String, reqired: true },
  lastName: { type: String, reqired: true },
  gender: { type: String, required: true, enam: Object.values(genderEnum) },
  address: {
    country: { type: String, default: null },
    city: { type: String, default: null },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
  },
  professional: { type: String, default: null },
  phone: { type: String, default: null },
  role: { type: [String], reqired: true, enam: Object.values(roleEnumb) },
  password: { type: String, required: true },
*/
export interface IUser extends Document {
  readonly email: string;
  readonly avatar: string;
  readonly avatarId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly gender: string;
  readonly address: IAddress;
  readonly professional: string;
  readonly phone: string;
  readonly role: Array<string>;
  readonly password: string;
}
