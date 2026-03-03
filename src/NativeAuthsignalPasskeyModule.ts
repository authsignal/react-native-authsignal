import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(
    tenantID: string,
    withBaseURL: string,
    withDeviceID: string | null
  ): Promise<void>;
  signUp(
    token: string | null,
    withUsername: string | null,
    withDisplayName: string | null,
    withIgnorePasskeyAlreadyExistsError: boolean
  ): Promise<Object | null>;
  signIn(
    action: string | null,
    withToken: string | null,
    withAutofill: boolean,
    withPreferImmediatelyAvailableCredentials: boolean
  ): Promise<Object | null>;
  shouldPromptToCreatePasskey(username: string | null): Promise<boolean>;
  isAvailableOnDevice(): Promise<boolean>;
  cancel(): void;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalPasskeyModule');
