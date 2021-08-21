export type Maybe<T> = T | null;

export interface AccessToken {
  jwt: string;
  expires: Date;
}
