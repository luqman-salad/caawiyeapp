import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { getTechnicianTickets, getTechnicianProfile, updateTechnicianStatus } from '../../services/technicianService';

let Audio: any = null;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  console.log("Audio native module not found, alarm loop disabled.");
}

export interface TechnicianTicket {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [tasks, setTasks] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();
  
  const soundRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
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
      console.error("Dashboard sync failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOnline, fetchData]);

  // Find the first available auto-dispatching offer item
  const incomingOffer = tasks.find(task => task.status === 'AUTO_DISPATCHING');
  const hasPendingTask = !!incomingOffer;

  useEffect(() => {
    let activeSound: any = null;
    let isMounted = true;

    const manageSound = async () => {
      if (hasPendingTask && isOnline) {
        if (!soundRef.current && Audio) {
          try {
            await Audio.setAudioModeAsync({
              playsInSilentModeIOS: true,
              staysActiveInBackground: true,
            });
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav' },
              { shouldPlay: true, isLooping: true }
            );
            if (isMounted) {
              activeSound = newSound;
              soundRef.current = newSound;
            } else {
              await newSound.unloadAsync();
            }
          } catch (error) {
            console.error("Failed to load sound", error);
          }
        }
      } else {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (e) {
            console.error("Failed to stop sound", e);
          }
          soundRef.current = null;
        }
      }
    };

    manageSound();

    return () => {
      isMounted = false;
      if (activeSound) {
        activeSound.unloadAsync();
      }
    };
  }, [hasPendingTask, isOnline]);

  const handleToggleStatus = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const nextStatus = isOnline ? 'OFFLINE' : 'ONLINE';
      let lat = 2.0333; 
      let lon = 45.3500;

      if (nextStatus === 'ONLINE') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            let loc = await Location.getLastKnownPositionAsync({});
            if (!loc) {
              loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
            }
            if (loc) {
              lat = loc.coords.latitude;
              lon = loc.coords.longitude;
            }
          } catch (locErr) {
            console.warn("Failed to get location, using default coordinates:", locErr);
          }
        } else {
          Alert.alert(
            "Location Required",
            "Caawiye needs location permission to match you with customers in your vicinity."
          );
          setToggling(false);
          return;
        }
      }

      const res = await updateTechnicianStatus(nextStatus, lat, lon);
      if (res.success) {
        setIsOnline(nextStatus === 'ONLINE');
        fetchData();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      Alert.alert("Error", "Unable to update status. Please check your connection.");
    } finally {
      setToggling(false);
    }
  };

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

      {/* --- Fullscreen Off-Duty Block Modal --- */}
      <Modal visible={!isOnline && !loading} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Feather name="moon" size={60} color="#64748b" />
            </View>
            <Text style={styles.modalTitle}>You are Offline</Text>
            <Text style={styles.modalSubtitle}>
              Toggle your status to online in order to view active customer tickets and begin work.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, toggling && styles.modalButtonDisabled]}
              onPress={handleToggleStatus}
              disabled={toggling}
              activeOpacity={0.8}
            >
              {toggling ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Feather name="wifi" size={20} color="#ffffff" style={{ marginRight: 10, transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.modalButtonText}>GO ONLINE</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* --- Incoming Urgent Offer Popup Modal --- */}
      <Modal visible={isOnline && hasPendingTask} animationType="fade" transparent={true}>
        <View style={styles.offerOverlay}>
          <View style={styles.offerAlertBox}>
            <View style={styles.pulseIconContainer}>
              <Feather name="bell" size={32} color="#ffffff" />
            </View>
            
            <Text style={styles.offerAlertTitle}>New Offer Received!</Text>
            <Text style={styles.offerAlertSubtitle}>An urgent ticket is nearby and requests tracking assignment confirmation.</Text>
            
            {incomingOffer && (
              <View style={styles.offerCardPreview}>
                <View style={styles.offerPreviewRow}>
                  <Text style={styles.offerTicketNum}>{incomingOffer.ticket_number}</Text>
                  <View style={[styles.priorityPill, getPriorityStyles(incomingOffer.priority).container]}>
                    <Text style={[styles.priorityPillText, getPriorityStyles(incomingOffer.priority).text]}>{incomingOffer.priority}</Text>
                  </View>
                </View>
                <Text style={styles.offerTicketTitle}>{incomingOffer.title}</Text>
                <Text style={styles.offerTicketCategory}>Category: {incomingOffer.category}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.offerAcceptButton}
              activeOpacity={0.8}
              onPress={() => {
                if (incomingOffer) {
                  router.push({
                    pathname: '/(technician)/taskDetail',
                    params: { id: incomingOffer.id }
                  });
                }
              }}
            >
              <Feather name="check-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.offerAcceptButtonText}>View the Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Main Dashboard View --- */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={styles.profileRightButton} onPress={() => router.push('/(technician)/completedTasks')}>
              <Feather name="clock" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileRightButton} onPress={() => router.push('/(technician)/profile')}>
              <Feather name="user" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.centeredToggleContainer}>
          <TouchableOpacity 
            style={[
              styles.uberSwitchContainer, 
              isOnline ? styles.uberSwitchOnline : styles.uberSwitchOffline
            ]}
            onPress={handleToggleStatus}
            disabled={toggling}
            activeOpacity={0.9}
          >
            {isOnline ? (
              <>
                <Text style={styles.uberSwitchText}>ONLINE</Text>
                <View style={styles.uberSwitchKnob}>
                  <View style={styles.onlineDot} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.uberSwitchKnob}>
                  <View style={styles.offlineDot} />
                </View>
                <Text style={styles.uberSwitchText}>OFFLINE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#00b047' }]}>
                {tasks.filter(t => t.status === 'DISPATCHED' || t.status === 'AUTO_DISPATCHING').length}
              </Text>
              <Text style={styles.metricLabel}>Assigned</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#f59e0b' }]}>
                {tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ON_THE_WAY').length}
              </Text>
              <Text style={styles.metricLabel}>In Progress</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: '#64748b' }]}>
                {tasks.filter(t => t.status === 'COMPLETED' || t.status === 'RESOLVED').length}
              </Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks Nearby You :</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#00b047" style={{ marginTop: 20 }} />
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            const priorityStyle = getPriorityStyles(task.priority);
            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <View style={styles.customerNameRow}>
                    <Feather 
                      name={task.status === 'AUTO_DISPATCHING' ? 'alert-octagon' : 'alert-circle'} 
                      size={20} 
                      color={task.status === 'AUTO_DISPATCHING' ? '#ef4444' : '#f97316'} 
                      style={styles.alertIcon} 
                    />
                    <Text style={styles.customerNameText}>{task.ticket_number}</Text>
                  </View>
                  <View style={[styles.priorityPill, priorityStyle.container]}>
                    <Text style={[styles.priorityPillText, priorityStyle.text]}>{task.priority}</Text>
                  </View>
                </View>
                
                <Text style={styles.taskTypeText}>{task.title}</Text>
                
                <View style={styles.taskMetaRow}>
                  <View style={styles.timeRow}>
                    <Feather name="folder" size={14} color="#64748b" />
                    <Text style={styles.timeText}>{task.category}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    task.status === 'AUTO_DISPATCHING' ? styles.statusAutoDispatching : styles.statusStandard
                  ]}>
                    <Text style={task.status === 'AUTO_DISPATCHING' ? styles.statusAutoDispatchingText : styles.statusStandardText}>
                      {task.status === 'AUTO_DISPATCHING' ? 'OFFER RECEIVED' : task.status}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.detailsButton,
                    task.status === 'AUTO_DISPATCHING' && { backgroundColor: '#ef4444' }
                  ]} 
                  activeOpacity={0.8} 
                  onPress={() => router.push({
                    pathname: '/(technician)/taskDetail',
                    params: { id: task.id }
                  })}
                >
                  <Text style={styles.detailsButtonText}>
                    {task.status === 'AUTO_DISPATCHING' ? 'Review Urgent Offer →' : 'View Details →'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.noTasksContainer}>
            <Feather name="check-circle" size={48} color="#cbd5e1" />
            <Text style={styles.noTasksText}>No tasks available at the moment.</Text>
          </View>
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
  
  // Uber Switch styles
  centeredToggleContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  uberSwitchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 160, height: 52, borderRadius: 26, paddingHorizontal: 8, backgroundColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  uberSwitchOnline: { backgroundColor: '#00b047' },
  uberSwitchOffline: { backgroundColor: '#1e293b' },
  uberSwitchText: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 1.2, flex: 1, textAlign: 'center' },
  uberSwitchKnob: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00b047' },
  offlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e11d48' },

  // Offline Modal styles
  modalContainer: { flex: 1, backgroundColor: '#0f172a' },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#ffffff', marginBottom: 12 },
  modalSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  modalButton: { backgroundColor: '#00b047', width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', shadowColor: '#00b047', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  modalButtonDisabled: { backgroundColor: '#1e293b', shadowOpacity: 0, elevation: 0 },
  modalButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Offer Overlay & Card styles
  offerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  offerAlertBox: { backgroundColor: '#ffffff', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  pulseIconContainer: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  offerAlertTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  offerAlertSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  offerCardPreview: { backgroundColor: '#f8fafc', width: '100%', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 24 },
  offerPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  offerTicketNum: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  offerTicketTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 6 },
  offerTicketCategory: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  offerAcceptButton: { backgroundColor: '#00b047', flexDirection: 'row', width: '100%', height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#00b047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  offerAcceptButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusAutoDispatching: { backgroundColor: '#fee2e2' },
  statusAutoDispatchingText: { color: '#ef4444', fontWeight: '800', fontSize: 11 },
  statusStandard: { backgroundColor: '#f1f5f9' },
  statusStandardText: { color: '#475569', fontWeight: '600', fontSize: 11 },
  detailsButton: { backgroundColor: '#00b047', borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' },
  detailsButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  noTasksContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, marginTop: 10 },
  noTasksText: { fontSize: 14, color: '#94a3b8', marginTop: 12, fontWeight: '600' },
});