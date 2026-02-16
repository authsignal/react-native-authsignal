import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Authsignal } from 'react-native-authsignal';
import { AuthsignalConfig } from '../config';
import { BackendService } from '../services/BackendService';
import { ConfigCard } from '../components/ConfigCard';
import { FeatureCard } from '../components/FeatureCard';
import { OutputConsole } from '../components/OutputConsole';

export function HomeScreen() {
  const authsignalRef = useRef<Authsignal | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [outputLog, setOutputLog] = useState<string[]>([]);

  const [userId, setUserId] = useState(`user_${Date.now()}`);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1234567890');

  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('');

  const addOutput = useCallback((message: string) => {
    const time = new Date().toISOString().substring(11, 19);
    setOutputLog((prev) => [...prev, `${time}: ${message}`]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputLog([]);
  }, []);

  useEffect(() => {
    setEmail(`${userId}@example.com`);
  }, [userId]);

  useEffect(() => {
    checkBackendHealth();
    addOutput('App started. Please configure and initialize.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackendHealth = async () => {
    const healthy = await BackendService.checkHealth();
    setBackendHealthy(healthy);
    if (!healthy) {
      addOutput(`Backend not reachable at ${AuthsignalConfig.backendUrl}`);
      addOutput('Start the backend server to enable full functionality');
    }
  };

  const initializeSDK = () => {
    if (!AuthsignalConfig.isConfigured) {
      addOutput('Please update src/config.ts with your credentials');
      return;
    }

    try {
      authsignalRef.current = new Authsignal({
        tenantID: AuthsignalConfig.tenantId,
        baseURL: AuthsignalConfig.baseUrl,
      });
      setIsInitialized(true);
      addOutput(`SDK initialized (platform: ${Platform.OS})`);
    } catch (e) {
      addOutput(`Error initializing SDK: ${e}`);
    }
  };

  // --- Passkey Methods ---

  const registerPasskey = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    try {
      addOutput('Requesting registration token for passkey...');
      const tokenResponse = await BackendService.getRegistrationToken(userId);

      if (!tokenResponse) {
        addOutput('Failed to get registration token');
        return;
      }

      addOutput(`Token received (${tokenResponse.state ?? 'ALLOW'})`);
      await authsignal.setToken(tokenResponse.token);

      const response = await authsignal.passkey.signUp({
        token: tokenResponse.token,
        username: email || undefined,
        displayName: userId || undefined,
      });

      if (response.error) {
        addOutput(`Passkey registration failed: ${response.error}`);
        return;
      }

      addOutput('Passkey registered successfully!');
      if (response.data?.token) {
        addOutput(`  Token: ${response.data.token.substring(0, 20)}...`);
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const signInWithPasskey = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    try {
      addOutput('Launching passkey sign-in prompt...');
      const response = await authsignal.passkey.signIn({
        action: 'signInWithPasskey',
      });

      if (response.error) {
        addOutput(`Passkey sign-in failed: ${response.error}`);
        return;
      }

      if (response.data?.isVerified) {
        addOutput('Passkey authentication successful!');
        const token = response.data?.token;
        if (token) {
          addOutput(`  Token: ${token.substring(0, 20)}...`);
          const validation = await BackendService.validateToken(token);
          if (validation?.isValid) {
            addOutput(`  Server validation: ${validation.state}`);
          }
        }
      } else {
        addOutput('Passkey response received but not verified.');
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  // --- Email OTP Methods ---

  const enrollEmail = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!email.trim()) {
      addOutput('Enter an email address to enroll.');
      return;
    }

    try {
      addOutput('Requesting registration token from backend...');
      const tokenResponse = await BackendService.getRegistrationToken(userId);

      if (!tokenResponse) {
        addOutput('Failed to get registration token');
        return;
      }

      addOutput(`Token received (${tokenResponse.state})`);
      await authsignal.setToken(tokenResponse.token);

      addOutput(`Requesting enrollment OTP for ${email}...`);
      const response = await authsignal.email.enroll({ email });

      if (response.error) {
        addOutput(`Failed to enroll email: ${response.error}`);
        return;
      }

      addOutput(`Enrollment email sent to ${email}`);
      addOutput('  Enter the received code and tap "Verify Code".');
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const challengeEmail = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!email.trim()) {
      addOutput('Enter an email address.');
      return;
    }

    try {
      addOutput('Getting challenge token from backend...');
      const tokenResponse = await BackendService.getChallengeToken({
        userId,
        email,
      });

      if (!tokenResponse) {
        addOutput('Failed to get challenge token');
        return;
      }

      addOutput(`Challenge token received (${tokenResponse.state})`);
      await authsignal.setToken(tokenResponse.token);

      addOutput(`Sending challenge email to ${email}...`);
      const response = await authsignal.email.challenge();

      if (response.error) {
        addOutput(`Failed to send challenge email: ${response.error}`);
        return;
      }

      addOutput('Challenge initiated. Check your inbox for the code.');
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const verifyEmail = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!emailCode.trim()) {
      addOutput('Enter the email OTP code before verifying.');
      return;
    }

    try {
      addOutput('Verifying email OTP...');
      const response = await authsignal.email.verify({ code: emailCode });

      if (response.error) {
        addOutput(`Verification failed: ${response.error}`);
        return;
      }

      if (response.data?.isVerified) {
        addOutput('Email OTP verified successfully!');
        if (response.data?.token) {
          addOutput(`  Token: ${response.data.token.substring(0, 20)}...`);
        }
      } else {
        addOutput('Verification response received but not marked verified.');
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  // --- SMS OTP Methods ---

  const enrollSms = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!phone.trim()) {
      addOutput('Enter a phone number to enroll.');
      return;
    }

    try {
      addOutput('Requesting registration token from backend...');
      const tokenResponse = await BackendService.getRegistrationToken(userId);

      if (!tokenResponse) {
        addOutput('Failed to get registration token');
        return;
      }

      addOutput(`Token received (${tokenResponse.state})`);
      await authsignal.setToken(tokenResponse.token);

      addOutput(`Requesting enrollment OTP for ${phone}...`);
      const response = await authsignal.sms.enroll({ phoneNumber: phone });

      if (response.error) {
        addOutput(`Failed to enroll SMS: ${response.error}`);
        return;
      }

      addOutput(`Enrollment SMS sent to ${phone}`);
      addOutput('  Enter the received code and tap "Verify Code".');
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const challengeSms = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!phone.trim()) {
      addOutput('Enter a phone number.');
      return;
    }

    try {
      addOutput('Getting challenge token from backend...');
      const tokenResponse = await BackendService.getChallengeToken({
        userId,
        phoneNumber: phone,
      });

      if (!tokenResponse) {
        addOutput('Failed to get challenge token');
        return;
      }

      addOutput(`Challenge token received (${tokenResponse.state})`);
      await authsignal.setToken(tokenResponse.token);

      addOutput(`Sending challenge SMS to ${phone}...`);
      const response = await authsignal.sms.challenge();

      if (response.error) {
        addOutput(`Failed to send challenge SMS: ${response.error}`);
        return;
      }

      addOutput('Challenge initiated. Check your phone for the code.');
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const verifySms = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!smsCode.trim()) {
      addOutput('Enter the SMS OTP code before verifying.');
      return;
    }

    try {
      addOutput('Verifying SMS OTP...');
      const response = await authsignal.sms.verify({ code: smsCode });

      if (response.error) {
        addOutput(`Verification failed: ${response.error}`);
        return;
      }

      if (response.data?.isVerified) {
        addOutput('SMS OTP verified successfully!');
        if (response.data?.token) {
          addOutput(`  Token: ${response.data.token.substring(0, 20)}...`);
        }
      } else {
        addOutput('Verification response received but not marked verified.');
        if (response.data?.failureReason) {
          addOutput(`  Reason: ${response.data.failureReason}`);
        }
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  // --- WhatsApp Methods ---

  const challengeWhatsapp = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    try {
      addOutput('Getting challenge token from backend...');
      const tokenResponse = await BackendService.getChallengeToken({
        userId,
        phoneNumber: phone,
      });

      if (!tokenResponse) {
        addOutput('Failed to get challenge token');
        return;
      }

      await authsignal.setToken(tokenResponse.token);
      addOutput('Sending WhatsApp OTP...');

      const result = await authsignal.whatsapp.challenge();

      if (result.error) {
        addOutput(`Failed to send OTP: ${result.error}`);
      } else {
        addOutput(`WhatsApp OTP sent! Check WhatsApp on ${phone}`);
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const verifyWhatsapp = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!whatsappCode.trim()) {
      addOutput('Enter the WhatsApp OTP code before verifying.');
      return;
    }

    try {
      addOutput(`Verifying WhatsApp OTP: ${whatsappCode}`);
      const result = await authsignal.whatsapp.verify({
        code: whatsappCode,
      });

      if (result.error) {
        addOutput(`Verification error: ${result.error}`);
        return;
      }

      if (result.data?.isVerified) {
        addOutput('WhatsApp OTP verified successfully!');
        if (result.data?.token) {
          addOutput(`  Token: ${result.data.token.substring(0, 20)}...`);
        }
      } else {
        addOutput('OTP verification failed');
        if (result.data?.failureReason) {
          addOutput(`  Reason: ${result.data.failureReason}`);
        }
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  // --- TOTP Methods ---

  const enrollTotp = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    try {
      addOutput('Requesting registration token from backend...');
      const tokenResponse = await BackendService.getRegistrationToken(userId);

      if (!tokenResponse) {
        addOutput('Failed to get registration token');
        return;
      }

      addOutput(`Token received (${tokenResponse.state})`);
      await authsignal.setToken(tokenResponse.token);

      addOutput('Enrolling TOTP authenticator...');
      const response = await authsignal.totp.enroll();

      if (response.error) {
        addOutput(`Failed to enroll TOTP: ${response.error}`);
        return;
      }

      if (response.data) {
        addOutput('TOTP enrolled successfully!');
        addOutput(`  Secret: ${response.data.secret}`);
        addOutput(`  URI: ${response.data.uri}`);
        addOutput(
          '  Scan the QR code or enter the secret in your authenticator app.'
        );
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const verifyTotp = async () => {
    const authsignal = authsignalRef.current;
    if (!authsignal) return;

    if (!totpCode.trim()) {
      addOutput('Enter the TOTP code from your authenticator app.');
      return;
    }

    try {
      addOutput('Verifying TOTP code...');
      const response = await authsignal.totp.verify({ code: totpCode });

      if (response.error) {
        addOutput(`Verification failed: ${response.error}`);
        return;
      }

      if (response.data?.isVerified) {
        addOutput('TOTP verified successfully!');
        if (response.data?.token) {
          addOutput(`  Token: ${response.data.token.substring(0, 20)}...`);
        }
      } else {
        addOutput('Verification response received but not marked verified.');
        if (response.data?.failureReason) {
          addOutput(`  Reason: ${response.data.failureReason}`);
        }
      }
    } catch (e) {
      addOutput(`Error: ${e}`);
    }
  };

  const ActionButton = ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.actionButtonText,
          disabled && styles.actionButtonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
    >
      <ConfigCard
        isInitialized={isInitialized}
        isConfigured={AuthsignalConfig.isConfigured}
        backendHealthy={backendHealthy}
        userId={userId}
        email={email}
        phone={phone}
        onUserIdChange={setUserId}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onInitialize={initializeSDK}
      />

      {/* Passkeys */}
      <FeatureCard
        title="Passkeys (web + mobile)"
        description="Register and sign in using passkeys/WebAuthn."
      >
        <ActionButton
          title="Register Passkey"
          onPress={registerPasskey}
          disabled={!isInitialized}
        />
        <ActionButton
          title="Sign In with Passkey"
          onPress={signInWithPasskey}
          disabled={!isInitialized}
        />
      </FeatureCard>

      {/* Email OTP */}
      <FeatureCard
        title="Email OTP (web + mobile)"
        description="Enroll, challenge, and verify email one-time passwords."
      >
        <TextInput
          style={styles.codeInput}
          placeholder="Email OTP Code"
          value={emailCode}
          onChangeText={setEmailCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View style={styles.buttonRow}>
          <ActionButton
            title="Enroll Email"
            onPress={enrollEmail}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Challenge"
            onPress={challengeEmail}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Verify Code"
            onPress={verifyEmail}
            disabled={!isInitialized}
          />
        </View>
      </FeatureCard>

      {/* SMS OTP */}
      <FeatureCard
        title="SMS OTP (web + mobile)"
        description="Send and verify one-time passwords via SMS."
      >
        <TextInput
          style={styles.codeInput}
          placeholder="SMS OTP Code"
          value={smsCode}
          onChangeText={setSmsCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View style={styles.buttonRow}>
          <ActionButton
            title="Enroll SMS"
            onPress={enrollSms}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Challenge"
            onPress={challengeSms}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Verify Code"
            onPress={verifySms}
            disabled={!isInitialized}
          />
        </View>
      </FeatureCard>

      {/* WhatsApp OTP */}
      <FeatureCard
        title="WhatsApp OTP (web + mobile)"
        description="Send and verify one-time passwords via WhatsApp."
      >
        <TextInput
          style={styles.codeInput}
          placeholder="WhatsApp OTP Code"
          value={whatsappCode}
          onChangeText={setWhatsappCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View style={styles.buttonRow}>
          <ActionButton
            title="Send OTP"
            onPress={challengeWhatsapp}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Verify OTP"
            onPress={verifyWhatsapp}
            disabled={!isInitialized}
          />
        </View>
      </FeatureCard>

      {/* TOTP */}
      <FeatureCard
        title="TOTP / Authenticator App (web + mobile)"
        description="Enroll and verify using authenticator apps like Google Authenticator."
      >
        <TextInput
          style={styles.codeInput}
          placeholder="TOTP Code"
          value={totpCode}
          onChangeText={setTotpCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <View style={styles.buttonRow}>
          <ActionButton
            title="Enroll TOTP"
            onPress={enrollTotp}
            disabled={!isInitialized}
          />
          <ActionButton
            title="Verify TOTP"
            onPress={verifyTotp}
            disabled={!isInitialized}
          />
        </View>
      </FeatureCard>

      <OutputConsole output={outputLog} />

      <TouchableOpacity style={styles.clearButton} onPress={clearOutput}>
        <Text style={styles.clearButtonText}>Clear Output</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#111827',
    width: '100%',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 40,
  },
});
