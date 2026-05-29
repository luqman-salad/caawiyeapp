import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TechnicianTrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      {/* --- MAP SIMULATION VIEWPORT BACKGROUND --- */}
      <View style={styles.mapCanvasBackground}>
        {/* Vector Grid Overlay Blueprint Lines */}
        <View style={styles.mapGridPatternHorizontal} />
        <View style={styles.mapGridPatternHorizontal2} />
        <View style={styles.mapGridPatternVertical} />
        <View style={styles.mapGridPatternVertical2} />

        {/* Tracking En Route Trajectory Dash Line */}
        <View style={styles.trajectoryPathContainer}>
          <View style={[styles.dashSegment, { transform: [{ rotate: '65deg' }] }]} />
        </View>

        {/* Dynamic En-Route Navigation Pointer Beacon */}
        <View style={styles.navigationPointerBeacon}>
          <Feather name="navigation" size={16} color="#ffffff" style={styles.pointerIconStyle} />
        </View>

        {/* FLOATING FLOOD HEADER OVERLAY */}
        <SafeAreaView style={styles.floatingHeaderSafeArea} edges={['top']}>
          <TouchableOpacity 
            style={styles.floatingHeaderCard}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={18} color="#0f172a" />
            <Text style={styles.floatingHeaderTitle}>Technician is en route</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* --- LIVE STATUS PANEL SHEET --- */}
      <View style={styles.statusPanelSheet}>
        {/* Central Drag Notch Cosmetic Anchor */}
        <View style={styles.sheetPanelNotchLine} />

        {/* Arrival ETA Summary Metadata */}
        <Text style={styles.etaLabelText}>Estimated Arrival</Text>
        <Text style={styles.etaTimeText}>12 Minutes</Text>

        <Text style={styles.etaDetailsSubText}>
          <Text style={styles.boldNumbers}>0</Text> days  •  <Text style={styles.boldNumbers}>0</Text> hours  •  <Text style={styles.greenNumbers}>12</Text> mins remaining
        </Text>

        <View style={styles.panelDividerLine} />

        {/* Dispatch Technician Identity Card Layout */}
        <View style={styles.technicianIdentityCardRow}>
          <View style={styles.avatarCircleContainer}>
            <Text style={styles.avatarInitialsText}>AS</Text>
          </View>

          <View style={styles.technicianMetaTextColumn}>
            <Text style={styles.technicianNameText}>Eng. Abdi Shakuur</Text>
            <View style={styles.ratingExpertiseBadgeRow}>
              <Feather name="star" size={14} color="#00b047" />
              <Text style={styles.ratingNumberValue}>4.9</Text>
              <Text style={styles.bulletSeparatorDot}>•</Text>
              <Text style={styles.specializationTitleText}>Fiber Splicing Specialist</Text>
            </View>
          </View>
        </View>

        <View style={styles.panelDividerLine} />

        {/* ACTION INTERACTION BUTTON PANEL CONTROL FOOTER */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.callButtonContainer} activeOpacity={0.8}>
            <Feather name="phone" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButtonContainer} activeOpacity={0.8}>
            <Feather name="message-square" size={16} color="#1e293b" style={{ marginRight: 8 }} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.progressPrimaryButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/progress')}
        >
          <Text style={styles.progressPrimaryButtonText}>View Work Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // --- Simulated Map Layout Rules ---
  mapCanvasBackground: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Soft blueprint canvas theme base
    position: 'relative',
  },
  mapGridPatternHorizontal: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  mapGridPatternHorizontal2: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  mapGridPatternVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '35%',
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  mapGridPatternVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  trajectoryPathContainer: {
    position: 'absolute',
    bottom: '25%',
    left: '35%',
    width: 140,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashSegment: {
    width: 2,
    height: 240,
    backgroundColor: '#00b047',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  navigationPointerBeacon: {
    position: 'absolute',
    top: '30%',
    right: '28%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pointerIconStyle: {
    transform: [{ rotate: '45deg' }],
  },
  // --- Floating Top Header Rule Card ---
  floatingHeaderSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  floatingHeaderCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 14,
  },
  // --- Bottom Track Context Sheet Layout ---
  statusPanelSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetPanelNotchLine: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f1f5f9',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  etaLabelText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  etaTimeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  etaDetailsSubText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 6,
  },
  boldNumbers: {
    color: '#0f172a',
    fontWeight: '700',
  },
  greenNumbers: {
    color: '#00b047',
    fontWeight: '700',
  },
  panelDividerLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  // --- Identity Panel Cards ---
  technicianIdentityCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircleContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitialsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  technicianMetaTextColumn: {
    flex: 1,
  },
  technicianNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  ratingExpertiseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingNumberValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 4,
  },
  bulletSeparatorDot: {
    fontSize: 12,
    color: '#94a3b8',
    marginHorizontal: 6,
  },
  specializationTitleText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  // --- Interactive CTA Matrix controls ---
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  callButtonContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  messageButtonContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messageButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '700',
  },
  progressPrimaryButton: {
    backgroundColor: '#00b047',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});