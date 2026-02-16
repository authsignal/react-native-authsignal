import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface OutputConsoleProps {
  output: string[];
}

export function OutputConsole({ output }: OutputConsoleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Output Console</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {output.length === 0 ? (
          <Text style={styles.placeholder}>Waiting for output...</Text>
        ) : (
          output.map((line, index) => (
            <Text key={index} style={styles.logLine} selectable>
              {line}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scrollView: {
    maxHeight: 250,
    minHeight: 120,
  },
  scrollContent: {
    padding: 12,
  },
  placeholder: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#9ca3af',
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#1f2937',
    lineHeight: 18,
  },
});
