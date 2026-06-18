import Header from '@/components/Header';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Linking,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTicketById, startTicket } from '../../services/ticketService';

type TaskLifecycleStatus = 'UNACCEPTED' | 'AUTO_DISPATCHING' | 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'DISPATCHED' | 'COMPLETED';

export default function ModernTaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskLifecycleStatus>('UNACCEPTED');

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
    if (ticket?.landmark) {
      const location = encodeURIComponent(ticket.landmark);
      Linking.openURL(`http://maps.google.com/?q=${location}`);
    }
  };

  const handleStatusTransition = async () => {
    if (submitting || !ticket || currentStatus === 'COMPLETED') return;
    setSubmitting(true);

    try {
      if (currentStatus === 'AUTO_DISPATCHING' || currentStatus === 'ASSIGNED' || currentStatus === 'DISPATCHED') {
        await startTicket(ticket.id);
        await refreshTicket();
        Alert.alert("Success", "Job accepted and started!");
      } else if (currentStatus === 'IN_PROGRESS') {
        router.push({
          pathname: '/proofOfWork',
          params: { id: ticket.id, customer: ticket.customer_id }
        });
      }
    } catch (error) {
      Alert.alert("Update Failed", "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#00b047" /></View>;

  const isCompleted = currentStatus === 'COMPLETED';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Task Overview" showBack={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Progress</Text>
          <View style={[
            styles.badge,
            currentStatus === 'AUTO_DISPATCHING' && { backgroundColor: '#fee2e2' },
            isCompleted && { backgroundColor: '#f1f5f9' }
          ]}>
            <Text style={[
              styles.badgeText,
              currentStatus === 'AUTO_DISPATCHING' && { color: '#ef4444' },
              isCompleted && { color: '#64748b' }
            ]}>
              {currentStatus === 'AUTO_DISPATCHING' ? 'OFFER RECEIVED' : currentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.metaSecondaryLabel}>Ticket Number</Text>
          <Text style={styles.metaPrimaryValue}>{ticket?.ticket_number || 'N/A'}</Text>
          <View style={styles.divider} />
          <Text style={styles.descriptionContextPara}>{ticket?.description}</Text>
        </View>

        <TouchableOpacity style={styles.primaryModernButton} onPress={handleNavigation}>
          <Feather name="navigation" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryModernButtonText}>Launch Navigation</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.persistentBottomDock}>
        <TouchableOpacity
          style={[
            styles.dockActionButtonCTA,
            currentStatus === 'AUTO_DISPATCHING' && { backgroundColor: '#ef4444' },
            isCompleted && styles.disabledButton // Applies gray color when complete
          ]}
          onPress={handleStatusTransition}
          disabled={submitting || isCompleted} // Native disabled flag
        >
          <Text style={styles.dockActionButtonCTAText}>
            {submitting
              ? 'Updating...'
              : isCompleted
                ? 'Job Completed'
                : currentStatus === 'AUTO_DISPATCHING'
                  ? 'Accept & Start Job'
                  : 'Proceed'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 110 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  statusLabel: { fontSize: 14, color: '#475569', fontWeight: '600' },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#15803d', fontWeight: '700' },
  premiumCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14 },
  metaSecondaryLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase' },
  metaPrimaryValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
  descriptionContextPara: { fontSize: 14, color: '#475569', lineHeight: 22 },
  primaryModernButton: { backgroundColor: '#00b047', borderRadius: 12, height: 46, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  primaryModernButtonText: { color: '#fff', fontWeight: '700' },
  persistentBottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  dockActionButtonCTA: { backgroundColor: '#00b047', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center' },
  dockActionButtonCTAText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  // Added clean slate disabled styling look
  disabledButton: { backgroundColor: '#cbd5e1' }
});