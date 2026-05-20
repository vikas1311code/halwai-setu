import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingAPI } from '../../utils/api';
import { COLORS, SHADOWS, BOOKING_STATUSES } from '../../utils/theme';

const FILTERS = [
  { key: null,         label: 'All' },
  { key: 'requested',  label: 'Requested' },
  { key: 'accepted',   label: 'Accepted' },
  { key: 'in_progress',label: 'In Progress' },
  { key: 'completed',  label: 'Completed' },
  { key: 'cancelled',  label: 'Cancelled' },
];

export default function ClientBookingsScreen({ navigation }) {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setFilter]   = useState(null);

  const fetchBookings = useCallback(async (status = null) => {
    try {
      const params = {};
      if (status) params.status = status;
      const { data } = await bookingAPI.getMyBookings(params);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const onFilterPress = (key) => {
    setFilter(key);
    setLoading(true);
    fetchBookings(key);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(activeFilter);
  };

  const renderBooking = ({ item }) => {
    const status = BOOKING_STATUSES[item.bookingStatus];
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('Tracking', {
          bookingId: item._id
        })}
        activeOpacity={0.85}
      >
        {/* Card Header */}
        <View style={s.cardHeader}>
          <View style={s.cardLeft}>
            <Text style={s.bookingId}>#{item.bookingId}</Text>
            <Text style={s.halwaiName}>
              👨‍🍳 {item.halwaiId?.name}
            </Text>
          </View>
          <View style={[
            s.statusBadge,
            { backgroundColor: status?.bg || COLORS.gray100 }
          ]}>
            <Text style={[
              s.statusText,
              { color: status?.color || COLORS.gray600 }
            ]}>
              {status?.label || item.bookingStatus}
            </Text>
          </View>
        </View>

        {/* Card Details */}
        <View style={s.cardDetails}>
          <View style={s.detailItem}>
            <Text style={s.detailIcon}>🎪</Text>
            <Text style={s.detailText}>
              {item.eventType.charAt(0).toUpperCase() +
               item.eventType.slice(1)}
            </Text>
          </View>
          <View style={s.detailItem}>
            <Text style={s.detailIcon}>👥</Text>
            <Text style={s.detailText}>
              {item.guestCount} guests
            </Text>
          </View>
          <View style={s.detailItem}>
            <Text style={s.detailIcon}>📅</Text>
            <Text style={s.detailText}>
              {new Date(item.eventDate).toLocaleDateString('en-IN', {
                day:   'numeric',
                month: 'short',
                year:  'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Card Footer */}
        <View style={s.cardFooter}>
          <Text style={s.amount}>
            ₹{item.pricing?.totalAmount?.toLocaleString('en-IN')}
          </Text>
          <View style={s.actions}>
            {/* Chat Button */}
            <TouchableOpacity
              style={s.chatBtn}
              onPress={() => navigation.navigate('Chat', {
                bookingId:    item._id,
                receiverId:   item.halwaiId?._id,
                receiverName: item.halwaiId?.name,
              })}
            >
              <Text style={s.chatBtnText}>💬</Text>
            </TouchableOpacity>
            {/* Track Button */}
            <TouchableOpacity
              style={s.trackBtn}
              onPress={() => navigation.navigate('Tracking', {
                bookingId: item._id
              })}
            >
              <Text style={s.trackBtnText}>Track →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6F00', '#E65100']}
        style={s.header}
      >
        <Text style={s.title}>My Bookings</Text>
        <Text style={s.sub}>
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={s.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => String(item.key)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                s.filterChip,
                activeFilter === item.key && s.filterChipActive
              ]}
              onPress={() => onFilterPress(item.key)}
            >
              <Text style={[
                s.filterText,
                activeFilter === item.key && s.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bookings List */}
      {loading ? (
        <ActivityIndicator
          color={COLORS.saffron}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.saffron]}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 56 }}>📋</Text>
              <Text style={s.emptyTitle}>No bookings yet</Text>
              <Text style={s.emptySubText}>
                Book a halwai for your next event!
              </Text>
              <TouchableOpacity
                style={s.bookNowBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={s.bookNowText}>Find a Halwai →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },
  header: { padding: 20, paddingBottom: 20 },
  title:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    backgroundColor:   '#fff',
  },
  filterChipActive: {
    backgroundColor: COLORS.saffron,
    borderColor:     COLORS.saffron,
  },
  filterText:       { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    marginBottom:    12,
    padding:         16,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   12,
  },
  cardLeft:    { flex: 1 },
  bookingId:   { fontSize: 12, color: COLORS.gray400, marginBottom: 4 },
  halwaiName:  { fontSize: 16, fontWeight: '700', color: COLORS.gray800 },
  statusBadge: {
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:   4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardDetails: {
    flexDirection:   'row',
    gap:             16,
    marginBottom:    12,
    paddingBottom:   12,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 12, color: COLORS.gray600 },
  cardFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  amount: { fontSize: 16, fontWeight: '800', color: COLORS.green },
  actions:{ flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  chatBtnText: { fontSize: 16 },
  trackBtn: {
    backgroundColor: COLORS.saffron,
    borderRadius:    10,
    paddingHorizontal:12,
    paddingVertical:  8,
  },
  trackBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
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
  bookNowBtn: {
    marginTop:       20,
    backgroundColor: COLORS.saffron,
    borderRadius:    12,
    paddingHorizontal:24,
    paddingVertical:  12,
  },
  bookNowText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});