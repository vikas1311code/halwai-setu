import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { bookingAPI } from '../../utils/api';
import { COLORS, SHADOWS, EVENT_TYPES } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

export default function BookingScreen({ route, navigation }) {
  const { halwai } = route.params || {};
  const { user }   = useAuth();

  const [eventType, setEventType]     = useState('wedding');
  const [guestCount, setGuestCount]   = useState(150);
  const [selectedDate, setDate]       = useState(null);
  const [specialReqs, setSpecialReqs] = useState('');
  const [loading, setLoading]         = useState(false);

  // Price calculation
  const pricePerPlate = halwai?.basePricePerPlate || 250;
  const baseAmount    = guestCount * pricePerPlate;
  const serviceFee    = Math.round(baseAmount * 0.05);
  const platformFee   = 500;
  const totalAmount   = baseAmount + serviceFee + platformFee;
  const advanceAmount = Math.round(totalAmount * 0.3);

  // Next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleBooking = async () => {
    if (!selectedDate) {
      return Toast.show({
        type:  'error',
        text1: 'Please select a date'
      });
    }
    try {
      setLoading(true);
      const { data } = await bookingAPI.create({
        halwaiUserId:    halwai.userId?._id || halwai._id,
        eventType,
        eventDate:       selectedDate,
        guestCount,
        specialRequests: specialReqs,
      });
      Toast.show({
        type:  'success',
        text1: 'Booking created! 🎉',
        text2: 'Proceed to payment'
      });
      navigation.navigate('Payment', { booking: data.booking });
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: err.response?.data?.message || 'Booking failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
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
          <Text style={s.title}>Book Halwai</Text>
          <Text style={s.sub}>
            Booking for {halwai?.userId?.name || 'Halwai'}
          </Text>
        </LinearGradient>

        {/* Event Type */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎪 Select Event Type</Text>
          <View style={s.eventGrid}>
            {EVENT_TYPES.map(ev => (
              <TouchableOpacity
                key={ev.key}
                style={[
                  s.eventCard,
                  eventType === ev.key && s.eventCardSelected
                ]}
                onPress={() => setEventType(ev.key)}
                activeOpacity={0.8}
              >
                <Text style={s.eventEmoji}>{ev.emoji}</Text>
                <Text style={[
                  s.eventLabel,
                  eventType === ev.key && { color: COLORS.saffron }
                ]}>
                  {ev.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Guest Count */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👥 Number of Guests</Text>
          <View style={s.counter}>
            <TouchableOpacity
              style={s.counterBtn}
              onPress={() => setGuestCount(Math.max(50, guestCount - 25))}
            >
              <Text style={s.counterBtnText}>−</Text>
            </TouchableOpacity>
            <View style={s.counterValueBox}>
              <Text style={s.counterValue}>{guestCount}</Text>
              <Text style={s.counterLabel}>guests</Text>
            </View>
            <TouchableOpacity
              style={s.counterBtn}
              onPress={() => setGuestCount(Math.min(1000, guestCount + 25))}
            >
              <Text style={s.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.guestRange}>
            Min: {halwai?.minGuests || 50} · Max: {halwai?.maxGuests || 1000} guests
          </Text>
        </View>

        {/* Date Selection */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {dates.map((d, i) => {
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.dateChip,
                    isSelected && s.dateChipSelected
                  ]}
                  onPress={() => setDate(d)}
                >
                  <Text style={[
                    s.dateDay,
                    isSelected && { color: COLORS.saffron }
                  ]}>
                    {days[d.getDay()]}
                  </Text>
                  <Text style={[
                    s.dateNum,
                    isSelected && { color: COLORS.saffron }
                  ]}>
                    {d.getDate()}
                  </Text>
                  <Text style={[
                    s.dateMonth,
                    isSelected && { color: COLORS.saffron }
                  ]}>
                    {d.toLocaleString('default', { month: 'short' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Special Requests */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📝 Special Requests</Text>
          <TextInput
            style={s.textarea}
            value={specialReqs}
            onChangeText={setSpecialReqs}
            placeholder="Any dietary requirements, special dishes, etc..."
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary */}
        <View style={s.priceSummary}>
          <Text style={s.sectionTitle}>💰 Price Estimate</Text>
          {[
            [
              `Base (₹${pricePerPlate} × ${guestCount})`,
              `₹${baseAmount.toLocaleString('en-IN')}`
            ],
            [
              'Service Fee (5%)',
              `₹${serviceFee.toLocaleString('en-IN')}`
            ],
            [
              'Platform Fee',
              `₹${platformFee}`
            ],
          ].map(([label, val]) => (
            <View key={label} style={s.priceRow}>
              <Text style={s.priceLabel}>{label}</Text>
              <Text style={s.priceValue}>{val}</Text>
            </View>
          ))}

          <View style={[s.priceRow, s.totalRow]}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalValue}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={s.advanceRow}>
            <Text style={s.advanceLabel}>Advance (30%)</Text>
            <Text style={s.advanceValue}>
              ₹{advanceAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={s.btnContainer}>
        <TouchableOpacity
          style={[s.bookBtn, loading && { opacity: 0.7 }]}
          onPress={handleBooking}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF6F00', '#E65100']}
            style={s.bookBtnGradient}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.bookBtnText}>
                  Confirm & Pay ₹{advanceAmount.toLocaleString('en-IN')}
                </Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  scroll:  { flex: 1 },
  header: {
    padding:       20,
    paddingBottom: 24,
  },
  backBtn:  { marginBottom: 12 },
  backText: {
    color:      'rgba(255,255,255,0.9)',
    fontSize:   15,
    fontWeight: '600',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: {
    padding:         16,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  sectionTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
  },
  eventCard: {
    borderWidth:     2,
    borderColor:     COLORS.gray200,
    borderRadius:    14,
    padding:         14,
    alignItems:      'center',
    width:           '47%',
    backgroundColor: '#fff',
  },
  eventCardSelected: {
    borderColor:     COLORS.saffron,
    backgroundColor: COLORS.saffronLight,
  },
  eventEmoji: { fontSize: 28, marginBottom: 6 },
  eventLabel: {
    fontSize:   13,
    fontWeight: '600',
    color:      COLORS.gray800,
  },
  counter: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            32,
  },
  counterBtn: {
    width:           48,
    height:          48,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     COLORS.gray200,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#fff',
  },
  counterBtnText: {
    fontSize:   26,
    color:      COLORS.saffron,
    fontWeight: '700',
  },
  counterValueBox: { alignItems: 'center' },
  counterValue:    {
    fontSize:   32,
    fontWeight: '900',
    color:      COLORS.gray800,
  },
  counterLabel: { fontSize: 12, color: COLORS.gray600 },
  guestRange: {
    textAlign:  'center',
    fontSize:   12,
    color:      COLORS.gray400,
    marginTop:  8,
  },
  dateChip: {
    borderWidth:     1.5,
    borderColor:     COLORS.gray200,
    borderRadius:    14,
    padding:         12,
    alignItems:      'center',
    marginRight:     10,
    minWidth:        60,
    backgroundColor: '#fff',
  },
  dateChipSelected: {
    borderColor:     COLORS.saffron,
    backgroundColor: COLORS.saffronLight,
  },
  dateDay:   { fontSize: 11, color: COLORS.gray600 },
  dateNum:   {
    fontSize:   20,
    fontWeight: '800',
    color:      COLORS.gray800,
    marginVertical: 2,
  },
  dateMonth: { fontSize: 10, color: COLORS.gray400 },
  textarea: {
    borderWidth:     1.5,
    borderColor:     COLORS.gray200,
    borderRadius:    12,
    padding:         12,
    fontSize:        14,
    color:           COLORS.gray800,
    textAlignVertical:'top',
    minHeight:       80,
  },
  priceSummary: { padding: 16 },
  priceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  priceLabel: { fontSize: 13, color: COLORS.gray600 },
  priceValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray800 },
  totalRow: {
    borderTopWidth:  1.5,
    borderTopColor:  COLORS.gray200,
    paddingTop:      12,
    marginTop:       4,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray800 },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.gray800 },
  advanceRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    marginTop:       10,
    backgroundColor: COLORS.saffronLight,
    borderRadius:    12,
    padding:         14,
  },
  advanceLabel: { fontSize: 14, color: COLORS.gray600, fontWeight: '600' },
  advanceValue: {
    fontSize:   16,
    fontWeight: '800',
    color:      COLORS.saffron,
  },
  btnContainer: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    padding:         16,
    backgroundColor: '#fff',
    borderTopWidth:  1,
    borderTopColor:  COLORS.gray200,
  },
  bookBtn:        { borderRadius: 16, overflow: 'hidden' },
  bookBtnGradient:{ paddingVertical: 16, alignItems: 'center' },
  bookBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});