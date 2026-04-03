import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  setToken(token: string | null): Promise<string>;
  launch(url: string): Promise<string | null>;
  getDeviceId(): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('AuthsignalModule');
