import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { getCustomerTickets } from '../../services/ticketService';

interface CustomerTicket {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

export default function ReportedTicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const fetchTickets = useCallback(async () => {
    try {
      const response = await getCustomerTickets();
      if (response && response.success && Array.isArray(response.data)) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error("Failed to load customer tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [fetchTickets]);

  // Combined Status and Date filtering
  const filteredTickets = useMemo(() => {
    // 1. Status Filter
    let list = tickets;
    if (statusFilter !== 'ALL') {
      list = list.filter((ticket) => {
        const s = ticket.status.toUpperCase();
        if (statusFilter === 'PENDING') {
          return s === 'REPORTED' || s === 'AUTO_DISPATCHING';
        }
        if (statusFilter === 'IN_PROGRESS') {
          return s === 'DISPATCHED' || s === 'ON_THE_WAY' || s === 'IN_PROGRESS';
        }
        if (statusFilter === 'COMPLETED') {
          return s === 'RESOLVED' || s === 'COMPLETED';
        }
        return true;
      });
    }

    // 2. Date Filter
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return list.filter((ticket) => {
      const ticketDate = new Date(ticket.created_at);
      switch (dateFilter) {
        case 'today':
          return ticketDate >= startOfToday;
        case 'yesterday':
          return ticketDate >= startOfYesterday && ticketDate < startOfToday;
        case 'week':
          return ticketDate >= sevenDaysAgo;
        case 'month':
          return ticketDate >= startOfMonth;
        case 'all':
        default:
          return true;
      }
    });
  }, [tickets, statusFilter, dateFilter]);

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'REPORTED':
      case 'AUTO_DISPATCHING':
        return { bg: '#fef3c7', text: '#d97706', label: s === 'REPORTED' ? 'Pending' : 'Matching' };
      case 'COMPLETED':
      case 'RESOLVED':
        return { bg: '#e6f7ed', text: '#00b047', label: s === 'RESOLVED' ? 'Resolved' : 'Completed' };
      case 'ON_THE_WAY':
        return { bg: '#eff6ff', text: '#1e40af', label: 'En Route' };
      case 'DISPATCHED':
        return { bg: '#eff6ff', text: '#1e40af', label: 'Assigned' };
      case 'IN_PROGRESS':
        return { bg: '#e0f2fe', text: '#0369a1', label: 'In Progress' };
      default:
        return { bg: '#f1f5f9', text: '#475569', label: s };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'MEDIUM':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'LOW':
      default:
        return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const renderTicketCard = ({ item }: { item: CustomerTicket }) => {
    const sStyle = getStatusBadgeStyle(item.status);
    const pStyle = getPriorityStyle(item.priority);
    const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/(customer)/ticketDetails',
            params: { id: item.id },
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.numberRow}>
            <Text style={styles.ticketNumber}>#{item.ticket_number}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: pStyle.bg }]}>
              <Text style={[styles.priorityText, { color: pStyle.text }]}>{item.priority}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sStyle.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: sStyle.text }]} />
            <Text style={[styles.statusText, { color: sStyle.text }]}>{sStyle.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => {
    const statusTabs: { label: string; value: StatusFilter }[] = [
      { label: 'All', value: 'ALL' },
      { label: 'Pending', value: 'PENDING' },
      { label: 'Active', value: 'IN_PROGRESS' },
      { label: 'Completed', value: 'COMPLETED' },
    ];

    const datePills: { label: string; value: DateFilter }[] = [
      { label: 'All Time', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 7 Days', value: 'week' },
      { label: 'This Month', value: 'month' },
    ];

    return (
      <View style={styles.filterBlock}>
        {/* Status Tabs Segment */}
        <View style={styles.tabsContainer}>
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setStatusFilter(tab.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {isSelected && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date Filters Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={datePills}
          keyExtractor={(d) => d.value}
          contentContainerStyle={styles.pillsContainer}
          renderItem={({ item }) => {
            const isActive = dateFilter === item.value;
            return (
              <TouchableOpacity
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setDateFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title="Reported Tickets" showBack={true} />

      {renderFilters()}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00b047" />
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00b047']} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Tickets Found</Text>
              <Text style={styles.emptySubtitle}>No records matched your status and date selections.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBlock: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabButtonActive: {
    // Active styling if needed
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#00b047',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#00b047',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#00b047',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
});
