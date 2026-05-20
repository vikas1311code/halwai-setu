import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { bookingAPI } from '../../utils/api';
import { COLORS, SHADOWS, BOOKING_STATUSES } from '../../utils/theme';

const FILTERS = [
  { key: null,          label: 'All' },
  { key: 'requested',   label: 'New' },
  { key: 'accepted',    label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'rejected',    label: 'Rejected' },
];

export default function HalwaiOrders({ navigation }) {
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

  const handleStatusUpdate = (bookingId, newStatus) => {
    const messages = {
      accepted:    'Accept this booking?',
      rejected:    'Reject this booking?',
      in_progress: 'Mark as In Progress?',
      completed:   'Mark as Completed?',
    };

    Alert.alert(
      'Update Status',
      messages[newStatus],
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text:    'Confirm',
          onPress: async () => {
            try {
              await bookingAPI.updateStatus(bookingId, {
                status: newStatus
              });
              Toast.show({
                type:  'success',
                text1: `Status updated to ${newStatus}! ✅`
              });
              fetchBookings(activeFilter);
            } catch (err) {
              Toast.show({
                type:  'error',
                text1: 'Failed to update status'
              });
            }
          }
        }
      ]
    );
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      accepted:    'in_progress',
      in_progress: 'completed',
    };
    return flow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      accepted:    '▶️ Start Event',
      in_progress: '✅ Complete',
    };
    return labels[currentStatus] || null;
  };

  const renderBooking = ({ item }) => {
    const status      = BOOKING_STATUSES[item.bookingStatus];
    const nextStatus  = getNextStatus(item.bookingStatus);
    const nextLabel   = getNextStatusLabel(item.bookingStatus);

    return (
      <View style={s.card}>
        {/* Card Header */}
        <View style={s.cardHeader}>
          <View style={s.clientRow}>
            <View style={s.clientAvatar}>
              <Text style={{ fontSize: 22 }}>🙋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.clientName}>
                {item.clientId?.name}
              </Text>
              <Text style={s.bookingId}>
                #{item.bookingId}
              </Text>
            </View>
            <View style={[
              s.statusBadge,
              { backgroundColor: status?.bg }
            ]}>
              <Text style={[
                s.statusText,
                { color: status?.color }
              ]}>
                {status?.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={s.eventDetails}>
          <View style={s.eventDetailItem}>
            <Text style={s.eventDetailIcon}>🎪</Text>
            <Text style={s.eventDetailText}>
              {item.eventType.charAt(0).toUpperCase() +
               item.eventType.slice(1)}
            </Text>
          </View>
          <View style={s.eventDetailItem}>
            <Text style={s.eventDetailIcon}>👥</Text>
            <Text style={s.eventDetailText}>
              {item.guestCount} guests
            </Text>
          </View>
          <View style={s.eventDetailItem}>
            <Text style={s.eventDetailIcon}>📅</Text>
            <Text style={s.eventDetailText}>
              {new Date(item.eventDate).toLocaleDateString('en-IN', {
                day:   'numeric',
                month: 'short',
                year:  'numeric',
              })}
            </Text>
          </View>
          <View style={s.eventDetailItem}>
            <Text style={s.eventDetailIcon}>💰</Text>
            <Text style={s.eventDetailText}>
              ₹{item.pricing?.totalAmount?.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={s.paymentRow}>
          <Text style={s.paymentLabel}>Payment:</Text>
          <View style={[
            s.paymentBadge,
            item.paymentStatus === 'fully_paid'
              ? { backgroundColor: COLORS.greenLight }
              : item.paymentStatus === 'advance_paid'
              ? { backgroundColor: COLORS.saffronLight }
              : { backgroundColor: COLORS.gray100 }
          ]}>
            <Text style={[
              s.paymentText,
              item.paymentStatus === 'fully_paid'
                ? { color: COLORS.green }
                : item.paymentStatus === 'advance_paid'
                ? { color: COLORS.saffron }
                : { color: COLORS.gray600 }
            ]}>
              {item.paymentStatus?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={s.actions}>
          {/* Accept/Reject for new requests */}
          {item.bookingStatus === 'requested' && (
            <>
              <TouchableOpacity
                style={s.acceptBtn}
                onPress={() =>
                  handleStatusUpdate(item._id, 'accepted')
                }
              >
                <Text style={s.acceptBtnText}>✅ Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.rejectBtn}
                onPress={() =>
                  handleStatusUpdate(item._id, 'rejected')
                }
              >
                <Text style={s.rejectBtnText}>❌ Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Next Status Button */}
          {nextStatus && nextLabel && (
            <TouchableOpacity
              style={s.nextStatusBtn}
              onPress={() =>
                handleStatusUpdate(item._id, nextStatus)
              }
            >
              <Text style={s.nextStatusText}>{nextLabel}</Text>
            </TouchableOpacity>
          )}

          {/* Chat Button */}
          <TouchableOpacity
            style={s.chatBtn}
            onPress={() => navigation.navigate('Chat', {
              bookingId:    item._id,
              receiverId:   item.clientId?._id,
              receiverName: item.clientId?.name,
            })}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32']}
        style={s.header}
      >
        <Text style={s.title}>My Orders</Text>
        <Text style={s.sub}>
          {bookings.length} order{bookings.length !== 1 ? 's' : ''} found
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

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator
          color={COLORS.green}
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
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings(activeFilter);
              }}
              colors={[COLORS.green]}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 56 }}>📋</Text>
              <Text style={s.emptyTitle}>No orders found</Text>
              <Text style={s.emptySubText}>
                New bookings will appear here
              </Text>
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
    backgroundColor:   '#fff',
    paddingVertical:   12,
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
    backgroundColor: COLORS.green,
    borderColor:     COLORS.green,
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
  cardHeader:   { marginBottom: 12 },
  clientRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  clientAvatar: {
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  clientName: { fontSize: 15, fontWeight: '700', color: COLORS.gray800 },
  bookingId:  { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  statusBadge: {
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:   4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  eventDetails: {
    flexDirection:    'row',
    flexWrap:         'wrap',
    gap:              10,
    marginBottom:     12,
    paddingBottom:    12,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    width:         '47%',
  },
  eventDetailIcon: { fontSize: 14 },
  eventDetailText: { fontSize: 12, color: COLORS.gray600 },
  paymentRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginBottom:   12,
  },
  paymentLabel: { fontSize: 13, color: COLORS.gray600 },
  paymentBadge: {
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:   3,
  },
  paymentText: { fontSize: 11, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
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
  nextStatusBtn: {
    flex:            2,
    backgroundColor: COLORS.saffron,
    borderRadius:    10,
    padding:         10,
    alignItems:      'center',
  },
  nextStatusText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  chatBtn: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
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