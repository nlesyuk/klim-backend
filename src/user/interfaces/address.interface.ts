import { Document } from 'mongoose';

/*
  address: {
    country: { type: String, default: null },
    city: { type: String, default: null },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
  },
*/
export interface IAddress extends Document {
  readonly country: string;
  readonly city: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
}
