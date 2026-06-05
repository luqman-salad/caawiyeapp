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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { getCustomerProfile } from "../../services/customerService";
import { apiClient } from "../../utils/apis";
import Header from "../../components/Header";

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
  user?: {
    name: string;
    phone: string;
    email?: string;
  };
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
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userRole");
      router.replace("/(auth)");
    }
  };

  if (isLoading) return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Your Profile" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchCustomerProfile} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER BANNER --- */}
        <View style={styles.headerBackground} />  

        {/* --- PROFILE HEADER CARD (OVERLAPPING MAP) --- */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={36} color="#ffffff" />
          </View>
          <Text style={styles.accountHolderName}>{profile?.user?.name || "Customer Account"}</Text>
          <Text style={styles.accountNumberBadge}>{profile?.account_number || "FSM-CUSTOMER"}</Text>
          <Text style={styles.accountHolderContact}>{profile?.user?.phone || profile?.user?.email}</Text>
        </View>

        {/* --- SUPPORT STATUS STATISTICS --- */}
        <Text style={styles.sectionTitle}>Support Tickets Summary</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: "#3b82f6" }]}>
            <Text style={styles.statNumber}>{profile?.stats.total_tickets ?? 0}</Text>
            <Text style={styles.statLabel}>Total Tickets</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
            <Text style={[styles.statNumber, { color: "#d97706" }]}>{profile?.stats.active_tickets ?? 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
            <Text style={[styles.statNumber, { color: "#059669" }]}>{profile?.stats.completed_tickets ?? 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* --- SUPPORT TICKETS LINK CARD --- */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push('/(customer)/reportedTickets')}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconWrapper}>
            <Feather name="file-text" size={18} color="#10b981" />
          </View>
          <Text style={styles.actionLabel}>View Support Tickets</Text>
          <Feather name="chevron-right" size={16} color="#cbd5e1" />
        </TouchableOpacity>

        {/* --- SUBSCRIPTION DETAILS --- */}
        <Text style={styles.sectionTitle}>Broadband Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="package" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Subscription Plan</Text>
              <Text style={styles.infoValue}>{profile?.plan_type || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="zap" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Allocated Speed</Text>
              <Text style={styles.infoValue}>{profile?.current_speed || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}><Feather name="map-pin" size={18} color="#10b981" /></View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Installation Address</Text>
              <Text style={styles.infoValue}>{profile?.address || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={16} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerBackground: {
    height: 120,
    width: "100%",
    backgroundColor: "#001a3d",
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
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#10b981",
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
    color: "#059669",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  accountHolderContact: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    fontWeight: "600",
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
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3b82f6",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#ffffff",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#ffe4e6",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 32,
  },
  logoutButtonText: {
    color: "#e11d48",
    fontSize: 15,
    fontWeight: "800",
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