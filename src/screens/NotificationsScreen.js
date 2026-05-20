import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
  {
    id:      '1',
    type:    'booking',
    title:   '✅ Booking Accepted!',
    message: 'Your booking for Wedding has been accepted by Ramesh Halwai.',
    time:    '2 mins ago',
    isRead:  false,
  },
  {
    id:      '2',
    type:    'payment',
    title:   '💰 Payment Successful!',
    message: '₹15,000 advance payment confirmed for booking #HLS-2025-1234.',
    time:    '1 hour ago',
    isRead:  false,
  },
  {
    id:      '3',
    type:    'message',
    title:   '💬 New Message',
    message: 'Ramesh Halwai sent you a message about your booking.',
    time:    '2 hours ago',
    isRead:  true,
  },
  {
    id:      '4',
    type:    'reminder',
    title:   '📅 Event Reminder',
    message: 'Your event is tomorrow! Make sure everything is ready.',
    time:    '5 hours ago',
    isRead:  true,
  },
  {
    id:      '5',
    type:    'booking',
    title:   '🎉 Booking Completed!',
    message: 'Your event has been completed. Please rate your experience.',
    time:    '1 day ago',
    isRead:  true,
  },
  {
    id:      '6',
    type:    'promo',
    title:   '🎊 Special Offer!',
    message: 'Get 10% off on your next booking. Use code HALWAI10.',
    time:    '2 days ago',
    isRead:  true,
  },
  {
    id:      '7',
    type:    'system',
    title:   '🔔 Profile Verified',
    message: 'Your halwai profile has been verified successfully.',
    time:    '3 days ago',
    isRead:  true,
  },
];

const getNotifIcon = (type) => {
  const icons = {
    booking:  '📋',
    payment:  '💰',
    message:  '💬',
    reminder: '📅',
    promo:    '🎊',
    system:   '🔔',
  };
  return icons[type] || '🔔';
};

const getNotifColor = (type) => {
  const colors = {
    booking:  COLORS.saffronLight,
    payment:  COLORS.greenLight,
    message:  COLORS.infoLight,
    reminder: '#FFF9C4',
    promo:    '#FCE4EC',
    system:   COLORS.gray100,
  };
  return colors[type] || COLORS.gray100;
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [activeFilter, setFilter]         = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'booking') return n.type === 'booking';
    if (activeFilter === 'payment') return n.type === 'payment';
    return true;
  });

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        s.notifCard,
        !item.isRead && s.notifCardUnread
      ]}
      onPress={() => markRead(item.id)}
      activeOpacity={0.85}
    >
      {/* Unread Dot */}
      {!item.isRead && <View style={s.unreadDot} />}

      {/* Icon */}
      <View style={[
        s.notifIcon,
        { backgroundColor: getNotifColor(item.type) }
      ]}>
        <Text style={{ fontSize: 22 }}>
          {getNotifIcon(item.type)}
        </Text>
      </View>

      {/* Content */}
      <View style={s.notifContent}>
        <Text style={[
          s.notifTitle,
          !item.isRead && { fontWeight: '800' }
        ]}>
          {item.title}
        </Text>
        <Text
          style={s.notifMessage}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text style={s.notifTime}>{item.time}</Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={s.deleteBtn}
        onPress={() => deleteNotif(item.id)}
      >
        <Text style={{ fontSize: 16, color: COLORS.gray400 }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6F00', '#E65100']}
        style={s.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={s.sub}>
                {unreadCount} unread notification
                {unreadCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={s.markAllBtn}
              onPress={markAllRead}
            >
              <Text style={s.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={s.filterRow}>
        {[
          { key: 'all',     label: 'All' },
          { key: 'unread',  label: 'Unread' },
          { key: 'booking', label: 'Bookings' },
          { key: 'payment', label: 'Payments' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              s.filterChip,
              activeFilter === filter.key && s.filterChipActive
            ]}
            onPress={() => setFilter(filter.key)}
          >
            <Text style={[
              s.filterText,
              activeFilter === filter.key && s.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>🔔</Text>
            <Text style={s.emptyTitle}>No notifications</Text>
            <Text style={s.emptySubText}>
              You are all caught up!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },
  header: { padding: 20, paddingBottom: 20 },
  backBtn:  { marginBottom: 12 },
  backText: {
    color:      'rgba(255,255,255,0.9)',
    fontSize:   15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    20,
    paddingHorizontal:12,
    paddingVertical:  6,
  },
  markAllText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  filterRow: {
    flexDirection:   'row',
    gap:             8,
    padding:         12,
    paddingHorizontal:16,
    backgroundColor: '#fff',
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    backgroundColor:   '#fff',
  },
  filterChipActive: {
    backgroundColor: COLORS.saffron,
    borderColor:     COLORS.saffron,
  },
  filterText:       { fontSize: 12, color: COLORS.gray600, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  listContainer:    { padding: 16 },
  notifCard: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             12,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
    position:        'relative',
  },
  notifCardUnread: {
    borderColor:     COLORS.saffron,
    borderWidth:     1.5,
    backgroundColor: COLORS.saffronLight,
  },
  unreadDot: {
    position:        'absolute',
    top:             12,
    right:           12,
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.saffron,
  },
  notifIcon: {
    width:          48,
    height:         48,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize:   14,
    fontWeight: '700',
    color:      COLORS.gray800,
    marginBottom:4,
  },
  notifMessage: {
    fontSize:   13,
    color:      COLORS.gray600,
    lineHeight: 18,
    marginBottom:4,
  },
  notifTime: { fontSize: 11, color: COLORS.gray400 },
  deleteBtn: { padding: 4 },
  empty: {
    alignItems:   'center',
    paddingTop:   60,
    paddingBottom:40,
  },
  emptyTitle:   {
    fontSize:   18,
    fontWeight: '700',
    color:      COLORS.gray800,
    marginTop:  16,
  },
  emptySubText: {
    fontSize:  13,
    color:     COLORS.gray600,
    marginTop: 8,
  },
});
