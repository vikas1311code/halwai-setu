import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { paymentAPI } from '../../utils/api';
import { COLORS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

export default function PaymentScreen({ route, navigation }) {
  const { booking } = route.params;
  const { user }    = useAuth();

  const [loading, setLoading]     = useState(false);
  const [paymentType, setPayType] = useState('advance');

  const amount = paymentType === 'advance'
    ? booking.pricing.advanceAmount
    : booking.pricing.totalAmount;

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create order on backend
      const { data: orderData } = await paymentAPI.createOrder({
        bookingId: booking._id,
        paymentType,
      });

      // Step 2: Open Razorpay
      // Note: Install react-native-razorpay for real payments
      // For now showing success simulation
      Alert.alert(
        '💳 Payment',
        `Pay ₹${amount.toLocaleString('en-IN')} via Razorpay?\n\nOrder ID: ${orderData.orderId}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false),
          },
          {
            text: 'Pay Now',
            onPress: async () => {
              try {
                // Simulate payment verification
                // In real app use RazorpayCheckout.open()
                const { data: verifyData } = await paymentAPI.verify({
                  razorpayOrderId:   orderData.orderId,
                  razorpayPaymentId: `pay_test_${Date.now()}`,
                  razorpaySignature: 'test_signature',
                  paymentId:         orderData.paymentId,
                });

                Toast.show({
                  type:  'success',
                  text1: '✅ Payment Successful!',
                  text2: `Booking ID: ${booking.bookingId}`
                });

                navigation.replace('Tracking', {
                  bookingId: booking._id
                });

              } catch (err) {
                Toast.show({
                  type:  'error',
                  text1: 'Payment failed',
                  text2: err.response?.data?.message
                });
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );

    } catch (err) {
      Toast.show({
        type:  'error',
        text1: err.response?.data?.message || 'Payment failed'
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
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
        <Text style={s.title}>Payment</Text>
        <Text style={s.sub}>Booking #{booking.bookingId}</Text>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Summary */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Booking Summary</Text>
          {[
            [
              'Event',
              booking.eventType.charAt(0).toUpperCase() +
              booking.eventType.slice(1)
            ],
            [
              'Guests',
              `${booking.guestCount} people`
            ],
            [
              'Date',
              new Date(booking.eventDate).toLocaleDateString('en-IN', {
                day:   'numeric',
                month: 'long',
                year:  'numeric'
              })
            ],
            [
              'Total Amount',
              `₹${booking.pricing.totalAmount.toLocaleString('en-IN')}`
            ],
            [
              'Advance (30%)',
              `₹${booking.pricing.advanceAmount.toLocaleString('en-IN')}`
            ],
          ].map(([label, val]) => (
            <View key={label} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={s.summaryValue}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Payment Type Selection */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💳 Choose Payment Amount</Text>

          {[
            {
              key:    'advance',
              label:  '30% Advance Payment',
              amount: booking.pricing.advanceAmount,
              desc:   'Pay rest before the event',
              emoji:  '💰',
            },
            {
              key:    'full',
              label:  'Full Payment',
              amount: booking.pricing.totalAmount,
              desc:   'Pay entire amount now',
              emoji:  '✅',
            },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                s.payOption,
                paymentType === opt.key && s.payOptionSelected
              ]}
              onPress={() => setPayType(opt.key)}
              activeOpacity={0.85}
            >
              <Text style={s.payOptionEmoji}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[
                  s.payLabel,
                  paymentType === opt.key && { color: COLORS.saffron }
                ]}>
                  {opt.label}
                </Text>
                <Text style={s.payDesc}>{opt.desc}</Text>
              </View>
              <View style={s.payAmountBox}>
                <Text style={s.payAmount}>
                  ₹{opt.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏦 Payment Method</Text>
          <View style={s.methodsRow}>
            {[
              { icon: '💳', label: 'Card' },
              { icon: '📱', label: 'UPI' },
              { icon: '🏦', label: 'Net Banking' },
              { icon: '💵', label: 'Wallet' },
            ].map(m => (
              <View key={m.label} style={s.methodBox}>
                <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                <Text style={s.methodLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <Text style={s.razorpayNote}>
            Powered by Razorpay — All payment methods available
          </Text>
        </View>

        {/* Security Notice */}
        <View style={s.secureBox}>
          <Text style={s.secureText}>
            🔒 100% Secure Payment — SSL Encrypted
          </Text>
          <Text style={s.secureSubText}>
            Your payment information is safe and encrypted
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={s.btnContainer}>
        <View style={s.amountPreview}>
          <Text style={s.amountLabel}>Amount to Pay</Text>
          <Text style={s.amountValue}>
            ₹{amount.toLocaleString('en-IN')}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.payBtn, loading && { opacity: 0.7 }]}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF6F00', '#E65100']}
            style={s.payBtnGradient}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={s.payBtnText}>
                    Pay ₹{amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={s.payBtnSub}>via Razorpay</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingBottom: 24 },
  backBtn:  { marginBottom: 12 },
  backText: {
    color:      'rgba(255,255,255,0.9)',
    fontSize:   15,
    fontWeight: '600',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flex: 1 },
  card: {
    margin:          16,
    padding:         16,
    backgroundColor: '#fff',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  summaryLabel: { fontSize: 13, color: COLORS.gray600 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray800 },
  section:      { padding: 16 },
  sectionTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  payOption: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    padding:         16,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     COLORS.gray200,
    marginBottom:    12,
    backgroundColor: '#fff',
  },
  payOptionSelected: {
    borderColor:     COLORS.saffron,
    backgroundColor: COLORS.saffronLight,
  },
  payOptionEmoji: { fontSize: 28 },
  payLabel: {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.gray800,
  },
  payDesc:      { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  payAmountBox: { alignItems: 'flex-end' },
  payAmount:    {
    fontSize:   16,
    fontWeight: '800',
    color:      COLORS.green,
  },
  methodsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   12,
  },
  methodBox: {
    flex:            1,
    alignItems:      'center',
    padding:         12,
    backgroundColor: COLORS.gray100,
    borderRadius:    12,
    marginHorizontal:4,
  },
  methodLabel: {
    fontSize:  10,
    color:     COLORS.gray600,
    marginTop: 4,
    fontWeight:'600',
  },
  razorpayNote: {
    fontSize:  12,
    color:     COLORS.gray400,
    textAlign: 'center',
  },
  secureBox: {
    margin:          16,
    padding:         14,
    backgroundColor: COLORS.greenLight,
    borderRadius:    12,
    alignItems:      'center',
  },
  secureText:    {
    fontSize:   13,
    color:      COLORS.green,
    fontWeight: '600',
  },
  secureSubText: {
    fontSize:  11,
    color:     COLORS.greenMid,
    marginTop: 4,
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
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
  },
  amountPreview: { flex: 1 },
  amountLabel:   { fontSize: 11, color: COLORS.gray600 },
  amountValue:   {
    fontSize:   18,
    fontWeight: '900',
    color:      COLORS.gray800,
  },
  payBtn:        { flex: 2, borderRadius: 14, overflow: 'hidden' },
  payBtnGradient:{
    paddingVertical: 14,
    alignItems:      'center',
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  payBtnSub:  { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
});