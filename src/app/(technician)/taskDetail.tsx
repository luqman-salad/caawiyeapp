import Header from '@/components/Header';
import apiClient from '@/utils/apis';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Linking,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTicketById, startTicket } from '../../services/ticketService';

type TaskLifecycleStatus = 'UNACCEPTED' | 'ASSIGNED' | 'ON_THE_WAY' | 'AUTO_DISPATCHING' | 'IN_PROGRESS' | 'DISPATCHED' | 'COMPLETED';

export default function ModernTaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskLifecycleStatus>('UNACCEPTED');
  const [updating, setUpdating] = useState(false);

  const refreshTicket = async () => {
    if (!id) return;
    try {
      const response = await getTicketById(id as string);
      if (response.success && response.data) {
        setTicket(response.data);
        setCurrentStatus(response.data.status as TaskLifecycleStatus);
      }
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  useEffect(() => {
    refreshTicket().finally(() => setLoading(false));
  }, [id]);

  const handleCall = () => ticket?.customerPhone && Linking.openURL(`tel:${ticket.customerPhone}`);
  const handleSMS = () => ticket?.customerPhone && Linking.openURL(`sms:${ticket.customerPhone}`);

  const handleNavigation = () => {
    if (ticket?.address || ticket?.landmark) {
      const location = encodeURIComponent(ticket.address || ticket.landmark);
      Linking.openURL(`maps://maps.apple.com/?q=${location}`);
    }
  };

  const handleStatusTransition = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // API call for starting the job
      if (currentStatus === 'ASSIGNED' || currentStatus === 'DISPATCHED') {
        await startTicket(ticket.id);
        await refreshTicket();
      }
      // Navigation for completing the job
      else if (currentStatus === 'IN_PROGRESS') {
        router.push({
          pathname: '/proofOfWork',
          params: { id: ticket.id, customer: ticket.customer_id }
        });
      }
    } catch (error: any) {
      console.error("Transition error:", error.response?.data || error);
      Alert.alert("Update Failed", "Server rejected the action. Please check if the ticket state is valid.");
    } finally {
      setSubmitting(false);
    }

    setUpdating(true);
    try {
      if (currentStatus === 'AUTO_DISPATCHING' || currentStatus === 'UNACCEPTED') {
        const response = await apiClient.post(`/tickets/${ticket.id}/accept`);
        if (response.data?.success) {
          setCurrentStatus('DISPATCHED');
          Alert.alert("Success", "You have accepted this task!");
        } else {
          Alert.alert("Error", response.data?.message || "Failed to accept task");
        }
      }
    } catch (error: any) {
      console.error("Status transition failed:", error);
      Alert.alert("Error", error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (updating || !ticket) return;

    Alert.alert(
      "Reject Task Offer",
      "Are you sure you want to reject this task? It will be re-assigned to another technician.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            try {
              const response = await apiClient.post(`/tickets/${ticket.id}/reject`);
              if (response.data?.success) {
                Alert.alert("Task Rejected", "You have rejected the offer.", [
                  { text: "OK", onPress: () => router.back() }
                ]);
              } else {
                Alert.alert("Error", response.data?.message || "Failed to reject task");
              }
            } catch (error: any) {
              console.error("Reject task failed:", error);
              Alert.alert("Error", error.response?.data?.message || "Could not connect to server");
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getButtonConfiguration = () => {
    switch (currentStatus) {
      case 'UNACCEPTED': case 'DISPATCHED':
        return { text: 'Confirm & Assign', icon: 'arrow-right-circle' as const };
      case 'ASSIGNED': return { text: 'Start Job', icon: 'play-circle' as const };
      case 'IN_PROGRESS': return { text: 'Complete Job', icon: 'check-square' as const };
      default: return { text: 'Status: ' + currentStatus, icon: 'info' as const };
    }
  };

  const getStatusDisplayMeta = () => {
    switch (currentStatus) {
      case 'DISPATCHED': return { text: 'DISPATCHED', badgeStyle: styles.badgeAssigned, textStyle: styles.textAssigned };
      case 'ASSIGNED': return { text: 'ASSIGNED', badgeStyle: styles.badgeAssigned, textStyle: styles.textAssigned };
      case 'IN_PROGRESS': return { text: 'IN PROGRESS', badgeStyle: styles.badgeInProgress, textStyle: styles.textInProgress };
      default: return { text: currentStatus || 'UNKNOWN', badgeStyle: styles.badgeUnaccepted, textStyle: styles.textUnaccepted };
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#00b047" /></View>;

  const buttonConfig = getButtonConfiguration();
  const statusMeta = getStatusDisplayMeta();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Task Overview" showBack={true} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Journey Progress</Text>
          <View style={[styles.assignedBadge, statusMeta.badgeStyle]}>
            <Text style={[styles.assignedBadgeText, statusMeta.textStyle]}>{statusMeta.text}</Text>
          </View>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.customerProfileHeaderRow}>
            <View style={styles.avatarGlassBlock}><Feather name="user" size={22} color="#00b047" /></View>
            <View style={styles.customerMetaTextCol}>
              <Text style={styles.metaSecondaryLabel}>Ticket Number</Text>
              <Text style={styles.metaPrimaryValue}>{ticket?.ticket_number || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.inlineMetricsGrid}>
            <View style={styles.metricColumnHalf}>
              <Text style={styles.metaSecondaryLabel}>Category</Text>
              <View style={styles.iconValueInlineRow}>
                <Feather name="settings" size={14} color="#64748b" style={styles.inlineGapIcon} />
                <Text style={styles.metaPrimaryValueSmall}>{ticket?.category || 'N/A'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.communicationActionTray}>
            <TouchableOpacity
              style={[styles.trayButtonSecondary, !ticket?.customerPhone && { opacity: 0.5 }]}
              onPress={handleCall}
              disabled={!ticket?.customerPhone}
            >
              <Text style={styles.trayButtonSecondaryText}>Voice Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.trayButtonSecondary, !ticket?.customerPhone && { opacity: 0.5 }]}
              onPress={handleSMS}
              disabled={!ticket?.customerPhone}
            >
              <Text style={styles.trayButtonSecondaryText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#fef2f2' }]}><Feather name="map-pin" size={16} color="#ef4444" /></View>
            <Text style={styles.sectionHeaderLabelText}>Site Location</Text>
          </View>
          <Text style={styles.addressDisplayParagraph}>{ticket?.landmark || 'No location specified'}</Text>
          <TouchableOpacity style={styles.primaryModernButton} onPress={handleNavigation}>
            <Feather name="navigation" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryModernButtonText}>Launch Navigation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#eff6ff' }]}><Feather name="alert-circle" size={16} color="#2563eb" /></View>
            <Text style={styles.sectionHeaderLabelText}>Job Description</Text>
          </View>
          <Text style={styles.descriptionContextPara}>{ticket?.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.persistentBottomDock}>
        <TouchableOpacity
          style={[styles.dockActionButtonCTA, submitting && { opacity: 0.6 }]}
          onPress={handleStatusTransition}
          disabled={submitting}
        >
          <Feather name={buttonConfig.icon} size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.dockActionButtonCTAText}>
            {submitting ? 'Updating...' : buttonConfig.text}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  statusLabel: { fontSize: 14, color: '#475569', fontWeight: '600' },
  assignedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  assignedBadgeText: { fontSize: 12, fontWeight: '700' },
  badgeUnaccepted: { backgroundColor: '#fee2e2' }, textUnaccepted: { color: '#ef4444' },
  badgeAssigned: { backgroundColor: '#e0f2fe' }, textAssigned: { color: '#0369a1' },
  badgeOnTheWay: { backgroundColor: '#fef3c7' }, textOnTheWay: { color: '#b45309' },
  badgeInProgress: { backgroundColor: '#dcfce7' }, textInProgress: { color: '#15803d' },
  premiumCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  customerProfileHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  avatarGlassBlock: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e6f7ed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  customerMetaTextCol: { flex: 1 },
  metaSecondaryLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  metaPrimaryValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  dividerLine: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
  inlineMetricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricColumnHalf: { flex: 1 },
  iconValueInlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  inlineGapIcon: { marginRight: 6 },
  metaPrimaryValueSmall: { fontSize: 15, fontWeight: '700', color: '#334155' },
  communicationActionTray: { flexDirection: 'row', justifyContent: 'space-between' },
  trayButtonSecondary: { flex: 0.48, flexDirection: 'row', backgroundColor: '#f0fdf4', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trayButtonSecondaryText: { color: '#00b047', fontSize: 13, fontWeight: '700' },
  cardSectionTitleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  miniHeaderIconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionHeaderLabelText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  addressDisplayParagraph: { fontSize: 15, color: '#475569', fontWeight: '500', lineHeight: 22, marginBottom: 14 },
  primaryModernButton: { backgroundColor: '#00b047', borderRadius: 12, height: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  primaryModernButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  descriptionContextPara: { fontSize: 14, color: '#475569', fontWeight: '500', lineHeight: 22 },

  persistentBottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  dockActionButtonCTA: { backgroundColor: '#00b047', borderRadius: 14, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dockActionButtonCTAText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },

  offerButtonRow: { flexDirection: 'row', justifyContent: 'space-between' }
});