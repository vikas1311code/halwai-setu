import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { bookingAPI, paymentAPI } from '../../utils/api';
import { COLORS, SHADOWS, BOOKING_STATUSES } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

export default function HalwaiDashboard({ navigation }) {
  const { user } = useAuth();

  const [bookings, setBookings]     = useState([]);
  const [earnings, setEarnings]     = useState({
    totalEarnings: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bookRes, earnRes] = await Promise.all([
        bookingAPI.getMyBookings({ status: 'requested', limit: 5 }),
        paymentAPI.getEarnings(),
      ]);
      setBookings(bookRes.data.bookings || []);
      setEarnings(earnRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status });
      Toast.show({
        type:  'success',
        text1: `Booking ${status}! ✅`
      });
      loadData();
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: 'Failed to update status'
      });
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            colors={[COLORS.green]}
          />
        }
      >
        {/* Green Header */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32']}
          style={s.header}
        >
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>Namaste 🙏</Text>
              <Text style={s.name}>{user?.name}</Text>
              <Text style={s.location}>
                📍 {user?.location?.city || 'Location not set'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={s.notifBtn}
            >
              <Text style={{ fontSize: 24 }}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Earnings Card */}
          <View style={s.earningsCard}>
            <Text style={s.earningsLabel}>Total Earnings</Text>
            <Text style={s.earningsValue}>
              ₹{earnings.totalEarnings?.toLocaleString('en-IN') || 0}
            </Text>
            <View style={s.earningsRow}>
              <Text style={s.earningsSub}>
                ₹{earnings.pendingAmount?.toLocaleString('en-IN') || 0} pending
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Earnings')}
              >
                <Text style={s.viewEarnings}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          {[
           { icon: '📋', label: 'Total Orders',  value: String(bookings.length || 0) },
           { icon: '⭐', label: 'Rating',        value: '0.0' },
           { icon: '✅', label: 'Completed',     value: '0' },
          ].map(stat => (
            <View key={stat.label} style={s.statBox}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Quick Actions</Text>
          <View style={s.actionsGrid}>
            {[
              {
                icon:    '📋',
                label:   'All Orders',
                color:   COLORS.saffronLight,
                onPress: () => navigation.navigate('Orders'),
              },
              {
                icon:    '💰',
                label:   'Earnings',
                color:   COLORS.greenLight,
                onPress: () => navigation.navigate('Earnings'),
              },
              {
                icon:    '👤',
                label:   'My Profile',
                color:   COLORS.infoLight,
                onPress: () => navigation.navigate('MyProfile'),
              },
              {
                icon:    '🍽️',
                label:   'My Menu',
                color:   '#FCE4EC',
                onPress: () => navigation.navigate('MyProfile'),
              },
            ].map(action => (
              <TouchableOpacity
                key={action.label}
                style={[s.actionBox, { backgroundColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28, marginBottom: 6 }}>
                  {action.icon}
                </Text>
                <Text style={s.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Requests */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>🔔 Pending Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.green} />
          ) : bookings.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>😴</Text>
              <Text style={s.emptyText}>No pending requests</Text>
              <Text style={s.emptySubText}>
                New bookings will appear here
              </Text>
            </View>
          ) : (
            bookings.map(booking => (
              <View key={booking._id} style={s.requestCard}>
                {/* Request Header */}
                <View style={s.requestHeader}>
                  <View style={s.clientInfo}>
                    <View style={s.clientAvatar}>
                      <Text style={{ fontSize: 20 }}>🙋</Text>
                    </View>
                    <View>
                      <Text style={s.clientName}>
                        {booking.clientId?.name}
                      </Text>
                      <Text style={s.eventInfo}>
                        {booking.eventType} · {booking.guestCount} guests
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    s.statusBadge,
                    { backgroundColor: COLORS.infoLight }
                  ]}>
                    <Text style={[s.statusText, { color: COLORS.info }]}>
                      New Request
                    </Text>
                  </View>
                </View>

                {/* Request Details */}
                <View style={s.requestDetails}>
                  <Text style={s.requestDetail}>
                    📅 {new Date(booking.eventDate)
                      .toLocaleDateString('en-IN', {
                        day:   'numeric',
                        month: 'short',
                        year:  'numeric',
                      })}
                  </Text>
                  <Text style={s.requestDetail}>
                    💰 ₹{booking.pricing?.totalAmount
                      ?.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={s.requestActions}>
                  <TouchableOpacity
                    style={s.acceptBtn}
                    onPress={() => handleStatus(booking._id, 'accepted')}
                    activeOpacity={0.85}
                  >
                    <Text style={s.acceptBtnText}>✅ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.rejectBtn}
                    onPress={() => handleStatus(booking._id, 'rejected')}
                    activeOpacity={0.85}
                  >
                    <Text style={s.rejectBtnText}>❌ Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.chatSmallBtn}
                    onPress={() => navigation.navigate('Chat', {
                      bookingId:    booking._id,
                      receiverId:   booking.clientId?._id,
                      receiverName: booking.clientId?.name,
                    })}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.gray100 },
  header:  { padding: 20, paddingBottom: 28 },
  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   16,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  name: {
    fontSize:   22,
    fontWeight: '900',
    color:      '#fff',
    marginTop:  2,
  },
  location: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  notifBtn: {
    padding:         8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    12,
  },
  earningsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
  },
  earningsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  earningsValue: {
    fontSize:   28,
    fontWeight: '900',
    color:      '#fff',
    marginTop:  4,
    marginBottom:8,
  },
  earningsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  earningsSub:  { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  viewEarnings: {
    fontSize:   12,
    color:      '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection:   'row',
    backgroundColor: '#fff',
    marginHorizontal:16,
    marginTop:       -16,
    borderRadius:    16,
    ...SHADOWS.md,
  },
  statBox: {
    flex:             1,
    alignItems:       'center',
    padding:          14,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  statIcon:  { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize:   16,
    fontWeight: '800',
    color:      COLORS.saffron,
  },
  statLabel: { fontSize: 10, color: COLORS.gray600, marginTop: 2 },
  section:   { padding: 16, paddingTop: 20 },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  sectionTitle: {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.gray800,
  },
  seeAll: { fontSize: 13, color: COLORS.green, fontWeight: '600' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  actionBox: {
    width:          '47%',
    padding:        16,
    borderRadius:   16,
    alignItems:     'center',
  },
  actionLabel: {
    fontSize:   13,
    fontWeight: '600',
    color:      COLORS.gray800,
  },
  empty:       { alignItems: 'center', padding: 32 },
  emptyText:   {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.gray800,
    marginTop:  12,
  },
  emptySubText:{ fontSize: 13, color: COLORS.gray600, marginTop: 4 },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         14,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  requestHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   10,
  },
  clientInfo: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  clientAvatar: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  clientName:  { fontSize: 14, fontWeight: '700', color: COLORS.gray800 },
  eventInfo:   { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  statusBadge: {
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:   4,
  },
  statusText:  { fontSize: 11, fontWeight: '700' },
  requestDetails: {
    flexDirection:    'row',
    gap:              16,
    marginBottom:     12,
    paddingBottom:    12,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  requestDetail: { fontSize: 13, color: COLORS.gray600 },
  requestActions:{ flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex:            1,
    backgroundColor: COLORS.green,
    borderRadius:    10,
    padding:         10,
    alignItems:      'center',
  },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rejectBtn: {
    flex:            1,
    backgroundColor: COLORS.errorLight,
    borderRadius:    10,
    padding:         10,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#FFCDD2',
  },
  rejectBtnText: { color: COLORS.error, fontSize: 13, fontWeight: '700' },
  chatSmallBtn: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
});