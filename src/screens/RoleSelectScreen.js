import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';

export default function RoleSelectScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const proceed = () => {
    if (!selected) return;
    navigation.navigate('Login', { role: selected });
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView 
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.icon}>👨‍🍳</Text>
          <Text style={s.title}>I am a...</Text>
          <Text style={s.sub}>Choose your role to continue</Text>
        </View>

        {/* Role Cards */}
        <View style={s.cards}>

          {/* Client Card */}
          <TouchableOpacity
            style={[
              s.card,
              selected === 'client' && s.cardSelected
            ]}
            onPress={() => setSelected('client')}
            activeOpacity={0.85}
          >
            <Text style={s.cardIcon}>🙋</Text>
            <View style={s.cardContent}>
              <Text style={[
                s.cardTitle,
                selected === 'client' && { color: COLORS.saffron }
              ]}>
                Customer
              </Text>
              <Text style={s.cardDesc}>
                I want to book a halwai for my event
              </Text>
            </View>
            <View style={[
              s.radio,
              selected === 'client' && s.radioSelected
            ]}>
              {selected === 'client' && (
                <View style={s.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          {/* Halwai Card */}
          <TouchableOpacity
            style={[
              s.card,
              selected === 'halwai' && s.cardSelectedGreen
            ]}
            onPress={() => setSelected('halwai')}
            activeOpacity={0.85}
          >
            <Text style={s.cardIcon}>👨‍🍳</Text>
            <View style={s.cardContent}>
              <Text style={[
                s.cardTitle,
                selected === 'halwai' && { color: COLORS.green }
              ]}>
                Halwai / Cook
              </Text>
              <Text style={s.cardDesc}>
                I am a cook or caterer offering services
              </Text>
            </View>
            <View style={[
              s.radio,
              selected === 'halwai' && s.radioSelectedGreen
            ]}>
              {selected === 'halwai' && (
                <View style={[s.radioDot, { backgroundColor: COLORS.green }]} />
              )}
            </View>
          </TouchableOpacity>

        </View>

        {/* Features List */}
        <View style={s.features}>
          {selected === 'client' && (
            <View style={s.featureBox}>
              <Text style={s.featureTitle}>As a Customer you can:</Text>
              {[
                '🔍 Search halwais near you',
                '📅 Book for any event',
                '💳 Pay securely online',
                '📍 Track booking status',
                '💬 Chat with halwai',
                '⭐ Rate & review',
              ].map((f, i) => (
                <Text key={i} style={s.featureItem}>{f}</Text>
              ))}
            </View>
          )}

          {selected === 'halwai' && (
            <View style={[s.featureBox, { borderColor: COLORS.green }]}>
              <Text style={[s.featureTitle, { color: COLORS.green }]}>
                As a Halwai you can:
              </Text>
              {[
                '📋 Manage bookings',
                '🍽️ Create your menu',
                '📸 Upload portfolio',
                '💰 Track earnings',
                '💬 Chat with clients',
                '⭐ Build your reputation',
              ].map((f, i) => (
                <Text key={i} style={s.featureItem}>{f}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[s.btn, !selected && { opacity: 0.5 }]}
          onPress={proceed}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              selected === 'halwai'
                ? ['#1B5E20', '#2E7D32']
                : ['#FF6F00', '#E65100']
            }
            style={s.btnGradient}
          >
            <Text style={s.btnText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login', { role: selected || 'client' })}
          style={s.loginLink}
        >
          <Text style={s.loginText}>
            Already have an account?{' '}
            <Text style={{ color: COLORS.saffron, fontWeight: '700' }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 40 },
  header:    { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  icon:      { fontSize: 56, marginBottom: 12 },
  title:     { fontSize: 28, fontWeight: '900', color: COLORS.gray800 },
  sub:       { fontSize: 15, color: COLORS.gray600, marginTop: 6 },
  cards:     { gap: 16, marginBottom: 24 },
  card: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            16,
    padding:        20,
    borderRadius:   20,
    borderWidth:    2,
    borderColor:    COLORS.gray200,
    backgroundColor:'#fff',
    ...SHADOWS.sm,
  },
  cardSelected: {
    borderColor:     COLORS.saffron,
    backgroundColor: COLORS.saffronLight,
  },
  cardSelectedGreen: {
    borderColor:     COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  cardIcon:    { fontSize: 44 },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize:   18,
    fontWeight: '700',
    color:      COLORS.gray800,
  },
  cardDesc: {
    fontSize:  13,
    color:     COLORS.gray600,
    marginTop: 4,
    lineHeight:18,
  },
  radio: {
    width:           24,
    height:          24,
    borderRadius:    12,
    borderWidth:     2,
    borderColor:     COLORS.gray400,
    alignItems:      'center',
    justifyContent:  'center',
  },
  radioSelected:      { borderColor: COLORS.saffron },
  radioSelectedGreen: { borderColor: COLORS.green },
  radioDot: {
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: COLORS.saffron,
  },
  features:    { marginBottom: 24 },
  featureBox: {
    padding:      16,
    borderRadius: 16,
    borderWidth:  1.5,
    borderColor:  COLORS.saffron,
    backgroundColor: COLORS.saffronLight,
  },
  featureTitle: {
    fontSize:     14,
    fontWeight:   '700',
    color:        COLORS.saffron,
    marginBottom: 10,
  },
  featureItem: {
    fontSize:   13,
    color:      COLORS.gray800,
    marginBottom:6,
    lineHeight: 20,
  },
  btn: {
    borderRadius: 16,
    overflow:     'hidden',
    marginBottom: 16,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems:      'center',
  },
  btnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', padding: 8 },
  loginText: { fontSize: 14, color: COLORS.gray600 },
});