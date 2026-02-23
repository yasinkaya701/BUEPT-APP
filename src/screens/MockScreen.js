import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { colors, spacing, typography } from '../theme/tokens';

export default function MockScreen({ navigation }) {
  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>Mock Exam</Text>
      <Card style={styles.card}>
        <Text style={styles.h3}>Full Mock</Text>
        <Text style={styles.body}>Listening + Reading + Writing</Text>
        <Button label="Start Full Mock" onPress={() => navigation.navigate('MockResult')} />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.h3}>Section Mock</Text>
        <Text style={styles.body}>Practice one section</Text>
        <Button label="Start Section" variant="secondary" onPress={() => navigation.navigate('MockResult')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  h1: {
    fontSize: typography.h1,
    fontFamily: typography.fontHeadline,
    color: colors.text,
    marginBottom: spacing.md
  },
  h3: {
    fontSize: typography.h3,
    fontFamily: typography.fontHeadline,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    fontFamily: typography.fontBody,
    marginBottom: spacing.md
  },
  card: {
    marginBottom: spacing.lg
  }
});
