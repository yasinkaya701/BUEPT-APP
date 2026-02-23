import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../Card';
import Button from '../Button';
import { colors, spacing, typography } from '../../theme/tokens';

// A reusable module block for standard 2-button features (Exams, Speaking, Placement, Resources, Chat)
export default function FeatureGrid({ navigation }) {
    return (
        <View style={styles.grid}>
            {/* Left Column */}
            <View style={styles.col}>
                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Placement</Text>
                    <Text style={styles.body}>Diagnostics & Analytics</Text>
                    <Button label="Check" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('PlacementTest')} />
                </Card>

                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Writing Studio</Text>
                    <Text style={styles.body}>Daily essay task</Text>
                    <Button label="Start" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('WritingEditor')} />
                </Card>

                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Speaking</Text>
                    <Text style={styles.body}>AI Coach</Text>
                    <Button label="Practice" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('Review')} />
                </Card>
            </View>

            {/* Right Column */}
            <View style={styles.col}>
                <Card style={[styles.miniCard, styles.darkCard]}>
                    <Text style={[styles.h3, { color: '#fff' }]}>BUEPT Exams</Text>
                    <Text style={[styles.body, { color: colors.primaryLight }]}>Official-style mock tests</Text>
                    <Button label="Mock Exam" variant="secondary" style={styles.btn} onPress={() => navigation.navigate('Mock')} />
                </Card>

                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Chat Coach</Text>
                    <Text style={styles.body}>Offline AI Tutor</Text>
                    <Button label="Chat" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('Chatbot')} />
                </Card>

                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Resources</Text>
                    <Text style={styles.body}>Guides & materials</Text>
                    <Button label="Library" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('Resources')} />
                </Card>

                <Card style={styles.miniCard}>
                    <Text style={styles.h3}>Ders Takvimi</Text>
                    <Text style={styles.body}>Program + tatil günleri</Text>
                    <Button label="Open" variant="ghost" style={styles.btn} textStyle={styles.btnText} onPress={() => navigation.navigate('ClassScheduleCalendar')} />
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    col: {
        flex: 1,
        gap: spacing.md,
    },
    miniCard: {
        flex: 1,
        padding: spacing.md,
        marginBottom: 0, // Override card defaults since gap handles it
    },
    darkCard: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    h3: {
        fontSize: typography.body, // Smaller H3 for minicards
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
        letterSpacing: -0.2,
    },
    body: {
        fontSize: typography.xsmall,
        color: colors.muted,
        marginBottom: spacing.md,
        lineHeight: 18,
    },
    btn: {
        height: 40,
        paddingHorizontal: spacing.md,
        minWidth: 0, // Remove 120px minimum
        width: '100%',
    },
    btnText: {
        fontSize: typography.small,
    }
});
