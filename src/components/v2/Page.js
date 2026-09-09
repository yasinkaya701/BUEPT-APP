import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { getV2Theme, v2Spacing } from '../../theme/v2';
import { useUniversity } from '../../context/UniversityContext';

export default function Page({ children, scroll = true, contentStyle, style, maxWidth = 1180 }) {
  const { uniKey } = useUniversity();
  const theme = getV2Theme(uniKey);
  const { width } = useWindowDimensions();
  const horizontal = width < 520 ? v2Spacing.md : width < 900 ? v2Spacing.lg : v2Spacing.xl;
  const content = (
    <View style={[styles.content, { maxWidth, paddingHorizontal: horizontal }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }, style]}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: v2Spacing.lg,
    paddingBottom: v2Spacing.xxxl,
  },
});
