import { IAddress } from '../interfaces/address.interface';

export class CreateUserDto {
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
