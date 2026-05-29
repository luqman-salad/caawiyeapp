import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const taskDetails = {
  id: 'T001',
  customerName: 'John Smith',
  phone: '+1 (555) 123-4567',
  serviceType: 'Internet Troubleshooting',
  scheduledTime: '10:00 AM',
  address: '123 Main St, Downtown, City 12345',
  description: 'Red LOS (Loss of Signal) light blinking on the ONU/ONT device. Customer reports complete loss of connection since yesterday evening. Suspected fiber bend or drop-cable attenuation issue.',
  requiredTools: ['Fiber Optical Power Meter', 'Visual Fault Locator (VFL)', 'Fiber Splice Machine', 'Replacement Patch Cord', 'RJ45 Crimping Tool'],
  safetyAlerts: 'Do not look directly into the fiber optic cable or laser aperture port to prevent permanent eye damage.',
};

// Define valid operational technician journey milestones
type TaskLifecycleStatus = 'UNACCEPTED' | 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS';

export default function ModernTaskDetailsScreen() {
  const router = useRouter();
  
  // Initialize task lifecycle tracking state
  const [currentStatus, setCurrentStatus] = useState<TaskLifecycleStatus>('UNACCEPTED');

  const handleCall = () => Linking.openURL(`tel:${taskDetails.phone}`);
  const handleSMS = () => Linking.openURL(`sms:${taskDetails.phone}`);
  
  const handleNavigation = () => {
    const encodedAddress = encodeURIComponent(taskDetails.address);
    Linking.openURL(`maps://maps.apple.com/?q=${encodedAddress}`);
  };

  // State Machine logic transitioning label copy and indicators step by step
  const handleStatusTransition = () => {
    switch (currentStatus) {
      case 'UNACCEPTED':
        setCurrentStatus('ASSIGNED');
        break;
      case 'ASSIGNED':
        setCurrentStatus('ON_THE_WAY');
        break;
      case 'ON_THE_WAY':
        setCurrentStatus('IN_PROGRESS');
        break;
      case 'IN_PROGRESS':
        // Final action paths forward out to the proof of work uploading workflow
        router.push({
          pathname: '/proofOfWork',
          params: { id: taskDetails.id, customer: taskDetails.customerName }
        });
        break;
    }
  };

  // Helper selectors returning text parameters based on the current active index point
  const getButtonConfiguration = () => {
    switch (currentStatus) {
      case 'UNACCEPTED':
        return { text: 'Confirm & Assign Task', icon: 'arrow-right-circle' as const };
      case 'ASSIGNED':
        return { text: 'Mark as On the Way', icon: 'truck' as const };
      case 'ON_THE_WAY':
        return { text: 'Mark as In Progress', icon: 'play-circle' as const };
      case 'IN_PROGRESS':
        return { text: 'Mark as Completed', icon: 'check-square' as const };
    }
  };

  const getStatusDisplayMeta = () => {
    switch (currentStatus) {
      case 'UNACCEPTED':
        return { text: 'UNACCEPTED', badgeStyle: styles.badgeUnaccepted, textStyle: styles.textUnaccepted };
      case 'ASSIGNED':
        return { text: 'ASSIGNED', badgeStyle: styles.badgeAssigned, textStyle: styles.textAssigned };
      case 'ON_THE_WAY':
        return { text: 'ON THE WAY', badgeStyle: styles.badgeOnTheWay, textStyle: styles.textOnTheWay };
      case 'IN_PROGRESS':
        return { text: 'IN PROGRESS', badgeStyle: styles.badgeInProgress, textStyle: styles.textInProgress };
    }
  };

  const buttonConfig = getButtonConfiguration();
  const statusMeta = getStatusDisplayMeta();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />


      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Status Display Panel Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Journey Progress</Text>
          <View style={[styles.assignedBadge, statusMeta.badgeStyle]}>
            <Text style={[styles.assignedBadgeText, statusMeta.textStyle]}>{statusMeta.text}</Text>
          </View>
        </View>

        {/* CUSTOMER PROFILE CARD */}
        <View style={styles.premiumCard}>
          <View style={styles.customerProfileHeaderRow}>
            <View style={styles.avatarGlassBlock}>
              <Feather name="user" size={22} color="#00b047" />
            </View>
            <View style={styles.customerMetaTextCol}>
              <Text style={styles.metaSecondaryLabel}>Customer Name</Text>
              <Text style={styles.metaPrimaryValue}>{taskDetails.customerName}</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          {/* Service info row metrics */}
          <View style={styles.inlineMetricsGrid}>
            <View style={styles.metricColumnHalf}>
              <Text style={styles.metaSecondaryLabel}>Service Requested</Text>
              <View style={styles.iconValueInlineRow}>
                <Feather name="settings" size={14} color="#64748b" style={styles.inlineGapIcon} />
                <Text style={styles.metaPrimaryValueSmall}>{taskDetails.serviceType}</Text>
              </View>
            </View>
            <View style={styles.metricColumnHalf}>
              <Text style={styles.metaSecondaryLabel}>Scheduled Arrival</Text>
              <View style={styles.iconValueInlineRow}>
                <Feather name="clock" size={14} color="#64748b" style={styles.inlineGapIcon} />
                <Text style={styles.metaPrimaryValueSmall}>{taskDetails.scheduledTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerLine} />

          {/* UTILITY COMMUNICATIONS ACTION TRAY */}
          <View style={styles.communicationActionTray}>
            <TouchableOpacity style={styles.trayButtonSecondary} onPress={handleCall} activeOpacity={0.7}>
              <Feather name="phone" size={16} color="#00b047" style={{ marginRight: 6 }} />
              <Text style={styles.trayButtonSecondaryText}>Voice Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trayButtonSecondary} onPress={handleSMS} activeOpacity={0.7}>
              <Feather name="message-square" size={16} color="#00b047" style={{ marginRight: 6 }} />
              <Text style={styles.trayButtonSecondaryText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOCATION & SMART ROUTING CARD */}
        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#fef2f2' }]}>
              <Feather name="map-pin" size={16} color="#ef4444" />
            </View>
            <Text style={styles.sectionHeaderLabelText}>Site Location Address</Text>
          </View>
          
          <Text style={styles.addressDisplayParagraph}>{taskDetails.address}</Text>
          
          <TouchableOpacity 
            style={styles.primaryModernButton} 
            onPress={handleNavigation}
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryModernButtonText}>Launch Navigation Maps</Text>
          </TouchableOpacity>
        </View>

        {/* ISSUE OVERVIEW DESCRIPTION CARD */}
        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#eff6ff' }]}>
              <Feather name="alert-circle" size={16} color="#2563eb" />
            </View>
            <Text style={styles.sectionHeaderLabelText}>Job Scope Description</Text>
          </View>
          <Text style={styles.descriptionContextPara}>{taskDetails.description}</Text>
        </View>

        {/* PRE-REQUISITE PARTS & TOOLS CHECKLIST */}
        <View style={styles.premiumCard}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#f0fdf4' }]}>
              <Feather name="tool" size={16} color="#16a34a" />
            </View>
            <Text style={styles.sectionHeaderLabelText}>Required Truck Stock & Tools</Text>
          </View>
          <Text style={styles.informationalHelperText}>Ensure these materials are loaded before transit:</Text>
          <View style={styles.toolsGridWrap}>
            {taskDetails.requiredTools.map((tool, index) => (
              <View key={index} style={styles.toolChipBadge}>
                <Feather name="check" size={12} color="#16a34a" style={{ marginRight: 4 }} />
                <Text style={styles.toolChipBadgeText}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* COMPLIANCE & PROTOCOL BRIEFING */}
        <View style={[styles.premiumCard, { borderColor: '#fed7aa', borderWidth: 1, backgroundColor: '#fffbfe' }]}>
          <View style={styles.cardSectionTitleHeaderRow}>
            <View style={[styles.miniHeaderIconBox, { backgroundColor: '#ffedd5' }]}>
              <Feather name="shield" size={16} color="#ea580c" />
            </View>
            <Text style={[styles.sectionHeaderLabelText, { color: '#c2410c' }]}>Safety Protocol Warning</Text>
          </View>
          <Text style={styles.safetyBriefingParagraphText}>{taskDetails.safetyAlerts}</Text>
        </View>
      </ScrollView>

      {/* DYNAMIC ADAPTIVE BOTTOM DOCK PERSISTENT BUTTON */}
      <View style={styles.persistentBottomDock}>
        <TouchableOpacity 
          style={styles.dockActionButtonCTA} 
          onPress={handleStatusTransition}
          activeOpacity={0.8}
        >
          <Feather 
            name={buttonConfig.icon} 
            size={18} 
            color="#ffffff" 
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.dockActionButtonCTAText}>
            {buttonConfig.text}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButtonIcon: {
    padding: 6,
  },
  headerCenterTitleText: {
    flex: 1,
    marginLeft: 12,
  },
  mainNavTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  subNavId: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadgeInline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  // Color State Profiles for Badges
  badgeUnaccepted: { backgroundColor: '#f1f5f9' },
  textUnaccepted: { color: '#475569' },
  badgeAssigned: { backgroundColor: '#e0f2fe' },
  textAssigned: { color: '#0369a1' },
  badgeOnTheWay: { backgroundColor: '#fef3c7' },
  textOnTheWay: { color: '#b45309' },
  badgeInProgress: { backgroundColor: '#dcfce7' },
  textInProgress: { color: '#15803d' },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  assignedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  assignedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 10,
    elevation: 2,
  },
  customerProfileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGlassBlock: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e6f7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerMetaTextCol: {
    flex: 1,
  },
  metaSecondaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  metaPrimaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  inlineMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricColumnHalf: {
    flex: 1,
  },
  iconValueInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  inlineGapIcon: {
    marginRight: 6,
  },
  metaPrimaryValueSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  communicationActionTray: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trayButtonSecondary: {
    flex: 0.48,
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trayButtonSecondaryText: {
    color: '#00b047',
    fontSize: 13,
    fontWeight: '700',
  },
  cardSectionTitleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniHeaderIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionHeaderLabelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  addressDisplayParagraph: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 14,
  },
  primaryModernButton: {
    backgroundColor: '#00b047',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryModernButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionContextPara: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 22,
  },
  informationalHelperText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
  },
  toolsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  toolChipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    margin: 4,
  },
  toolChipBadgeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  safetyBriefingParagraphText: {
    fontSize: 13,
    color: '#9a3412',
    fontWeight: '600',
    lineHeight: 18,
  },
  persistentBottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  dockActionButtonCTA: {
    backgroundColor: '#00b047',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockActionButtonCTAText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});