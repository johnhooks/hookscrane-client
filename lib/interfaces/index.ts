export type Maybe<T> = T | null;

export interface AccessTokenPayload {
  token: string;
  tokenExpires: string;
}

export type Status = "error" | "info" | "success" | "warning";

export interface Message {
  body?: string;
  heading: string;
  status: Status;
  key: string;
}

interface Msg {
  body?: string;
  heading: string;
  status: Status;
}

export interface InputProps {
  id: string;
  name: string;
  label: string;
  className?: string | undefined;
  validate: () => Msg | null;
  sendMessage: (message: Msg) => void;
}

export type Nullish = null | undefined;
