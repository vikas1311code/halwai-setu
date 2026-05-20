import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { halwaiAPI } from '../../utils/api';
import { COLORS, SHADOWS, EVENT_TYPES } from '../../utils/theme';

export default function SearchScreen({ navigation }) {
  const [search, setSearch]         = useState('');
  const [halwais, setHalwais]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [maxPrice, setMaxPrice]     = useState('');
  const [minRating, setMinRating]   = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async () => {
    try {
      setLoading(true);
      setSearched(true);
      const params = {};
      if (search)    params.city      = search;
      if (activeEvent) params.eventType = activeEvent;
      if (maxPrice)  params.maxPrice  = maxPrice;
      if (minRating) params.minRating = minRating;

      const { data } = await halwaiAPI.search(params);
      setHalwais(data.halwais || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, activeEvent, maxPrice, minRating]);

  const clearFilters = () => {
    setActiveEvent(null);
    setMaxPrice('');
    setMinRating('');
    setSearch('');
    setHalwais([]);
    setSearched(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>🔍 Search Halwais</Text>

        {/* Search Input */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by city or name..."
              placeholderTextColor={COLORS.gray400}
              returnKeyType="search"
              onSubmitEditing={doSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={s.filterToggleBtn}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Event Type Filter */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Event Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EVENT_TYPES.map(ev => (
              <TouchableOpacity
                key={ev.key}
                style={[
                  s.chip,
                  activeEvent === ev.key && s.chipActive
                ]}
                onPress={() =>
                  setActiveEvent(activeEvent === ev.key ? null : ev.key)
                }
              >
                <Text style={[
                  s.chipText,
                  activeEvent === ev.key && s.chipTextActive
                ]}>
                  {ev.emoji} {ev.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Extra Filters */}
        {showFilters && (
          <View style={s.filtersBox}>
            <Text style={s.sectionTitle}>More Filters</Text>

            <Text style={s.filterLabel}>Max Price per Plate (₹)</Text>
            <TextInput
              style={s.filterInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="e.g. 500"
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={s.filterLabel}>Minimum Rating</Text>
            <View style={s.ratingRow}>
              {['3', '3.5', '4', '4.5'].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[
                    s.ratingChip,
                    minRating === r && s.ratingChipActive
                  ]}
                  onPress={() => setMinRating(minRating === r ? '' : r)}
                >
                  <Text style={[
                    s.ratingChipText,
                    minRating === r && { color: '#fff' }
                  ]}>
                    ⭐ {r}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={s.clearBtn}
              onPress={clearFilters}
            >
              <Text style={s.clearBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Button */}
        <View style={s.searchBtnContainer}>
          <TouchableOpacity
            style={s.searchBtn}
            onPress={doSearch}
            activeOpacity={0.85}
          >
            <Text style={s.searchBtnText}>Search Halwais 🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {loading ? (
          <ActivityIndicator
            color={COLORS.saffron}
            size="large"
            style={{ marginTop: 40 }}
          />
        ) : searched && halwais.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>😔</Text>
            <Text style={s.emptyText}>No halwais found</Text>
            <Text style={s.emptySubText}>
              Try different filters or city
            </Text>
          </View>
        ) : (
          halwais.map(item => (
            <TouchableOpacity
              key={item._id}
              style={s.resultCard}
              onPress={() =>
                navigation.navigate('HalwaiProfile', {
                  halwaiId: item._id
                })
              }
              activeOpacity={0.85}
            >
              {/* Avatar */}
              <View style={s.avatar}>
                <Text style={{ fontSize: 32 }}>👨‍🍳</Text>
              </View>

              {/* Info */}
              <View style={s.resultInfo}>
                <View style={s.resultRow}>
                  <Text style={s.resultName}>
                    {item.userId?.name}
                  </Text>
                  <View style={s.ratingBadge}>
                    <Text style={s.ratingText}>
                      ⭐ {item.rating?.average?.toFixed(1) || '4.5'}
                    </Text>
                  </View>
                </View>
                <Text style={s.resultSpec}>
                  {item.specialization?.join(', ')}
                </Text>
                <View style={s.resultMeta}>
                  <Text style={s.metaText}>
                    📍 {item.userId?.location?.city}
                  </Text>
                  <Text style={s.metaText}>
                    ₹{item.basePricePerPlate}/plate
                  </Text>
                  <Text style={s.metaText}>
                    {item.experience} yrs exp
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  header: {
    padding:         16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize:     20,
    fontWeight:   '800',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  searchBox: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    backgroundColor: COLORS.gray100,
    borderRadius:  12,
    paddingHorizontal: 12,
    paddingVertical:   10,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    COLORS.gray800,
  },
  filterToggleBtn: {
    padding:         10,
    backgroundColor: COLORS.saffronLight,
    borderRadius:    12,
  },
  section:      { padding: 16 },
  sectionTitle: {
    fontSize:     14,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      24,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    backgroundColor:   '#fff',
    marginRight:       10,
  },
  chipActive:     {
    backgroundColor: COLORS.saffronLight,
    borderColor:     COLORS.saffron,
  },
  chipText:       {
    fontSize:   13,
    fontWeight: '500',
    color:      COLORS.gray600,
  },
  chipTextActive: { color: COLORS.saffron },
  filtersBox: {
    margin:          16,
    padding:         16,
    backgroundColor: COLORS.gray100,
    borderRadius:    16,
  },
  filterLabel: {
    fontSize:     13,
    fontWeight:   '600',
    color:        COLORS.gray800,
    marginBottom: 6,
    marginTop:    12,
  },
  filterInput: {
    backgroundColor: '#fff',
    borderRadius:    10,
    padding:         12,
    fontSize:        14,
    color:           COLORS.gray800,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
  },
  ratingRow: {
    flexDirection: 'row',
    gap:           8,
    flexWrap:      'wrap',
  },
  ratingChip: {
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    backgroundColor:   '#fff',
  },
  ratingChipActive: {
    backgroundColor: COLORS.saffron,
    borderColor:     COLORS.saffron,
  },
  ratingChipText: {
    fontSize:   12,
    fontWeight: '600',
    color:      COLORS.gray600,
  },
  clearBtn: {
    marginTop:  12,
    padding:    10,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize:   13,
    color:      COLORS.error,
    fontWeight: '600',
  },
  searchBtnContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchBtn: {
    backgroundColor: COLORS.saffron,
    borderRadius:    16,
    paddingVertical: 14,
    alignItems:      'center',
    ...SHADOWS.sm,
  },
  searchBtnText: {
    color:      '#fff',
    fontSize:   15,
    fontWeight: '700',
  },
  empty:       { alignItems: 'center', paddingVertical: 40 },
  emptyText:   {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.gray800,
    marginTop:  12,
  },
  emptySubText:{ fontSize: 13, color: COLORS.gray600, marginTop: 4 },
  resultCard: {
    flexDirection:   'row',
    gap:             12,
    padding:         14,
    marginHorizontal:16,
    marginBottom:    12,
    backgroundColor: '#fff',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  avatar: {
    width:           64,
    height:          64,
    borderRadius:    12,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  resultInfo:  { flex: 1 },
  resultRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   4,
  },
  resultName: {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.gray800,
    flex:       1,
  },
  ratingBadge: {
    backgroundColor: COLORS.green,
    borderRadius:    6,
    paddingHorizontal:6,
    paddingVertical:  2,
  },
  ratingText:  { color: '#fff', fontSize: 11, fontWeight: '700' },
  resultSpec:  {
    fontSize:  12,
    color:     COLORS.saffron,
    fontWeight:'500',
    marginBottom: 6,
  },
  resultMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaText:   { fontSize: 11, color: COLORS.gray600 },
});