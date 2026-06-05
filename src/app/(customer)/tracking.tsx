import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTicketById } from '../../services/ticketService';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Header from '../../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TechnicianTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    if (!id) return;
    try {
      const response = await getTicketById(id as string);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (err) {
      console.error("Error fetching ticket in tracking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCall = () => {
    if (ticket?.technicianPhone) {
      Linking.openURL(`tel:${ticket.technicianPhone}`);
    }
  };

  const handleMessage = () => {
    if (ticket?.technicianPhone) {
      Linking.openURL(`sms:${ticket.technicianPhone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b047" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No active tracking details available.</Text>
      </View>
    );
  }

  // Get Initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "Tech";
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title="Live Tracking" showBack={true} />

      {/* --- REAL GOOGLE MAP VIEWPORT BACKGROUND --- */}
      <View style={styles.mapCanvasBackground}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: ticket.latitude || 2.0333,
            longitude: ticket.longitude || 45.3500,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          customMapStyle={mapStyle}
        >
          {/* Customer Location Marker */}
          <Marker
            coordinate={{
              latitude: ticket.latitude || 2.0333,
              longitude: ticket.longitude || 45.3500,
            }}
            title="Your Location"
            description={ticket.address || "Service Destination"}
            pinColor="#ef4444"
          />

          {/* Technician Location Marker */}
          {ticket.technicianLatitude && ticket.technicianLongitude && ticket.technicianLatitude !== 0 && (
            <Marker
              coordinate={{
                latitude: ticket.technicianLatitude,
                longitude: ticket.technicianLongitude,
              }}
              title={ticket.technicianName || "Technician"}
              description="Last reported position"
            >
              <View style={styles.technicianMarker}>
                <Feather name="truck" size={16} color="#ffffff" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* --- LIVE STATUS PANEL SHEET --- */}
      <View style={styles.statusPanelSheet}>
        {/* Central Drag Notch Cosmetic Anchor */}
        <View style={styles.sheetPanelNotchLine} />

        {/* Arrival ETA Summary Metadata */}
        <Text style={styles.etaLabelText}>Estimated Arrival</Text>
        <Text style={styles.etaTimeText}>{ticket.status === 'ON_THE_WAY' ? '12 Minutes' : 'Arrived'}</Text>

        <Text style={styles.etaDetailsSubText}>
          <Text style={styles.boldNumbers}>0</Text> days  •  <Text style={styles.boldNumbers}>0</Text> hours  •  <Text style={styles.greenNumbers}>{ticket.status === 'ON_THE_WAY' ? '12' : '0'}</Text> mins remaining
        </Text>

        <View style={styles.panelDividerLine} />

        {/* Dispatch Technician Identity Card Layout */}
        <View style={styles.technicianIdentityCardRow}>
          <View style={styles.avatarCircleContainer}>
            <Text style={styles.avatarInitialsText}>{getInitials(ticket.technicianName || 'Technician')}</Text>
          </View>

          <View style={styles.technicianMetaTextColumn}>
            <Text style={styles.technicianNameText}>{ticket.technicianName || 'Field Technician'}</Text>
            <View style={styles.ratingExpertiseBadgeRow}>
              <Feather name="star" size={14} color="#00b047" />
              <Text style={styles.ratingNumberValue}>{ticket.technicianRating?.toFixed(1) || '5.0'}</Text>
              <Text style={styles.bulletSeparatorDot}>•</Text>
              <Text style={styles.specializationTitleText}>{ticket.category || 'Specialist'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panelDividerLine} />

        {/* ACTION INTERACTION BUTTON PANEL CONTROL FOOTER */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.callButtonContainer, !ticket.technicianPhone && { backgroundColor: '#cbd5e0' }]} 
            activeOpacity={0.8}
            onPress={handleCall}
            disabled={!ticket.technicianPhone}
          >
            <Feather name="phone" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.messageButtonContainer, !ticket.technicianPhone && { backgroundColor: '#e2e8f0' }]} 
            activeOpacity={0.8}
            onPress={handleMessage}
            disabled={!ticket.technicianPhone}
          >
            <Feather name="message-square" size={16} color="#1e293b" style={{ marginRight: 8 }} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.progressPrimaryButton} 
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: '/(customer)/progress',
            params: { id: ticket.id }
          })}
        >
          <Text style={styles.progressPrimaryButtonText}>View Work Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  technicianMarker: {
    backgroundColor: '#00b047',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  }
];