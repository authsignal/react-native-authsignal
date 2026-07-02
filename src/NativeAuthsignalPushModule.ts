import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(tenantID: string, withBaseURL: string): Promise<void>;
  getCredential(): Promise<Object | null>;
  addCredential(
    token: string | null,
    withRequireUserAuthentication: boolean,
    withKeychainAccess: string | null,
    withPerformAttestation: boolean,
    withPushToken: string | null
  ): Promise<Object | null>;
  removeCredential(): Promise<boolean>;
  getChallenge(): Promise<Object | null>;
  updateChallenge(
    challengeId: string,
    withApproval: boolean,
    withVerificationCode: string | null
  ): Promise<boolean>;
  updateCredential(
    pushToken: string | null,
    withResetExpiry: boolean
  ): Promise<Object | null>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalPushModule');
