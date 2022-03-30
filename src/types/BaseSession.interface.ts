export interface BaseSession<User> {
  accessToken: string;
  expireAt: number;
  user: User;
}
