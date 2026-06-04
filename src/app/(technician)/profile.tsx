import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getTechnicianProfile, updateTechnicianStatus } from '../../services/technicianService';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await getTechnicianProfile();
      if (response.success) setProfile(response.data);
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

  const handleToggleStatus = async (value: boolean) => {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      await updateTechnicianStatus(value ? 'ONLINE' : 'OFFLINE', loc.coords.latitude, loc.coords.longitude);
      setProfile((prev: any) => ({ ...prev, status: value ? 'ONLINE' : 'OFFLINE' }));
    } catch (err) { 
      setErrorMessage("Could not update status.");
    } finally { setIsUpdating(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#00b047" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00b047']} />}
      >
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}
        
        <View style={styles.hero}>
          <View style={styles.avatar}><Feather name="user" size={40} color="#fff" /></View>
          <Text style={styles.title}>{profile?.user?.phone}</Text>
          <Text style={styles.subtitle}>{profile?.user?.email}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{profile?.status}</Text></View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Availability</Text>
            {isUpdating ? <ActivityIndicator size="small" /> : 
              <Switch value={profile?.status === 'ONLINE'} onValueChange={handleToggleStatus} trackColor={{true: '#00b047'}} />}
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {flex: 1, marginRight: 5}]}><Text style={styles.statVal}>{profile?.stats?.total_assigned ?? 0}</Text><Text style={styles.statLabel}>Assigned</Text></View>
          <View style={[styles.card, {flex: 1, marginHorizontal: 5}]}><Text style={styles.statVal}>{profile?.stats?.active_tickets ?? 0}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={[styles.card, {flex: 1, marginLeft: 5}]}><Text style={styles.statVal}>{profile?.stats?.completed_tickets ?? 0}</Text><Text style={styles.statLabel}>Done</Text></View>
        </View>

        <View style={styles.card}>
          <InfoRow icon="map-marker" label="Zone" value={profile?.zone_assignment} />
          <InfoRow icon="star" label="Rating" value={`${profile?.rating ?? 0}/5.0`} />
          <InfoRow icon="briefcase" label="Skills" value={profile?.skills?.join(', ') || 'N/A'} />
          <InfoRow icon="clock-outline" label="Last Login" value={new Date(profile?.user?.last_login_at || Date.now()).toLocaleDateString()} />
        </View>

        <TouchableOpacity style={styles.logout} onPress={() => router.push('/(auth)')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={20} color="#64748b" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoVal}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00b047', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#64748b', marginBottom: 10 },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#166534', fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', marginBottom: 10 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#00b047' },
  statLabel: { fontSize: 12, color: '#64748b' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { flex: 1, marginLeft: 10, color: '#475569' },
  infoVal: { fontWeight: '600' },
  logout: { marginTop: 20, padding: 16, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '700' },
  errorBanner: { backgroundColor: "#fef2f2", borderColor: "#fee2e2", borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 20 },
  errorBannerText: { color: "#991b1b", fontSize: 13, fontWeight: "600", flex: 1 },
});