import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingAPI } from '../../utils/api';
import { COLORS, SHADOWS, BOOKING_STATUSES } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
  {
    key:   'requested',
    label: 'Booking Requested',
    icon:  '📋',
    desc:  'Your booking request has been sent',
  },
  {
    key:   'accepted',
    label: 'Booking Accepted',
    icon:  '✅',
    desc:  'Halwai has accepted your booking',
  },
  {
    key:   'in_progress',
    label: 'Event In Progress',
    icon:  '👨‍🍳',
    desc:  'Halwai is cooking for your event',
  },
  {
    key:   'completed',
    label: 'Event Completed',
    icon:  '🎉',
    desc:  'Your event has been completed',
  },
];

const STATUS_ORDER = [
  'requested',
  'accepted',
  'in_progress',
  'completed',
];

export default function TrackingScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const { user }      = useAuth();

  const [booking, setBooking]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooking = async () => {
    try {
      const { data } = await bookingAPI.getById(bookingId);
      setBooking(data.booking);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchBooking, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const getCurrentStepIndex = () => {
    if (!booking) return 0;
    return STATUS_ORDER.indexOf(booking.bookingStatus);
  };

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={COLORS.saffron} size="large" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={s.loader}>
        <Text style={{ fontSize: 48 }}>😔</Text>
        <Text style={s.errorText}>Booking not found</Text>
      </View>
    );
  }

  const currentStep = getCurrentStepIndex();
  const status      = BOOKING_STATUSES[booking.bookingStatus];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchBooking(); }}
            colors={[COLORS.saffron]}
          />
        }
      >
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
          <Text style={s.title}>Track Booking</Text>
          <Text style={s.bookingId}>#{booking.bookingId}</Text>

          {/* Status Badge */}
          <View style={[s.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={s.statusText}>
              {status?.label || booking.bookingStatus}
            </Text>
          </View>
        </LinearGradient>

        {/* Cancelled or Rejected */}
        {(booking.bookingStatus === 'cancelled' ||
          booking.bookingStatus === 'rejected') && (
          <View style={s.cancelledBox}>
            <Text style={s.cancelledIcon}>❌</Text>
            <Text style={s.cancelledTitle}>
              Booking {booking.bookingStatus === 'cancelled'
                ? 'Cancelled'
                : 'Rejected'}
            </Text>
            <Text style={s.cancelledReason}>
              {booking.cancelReason ||
               booking.rejectionReason ||
               'No reason provided'}
            </Text>
          </View>
        )}

        {/* Progress Tracker */}
        {booking.bookingStatus !== 'cancelled' &&
         booking.bookingStatus !== 'rejected' && (
          <View style={s.tracker}>
            <Text style={s.trackerTitle}>Booking Progress</Text>
            {STEPS.map((step, index) => {
              const isDone    = index <= currentStep;
              const isCurrent = index === currentStep;
              const isLast    = index === STEPS.length - 1;

              return (
                <View key={step.key} style={s.stepRow}>
                  {/* Left side - icon and line */}
                  <View style={s.stepLeft}>
                    <View style={[
                      s.stepIcon,
                      isDone    && s.stepIconDone,
                      isCurrent && s.stepIconCurrent,
                    ]}>
                      <Text style={{ fontSize: 16 }}>
                        {isDone ? step.icon : '○'}
                      </Text>
                    </View>
                    {!isLast && (
                      <View style={[
                        s.stepLine,
                        isDone && s.stepLineDone,
                      ]} />
                    )}
                  </View>

                  {/* Right side - content */}
                  <View style={s.stepContent}>
                    <Text style={[
                      s.stepLabel,
                      isDone && { color: COLORS.gray800, fontWeight: '700' },
                      !isDone && { color: COLORS.gray400 },
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={s.stepDesc}>{step.desc}</Text>
                    {isCurrent && (
                      <View style={s.currentBadge}>
                        <Text style={s.currentBadgeText}>Current Status</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Booking Details */}
        <View style={s.detailsCard}>
          <Text style={s.detailsTitle}>📋 Booking Details</Text>
          {[
            ['Event Type', booking.eventType],
            ['Guest Count', `${booking.guestCount} people`],
            ['Event Date', new Date(booking.eventDate)
              .toLocaleDateString('en-IN', {
                weekday: 'long',
                day:     'numeric',
                month:   'long',
                year:    'numeric',
              })
            ],
            ['Total Amount', `₹${booking.pricing?.totalAmount
              ?.toLocaleString('en-IN')}`
            ],
            ['Payment Status', booking.paymentStatus],
          ].map(([label, val]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Halwai Info */}
        <View style={s.halwaiCard}>
          <Text style={s.detailsTitle}>👨‍🍳 Your Halwai</Text>
          <View style={s.halwaiRow}>
            <View style={s.halwaiAvatar}>
              <Text style={{ fontSize: 28 }}>👨‍🍳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.halwaiName}>
                {booking.halwaiId?.name}
              </Text>
              <Text style={s.halwaiPhone}>
                📱 {booking.halwaiId?.phone}
              </Text>
            </View>
            <TouchableOpacity
              style={s.chatBtn}
              onPress={() => navigation.navigate('Chat', {
                bookingId:    booking._id,
                receiverId:   booking.halwaiId?._id,
                receiverName: booking.halwaiId?.name,
              })}
            >
              <Text style={s.chatBtnText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Review Button - show when completed */}
        {booking.bookingStatus === 'completed' &&
         !booking.isReviewed && (
          <View style={s.reviewSection}>
            <Text style={s.reviewPrompt}>
              How was your experience? Rate your halwai!
            </Text>
            <TouchableOpacity
              style={s.reviewBtn}
              onPress={() => navigation.navigate('Review', {
                bookingId: booking._id,
                halwaiId:  booking.halwaiId?._id,
              })}
            >
              <Text style={s.reviewBtnText}>⭐ Write a Review</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },
  loader: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor:'#fff',
  },
  errorText: {
    fontSize:  16,
    color:     COLORS.gray600,
    marginTop: 12,
  },
  header:   { padding: 20, paddingBottom: 24 },
  backBtn:  { marginBottom: 12 },
  backText: {
    color:      'rgba(255,255,255,0.9)',
    fontSize:   15,
    fontWeight: '600',
  },
  title:     { fontSize: 22, fontWeight: '800', color: '#fff' },
  bookingId: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf:       'flex-start',
    marginTop:       10,
    paddingHorizontal:12,
    paddingVertical:  6,
    borderRadius:    20,
  },
  statusText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelledBox: {
    margin:          16,
    padding:         20,
    backgroundColor: COLORS.errorLight,
    borderRadius:    16,
    alignItems:      'center',
  },
  cancelledIcon:   { fontSize: 40, marginBottom: 8 },
  cancelledTitle: {
    fontSize:   18,
    fontWeight: '700',
    color:      COLORS.error,
    marginBottom:8,
  },
  cancelledReason: { fontSize: 14, color: COLORS.error, textAlign: 'center' },
  tracker: {
    margin:          16,
    padding:         16,
    backgroundColor: '#fff',
    borderRadius:    16,
    ...SHADOWS.sm,
  },
  trackerTitle: {
    fontSize:     16,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap:           12,
  },
  stepLeft: {
    alignItems: 'center',
    width:      40,
  },
  stepIcon: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: COLORS.gray200,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepIconDone:    { backgroundColor: COLORS.greenLight },
  stepIconCurrent: { backgroundColor: COLORS.saffronLight },
  stepLine: {
    width:           2,
    flex:            1,
    backgroundColor: COLORS.gray200,
    marginVertical:  4,
    minHeight:       24,
  },
  stepLineDone: { backgroundColor: COLORS.greenMid },
  stepContent:  { flex: 1, paddingBottom: 20 },
  stepLabel:    { fontSize: 14, marginBottom: 2 },
  stepDesc:     { fontSize: 12, color: COLORS.gray400 },
  currentBadge: {
    alignSelf:        'flex-start',
    marginTop:        6,
    backgroundColor:  COLORS.saffronLight,
    borderRadius:     20,
    paddingHorizontal:10,
    paddingVertical:   3,
  },
  currentBadgeText: {
    fontSize:   11,
    color:      COLORS.saffron,
    fontWeight: '600',
  },
  detailsCard: {
    margin:          16,
    marginTop:       0,
    padding:         16,
    backgroundColor: '#fff',
    borderRadius:    16,
    ...SHADOWS.sm,
  },
  detailsTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical:8,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  detailLabel: { fontSize: 13, color: COLORS.gray600 },
  detailValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray800 },
  halwaiCard: {
    margin:          16,
    marginTop:       0,
    padding:         16,
    backgroundColor: '#fff',
    borderRadius:    16,
    ...SHADOWS.sm,
  },
  halwaiRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  halwaiAvatar: {
    width:           52,
    height:          52,
    borderRadius:    14,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  halwaiName:  { fontSize: 15, fontWeight: '700', color: COLORS.gray800 },
  halwaiPhone: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  chatBtn: {
    backgroundColor: COLORS.saffron,
    borderRadius:    10,
    paddingHorizontal:12,
    paddingVertical:  8,
  },
  chatBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  reviewSection: {
    margin:          16,
    padding:         16,
    backgroundColor: COLORS.saffronLight,
    borderRadius:    16,
    alignItems:      'center',
  },
  reviewPrompt: {
    fontSize:     14,
    color:        COLORS.gray800,
    textAlign:    'center',
    marginBottom: 12,
  },
  reviewBtn: {
    backgroundColor: COLORS.saffron,
    borderRadius:    12,
    paddingHorizontal:24,
    paddingVertical:  10,
  },
  reviewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});