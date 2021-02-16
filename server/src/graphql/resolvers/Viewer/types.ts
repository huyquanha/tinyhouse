import { Provider } from "../../../lib/types";

export interface SignUpArgs {
  input: {
    name: string;
    avatar?: string;
    email: string;
    password: string;
  };
}

export interface LogInArgs {
  input: {
    code?: string;
    provider?: Provider;
    email?: string;
    password?: string;
  } | null;
}

export interface AuthUrlArgs {
  provider: Provider;
}

export interface VerifyEmailArgs {
  token: string;
}
