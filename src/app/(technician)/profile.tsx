import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getTechnicianProfile, updateTechnicianStatus } from '../../services/technicianService';

export default function ProfileScreen() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getTechnicianProfile();
      if (response.success) setProfile(response.data);
    } catch (err) {
      setErrorMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (value: boolean) => {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      // 1. Get current location
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        throw new Error("Location permission is required to update status.");
      }
      const location = await Location.getCurrentPositionAsync({});
      
      // 2. Call API with status and coordinates
      const newStatus = value ? 'ONLINE' : 'OFFLINE';
      await updateTechnicianStatus(newStatus, location.coords.latitude, location.coords.longitude);
      
      // 3. Update local state
      setProfile({ ...profile, status: newStatus });
    } catch (err: any) {
      setErrorMessage(err.message || "Could not update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.push('/(auth)') },
    ]);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#00b047" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={42} color="#ffffff" />
          </View>
          <Text style={styles.technicianName}>{profile?.user.phone}</Text>
          <Text style={styles.technicianId}>ID: {profile?.id.substring(0, 8)}</Text>

          <View style={styles.availabilityBox}>
            <View style={styles.availabilityTextRow}>
              <Feather name="power" size={16} color={profile?.status === 'ONLINE' ? '#00b047' : '#64748b'} style={{ marginRight: 8 }} />
              <Text style={styles.availabilityLabel}>Availability Status</Text>
            </View>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#00b047" />
            ) : (
              <Switch
                trackColor={{ false: '#e2e8f0', true: '#00b047' }}
                thumbColor="#ffffff"
                onValueChange={handleToggleStatus}
                value={profile?.status === 'ONLINE'}
              />
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Feather name="map-pin" size={18} color="#00b047" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Zone Assignment</Text>
          </View>
          <Text style={styles.cardHighlightText}>{profile?.zone_assignment}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Feather name="award" size={18} color="#00b047" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Performance Stats</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>{profile?.stats.completed_tickets}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>{profile?.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>{profile?.stats.active_tickets}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeaderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00b047', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  technicianName: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  technicianId: { fontSize: 14, color: '#64748b', fontWeight: '600', marginTop: 2, marginBottom: 16 },
  availabilityBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, width: '100%' },
  availabilityTextRow: { flexDirection: 'row', alignItems: 'center' },
  availabilityLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  infoCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  cardHighlightText: { fontSize: 16, fontWeight: '600', color: '#334155' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  logoutButton: { backgroundColor: '#dc2626', borderRadius: 14, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  logoutButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  errorBanner: { backgroundColor: "#fef2f2", borderColor: "#fee2e2", borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 20 },
  errorBannerText: { color: "#991b1b", fontSize: 13, fontWeight: "600", flex: 1 },
});