import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id:   '1',
    icon: '🔍',
    title:'Find Your Halwai',
    desc: 'Search verified halwais by event type, budget and ratings near you.',
    bg:   ['#FF6F00', '#E65100'],
  },
  {
    id:   '2',
    icon: '🍽️',
    title:'Book & Pay Easily',
    desc: 'Choose your menu, set guest count, and pay securely via Razorpay.',
    bg:   ['#1B5E20', '#2E7D32'],
  },
  {
    id:   '3',
    icon: '🎉',
    title:'Celebrate Stress-Free',
    desc: 'Track your booking live, chat with your halwai, and enjoy your event.',
    bg:   ['#FF6F00', '#E65100'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      navigation.replace('RoleSelect');
    }
  };

  const skip = () => {
    navigation.replace('RoleSelect');
  };

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.bg}
            style={styles.slide}
          >
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.desc}</Text>
          </LinearGradient>
        )}
      />

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && styles.dotActive
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={next}
          activeOpacity={0.85}
          style={styles.btn}
        >
          <LinearGradient
            colors={['#FF6F00', '#E65100']}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>
              {index === SLIDES.length - 1 ? 'Get Started 🚀' : 'Next →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          onPress={skip}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  slide: {
    width,
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        40,
  },
  slideIcon: { 
    fontSize:     80, 
    marginBottom: 24 
  },
  slideTitle: {
    fontSize:    28,
    fontWeight:  '900',
    color:       '#fff',
    textAlign:   'center',
    marginBottom:12,
  },
  slideDesc: {
    fontSize:   15,
    color:      'rgba(255,255,255,0.85)',
    textAlign:  'center',
    lineHeight: 24,
  },
  bottom: {
    backgroundColor: '#fff',
    padding:         24,
    paddingBottom:   40,
    alignItems:      'center',
  },
  dots: { 
    flexDirection:  'row', 
    gap:            8, 
    marginBottom:   24 
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.gray200,
  },
  dotActive: {
    width:           24,
    backgroundColor: COLORS.saffron,
  },
  btn: {
    width:        '100%',
    borderRadius: 16,
    overflow:     'hidden',
    marginBottom: 12,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems:      'center',
  },
  btnText: {
    color:      '#fff',
    fontSize:   16,
    fontWeight: '700',
  },
  skipBtn: { 
    padding: 12 
  },
  skipText: { 
    fontSize: 14, 
    color:    COLORS.gray600 
  },
});