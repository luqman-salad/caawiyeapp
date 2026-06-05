import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getTicketById } from '../../services/ticketService';
import { apiClient } from '../../utils/apis';
import Header from '../../components/Header';

type TaskLifecycleStatus = 'UNACCEPTED' | 'AUTO_DISPATCHING' | 'ASSIGNED' | 'DISPATCHED' | 'ON_THE_WAY' | 'IN_PROGRESS';

export default function ModernTaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<TaskLifecycleStatus>('UNACCEPTED');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getTicketById(id as string);
        if (response.success) {
          setTicket(response.data);
          if (response.data.status) setCurrentStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleCall = () => ticket?.customerPhone && Linking.openURL(`tel:${ticket.customerPhone}`);
  const handleSMS = () => ticket?.customerPhone && Linking.openURL(`sms:${ticket.customerPhone}`);
  
  const handleNavigation = () => {
    if (ticket?.address) {
      const encodedAddress = encodeURIComponent(ticket.address);
      const url = Platform.OS === 'ios'
        ? `maps://maps.apple.com/?q=${encodedAddress}`
        : `geo:0,0?q=${encodedAddress}`;
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open maps:", err);
        Alert.alert("Maps Error", "Could not open map application on your device.");
      });
    }
  };

  const handleStatusTransition = async () => {
    if (updating || !ticket) return;
    
    // Once accepted, the next and only status is Complete (via proof of work screen)
    if (currentStatus === 'DISPATCHED' || currentStatus === 'ASSIGNED' || currentStatus === 'ON_THE_WAY' || currentStatus === 'IN_PROGRESS') {
      router.push({
        pathname: '/(technician)/proofOfWork',
        params: { id: ticket.id, customer: ticket.customerName }
      });
      return;
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
      case 'UNACCEPTED': 
      case 'AUTO_DISPATCHING': 
        return { text: 'Confirm & Accept Task', icon: 'arrow-right-circle' as const };
      case 'ASSIGNED': 
      case 'DISPATCHED': 
      case 'ON_THE_WAY': 
      case 'IN_PROGRESS': 
        return { text: 'Mark as Completed', icon: 'check-square' as const };
      default: 
        return { text: 'Task Completed', icon: 'alert-circle' as const };
    }
  };

  const getStatusDisplayMeta = () => {
    switch (currentStatus) {
      case 'UNACCEPTED': 
      case 'AUTO_DISPATCHING': 
        return { text: 'OFFER RECEIVED', badgeStyle: styles.badgeUnaccepted, textStyle: styles.textUnaccepted };
      case 'ASSIGNED': 
      case 'DISPATCHED': 
      case 'ON_THE_WAY': 
      case 'IN_PROGRESS': 
        return { text: 'ACCEPTED / WORK IN PROGRESS', badgeStyle: styles.badgeInProgress, textStyle: styles.textInProgress };
      default: 
        return { text: currentStatus || 'UNKNOWN', badgeStyle: styles.badgeUnaccepted, textStyle: styles.textUnaccepted };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00b047" />
      </View>
    );
  }

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
              <Text style={styles.metaSecondaryLabel}>Customer Name</Text>
              <Text style={styles.metaPrimaryValue}>{ticket?.customerName || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.inlineMetricsGrid}>
            <View style={styles.metricColumnHalf}>
              <Text style={styles.metaSecondaryLabel}>Service Requested</Text>
              <View style={styles.iconValueInlineRow}>
                <Feather name="settings" size={14} color="#64748b" style={styles.inlineGapIcon} />
                <Text style={styles.metaPrimaryValueSmall}>{ticket?.serviceType || 'N/A'}</Text>
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
            <Text style={styles.sectionHeaderLabelText}>Site Location Address</Text>
          </View>
          <Text style={styles.addressDisplayParagraph}>{ticket?.address || 'No address provided'}</Text>
          <TouchableOpacity style={styles.primaryModernButton} onPress={handleNavigation}>
            <Feather name="navigation" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryModernButtonText}>Launch Navigation Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#eff6ff' }]}><Feather name="alert-circle" size={16} color="#2563eb" /></View>
            <Text style={styles.sectionHeaderLabelText}>Job Scope Description</Text>
          </View>
          <Text style={styles.descriptionContextPara}>{ticket?.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.persistentBottomDock}>
        {updating ? (
          <ActivityIndicator size="small" color="#00b047" style={{ paddingVertical: 12 }} />
        ) : (currentStatus === 'AUTO_DISPATCHING' || currentStatus === 'UNACCEPTED') ? (
          <View style={styles.offerButtonRow}>
            <TouchableOpacity 
              style={[styles.dockActionButtonCTA, { flex: 1, backgroundColor: '#00b047', marginRight: 8 }]} 
              onPress={handleStatusTransition}
            >
              <Feather name={buttonConfig.icon} size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.dockActionButtonCTAText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dockActionButtonCTA, { flex: 1, backgroundColor: '#ef4444' }]} 
              onPress={handleReject}
            >
              <Feather name="x-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.dockActionButtonCTAText}>Reject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.dockActionButtonCTA} onPress={handleStatusTransition}>
            <Feather name={buttonConfig.icon} size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.dockActionButtonCTAText}>{buttonConfig.text}</Text>
          </TouchableOpacity>
        )}
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