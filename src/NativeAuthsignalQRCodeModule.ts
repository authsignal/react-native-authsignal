import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(tenantID: string, withBaseURL: string): Promise<void>;
  getCredential(): Promise<Object | null>;
  addCredential(
    token: string | null,
    withRequireUserAuthentication: boolean,
    withKeychainAccess: string | null
  ): Promise<Object | null>;
  removeCredential(): Promise<boolean>;
  claimChallenge(challengeId: string): Promise<Object | null>;
  updateChallenge(
    challengeId: string,
    withApproval: boolean,
    withVerificationCode: string | null
  ): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalQRCodeModule');
