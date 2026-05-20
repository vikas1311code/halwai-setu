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
import { halwaiAPI } from '../../utils/api';
import { COLORS, SHADOWS, EVENT_TYPES } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

// ─── Halwai Card Component ────────────────────────────────────────────────────
const HalwaiCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={card.container}
    onPress={onPress}
    activeOpacity={0.85}
  >
    {/* Image placeholder */}
    <View style={card.img}>
      <Text style={{ fontSize: 52 }}>👨‍🍳</Text>
    </View>

    <View style={card.body}>
      {/* Name and Rating */}
      <View style={card.row}>
        <Text style={card.name}>
          {item.userId?.name || 'Halwai'}
        </Text>
        <View style={card.ratingBadge}>
          <Text style={card.ratingText}>
            ⭐ {item.rating?.average?.toFixed(1) || '4.5'}
          </Text>
        </View>
      </View>

      {/* Specialization */}
      <Text style={card.spec}>
        {item.specialization?.join(', ') || 'Wedding, Catering'}
      </Text>

      {/* Meta info */}
      <View style={card.meta}>
        <Text style={card.metaText}>
          📍 {item.userId?.location?.city || 'Your City'}
        </Text>
        <Text style={card.metaText}>
          👥 {item.minGuests}–{item.maxGuests} guests
        </Text>
      </View>

      {/* Price and Verified */}
      <View style={card.footer}>
        <Text style={card.price}>
          ₹{item.basePricePerPlate}/plate
        </Text>
        {item.isVerified && (
          <View style={card.verified}>
            <Text style={card.verifiedText}>✅ Verified</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [halwais, setHalwais]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeCategory, setCategory] = useState('all');

  const fetchHalwais = useCallback(async (eventType = null) => {
    try {
      const params = eventType && eventType !== 'all' 
        ? { eventType } 
        : {};
      const { data } = await halwaiAPI.search(params);
      setHalwais(data.halwais || []);
    } catch (err) {
      console.error('Fetch halwais error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchHalwais(); 
  }, []);

  const onCategoryPress = (key) => {
    setCategory(key);
    setLoading(true);
    fetchHalwais(key);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHalwais(activeCategory);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.saffron]}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#FF6F00', '#E65100']}
          style={s.header}
        >
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>Namaste 🙏</Text>
              <Text style={s.userName}>
                {user?.name?.split(' ')[0] || 'Friend'}
              </Text>
              <Text style={s.location}>
                📍 {user?.location?.city || 'Detecting location...'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={s.notifBtn}
            >
              <Text style={{ fontSize: 24 }}>🔔</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Text style={s.searchIcon}>🔍</Text>
          <Text style={s.searchPlaceholder}>
            Search halwais, events, cuisine...
          </Text>
          <View style={s.filterBtn}>
            <Text>⚙️</Text>
          </View>
        </TouchableOpacity>

        {/* Event Categories */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎪 Book by Event</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {[
              { key: 'all', label: 'All', emoji: '🌟' },
              ...EVENT_TYPES
            ].map((ev) => (
              <TouchableOpacity
                key={ev.key}
                style={[
                  s.chip,
                  activeCategory === ev.key && s.chipActive
                ]}
                onPress={() => onCategoryPress(ev.key)}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.chipText,
                  activeCategory === ev.key && s.chipTextActive
                ]}>
                  {ev.emoji} {ev.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { icon: '👨‍🍳', label: 'Halwais',   value: '500+' },
            { icon: '🎉', label: 'Events Done', value: '2000+' },
            { icon: '⭐', label: 'Avg Rating',  value: '4.8' },
          ].map((stat) => (
            <View key={stat.label} style={s.statBox}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Halwai List */}
        <View style={s.section}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>
              👨‍🍳 Top Halwais Near You
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              color={COLORS.saffron}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : halwais.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>😔</Text>
              <Text style={s.emptyText}>No halwais found</Text>
              <Text style={s.emptySubText}>
                Try a different category
              </Text>
            </View>
          ) : (
            halwais.map((item) => (
              <HalwaiCard
                key={item._id}
                item={item}
                onPress={() =>
                  navigation.navigate('HalwaiProfile', {
                    halwaiId: item._id
                  })
                }
              />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },
  scroll: { flex: 1 },
  header: { padding: 20, paddingBottom: 56 },
  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  greeting: { 
    fontSize: 13, 
    color:    'rgba(255,255,255,0.8)' 
  },
  userName: {
    fontSize:   24,
    fontWeight: '900',
    color:      '#fff',
    marginTop:  2,
  },
  location: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  notifBtn: {
    padding:         8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    12,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop:        -28,
    marginBottom:     8,
    backgroundColor:  '#fff',
    borderRadius:     16,
    padding:          14,
    flexDirection:    'row',
    alignItems:       'center',
    gap:              10,
    ...SHADOWS.md,
  },
  searchIcon:        { fontSize: 16 },
  searchPlaceholder: { 
    flex:     1, 
    fontSize: 14, 
    color:    COLORS.gray400 
  },
  filterBtn: {
    padding:         6,
    backgroundColor: COLORS.saffronLight,
    borderRadius:    8,
  },
  section:      { padding: 16, paddingTop: 20 },
  sectionTitle: {
    fontSize:     16,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  seeAll: { 
    fontSize:   13, 
    color:      COLORS.saffron, 
    fontWeight: '600' 
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      24,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    backgroundColor:   '#fff',
    marginRight:       10,
  },
  chipActive:     { 
    backgroundColor: COLORS.saffronLight, 
    borderColor:     COLORS.saffron 
  },
  chipText:       { 
    fontSize:   13, 
    fontWeight: '500', 
    color:      COLORS.gray600 
  },
  chipTextActive: { color: COLORS.saffron },
  statsRow: {
    flexDirection:   'row',
    marginHorizontal:16,
    backgroundColor: '#fff',
    borderRadius:    16,
    ...SHADOWS.sm,
  },
  statBox: {
    flex:           1,
    alignItems:     'center',
    padding:        16,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  statIcon:  { fontSize: 22, marginBottom: 4 },
  statValue: { 
    fontSize:   16, 
    fontWeight: '800', 
    color:      COLORS.saffron 
  },
  statLabel: { 
    fontSize:  11, 
    color:     COLORS.gray600, 
    marginTop: 2 
  },
  empty:       { alignItems: 'center', paddingVertical: 40 },
  emptyText:   { 
    fontSize:   16, 
    fontWeight: '700', 
    color:      COLORS.gray800, 
    marginTop:  12 
  },
  emptySubText:{ 
    fontSize:  13, 
    color:     COLORS.gray600, 
    marginTop: 4 
  },
});

const card = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius:    20,
    marginBottom:    16,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  img: {
    height:         140,
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor:COLORS.saffronLight,
  },
  body:   { padding: 14 },
  row:    { 
    flexDirection:  'row', 
    justifyContent: 'space-between', 
    alignItems:     'flex-start' 
  },
  name: {
    fontSize:   17,
    fontWeight: '700',
    color:      COLORS.gray800,
    flex:       1,
  },
  ratingBadge: {
    backgroundColor: COLORS.green,
    borderRadius:    8,
    paddingHorizontal:8,
    paddingVertical:  3,
  },
  ratingText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  spec:  { 
    fontSize:  12, 
    color:     COLORS.saffron, 
    fontWeight:'500', 
    marginTop: 4 
  },
  meta:  { 
    flexDirection: 'row', 
    gap:           12, 
    marginTop:     8 
  },
  metaText: { fontSize: 12, color: COLORS.gray600 },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      10,
  },
  price:    { 
    fontSize:   15, 
    fontWeight: '700', 
    color:      COLORS.green 
  },
  verified: {
    backgroundColor: COLORS.greenLight,
    borderRadius:    20,
    paddingHorizontal:8,
    paddingVertical:  2,
  },
  verifiedText: { 
    fontSize:   11, 
    color:      COLORS.green, 
    fontWeight: '600' 
  },
});