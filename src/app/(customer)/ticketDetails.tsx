import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  technicianRating?: number;
  technicianLatitude?: number;
  technicianLongitude?: number;
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(() => {
      if (ticket && (ticket.status === 'REPORTED' || ticket.status === 'AUTO_DISPATCHING')) {
        fetchDetails();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDetails, ticket?.status]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!ticket) return <View style={styles.centered}><Text style={styles.errorText}>Ticket not available.</Text></View>;

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Status & Title */}
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{ticket.status}</Text>
          </View>
          <Text style={styles.title}>{ticket.title}</Text>
          <Text style={styles.ticketNumber}>ID: #{ticket.ticket_number}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        {/* OTP Section */}
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <View style={styles.passcodeRow}>
            {(ticket.otp_code || '0000').split('').map((char, i) => (
              <View key={i} style={styles.passcodeBox}><Text style={styles.passcodeChar}>{char}</Text></View>
            ))}
          </View>
        </View>

        {/* Technician/Tracking */}
        {ticket.technician_id && (
          <View style={styles.dispatchCard}>
            <Text style={styles.sectionHeading}>Assigned Professional</Text>
            <View style={styles.techDetailsRow}>
              <View style={styles.techAvatar}><Feather name="user" size={20} color="#00b047" /></View>
              <View>
                <Text style={styles.techName}>{ticket.technicianName || 'Field Technician'}</Text>
                <Text style={styles.techSubText}>{ticket.technicianRating || 5.0} Rating</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.trackButton} onPress={() => router.push({ pathname: '/(customer)/tracking', params: { id: ticket.id } })}>
              <Feather name="navigation" size={16} color="#fff" />
              <Text style={styles.trackButtonText}> Track Live Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginVertical: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  ticketNumber: { fontSize: 13, color: '#64748b', marginTop: 6, fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionHeading: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 },
  descriptionText: { fontSize: 15, color: '#334155', lineHeight: 22 },
  otpCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  otpLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 14 },
  passcodeRow: { flexDirection: 'row', gap: 8 },
  passcodeBox: { width: 44, height: 48, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  passcodeChar: { fontSize: 22, fontWeight: '900', color: '#10b981' },
  dispatchCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  techDetailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  techAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e6f7ed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  techName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  techSubText: { fontSize: 12, color: '#64748b', fontWeight: '700' },
  trackButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  trackButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  errorText: { color: '#ef4444', fontSize: 16, fontWeight: '600' }
});
