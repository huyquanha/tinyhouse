import { Provider } from '../../../lib/types';

export interface LogInArgs {
  input: { code: string; provider: Provider } | null;
}

export interface AuthUrlArgs {
  input: { provider: Provider };
}
