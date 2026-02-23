import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LEADERBOARD_DB = {
    'Global': [
        { id: '1', name: 'Zeynep Y.', score: 4250, badge: 'crown' },
        { id: '2', name: 'Emre C.', score: 3980, badge: 'star' },
        { id: '3', name: 'Alperen K.', score: 3850, badge: 'star' },
        { id: '4', name: 'You', score: 2140, badge: 'none' },
        { id: '5', name: 'Ayşe B.', score: 1800, badge: 'none' },
    ],
    'Engineering': [
        { id: '3', name: 'Alperen K.', score: 3850, badge: 'star' },
        { id: '22', name: 'Caner D.', score: 3100, badge: 'none' },
        { id: '9', name: 'Mert T.', score: 2950, badge: 'none' },
    ],
    'Economics': [
        { id: '1', name: 'Zeynep Y.', score: 4250, badge: 'crown' },
        { id: '4', name: 'You', score: 2140, badge: 'none' },
        { id: '14', name: 'Buse S.', score: 1650, badge: 'none' },
    ]
};

export default function CampusSocialScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('Global');

    // Dynamically sort just in case db is out of order
    const currentList = [...LEADERBOARD_DB[activeTab]].sort((a, b) => b.score - a.score);

    return (
        <Screen contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>Campus Social</Text>
                    <Text style={styles.pageSub}>Weekly Leaderboards</Text>
                </View>
            </View>

            <View style={styles.tabWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {['Global', 'Engineering', 'Economics'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.heroBanner}>
                    <Ionicons name="trophy" size={48} color="#f1c40f" />
                    <Text style={styles.heroTitle}>{activeTab === 'Global' ? 'Top Legends' : `${activeTab} Faculty`}</Text>
                    <Text style={styles.heroDesc}>Rankings reset every Sunday at midnight.</Text>
                </View>

                <View style={styles.listWrap}>
                    {currentList.map((user, idx) => {
                        const isYou = user.name === 'You';
                        return (
                            <Card key={user.id} style={[styles.rankCard, isYou && styles.rankCardYou]}>
                                <Text style={[styles.rankNum, idx < 3 && { color: colors.primaryDark }]}>#{idx + 1}</Text>

                                <View style={styles.avatarWrap}>
                                    <Ionicons name="person-circle" size={40} color={isYou ? colors.primary : colors.muted} />
                                </View>

                                <View style={styles.nameWrap}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.userName, isYou && { color: colors.primaryDark }]}>{user.name}</Text>
                                        {user.badge === 'crown' && <Ionicons name="flash" size={14} color="#f1c40f" style={{ marginLeft: 4 }} />}
                                    </View>
                                    <Text style={styles.userScore}>{user.score} XP</Text>
                                </View>

                                {isYou && <View style={styles.youBadge}><Text style={styles.youBadgeText}>YOU</Text></View>}
                            </Card>
                        )
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl },
    backBtn: { padding: spacing.xs, marginRight: spacing.md, borderRadius: radius.round, backgroundColor: 'rgba(0,0,0,0.05)' },
    pageTitle: { fontSize: typography.h2, fontFamily: typography.fontHeadline, color: colors.primaryDark, fontWeight: '800' },
    pageSub: { fontSize: typography.xsmall, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },

    tabWrap: { marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: '#fff', paddingBottom: spacing.sm },
    tabScroll: { paddingHorizontal: spacing.xl, gap: spacing.md },
    tabBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.03)' },
    tabBtnActive: { backgroundColor: colors.primaryDark },
    tabText: { fontSize: 13, fontWeight: '800', color: colors.muted },
    tabTextActive: { color: '#fff' },

    scroll: { paddingHorizontal: spacing.xl },

    heroBanner: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.primaryDark, borderRadius: radius.xl, marginBottom: spacing.xl },
    heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: spacing.md, fontFamily: typography.fontHeadline },
    heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 4 },

    listWrap: { gap: spacing.sm },
    rankCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, backgroundColor: '#fff', ...shadow.slight },
    rankCardYou: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
    rankNum: { fontSize: 18, fontWeight: '900', color: colors.muted, width: 40, textAlign: 'center' },
    avatarWrap: { marginHorizontal: spacing.sm },
    nameWrap: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
    userScore: { fontSize: 13, color: colors.muted, fontWeight: '700' },
    youBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    youBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' }
});
