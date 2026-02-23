import type { UserProfile } from './user';

export interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresIn: number;
}
