import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { getCustomerTickets } from '../../services/ticketService';

interface ActivityItem {
  id: string;
  ticket_number: string;
  title: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
}

interface BroadbandPlan {
  accountNo: string;
  speed: string;
  type: string;
  isActive: boolean;
}

interface IssueOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  hasQuickFix: boolean;
}

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);

  const [activePlan] = useState<BroadbandPlan | null>({
    accountNo: 'FSM-28491',
    speed: '100 Mbps',
    type: 'Premium FTTH',
    isActive: true,
  });

  const issueOptions: IssueOption[] = [
    { id: 'no-internet', title: 'No Internet Connection', subtitle: 'Complete outage or no connectivity', icon: 'wifi', hasQuickFix: true },
    { id: 'slow-speed', title: 'Slow Connection Speed', subtitle: 'Lower than expected performance', icon: 'zap', hasQuickFix: true },
    { id: 'intermittent', title: 'Intermittent Connection', subtitle: 'Connection keeps dropping', icon: 'bar-chart-2', hasQuickFix: false },
    { id: 'equipment', title: 'Equipment Issue', subtitle: 'Router or hardware problem', icon: 'sliders', hasQuickFix: false },
  ];

  const fetchTickets = async () => {
    try {
      const response = await getCustomerTickets();
      if (response.success && Array.isArray(response.data)) {
        const mappedTickets: ActivityItem[] = response.data.map((ticket: any) => ({
          // CHANGE THIS LINE: Use the actual UUID from the API
          id: ticket.id, 
          ticket_number: ticket.ticket_number,
          // Keep the ticket number for display purposes if you want, 
          // but do not use it for navigation navigation or API lookups
          title: ticket.title,
          date: new Date(ticket.created_at).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          }),
          status: ticket.status === 'REPORTED' ? 'Pending' : 'In Progress'
        }));
        setRecentActivity(mappedTickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, []);

  const handlePresentModalPress = useCallback(() => bottomSheetModalRef.current?.present(), []);
  const handleCloseModalPress = useCallback(() => bottomSheetModalRef.current?.dismiss(), []);

  const handleIssueSelection = useCallback((issue: IssueOption) => {
    bottomSheetModalRef.current?.dismiss();
    const skillMapping: Record<string, string> = { 'no-internet': 'Fiber Optic', 'slow-speed': 'Fiber Optic', 'intermittent': 'Fiber Optic', 'equipment': 'Hardware Support' };
    router.push({ pathname: '/(customer)/reportIssue', params: { issueTitle: issue.title, skillRequired: skillMapping[issue.id] || 'General' } });
  }, [router]);

  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  ), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="#001a3d" />
          <View style={styles.header}>
            <View style={styles.userInfoRow}>
              <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/(customer)/profile')}>
                <Feather name="user" size={18} color="#ffffff" />
                <View style={styles.avatarEditIndicator}><Feather name="settings" size={8} color="#ffffff" /></View>
              </TouchableOpacity>
              <View>
                <Text style={styles.headerGreeting}>Hello, Subscriber</Text>
                <Text style={styles.headerSubtitle}>Welcome back to Caawiye</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/(customer)/profile')}><Feather name="sliders" size={18} color="#ffffff" /></TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/(customer)/notifications')}><Feather name="bell" size={18} color="#ffffff" /><View style={styles.notificationBadge} /></TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}>
            {activePlan && (
              <View style={styles.broadbandCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>Active Connection</Text></View>
                  <View style={styles.wifiIconCircle}><Feather name="wifi" size={18} color="#10b981" /></View>
                </View>
                <Text style={styles.planTitle}>{activePlan.type}</Text>
                <Text style={styles.accountNumber}>Account ID: {activePlan.accountNo}</Text>
                <View style={styles.cardDivider} />
                <View style={styles.planDetailsGrid}>
                  <View style={styles.detailColumn}><Text style={styles.detailLabel}>ALLOCATED SPEED</Text><Text style={styles.detailValue}>{activePlan.speed}</Text></View>
                  <View style={[styles.detailColumn, styles.detailColumnRight]}><Text style={styles.detailLabel}>INFRASTRUCTURE</Text><Text style={[styles.detailValue, { color: '#10b981' }]}>FIBER</Text></View>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.reportBanner} onPress={handlePresentModalPress} activeOpacity={0.9}>
              <View style={styles.iconCircleBackground}><Ionicons name="construct-outline" size={20} color="#ffffff" /></View>
              <View style={styles.bannerTextContainer}><Text style={styles.bannerTitle}>Report Connection Issue</Text><Text style={styles.bannerSubtitle}>Instantly provision dispatch tickets</Text></View>
              <Feather name="chevron-right" size={20} color="#ffffff" style={{ opacity: 0.9 }} />
            </TouchableOpacity>
            <View style={styles.sectionHeaderRow}><Text style={styles.sectionTitle}>Recent Activity Log</Text></View>
            {recentActivity.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.activityCard}
                onPress={() => router.push({
                  pathname: '/(customer)/ticketDetails',
                  params: { id: item.id }
                })}
              >
                <View style={styles.activityHeader}><Text style={styles.ticketId}>{item.ticket_number}</Text><View style={styles.resolvedBadge}><Text style={styles.resolvedBadgeText}>{item.status}</Text></View></View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <View style={styles.activityFooter}><Feather name="calendar" size={12} color="#a0aec0" style={{ marginRight: 6 }} /><Text style={styles.activityDate}>{item.date}</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={snapPoints} backdropComponent={renderBackdrop} backgroundStyle={styles.sheetBackground} handleIndicatorStyle={styles.sheetIndicator}>
            <BottomSheetView style={styles.sheetContainer}>
              <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Report an Issue</Text><TouchableOpacity onPress={handleCloseModalPress} style={styles.closeButtonCircle}><Feather name="x" size={16} color="#718096" /></TouchableOpacity></View>
              <Text style={styles.sheetSubtitle}>Select the option matching your problem</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {issueOptions.map((issue) => (
                  <TouchableOpacity key={issue.id} style={styles.issueCard} onPress={() => handleIssueSelection(issue)}>
                    <View style={styles.issueIconCircle}><Feather name={issue.icon} size={18} color="#001a3d" /></View>
                    <View style={styles.issueTextContainer}>
                      <View style={styles.issueTitleRow}><Text style={styles.issueTitle}>{issue.title}</Text>{issue.hasQuickFix && <View style={styles.quickFixBadge}><Text style={styles.quickFixText}>Quick Fix</Text></View>}</View>
                      <Text style={styles.issueSubtitleText}>{issue.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: '#001a3d', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' },
  avatarEditIndicator: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#001a3d', borderRadius: 6, width: 14, height: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#10b981' },
  headerGreeting: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  headerSubtitle: { color: '#a0aec0', fontSize: 12, fontWeight: '600', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', justifyContent: 'center', alignItems: 'center' },
  notificationBadge: { position: 'absolute', top: 10, right: 11, backgroundColor: '#10b981', borderRadius: 4, width: 7, height: 7, borderWidth: 1, borderColor: '#001a3d' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  broadbandCard: { backgroundColor: '#f7fafc', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1.5, borderColor: '#e2e8f0' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { color: '#065f46', fontSize: 12, fontWeight: '700' },
  wifiIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  planTitle: { fontSize: 22, fontWeight: '800', color: '#001a3d' },
  accountNumber: { fontSize: 13, color: '#718096', fontWeight: '600', marginTop: 4 },
  cardDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 18 },
  planDetailsGrid: { flexDirection: 'row' },
  detailColumn: { flex: 1 },
  detailColumnRight: { alignItems: 'flex-end' },
  detailLabel: { fontSize: 11, color: '#a0aec0', fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  detailValue: { fontSize: 16, fontWeight: '800', color: '#001a3d' },
  reportBanner: { backgroundColor: '#10b981', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  iconCircleBackground: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  bannerSubtitle: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: '500', marginTop: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#001a3d', textTransform: 'uppercase', letterSpacing: 0.6 },
  activityCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#e2e8f0' },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { fontSize: 12, color: '#718096', fontWeight: '700' },
  resolvedBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  resolvedBadgeText: { color: '#065f46', fontSize: 11, fontWeight: '700' },
  activityTitle: { fontSize: 15, fontWeight: '700', color: '#001a3d' },
  activityFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  activityDate: { fontSize: 12, color: '#718096', fontWeight: '600' },
  sheetBackground: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#ffffff' },
  sheetIndicator: { backgroundColor: '#cbd5e0', width: 40 },
  sheetContainer: { flex: 1, paddingHorizontal: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#001a3d' },
  closeButtonCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f7fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  sheetSubtitle: { fontSize: 14, fontWeight: '500', color: '#718096', marginTop: 8, marginBottom: 20 },
  issueCard: { flexDirection: 'row', backgroundColor: '#f7fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 12 },
  issueIconCircle: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  issueTextContainer: { flex: 1 },
  issueTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  issueTitle: { fontSize: 15, fontWeight: '700', color: '#001a3d' },
  quickFixBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  quickFixText: { color: '#065f46', fontSize: 10, fontWeight: '700' },
  issueSubtitleText: { fontSize: 13, color: '#718096', fontWeight: '500', marginTop: 3 },
});