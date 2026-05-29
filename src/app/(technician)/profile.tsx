import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  
  // State for handling live Availability matching your mockup layout
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Caawiye?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: () => {
          //navigate to login screen
          router.push('/(auth)');
        } 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* AVATAR & BASIC DETAILS CARD */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={42} color="#ffffff" />
          </View>
          <Text style={styles.technicianName}>Nor Ali Ahmed</Text>
          <Text style={styles.technicianId}>ID: 324</Text>

          {/* AVAILABILITY TOGGLE SUB-BOX */}
          <View style={styles.availabilityBox}>
            <View style={styles.availabilityTextRow}>
              <Feather 
                name="power" 
                size={16} 
                color={isOnline ? '#00b047' : '#64748b'} 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.availabilityLabel}>Availability Status</Text>
            </View>
            <Switch
              trackColor={{ false: '#e2e8f0', true: '#00b047' }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e2e8f0"
              onValueChange={setIsOnline}
              value={isOnline}
            />
          </View>
          <Text style={[styles.statusSubtext, { color: isOnline ? '#00b047' : '#64748b' }]}>
            {isOnline ? 'Online - Accepting Tasks' : 'Offline - Inactive'}
          </Text>
        </View>

        {/* ZONE ASSIGNMENT CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Feather name="map-pin" size={18} color="#00b047" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Zone Assignment</Text>
          </View>
          <Text style={styles.cardHighlightText}>Downtown District</Text>
        </View>

        {/* PERFORMANCE STATS SCOREBOARD CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Feather name="award" size={18} color="#00b047" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Performance Stats</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>47</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#00b047' }]}>95%</Text>
              <Text style={styles.statLabel}>On-Time</Text>
            </View>
          </View>
        </View>

        {/* TODAY'S HOURS TIME CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Feather name="clock" size={18} color="#00b047" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Today's Hours</Text>
          </View>

          <View style={styles.timeGrid}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Shift Start</Text>
              <Text style={styles.timeValue}>8:00 AM</Text>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Worked</Text>
              <Text style={[styles.timeValue, { color: '#00b047' }]}>6h 30m</Text>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Shift End</Text>
              <Text style={styles.timeValue}>6:00 PM</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT SYSTEM ACTION ELEMENT */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

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
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00b047',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  technicianName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  technicianId: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 16,
  },
  availabilityBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  availabilityTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusSubtext: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardHighlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});