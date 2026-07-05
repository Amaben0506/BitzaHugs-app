import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { isModerator } from '../lib/moderation';
import {
  CommunityReport,
  HiddenItem,
  loadOpenReports,
  loadHiddenPosts,
  getContentBody,
  moderateSetStatus,
  resolveReport,
  hardDeletePost,
  timeAgo,
} from '../lib/communityService';
import { Colors, Fonts, Type, Spacing, Radius } from '../theme/theme';
import Card from '../components/ui/Card';
import ScreenHeader from '../components/ui/ScreenHeader';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReportWithContent extends CommunityReport {
  contentBody: string;
}

type Tab = 'reports' | 'hidden';
type ReportAction = 'restore' | 'hide' | 'remove' | 'delete' | 'dismiss';
type HiddenAction = 'restore' | 'remove' | 'delete';

// ── Reason badge ───────────────────────────────────────────────────────────────

const REASON_MAP: Record<string, { label: string; bg: string; color: string }> = {
  harassment: { label: 'Harassment', bg: '#FFF1F3', color: '#B86078' },
  hate:       { label: 'Hate',       bg: '#FFE5E5', color: '#C03060' },
  graphic:    { label: 'Graphic',    bg: '#FFF0E0', color: '#C07030' },
  privacy:    { label: 'Privacy',    bg: Colors.lavenderSurface, color: Colors.purple },
  spam:       { label: 'Spam',       bg: '#FFFBEC', color: '#9B7828' },
  dangerous:  { label: 'Dangerous',  bg: '#FFE5E5', color: '#C03060' },
  other:      { label: 'Other',      bg: '#F0F0F8', color: Colors.textMuted },
};

function ReasonBadge({ reason }: { reason: string }) {
  const r = REASON_MAP[reason] ?? REASON_MAP.other;
  return (
    <View style={[b.pill, { backgroundColor: r.bg }]}>
      <Text style={[b.text, { color: r.color }]}>{r.label}</Text>
    </View>
  );
}

const b = StyleSheet.create({
  pill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontFamily: Fonts.bold, fontSize: 10.5, lineHeight: 14 },
});

// ── Filter chip ────────────────────────────────────────────────────────────────

function Chip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[c.chip, active && c.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[c.label, active && c.labelActive]}>
        {label}
        {count > 0 ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
}

const c = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: '#EDE7F6',
  },
  chipActive: { backgroundColor: Colors.purple },
  label: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 16, color: Colors.textMuted },
  labelActive: { color: '#fff' },
});

// ── Action button ──────────────────────────────────────────────────────────────

function ActionBtn({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[a.btn, { borderColor: color }, disabled && a.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={[a.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const a = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: { fontFamily: Fonts.bold, fontSize: 11, lineHeight: 15 },
  disabled: { opacity: 0.4 },
});

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message?: string }) {
  return (
    <View style={e.wrap}>
      <Text style={e.emoji}>🛡️</Text>
      <Text style={e.title}>No open reports</Text>
      <Text style={e.body}>{message ?? 'The community is calm right now. 💜'}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl },
  emoji: { fontSize: 36, marginBottom: Spacing.md },
  title: { ...Type.heading, color: Colors.textPrimary, marginBottom: Spacing.sm },
  body: { ...Type.bodySmall, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});

// ── Main screen ────────────────────────────────────────────────────────────────

export default function ModerationScreen() {
  const navigation = useNavigation<any>();
  const allowed = isModerator();

  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState<ReportWithContent[]>([]);
  const [hidden, setHidden] = useState<HiddenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) navigation.goBack();
  }, [allowed, navigation]);

  if (!allowed) return null;

  // ── Load ─────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [rawReports, hiddenPosts] = await Promise.all([
        loadOpenReports(),
        loadHiddenPosts(),
      ]);
      const withContent = await Promise.all(
        rawReports.map(async (r) => {
          const body = await getContentBody(r.targetType, r.postId, r.targetId).catch(
            () => '[Content unavailable]',
          );
          return { ...r, contentBody: body };
        }),
      );
      setReports(withContent);
      setHidden(hiddenPosts);
    } catch {
      Alert.alert('Error', 'Could not load moderation data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Report actions ───────────────────────────────────────────────────────────

  const actOnReport = async (report: ReportWithContent, action: ReportAction) => {
    setActing(report.id);
    try {
      if (action === 'dismiss') {
        await resolveReport(report.id);
      } else if (action === 'delete') {
        if (report.targetType !== 'post') return; // guard — only posts can be hard-deleted
        await hardDeletePost(report.postId);
        await resolveReport(report.id);
      } else {
        const STATUS = { restore: 'active', hide: 'hidden', remove: 'removed' } as const;
        await moderateSetStatus(report.targetType, report.postId, report.targetId, STATUS[action]);
        await resolveReport(report.id);
      }
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setActing(null);
    }
  };

  const confirmDelete = (report: ReportWithContent) => {
    Alert.alert(
      'Delete permanently?',
      'This removes the post and all its comments. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => actOnReport(report, 'delete') },
      ],
    );
  };

  // ── Hidden-post actions ───────────────────────────────────────────────────────

  const actOnHidden = async (item: HiddenItem, action: HiddenAction) => {
    setActing(item.id);
    try {
      if (action === 'delete') {
        await hardDeletePost(item.postId);
      } else {
        await moderateSetStatus(item.targetType, item.postId, item.id, action === 'restore' ? 'active' : 'removed');
      }
      setHidden((prev) => prev.filter((h) => h.id !== item.id));
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setActing(null);
    }
  };

  const confirmDeleteHidden = (item: HiddenItem) => {
    Alert.alert(
      'Delete permanently?',
      'This removes the post and all its comments. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => actOnHidden(item, 'delete') },
      ],
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Moderation"
        onBack={() => navigation.goBack()}
        style={s.headerBg}
      />

      {/* Filter chips */}
      <View style={s.chipRow}>
        <Chip
          label="Open Reports"
          count={reports.length}
          active={tab === 'reports'}
          onPress={() => setTab('reports')}
        />
        <Chip
          label="Auto-hidden"
          count={hidden.length}
          active={tab === 'hidden'}
          onPress={() => setTab('hidden')}
        />
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator color={Colors.purple} size="large" />
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={Colors.purple}
            />
          }
        >
          {tab === 'reports' ? (
            reports.length === 0 ? (
              <EmptyState />
            ) : (
              reports.map((report) => {
                const busy = acting === report.id;
                return (
                  <Card key={report.id} style={s.card}>
                    {/* Content preview */}
                    <Text style={s.contentLabel}>
                      {report.targetType === 'comment' ? 'Comment' : 'Post'}
                    </Text>
                    <Text style={s.contentBody} numberOfLines={5}>
                      {report.contentBody || '[No content]'}
                    </Text>

                    {/* Meta */}
                    <View style={s.metaRow}>
                      <ReasonBadge reason={report.reason} />
                      <Text style={s.metaMuted}>
                        Reporter ···{report.reporterId.slice(-6)}
                      </Text>
                      <Text style={s.metaMuted}>{timeAgo(report.createdAt)}</Text>
                    </View>

                    {!!report.detail && (
                      <Text style={s.reporterNote}>"{report.detail}"</Text>
                    )}

                    {/* Actions */}
                    <View style={s.actions}>
                      <ActionBtn
                        label="Restore"
                        color={Colors.green}
                        disabled={busy}
                        onPress={() => actOnReport(report, 'restore')}
                      />
                      <ActionBtn
                        label="Hide"
                        color={Colors.mutedGold}
                        disabled={busy}
                        onPress={() => actOnReport(report, 'hide')}
                      />
                      <ActionBtn
                        label="Remove"
                        color={Colors.blushText}
                        disabled={busy}
                        onPress={() => actOnReport(report, 'remove')}
                      />
                      {report.targetType === 'post' && (
                        <ActionBtn
                          label="Delete"
                          color="#C03060"
                          disabled={busy}
                          onPress={() => confirmDelete(report)}
                        />
                      )}
                      <ActionBtn
                        label="Dismiss"
                        color={Colors.textMuted}
                        disabled={busy}
                        onPress={() => actOnReport(report, 'dismiss')}
                      />
                    </View>

                    {busy && (
                      <ActivityIndicator
                        style={s.spinner}
                        color={Colors.purple}
                        size="small"
                      />
                    )}
                  </Card>
                );
              })
            )
          ) : (
            // Auto-hidden tab
            hidden.length === 0 ? (
              <EmptyState message="No auto-hidden posts right now. 💜" />
            ) : (
              hidden.map((item) => {
                const busy = acting === item.id;
                return (
                  <Card key={item.id} style={s.card}>
                    {/* Author row */}
                    <View style={s.hiddenAuthorRow}>
                      <Text style={s.hiddenAuthor}>
                        {item.avatarEmoji}  {item.displayName}
                      </Text>
                      <View style={[b.pill, { backgroundColor: '#FFF0E0' }]}>
                        <Text style={[b.text, { color: '#C07030' }]}>
                          {item.reportCount} report{item.reportCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>

                    <Text style={s.contentBody} numberOfLines={5}>
                      {item.body || '[No content]'}
                    </Text>
                    <Text style={s.metaMuted}>{timeAgo(item.createdAt)}</Text>

                    <View style={s.actions}>
                      <ActionBtn
                        label="Restore"
                        color={Colors.green}
                        disabled={busy}
                        onPress={() => actOnHidden(item, 'restore')}
                      />
                      <ActionBtn
                        label="Remove"
                        color={Colors.blushText}
                        disabled={busy}
                        onPress={() => actOnHidden(item, 'remove')}
                      />
                      <ActionBtn
                        label="Delete"
                        color="#C03060"
                        disabled={busy}
                        onPress={() => confirmDeleteHidden(item)}
                      />
                    </View>

                    {busy && (
                      <ActivityIndicator
                        style={s.spinner}
                        color={Colors.purple}
                        size="small"
                      />
                    )}
                  </Card>
                );
              })
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F9FAFC' },
  headerBg:    { backgroundColor: 'transparent' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:      { flex: 1, backgroundColor: 'transparent' },
  content:     { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 60 },

  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  card: { gap: Spacing.sm, paddingVertical: Spacing.md },

  contentLabel: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  contentBody: {
    ...Type.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 2,
  },
  metaMuted: { ...Type.caption, color: Colors.textMuted },

  reporterNote: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  hiddenAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  hiddenAuthor: { ...Type.cardTitle, color: Colors.textPrimary },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },

  spinner: { alignSelf: 'center', marginTop: Spacing.xs },
});
