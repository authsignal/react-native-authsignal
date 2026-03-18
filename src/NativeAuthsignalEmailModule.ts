import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(tenantID: string, withBaseURL: string): Promise<void>;
  enroll(email: string): Promise<Object | null>;
  challenge(): Promise<Object | null>;
  verify(code: string): Promise<Object | null>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalEmailModule');
