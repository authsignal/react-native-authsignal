import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './error';

export function getNativeModule<Spec>(
  moduleName: string,
  turboModule: Spec | null
): Spec {
  if (turboModule != null) {
    return turboModule;
  }

  const legacyModule = (NativeModules as Record<string, Spec | undefined>)[
    moduleName
  ];

  if (legacyModule != null) {
    return legacyModule;
  }

  return new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  ) as Spec;
}
