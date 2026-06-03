import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getCustomerProfile } from "../../services/customerService";
import { apiClient } from "../../utils/apis";

// --- Types ---
interface TicketStats {
  total_tickets: number;
  active_tickets: number;
  completed_tickets: number;
}

interface CustomerProfile {
  id: string;
  user_id: string;
  account_number: string;
  plan_type: string;
  current_speed: string;
  address: string;
  stats: TicketStats;
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCustomerProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getCustomerProfile();
      
      // CORRECTED: Accessing the nested 'data' object from your API response
      if (response && response.success) {
        setProfile(response.data);
      }
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      Alert.alert("Error", "Could not load profile. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.log("Server logout skipped");
    } finally {
      await SecureStore.deleteItemAsync("userToken");
      router.replace("/(auth)");
    }
  };

  if (isLoading) return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#001a3d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchCustomerProfile} tintColor="#10b981" />
        }
      >
        <View style={styles.profileHeroSection}>
          <View style={styles.greenCircleBadge}>
            <Feather name="user" size={40} color="#ffffff" />
          </View>
          <Text style={styles.accountHolderName}>Caawiye Customer</Text>
          <Text style={styles.accountNumberBadge}>{profile?.account_number}</Text>
        </View>

        <Text style={styles.sectionTitle}>Support Status</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: "#3b82f6" }]}>
            <Text style={styles.statNumber}>{profile?.stats.total_tickets}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
            <Text style={[styles.statNumber, { color: "#d97706" }]}>{profile?.stats.active_tickets}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
            <Text style={[styles.statNumber, { color: "#059669" }]}>{profile?.stats.completed_tickets}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Subscription Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="package" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Subscription Plan</Text>
              <Text style={styles.infoValue}>{profile?.plan_type}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="zap" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Speed</Text>
              <Text style={styles.infoValue}>{profile?.current_speed}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="map-pin" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{profile?.address}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#001a3d",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
  },
  profileHeroSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  greenCircleBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  accountHolderName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#001a3d",
    marginTop: 12,
  },
  accountNumberBadge: {
    fontSize: 13,
    fontWeight: "700",
    color: "#718096",
    backgroundColor: "#f7fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001a3d",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f7fafc",
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#718096",
    marginTop: 2,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#718096",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#001a3d",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    width: "100%",
  },
});