import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getTechnicianTickets, getTechnicianProfile } from '../../services/technicianService';

// --- Types ---
export interface TechnicianTicket {
  id: string;
  customer: string;
  type: string;
  time: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [tasks, setTasks] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetches current status and tickets
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, ticketRes] = await Promise.all([
        getTechnicianProfile(),
        getTechnicianTickets()
      ]);
      
      if (profileRes.success) {
        setIsOnline(profileRes.data.status === 'ONLINE');
      }
      setTasks(ticketRes?.data || []);
    } catch (err) {
      console.error("Failed to sync dashboard:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Correct implementation of useFocusEffect with an async wrapper
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'HIGH': return { container: styles.highPill, text: styles.highPillText };
      case 'MEDIUM': return { container: styles.medPill, text: styles.medPillText };
      default: return { container: styles.lowPill, text: styles.lowPillText };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#00b047" />

      <View style={styles.greenHeaderBlock}>
        <View style={styles.headerTopRow}>
          <View style={styles.userInfoCol}>
            <View style={styles.avatarRow}>
              <View style={styles.whiteAvatar}>
                <Feather name="user" size={20} color="#00b047" />
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.headerTitle}>Task Dashboard</Text>
                <Text style={styles.headerSubTitle}>Welcome back, Technician</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.profileRightButton} onPress={() => router.push('/(technician)/profile')}>
            <Feather name="user" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleBarContainer}>
          <View style={styles.toggleLeftInfo}>
            <Feather name="wifi" size={20} color={isOnline ? '#00b047' : '#64748b'} style={styles.wifiIcon} />
            <Text style={{ color: isOnline ? '#00b047' : '#64748b', fontWeight: '600', marginLeft: 8 }}>
              {isOnline ? 'On-Duty' : 'Off-Duty'}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
            thumbColor={isOnline ? '#00b047' : '#94a3b8'}
            value={isOnline}
            disabled={true} 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#00b047' }]}>{tasks.length}</Text>
              <Text style={styles.metricLabel}>Assigned</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#64748b' }]}>0</Text>
              <Text style={styles.metricLabel}>In Progress</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#64748b' }]}>0</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks Nearby You :</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00b047" style={{ marginTop: 20 }} />
        ) : (
          tasks.map((task) => {
            const priorityStyle = getPriorityStyles(task.priority);
            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <View style={styles.customerNameRow}>
                    <Feather name="alert-circle" size={20} color="#f97316" style={styles.alertIcon} />
                    <Text style={styles.customerNameText}>{task.customer}</Text>
                  </View>
                  <View style={[styles.priorityPill, priorityStyle.container]}>
                    <Text style={[styles.priorityPillText, priorityStyle.text]}>{task.priority}</Text>
                  </View>
                </View>
                <Text style={styles.taskTypeText}>{task.type}</Text>
                <View style={styles.taskMetaRow}>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={14} color="#64748b" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>
                  <Text style={styles.statusLabelText}>{task.status}</Text>
                </View>
                <TouchableOpacity style={styles.detailsButton} activeOpacity={0.8} onPress={() => router.push('/(technician)/taskDetail')}>
                  <Text style={styles.detailsButtonText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fa' },
  greenHeaderBlock: { backgroundColor: '#00b047', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 24 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfoCol: { flexDirection: 'row', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  whiteAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userTextContainer: { justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  headerSubTitle: { fontSize: 13, fontWeight: '500', color: '#e2fbe9', marginTop: 1 },
  profileRightButton: { padding: 4 },
  toggleBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, height: 48, paddingHorizontal: 16, elevation: 3 },
  toggleLeftInfo: { flexDirection: 'row', alignItems: 'center' },
  wifiIcon: { transform: [{ rotate: '45deg' }] },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  metricsGrid: { marginBottom: 28 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 14, marginHorizontal: 5, alignItems: 'center', elevation: 1 },
  metricNumber: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  metricLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#001a3d', marginBottom: 16 },
  taskCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  taskCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  customerNameRow: { flexDirection: 'row', alignItems: 'center' },
  alertIcon: { marginRight: 8 },
  customerNameText: { fontSize: 18, fontWeight: '800', color: '#001a3d' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  priorityPillText: { fontSize: 11, fontWeight: '700' },
  highPill: { backgroundColor: '#fee2e2' }, highPillText: { color: '#ef4444' },
  medPill: { backgroundColor: '#fef9c3' }, medPillText: { color: '#b45309' },
  lowPill: { backgroundColor: '#dcfce7' }, lowPillText: { color: '#22c55e' },
  taskTypeText: { fontSize: 14, color: '#475569', paddingLeft: 28, marginBottom: 14 },
  taskMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 28, marginBottom: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 13, color: '#64748b', marginLeft: 6, fontWeight: '500' },
  statusLabelText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  detailsButton: { backgroundColor: '#00b047', borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' },
  detailsButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});