export type Maybe<T> = T | null;

export interface AccessTokenPayload {
  token: string;
  tokenExpires: string;
}

export interface Message {
  body?: string;
  heading: string;
  status: "error" | "info" | "success" | "warning";
  key: string;
}

export type Nullish = null | undefined;
