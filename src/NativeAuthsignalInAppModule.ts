import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(tenantID: string, withBaseURL: string): Promise<void>;
  getCredential(username: string | null): Promise<Object | null>;
  addCredential(
    token: string | null,
    withRequireUserAuthentication: boolean,
    withKeychainAccess: string | null,
    withUsername: string | null,
    withAppAttestation: boolean
  ): Promise<Object | null>;
  removeCredential(username: string | null): Promise<boolean>;
  verify(
    action: string | null,
    withUsername: string | null
  ): Promise<Object | null>;
  createPin(
    pin: string,
    withUsername: string,
    withToken: string | null
  ): Promise<Object | null>;
  verifyPin(
    pin: string,
    withUsername: string,
    withAction: string | null
  ): Promise<Object | null>;
  deletePin(username: string): Promise<boolean>;
  getAllPinUsernames(): Promise<string[]>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalInAppModule');
