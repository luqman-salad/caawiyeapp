import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBg: string;
}

export default function NotificationsScreen() {
  // --- NOTIFICATION DATA ENGINE ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Ticket #TK-88394 Completed',
      description: 'Your fiber connection issue has been resolved successfully',
      timestamp: '2 hours ago',
      isUnread: true,
      iconName: 'check-circle',
      iconColor: '#00b047',
      iconBg: '#e6f7ed',
    },
    {
      id: '2',
      title: 'Technician En Route',
      description: 'Eng. Abdi Shakuur is on the way. Arriving in 12 minutes',
      timestamp: '3 hours ago',
      isUnread: true,
      iconName: 'bell',
      iconColor: '#1e293b',
      iconBg: '#f1f5f9',
    },
    {
      id: '3',
      title: 'Appointment Confirmed',
      description: 'Your service appointment is scheduled for today at 2:00 PM',
      timestamp: '5 hours ago',
      isUnread: false,
      iconName: 'bell',
      iconColor: '#64748b',
      iconBg: '#f8fafc',
    },
    {
      id: '4',
      title: 'Payment Received',
      description: 'Monthly subscription payment of $45.00 processed successfully',
      timestamp: '1 day ago',
      isUnread: false,
      iconName: 'check-circle',
      iconColor: '#00b047',
      iconBg: '#e6f7ed',
    },
    {
      id: '5',
      title: 'Scheduled Maintenance',
      description: 'Network maintenance planned for May 28, 2026 from 2:00 AM - 4:00 AM',
      timestamp: '2 days ago',
      isUnread: false,
      iconName: 'alert-circle',
      iconColor: '#ef4444',
      iconBg: '#fef2f2',
    },
    {
      id: '6',
      title: 'Speed Upgrade Available',
      description: "You're eligible for a free speed upgrade to 200 Mbps",
      timestamp: '3 days ago',
      isUnread: false,
      iconName: 'check-circle',
      iconColor: '#00b047',
      iconBg: '#e6f7ed',
    },
  ]);

  // --- ACTIONS SYSTEM ---
  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((item) => ({ ...item, isUnread: false }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((item) => item.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // --- RENDER COMPONENT LAYOUTS ---


  const renderEmptyState = () => (
    <View style={styles.emptyStateBlock}>
      <Feather name="bell-off" size={48} color="#94a3b8" />
      <Text style={styles.emptyStateTitle}>All caught up!</Text>
      <Text style={styles.emptyStateSubtitle}>No recent updates found here.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screenWrapper} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header 
        title="Notifications" 
        showBack={true} 
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity 
              activeOpacity={0.6} 
              onPress={handleMarkAllRead}
              style={styles.markReadButton}
            >
              <Text style={styles.markAllReadText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContentPadding}
        style={styles.mainFlatList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.notificationCardItem,
              item.isUnread && styles.notificationCardUnreadAccent,
            ]}
          >
            {/* Left Column: Status Icons */}
            <View style={[styles.iconContainerBadge, { backgroundColor: item.iconBg }]}>
              <Feather name={item.iconName} size={18} color={item.iconColor} />
            </View>

            {/* Middle Column: Context Structure */}
            <View style={styles.textDetailsColumn}>
              <Text style={styles.notificationMainTitle}>{item.title}</Text>
              <Text style={styles.notificationDescriptionText}>{item.description}</Text>
              
              <View style={styles.timestampRowLayout}>
                <Feather name="clock" size={12} color="#94a3b8" style={styles.clockSpacing} />
                <Text style={styles.timestampText}>{item.timestamp}</Text>
              </View>
            </View>

            {/* Right Column: Dynamic Unread Dots and Deletion Trash Triggers */}
            <View style={styles.rightActionColumn}>
              {item.isUnread && <View style={styles.unreadActiveDotIndicator} />}
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => handleDeleteNotification(item.id)}
                style={styles.trashIconTouchArea}
              >
                <Feather name="trash-2" size={15} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white foundational body line
  },
  mainFlatList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  outerHeaderContainer: {
    paddingHorizontal: 0,
    // paddingTop: 12,
    // paddingBottom: 16,
    backgroundColor: '#f8fafc', // Contrasting backdrop wrapper matching your token profiles
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  // --- MODERN WHITE ROUNDED EDGE CARD HEADER ---
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeftBlock: {
    flexDirection: 'column',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitleText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  markReadButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  markAllReadText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  listContentPadding: {
    paddingBottom: 40,
  },
  notificationCardItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  notificationCardUnreadAccent: {
    backgroundColor: '#f0fdf9', // Custom matching light tracking tint from image_add023.png
  },
  iconContainerBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  textDetailsColumn: {
    flex: 1,
    paddingRight: 8,
  },
  notificationMainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  notificationDescriptionText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 4,
  },
  timestampRowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  clockSpacing: {
    marginRight: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  rightActionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 24,
    paddingVertical: 2,
  },
  unreadActiveDotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00b047',
    marginRight: 4,
    marginTop: 6,
  },
  trashIconTouchArea: {
    padding: 4,
    marginTop: 'auto',
  },
  emptyStateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
});