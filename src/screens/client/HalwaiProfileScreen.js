import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { halwaiAPI } from '../../utils/api';
import { COLORS, SHADOWS, BOOKING_STATUSES } from '../../utils/theme';

export default function HalwaiProfileScreen({ route, navigation }) {
  const { halwaiId } = route.params;
  const [halwai, setHalwai]   = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab]   = useState('about');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await halwaiAPI.getById(halwaiId);
        setHalwai(data.halwai);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [halwaiId]);

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={COLORS.saffron} size="large" />
      </View>
    );
  }

  if (!halwai) {
    return (
      <View style={s.loader}>
        <Text style={{ fontSize: 48 }}>😔</Text>
        <Text style={s.errorText}>Halwai not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

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

          <View style={s.profileTop}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 48 }}>👨‍🍳</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.name}>
                {halwai.userId?.name}
              </Text>
              <Text style={s.exp}>
                {halwai.experience} years experience
              </Text>
              <View style={s.ratingRow}>
                <View style={s.ratingBadge}>
                  <Text style={s.ratingText}>
                    ⭐ {halwai.rating?.average?.toFixed(1) || '4.5'}
                  </Text>
                </View>
                <Text style={s.ratingCount}>
                  ({halwai.rating?.count || 0} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={s.quickStats}>
            {[
              { label: 'Price/Plate', value: `₹${halwai.basePricePerPlate}` },
              { label: 'Min Guests',  value: halwai.minGuests },
              { label: 'Max Guests',  value: halwai.maxGuests },
              { label: 'Service KM',  value: `${halwai.serviceRadius}km` },
            ].map(stat => (
              <View key={stat.label} style={s.quickStat}>
                <Text style={s.quickStatValue}>{stat.value}</Text>
                <Text style={s.quickStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Verified Badge */}
        {halwai.isVerified && (
          <View style={s.verifiedBanner}>
            <Text style={s.verifiedText}>
              ✅ Verified Halwai — Background checked & approved
            </Text>
          </View>
        )}

        {/* Specializations */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Specializations</Text>
          <View style={s.specRow}>
            {halwai.specialization?.map(spec => (
              <View key={spec} style={s.specChip}>
                <Text style={s.specText}>
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {['about', 'menu', 'portfolio', 'reviews'].map(tab => (
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

        {/* Tab Content */}
        <View style={s.tabContent}>

          {/* About Tab */}
          {activeTab === 'about' && (
            <View>
              <Text style={s.bioText}>
                {halwai.bio || 'No bio added yet.'}
              </Text>
              <View style={s.contactBox}>
                <Text style={s.contactTitle}>Contact Info</Text>
                <Text style={s.contactItem}>
                  📍 {halwai.userId?.location?.city || 'Location not set'}
                </Text>
                <Text style={s.contactItem}>
                  📱 {halwai.userId?.phone || 'Not available'}
                </Text>
              </View>
            </View>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <View>
              {halwai.menu?.length === 0 ? (
                <Text style={s.emptyText}>No menu items added yet</Text>
              ) : (
                halwai.menu?.map(item => (
                  <View key={item._id} style={s.menuItem}>
                    <View style={s.menuLeft}>
                      <Text style={s.menuName}>{item.name}</Text>
                      <Text style={s.menuDesc}>{item.description}</Text>
                      <View style={[
                        s.categoryBadge,
                        item.category === 'veg'
                          ? { backgroundColor: COLORS.greenLight }
                          : { backgroundColor: COLORS.errorLight }
                      ]}>
                        <Text style={[
                          s.categoryText,
                          item.category === 'veg'
                            ? { color: COLORS.green }
                            : { color: COLORS.error }
                        ]}>
                          {item.category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.menuPrice}>
                      ₹{item.pricePerPlate}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <View>
              {halwai.portfolio?.length === 0 ? (
                <Text style={s.emptyText}>No portfolio images added yet</Text>
              ) : (
                <View style={s.portfolioGrid}>
                  {halwai.portfolio?.map(item => (
                    <View key={item._id} style={s.portfolioItem}>
                      <View style={s.portfolioImg}>
                        <Text style={{ fontSize: 32 }}>🍽️</Text>
                      </View>
                      <Text style={s.portfolioCaption}>
                        {item.caption || item.eventType}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <View>
              {reviews.length === 0 ? (
                <Text style={s.emptyText}>No reviews yet</Text>
              ) : (
                reviews.map(review => (
                  <View key={review._id} style={s.reviewCard}>
                    <View style={s.reviewHeader}>
                      <View style={s.reviewAvatar}>
                        <Text style={{ fontSize: 20 }}>👤</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.reviewerName}>
                          {review.clientId?.name}
                        </Text>
                        <View style={s.starsRow}>
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Text key={i} style={{ fontSize: 12 }}>⭐</Text>
                          ))}
                        </View>
                      </View>
                      <Text style={s.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </Text>
                    </View>
                    <Text style={s.reviewComment}>
                      {review.comment}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={s.bookContainer}>
        <TouchableOpacity
          style={s.bookBtn}
          onPress={() => navigation.navigate('Booking', { halwai })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF6F00', '#E65100']}
            style={s.bookBtnGradient}
          >
            <Text style={s.bookBtnText}>
              Book Now — ₹{halwai.basePricePerPlate}/plate
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#fff' },
  loader: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor:'#fff',
  },
  errorText:  { fontSize: 16, color: COLORS.gray600, marginTop: 12 },
  header:     { padding: 20, paddingBottom: 24 },
  backBtn:    { marginBottom: 16 },
  backText:   { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  profileTop: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatar: {
    width:           80,
    height:          80,
    borderRadius:    20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  profileInfo: { flex: 1 },
  name: {
    fontSize:   22,
    fontWeight: '800',
    color:      '#fff',
    marginBottom:4,
  },
  exp:        { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBadge:{
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    8,
    paddingHorizontal:8,
    paddingVertical:  3,
  },
  ratingText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ratingCount:{ color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  quickStats: {
    flexDirection:   'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    16,
    padding:         12,
  },
  quickStat:      { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  quickStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  verifiedBanner: {
    backgroundColor: COLORS.greenLight,
    padding:         12,
    alignItems:      'center',
  },
  verifiedText:   { fontSize: 13, color: COLORS.green, fontWeight: '600' },
  section:        { padding: 16 },
  sectionTitle:   {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  specRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: {
    backgroundColor:  COLORS.saffronLight,
    borderRadius:     20,
    paddingHorizontal:12,
    paddingVertical:   6,
  },
  specText: { fontSize: 12, color: COLORS.saffron, fontWeight: '600' },
  tabs: {
    flexDirection:   'row',
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
    backgroundColor: '#fff',
  },
  tab: {
    flex:           1,
    paddingVertical:12,
    alignItems:     'center',
  },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: COLORS.saffron },
  tabText:       { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  tabTextActive: { color: COLORS.saffron, fontWeight: '700' },
  tabContent:    { padding: 16 },
  bioText:       { fontSize: 14, color: COLORS.gray600, lineHeight: 22 },
  contactBox: {
    marginTop:       16,
    padding:         14,
    backgroundColor: COLORS.gray100,
    borderRadius:    12,
  },
  contactTitle: {
    fontSize:     14,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 8,
  },
  contactItem: {
    fontSize:  13,
    color:     COLORS.gray600,
    marginBottom:6,
  },
  emptyText: {
    textAlign: 'center',
    color:     COLORS.gray400,
    fontSize:  14,
    marginTop: 24,
  },
  menuItem: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    padding:         14,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  menuLeft:       { flex: 1, marginRight: 12 },
  menuName:       { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  menuDesc:       { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  categoryBadge:  { marginTop: 6, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText:   { fontSize: 11, fontWeight: '600' },
  menuPrice:      { fontSize: 16, fontWeight: '800', color: COLORS.green },
  portfolioGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portfolioItem:  { width: '47%' },
  portfolioImg: {
    height:          120,
    backgroundColor: COLORS.saffronLight,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    6,
  },
  portfolioCaption: { fontSize: 12, color: COLORS.gray600, textAlign: 'center' },
  reviewCard: {
    padding:         14,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  reviewHeader:   { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  reviewAvatar: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: COLORS.gray100,
    alignItems:      'center',
    justifyContent:  'center',
  },
  reviewerName: { fontSize: 14, fontWeight: '600', color: COLORS.gray800 },
  starsRow:     { flexDirection: 'row', marginTop: 2 },
  reviewDate:   { fontSize: 11, color: COLORS.gray400 },
  reviewComment:{ fontSize: 13, color: COLORS.gray600, lineHeight: 20 },
  bookContainer:{
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