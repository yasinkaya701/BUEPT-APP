import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius } from '../../theme/tokens';

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  step: {
    flex: 1,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: colors.success,
  },
  nodeActive: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primarySoft,
  },
  nodeUpcoming: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  connector: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 3,
    marginTop: -10,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
  connectorPending: {
    backgroundColor: colors.border,
  },
  meta: {
    marginTop: 6,
    paddingLeft: 2,
  },
  stepLabel: {
    fontSize: typography.xsmall,
    fontFamily: typography.fontHeadline,
    lineHeight: 14,
  },
  labelDone: {
    color: colors.successDark,
  },
  labelActive: {
    color: colors.primaryDark,
  },
  labelUpcoming: {
    color: colors.muted,
  },
  stepDuration: {
    fontSize: typography.micro,
    color: colors.muted,
    marginTop: 1,
  },
});

/**
 * Horizontal exam-section timeline.
 * steps: [{ key, label, icon?, duration?, status: 'done'|'active'|'upcoming' }]
 */
export default function TimelineStep({ steps = [], activeIndex = 0, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {steps.map((step, idx) => {
        const status = idx < activeIndex ? 'done' : idx === activeIndex ? 'active' : 'upcoming';
        const isLast = idx === steps.length - 1;
        return (
          <View key={step.key} style={styles.step}>
            <View style={styles.head}>
              <View
                style={[
                  styles.node,
                  status === 'done' && styles.nodeDone,
                  status === 'active' && styles.nodeActive,
                  status === 'upcoming' && styles.nodeUpcoming,
                ]}
              >
                {status === 'done' ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={step.icon || 'ellipse'}
                    size={step.icon ? 14 : 8}
                    color={status === 'active' ? '#FFFFFF' : colors.muted}
                  />
                )}
              </View>
              {!isLast ? (
                <View style={[styles.connector, status === 'done' ? styles.connectorDone : styles.connectorPending]} />
              ) : null}
            </View>
            <View style={styles.meta}>
              <Text
                style={[
                  styles.stepLabel,
                  status === 'done' && styles.labelDone,
                  status === 'active' && styles.labelActive,
                  status === 'upcoming' && styles.labelUpcoming,
                ]}
              >
                {step.label}
              </Text>
              {step.duration ? <Text style={styles.stepDuration}>{step.duration}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

