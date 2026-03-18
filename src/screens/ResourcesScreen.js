import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography } from '../theme/tokens';

export default function ResourcesScreen({ navigation }) {
  const goTab = (tab) => navigation.navigate("MainTabs", { screen: tab });
  return (
    <Screen scroll contentStyle={styles.container}>
      <Text style={styles.h1}>In-App Library</Text>
      <Text style={styles.sub}>All resources are embedded in the app</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.cardContainer} onPress={() => navigation.navigate('Reading')}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxReading]}><Text style={styles.icon}>📚</Text></View>
            <Text style={styles.h3}>Reading</Text>
            <Text style={styles.body}>Academic passages</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardContainer} onPress={() => navigation.navigate('Listening')}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxListening]}><Text style={styles.icon}>🎧</Text></View>
            <Text style={styles.h3}>Listening</Text>
            <Text style={styles.body}>Audio drills</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardContainer} onPress={() => navigation.navigate('Grammar')}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxGrammar]}><Text style={styles.icon}>🧩</Text></View>
            <Text style={styles.h3}>Grammar</Text>
            <Text style={styles.body}>Rule practice</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardContainer} onPress={() => goTab("Writing")}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxWriting]}><Text style={styles.icon}>✍️</Text></View>
            <Text style={styles.h3}>Writing</Text>
            <Text style={styles.body}>Essay studio</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardContainer} onPress={() => navigation.navigate('Exams')}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxExams]}><Text style={styles.icon}>⏳</Text></View>
            <Text style={styles.h3}>Exams</Text>
            <Text style={styles.body}>Timed tests</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardContainer} onPress={() => goTab("Vocab")}>
          <Card style={styles.gridCard}>
            <View style={[styles.iconBox, styles.iconBoxVocab]}><Text style={styles.icon}>📖</Text></View>
            <Text style={styles.h3}>Vocab</Text>
            <Text style={styles.body}>Dictionary & lists</Text>
          </Card>
        </TouchableOpacity>
      </View>
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
    marginBottom: spacing.sm
  },
  sub: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.lg
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md
  },
  gridCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    height: 160
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  iconBoxReading: {
    backgroundColor: '#E0E7FF'
  },
  iconBoxListening: {
    backgroundColor: '#FEF3C7'
  },
  iconBoxGrammar: {
    backgroundColor: '#DCFCE7'
  },
  iconBoxWriting: {
    backgroundColor: '#FCE7F3'
  },
  iconBoxExams: {
    backgroundColor: '#F3E8FF'
  },
  iconBoxVocab: {
    backgroundColor: '#E0F2FE'
  },
  icon: {
    fontSize: 24
  },
});
