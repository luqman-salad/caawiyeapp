import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { getTicketById } from '../../services/ticketService';

interface TicketData {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  landmark: string;
  otp_code: string;
  created_at: string;
  latitude: number;
  longitude: number;
  technician_id?: string | null;
  technicianName?: string;
  technicianPhone?: string;
  technicianRating?: number;
  technicianLatitude?: number;
  technicianLongitude?: number;
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const response = await getTicketById(id as string);
      if (response.success) {
        setTicket(response.data);
      } else {
        setErrorMessage(response.message || "Failed to load ticket");
      }
    } catch (err) {
      setErrorMessage("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();

    // Poll for status updates if ticket is in reporting or dispatching state
    const interval = setInterval(() => {
      if (ticket && (ticket.status === 'REPORTED' || ticket.status === 'AUTO_DISPATCHING')) {
        fetchDetails();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, ticket?.status]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ticket details not available.</Text>
      </View>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'REPORTED':
      case 'AUTO_DISPATCHING':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'COMPLETED':
      case 'RESOLVED':
        return { bg: '#d1fae5', text: '#059669' };
      default:
        return { bg: '#eff6ff', text: '#2563eb' };
    }
  };

  const statusStyle = getStatusBadgeStyle(ticket.status);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ticket Details" showBack={true} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* Main Title Block */}
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{ticket.status}</Text>
          </View>
          <Text style={styles.title}>{ticket.title}</Text>
          <Text style={styles.ticketNumber}>Reference ID: #{ticket.ticket_number}</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{ticket.category}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabel}>Priority</Text>
              <Text style={[styles.metaValue, ticket.priority === 'HIGH' && { color: '#ef4444' }]}>
                {ticket.priority}
              </Text>
            </View>
          </View>

          {ticket.landmark ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.metaLabel}>Landmark</Text>
              <Text style={styles.metaValue}>{ticket.landmark}</Text>
            </View>
          ) : null}
        </View>

        {/* Passcode OTP Card */}
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Verification Code (OTP)</Text>
          <View style={styles.passcodeRow}>
            {ticket.otp_code.split('').map((char, index) => (
              <View key={index} style={styles.passcodeBox}>
                <Text style={styles.passcodeChar}>{char}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.otpHint}>Please provide this secure code to the technician upon arrival to authorize completion.</Text>
        </View>

        {/* Dispatching States & Map Tracking */}
        {(ticket.status === 'REPORTED' || ticket.status === 'AUTO_DISPATCHING') ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.searchingText}>Finding Nearest Technician...</Text>
          </View>
        ) : ticket.technician_id ? (
          <View style={styles.dispatchCard}>
            <Text style={styles.sectionHeading}>Assigned Professional</Text>

            <View style={styles.techDetailsRow}>
              <View style={styles.techAvatar}>
                <Feather name="user" size={20} color="#00b047" />
              </View>
              <View style={styles.techMeta}>
                <Text style={styles.techName}>{ticket.technicianName || 'Field Technician'}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                  <Text style={styles.techSubText}>{ticket.technicianRating?.toFixed(1) || '5.0'} Rating</Text>
                </View>
              </View>
            </View>

            {/* Embedded Mini Map Preview */}
            <View style={styles.miniMapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}
                region={{
                  latitude: ticket.latitude || 2.0333,
                  longitude: ticket.longitude || 45.3500,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                customMapStyle={mapStyle}
                zoomEnabled={false}
                scrollEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: ticket.latitude || 2.0333,
                    longitude: ticket.longitude || 45.3500,
                  }}
                  pinColor="#ef4444"
                />
                {ticket.technicianLatitude && ticket.technicianLongitude && ticket.technicianLatitude !== 0 && (
                  <Marker
                    coordinate={{
                      latitude: ticket.technicianLatitude,
                      longitude: ticket.technicianLongitude,
                    }}
                    pinColor="#00b047"
                  />
                )}
              </MapView>
            </View>

            <TouchableOpacity
              style={styles.trackButton}
              activeOpacity={0.8}
              onPress={() => router.push({
                pathname: '/(customer)/tracking',
                params: { id: ticket.id }
              })}
            >
              <Feather name="navigation" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.trackButtonText}>Track Live Location</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  header: {
    marginVertical: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
  },
  ticketNumber: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },
  gridRow: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 16,
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    color: '#0f172a',
    marginTop: 4,
    fontWeight: '700'
  },
  otpCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  passcodeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  passcodeBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passcodeChar: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10b981',
  },
  otpHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  errorText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fef3c7'
  },
  searchingText: {
    color: '#b45309',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10
  },
  dispatchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  techDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  techAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  techMeta: { flex: 1 },
  techName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  techSubText: { fontSize: 12, color: '#64748b', fontWeight: '700' },
  miniMapContainer: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  trackButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  trackButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  }
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