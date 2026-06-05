import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../utils/apis';
import { getTechnicianProfile } from '../../services/technicianService';
import Header from '../../components/Header';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await getTechnicianProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) { 
      setErrorMessage("Failed to load profile.");
    } finally { 
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));



  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.log("Server logout skipped");
    } finally {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userRole");
      router.replace("/(auth)");
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#00b047" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Your Profile" showBack={true} />
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00b047']} />}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* --- HEADER BANNER --- */}
        <View style={styles.headerBackground} />

        {/* --- PROFILE HEADER CARD (OVERLAPPING MAP) --- */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={36} color="#ffffff" />
          </View>
          <Text style={styles.accountHolderName}>{profile?.user?.name || "Technician"}</Text>
          <Text style={styles.accountNumberBadge}>{profile?.user?.phone || "FSM-TECHNICIAN"}</Text>
          <View style={styles.dutyBadgeRow}>
            <View style={[styles.statusDot, { backgroundColor: profile?.status === 'ONLINE' ? '#10b981' : '#64748b' }]} />
            <Text style={styles.dutyBadgeText}>{profile?.status || 'OFFLINE'}</Text>
          </View>
        </View>

        {/* --- STATS SUMMARY GRID --- */}
        <Text style={styles.sectionTitle}>Performance Stats</Text>
        <View style={styles.grid}>
          <View style={[styles.statCard, { borderLeftColor: '#00b047' }]}>
            <Text style={styles.statVal}>{profile?.stats?.total_assigned ?? 0}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={[styles.statVal, { color: '#2563eb' }]}>{profile?.stats?.active_tickets ?? 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
            <Text style={[styles.statVal, { color: '#059669' }]}>{profile?.stats?.completed_tickets ?? 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* --- COMPLETED TASKS LINK CARD --- */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push('/(technician)/completedTasks')}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconWrapper}>
            <Feather name="check-square" size={18} color="#00b047" />
          </View>
          <Text style={styles.actionLabel}>View Completed Tasks</Text>
          <Feather name="chevron-right" size={16} color="#cbd5e1" />
        </TouchableOpacity>

        {/* --- DETAILED TECHNICAL INFO --- */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.card}>
          <InfoRow icon="map-marker" label="Zone" value={profile?.zone_assignment || "Not Assigned"} />
          <View style={styles.divider} />
          <InfoRow icon="star" label="Rating" value={`${profile?.rating?.toFixed(1) ?? "5.0"}/5.0`} />
          <View style={styles.divider} />
          <InfoRow icon="briefcase" label="Skills" value={profile?.skills?.join(', ') || 'N/A'} />
          <View style={styles.divider} />
          <InfoRow icon="clock-outline" label="Last Login" value={new Date(profile?.user?.last_login_at || Date.now()).toLocaleDateString()} />
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={16} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={20} color="#00b047" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoVal}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  scroll: { 
    flexGrow: 1,
    paddingBottom: 40 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  headerBackground: {
    height: 120,
    width: "100%",
    backgroundColor: "#0f172a",
  },
  floatingBackButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  profileHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -40,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#00b047",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#00b047",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  accountHolderName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
  },
  accountNumberBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00b047",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  dutyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dutyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  grid: { 
    flexDirection: 'row', 
    gap: 10,
    marginHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff', 
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statVal: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#00b047' 
  },
  statLabel: { 
    fontSize: 11, 
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16 
  },
  infoLabel: { 
    flex: 1, 
    marginLeft: 12, 
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  infoVal: { 
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    width: "100%",
  },
  logout: { 
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 32,
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: '800',
    fontSize: 15,
  },
  errorBanner: { 
    backgroundColor: "#fef2f2", 
    borderColor: "#fee2e2", 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 12, 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20,
    marginHorizontal: 20,
  },
  errorBannerText: { 
    color: "#991b1b", 
    fontSize: 13, 
    fontWeight: "600", 
    flex: 1 
  },
  actionCard: {
    backgroundColor: '#ffffff', 
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    flex: 1,
    marginLeft: 12,
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
  },
});