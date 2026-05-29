import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router'; // Template routing system hook
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

interface ActivityItem {
  id: string;
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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);

  // --- MOCK SUBSCRIPTION DATA ---
  const [activePlan, setActivePlan] = useState<BroadbandPlan | null>({
    accountNo: 'FSM-28491',
    speed: '100 Mbps',
    type: 'Premium FTTH',
    isActive: true,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([
    {
      id: 'TK-88391',
      title: 'Fiber connection restored',
      date: 'May 18, 2026',
      status: 'Resolved',
    },
    {
      id: 'TK-88345',
      title: 'Router configuration updated',
      date: 'May 12, 2026',
      status: 'Resolved',
    },
  ]);

  const issueOptions: IssueOption[] = [
    {
      id: 'no-internet',
      title: 'No Internet Connection',
      subtitle: 'Complete outage or no connectivity',
      icon: 'wifi',
      hasQuickFix: true,
    },
    {
      id: 'slow-speed',
      title: 'Slow Connection Speed',
      subtitle: 'Lower than expected performance',
      icon: 'zap',
      hasQuickFix: true,
    },
    {
      id: 'intermittent',
      title: 'Intermittent Connection',
      subtitle: 'Connection keeps dropping',
      icon: 'bar-chart-2',
      hasQuickFix: false,
    },
    {
      id: 'equipment',
      title: 'Equipment Issue',
      subtitle: 'Router or hardware problem',
      icon: 'sliders',
      hasQuickFix: false,
    },
  ];

  // --- ACTIONS & INTERACTION HANDLERS ---
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // CONFIRMATION POPUP SYSTEM
  const handleIssueSelection = useCallback((issue: IssueOption) => {
    Alert.alert(
      "Confirm Report",
      `Are you sure you want to report "${issue.title}"? A technician track ticket will be generated automatically.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Report",
          style: "destructive",
          onPress: () => {
            // 1. Close out the active sheet transition layout context
            bottomSheetModalRef.current?.dismiss();
            
            // 2. Redirect to the tracking status viewport layout screen mapping
            router.push('/(customer)/tracking'); // Adjust route destination mapping paths as necessary
          }
        }
      ],
      { cancelable: true }
    );
  }, [router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="#0b1e33" />

          {/* PREMIUM BRANDED HEADER */}
          <View style={styles.header}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerGreeting}>Hello, Subscriber</Text>
                <Text style={styles.headerSubtitle}>Welcome back to Caawiye</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}
              onPress={() => router.push('/(customer)/notifications')}
            >
              <Feather name="bell" size={20} color="#ffffff" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b047" />
            }
          >
            {/* BROADBAND PLAN CARD */}
            {activePlan ? (
              <View style={styles.broadbandCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                  <View style={styles.wifiIconCircle}>
                    <Feather name="wifi" size={20} color="#00b047" />
                  </View>
                </View>

                <Text style={styles.planTitle}>{activePlan.type} Broadband</Text>
                <Text style={styles.accountNumber}>Account #{activePlan.accountNo}</Text>

                <View style={styles.cardDivider} />

                <View style={styles.planDetailsGrid}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>SPEED</Text>
                    <Text style={styles.detailValue}>{activePlan.speed}</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>PLAN TYPE</Text>
                    <Text style={styles.detailValue}>{activePlan.type.split(' ')[0]}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCardContainer}>
                <Feather name="activity" size={24} color="#94a3b8" />
                <Text style={styles.emptyCardTitle}>No Active Subscription</Text>
              </View>
            )}

            {/* ACTION INTERACTION REPORT BANNER */}
            <TouchableOpacity
              style={styles.reportBanner}
              onPress={handlePresentModalPress}
              activeOpacity={0.9}
            >
              <View style={styles.iconCircleBackground}>
                <Feather name="wifi" size={20} color="#ffffff" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Report Connection Issue</Text>
                <Text style={styles.bannerSubtitle}>Get instant technical support</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ffffff" style={{ opacity: 0.9 }} />
            </TouchableOpacity>

            {/* TIMELINE SECTION CONTAINER */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.6}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.ticketId}>{item.id}</Text>
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedBadgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
            ))}
          </ScrollView>

          {/* ASYNC BOTTOM GESTURE SHEET COMPONENT FROM TEMPLATE */}
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.sheetIndicator}
          >
            <BottomSheetView style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Report an Issue</Text>
                <TouchableOpacity 
                  onPress={handleCloseModalPress} 
                  style={styles.closeButtonCircle}
                >
                  <Feather name="x" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetSubtitle}>Select the issue you're experiencing</Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
                {issueOptions.map((issue) => (
                  <TouchableOpacity 
                    key={issue.id} 
                    style={styles.issueCard}
                    activeOpacity={0.7}
                    onPress={() => handleIssueSelection(issue)} // Pops prompt alert instantly
                  >
                    <View style={styles.issueIconCircle}>
                      <Feather name={issue.icon} size={20} color="#475569" />
                    </View>
                    
                    <View style={styles.issueTextContainer}>
                      <View style={styles.issueTitleRow}>
                        <Text style={styles.issueTitle}>{issue.title}</Text>
                        {issue.hasQuickFix && (
                          <View style={styles.quickFixBadge}>
                            <Text style={styles.quickFixText}>Quick Fix Available</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.issueSubtitleText}>{issue.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.selfServiceButton} activeOpacity={0.8}>
                  <Text style={styles.selfServiceButtonText}>Try Self-Service Troubleshooting</Text>
                </TouchableOpacity>
              </ScrollView>
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0b1e33',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00b047',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerGreeting: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    backgroundColor: '#00b047',
    borderRadius: 4,
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: '#0b1e33',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  broadbandCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00b047',
    marginRight: 6,
  },
  statusText: {
    color: '#00b047',
    fontSize: 13,
    fontWeight: '700',
  },
  wifiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  accountNumber: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  planDetailsGrid: {
    flexDirection: 'row',
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  reportBanner: {
    backgroundColor: '#00b047',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleBackground: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#00b047',
    fontSize: 14,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  resolvedBadge: {
    backgroundColor: '#e6f7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolvedBadgeText: {
    color: '#00b047',
    fontSize: 11,
    fontWeight: '700',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  activityDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyCardContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCardTitle: {
    color: '#64748b',
    marginTop: 8,
  },

  // --- TEMPLATE HOOK BOTTOM SHEET STYLES ---
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
  },
  sheetIndicator: {
    backgroundColor: '#e2e8f0',
    width: 38,
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 10,
    marginBottom: 16,
  },
  sheetScrollContent: {
    paddingBottom: 40,
  },
  issueCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  issueIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  issueTextContainer: {
    flex: 1,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  quickFixBadge: {
    backgroundColor: '#e6f7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quickFixText: {
    color: '#00b047',
    fontSize: 11,
    fontWeight: '700',
  },
  issueSubtitleText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  selfServiceButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  selfServiceButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
  },
});