import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(tenantID: string, withBaseURL: string): Promise<void>;
  challenge(): Promise<Object | null>;
  verify(code: string): Promise<Object | null>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalWhatsappModule');
