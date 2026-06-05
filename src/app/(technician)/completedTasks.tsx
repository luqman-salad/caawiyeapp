import React, { useState, useEffect, useCallback } from 'react';
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
import { getTechnicianTickets } from '../../services/technicianService';

interface CompletedTicket {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  created_at: string;
  updated_at: string;
  rating_score?: number | null;
  rating_tags?: string[] | null;
  rating_comment?: string | null;
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

export default function CompletedTasksScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<CompletedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const fetchCompletedTickets = useCallback(async () => {
    try {
      const response = await getTechnicianTickets();
      if (response && response.success && Array.isArray(response.data)) {
        // Filter for completed or resolved tasks
        const completedOnly = response.data.filter(
          (t: any) => t.status === 'COMPLETED' || t.status === 'RESOLVED'
        );
        setTickets(completedOnly);
      }
    } catch (error) {
      console.error("Failed to load completed tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedTickets();
  }, [fetchCompletedTickets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompletedTickets();
  }, [fetchCompletedTickets]);

  // Client-side date filter logic
  const filteredTickets = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.updated_at || ticket.created_at);
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
  }, [tickets, dateFilter]);

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= score ? "star" : "star-outline"}
          size={14}
          color={i <= score ? "#eab308" : "#cbd5e1"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
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

  const renderTicketCard = ({ item }: { item: CompletedTicket }) => {
    const pStyle = getPriorityStyle(item.priority);
    const completionDateStr = new Date(item.updated_at || item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.numberRow}>
            <Text style={styles.ticketNumber}>#{item.ticket_number}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: pStyle.bg }]}>
              <Text style={[styles.priorityText, { color: pStyle.text }]}>{item.priority}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{completionDateStr}</Text>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>

        {/* Rating and Customer Feedback Area */}
        {item.rating_score !== undefined && item.rating_score !== null && item.rating_score > 0 ? (
          <View style={styles.feedbackContainer}>
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>{renderStars(item.rating_score)}</View>
              <Text style={styles.ratingLabel}>{item.rating_score.toFixed(1)} Rating</Text>
            </View>

            {item.rating_tags && item.rating_tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.rating_tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagCapsule}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.rating_comment ? (
              <Text style={styles.commentText}>"{item.rating_comment}"</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.noFeedbackContainer}>
            <Feather name="message-square" size={12} color="#94a3b8" />
            <Text style={styles.noFeedbackText}>No customer review submitted yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderDateFilters = () => {
    const filters: { label: string; value: DateFilter }[] = [
      { label: 'All Time', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 7 Days', value: 'week' },
      { label: 'This Month', value: 'month' },
    ];

    return (
      <View style={styles.filterScrollViewContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(f) => f.value}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => {
            const isActive = dateFilter === item.value;
            return (
              <TouchableOpacity
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setDateFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
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
      <Header title="Completed Tasks" showBack={true} />

      {renderDateFilters()}

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
              <Feather name="clipboard" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Completed Tasks</Text>
              <Text style={styles.emptySubtitle}>No records found matching this date filter.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// React Native hooks useMemo fallback for inline logic
import { useMemo } from 'react';

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
  filterScrollViewContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#00b047',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
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
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00b047',
    backgroundColor: '#f0fdf4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  feedbackContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tagCapsule: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  commentText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 16,
  },
  noFeedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  noFeedbackText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
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
