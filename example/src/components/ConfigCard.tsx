import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ConfigCardProps {
  isInitialized: boolean;
  isConfigured: boolean;
  backendHealthy: boolean;
  userId: string;
  email: string;
  phone: string;
  onUserIdChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPhoneChange: (text: string) => void;
  onInitialize: () => void;
}

export function ConfigCard({
  isInitialized,
  isConfigured,
  backendHealthy,
  userId,
  email,
  phone,
  onUserIdChange,
  onEmailChange,
  onPhoneChange,
  onInitialize,
}: ConfigCardProps) {
  const statusLabel = !isConfigured
    ? 'Not Configured'
    : !backendHealthy
    ? 'Backend Offline'
    : 'Ready';

  const statusColor = !isConfigured
    ? '#f59e0b'
    : !backendHealthy
    ? '#ef4444'
    : '#22c55e';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Configuration</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={onUserIdChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (E.164)"
        value={phone}
        onChangeText={onPhoneChange}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.button, isInitialized && styles.buttonDisabled]}
        onPress={onInitialize}
        disabled={isInitialized}
      >
        <Text style={styles.buttonText}>
          {isInitialized ? 'SDK Initialized' : 'Initialize SDK'}
        </Text>
      </TouchableOpacity>

      {!isConfigured && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Update src/config.ts with your Authsignal credentials
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
  },
});
