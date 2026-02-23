import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../Button';
import { colors, spacing, typography } from '../../theme/tokens';

export default function QuickActions({ navigation }) {
    return (
        <View style={styles.scrollSection}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                decelerationRate="fast"
            >
                <Button
                    label="MOC Exam"
                    onPress={() => navigation.navigate('Mock')}
                    style={styles.actionBtn}
                />
                <Button
                    label="Sync Vocab"
                    variant="secondary"
                    onPress={() => navigation.navigate('Review')}
                    style={styles.actionBtn}
                />
                <Button
                    label="Feedback"
                    variant="secondary"
                    onPress={() => navigation.navigate('WritingEditor')}
                    style={styles.actionBtn}
                />
                <Button
                    label="Reading"
                    variant="secondary"
                    onPress={() => navigation.navigate('Reading')}
                    style={styles.actionBtn}
                />
                <Button
                    label="Ders Takvimi"
                    variant="secondary"
                    onPress={() => navigation.navigate('ClassScheduleCalendar')}
                    style={styles.actionBtn}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollSection: {
        marginHorizontal: -spacing.xl, // Bleed out of standard container mapping
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        marginLeft: spacing.xl,
        marginBottom: spacing.md,
        fontSize: typography.h3,
        fontFamily: typography.fontHeadline,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.3,
    },
    horizontalScroll: {
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        paddingBottom: spacing.xs, // Drop shadow space
    },
    actionBtn: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    }
});
