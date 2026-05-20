import React, { useState, useEffect } from 'react';
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
import { paymentAPI } from '../../utils/api';
import { COLORS, SHADOWS } from '../../utils/theme';

export default function HalwaiEarnings({ navigation }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setTab]       = useState('all');

  const fetchEarnings = async () => {
    try {
      const { data: res } = await paymentAPI.getEarnings();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchEarnings(); }}
            colors={[COLORS.green]}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32']}
          style={s.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
          >
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>My Earnings</Text>
          <Text style={s.sub}>Track your income</Text>

          {/* Total Earnings */}
          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Total Earnings</Text>
            <Text style={s.totalValue}>
              ₹{data?.totalEarnings?.toLocaleString('en-IN') || 0}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={s.statsRow}>
          {[
            {
              icon:  '💰',
              label: 'Total Earned',
              value: `₹${data?.totalEarnings?.toLocaleString('en-IN') || 0}`,
              color: COLORS.greenLight,
            },
            {
              icon:  '⏳',
              label: 'Pending',
              value: `₹${data?.pendingAmount?.toLocaleString('en-IN') || 0}`,
              color: COLORS.saffronLight,
            },
          ].map(stat => (
            <View
              key={stat.label}
              style={[s.statCard, { backgroundColor: stat.color }]}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>
                {stat.icon}
              </Text>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Breakdown */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊 Earnings Breakdown</Text>
          <View style={s.breakdownCard}>
            {[
              { label: 'This Week',  value: '₹12,500', trend: '↑ 12%' },
              { label: 'This Month', value: '₹48,000', trend: '↑ 8%' },
              { label: 'Last Month', value: '₹44,500', trend: '' },
              { label: 'This Year',  value: '₹2,40,000', trend: '↑ 24%' },
            ].map((item, i) => (
              <View
                key={item.label}
                style={[
                  s.breakdownRow,
                  i < 3 && {
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.gray200
                  }
                ]}
              >
                <Text style={s.breakdownLabel}>{item.label}</Text>
                <View style={s.breakdownRight}>
                  <Text style={s.breakdownValue}>{item.value}</Text>
                  {item.trend ? (
                    <Text style={s.breakdownTrend}>{item.trend}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📋 Transaction History</Text>

          {/* Tabs */}
          <View style={s.tabs}>
            {['all', 'received', 'pending'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setTab(tab)}
              >
                <Text style={[
                  s.tabText,
                  activeTab === tab && s.tabTextActive
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment List */}
          {data?.payments?.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>💸</Text>
              <Text style={s.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            data?.payments?.map((payment, i) => (
              <View key={payment._id || i} style={s.transactionCard}>
                <View style={s.transactionLeft}>
                  <View style={s.transactionIcon}>
                    <Text style={{ fontSize: 20 }}>💰</Text>
                  </View>
                  <View>
                    <Text style={s.transactionTitle}>
                      {payment.type === 'advance'
                        ? 'Advance Payment'
                        : 'Full Payment'}
                    </Text>
                    <Text style={s.transactionDate}>
                      {new Date(payment.createdAt)
                        .toLocaleDateString('en-IN', {
                          day:   'numeric',
                          month: 'short',
                          year:  'numeric',
                        })}
                    </Text>
                    {payment.bookingId?.bookingId && (
                      <Text style={s.transactionBooking}>
                        #{payment.bookingId.bookingId}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={s.transactionRight}>
                  <Text style={s.transactionAmount}>
                    +₹{payment.amount?.toLocaleString('en-IN')}
                  </Text>
                  <View style={[
                    s.transactionStatus,
                    payment.status === 'paid'
                      ? { backgroundColor: COLORS.greenLight }
                      : { backgroundColor: COLORS.saffronLight }
                  ]}>
                    <Text style={[
                      s.transactionStatusText,
                      payment.status === 'paid'
                        ? { color: COLORS.green }
                        : { color: COLORS.saffron }
                    ]}>
                      {payment.status === 'paid' ? 'Received' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Withdraw Section */}
        <View style={s.withdrawSection}>
          <Text style={s.withdrawTitle}>💳 Withdraw Earnings</Text>
          <Text style={s.withdrawDesc}>
            Available for withdrawal after event completion
          </Text>
          <View style={s.withdrawAmount}>
            <Text style={s.withdrawLabel}>Available Balance</Text>
            <Text style={s.withdrawValue}>
              ₹{data?.pendingAmount?.toLocaleString('en-IN') || 0}
            </Text>
          </View>
          <TouchableOpacity style={s.withdrawBtn}>
            <Text style={s.withdrawBtnText}>
              Request Withdrawal
            </Text>
          </TouchableOpacity>
        </View>

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
  },
  header:   { padding: 20, paddingBottom: 32 },
  backBtn:  { marginBottom: 12 },
  backText: {
    color:      'rgba(255,255,255,0.9)',
    fontSize:   15,
    fontWeight: '600',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  totalCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    16,
    padding:         16,
    marginTop:       16,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
    alignItems:      'center',
  },
  totalLabel: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.8)',
    marginBottom:4,
  },
  totalValue: {
    fontSize:   32,
    fontWeight: '900',
    color:      '#fff',
  },
  statsRow: {
    flexDirection:   'row',
    gap:             12,
    padding:         16,
    paddingTop:      20,
  },
  statCard: {
    flex:         1,
    padding:      16,
    borderRadius: 16,
    alignItems:   'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      COLORS.gray800,
    marginBottom:4,
  },
  statLabel: { fontSize: 12, color: COLORS.gray600 },
  section:   { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    overflow:        'hidden',
    ...SHADOWS.sm,
  },
  breakdownRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        14,
  },
  breakdownLabel: { fontSize: 14, color: COLORS.gray600 },
  breakdownRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  breakdownValue: {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.gray800,
  },
  breakdownTrend: {
    fontSize:        11,
    color:           COLORS.green,
    backgroundColor: COLORS.greenLight,
    paddingHorizontal:6,
    paddingVertical:  2,
    borderRadius:    10,
    fontWeight:      '600',
  },
  tabs: {
    flexDirection:   'row',
    backgroundColor: COLORS.gray100,
    borderRadius:    12,
    padding:         4,
    marginBottom:    12,
  },
  tab: {
    flex:           1,
    paddingVertical:8,
    alignItems:     'center',
    borderRadius:   10,
  },
  tabActive:     { backgroundColor: '#fff', ...SHADOWS.sm },
  tabText:       { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  tabTextActive: { color: COLORS.green, fontWeight: '700' },
  empty: {
    alignItems:   'center',
    paddingVertical:32,
  },
  emptyText: {
    fontSize:  14,
    color:     COLORS.gray600,
    marginTop: 12,
  },
  transactionCard: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: '#fff',
    borderRadius:    14,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    flex:          1,
  },
  transactionIcon: {
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: COLORS.greenLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  transactionTitle: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.gray800,
  },
  transactionDate: {
    fontSize:  12,
    color:     COLORS.gray400,
    marginTop: 2,
  },
  transactionBooking: {
    fontSize:  11,
    color:     COLORS.gray400,
    marginTop: 2,
  },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: {
    fontSize:     16,
    fontWeight:   '800',
    color:        COLORS.green,
    marginBottom: 4,
  },
  transactionStatus: {
    borderRadius:     20,
    paddingHorizontal:8,
    paddingVertical:   2,
  },
  transactionStatusText: { fontSize: 11, fontWeight: '600' },
  withdrawSection: {
    margin:          16,
    padding:         20,
    backgroundColor: '#fff',
    borderRadius:    16,
    ...SHADOWS.sm,
  },
  withdrawTitle: {
    fontSize:     16,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 4,
  },
  withdrawDesc: {
    fontSize:     13,
    color:        COLORS.gray600,
    marginBottom: 16,
  },
  withdrawAmount: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: COLORS.greenLight,
    borderRadius:    12,
    padding:         14,
    marginBottom:    16,
  },
  withdrawLabel: { fontSize: 13, color: COLORS.gray600 },
  withdrawValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      COLORS.green,
  },
  withdrawBtn: {
    backgroundColor: COLORS.green,
    borderRadius:    12,
    padding:         14,
    alignItems:      'center',
  },
  withdrawBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});