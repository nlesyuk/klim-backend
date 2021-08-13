import * as mongoose from 'mongoose';
import { genderEnum } from '../enums/gender.enum';
import { roleEnumb } from '../enums/role.enum';

export const UserSchema = new mongoose.Schema({
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
});

UserSchema.index({ email: 1 }, { unique: true });