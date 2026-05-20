import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const loaderWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, { 
          toValue:         1, 
          duration:        600, 
          useNativeDriver: true 
        }),
        Animated.spring(scaleAnim, { 
          toValue:         1, 
          tension:         50,
          friction:        7,
          useNativeDriver: true 
        }),
      ]),
      // Load bar animation
      Animated.timing(loaderWidth, {
        toValue:         width * 0.5,
        duration:        1800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      navigation.replace('Onboarding');
    });
  }, []);

  return (
    <LinearGradient 
      colors={['#FF6F00', '#E65100']} 
      style={styles.container}
    >
      <Animated.View style={[
        styles.content, 
        { 
          opacity:   fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        {/* Logo Icon */}
        <Text style={styles.icon}>👨‍🍳</Text>

        {/* App Name */}
        <Text style={styles.logo}>Halwai</Text>
        <Text style={styles.logoSetu}>Setu</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>KHANA · LOVE · MEMORIES</Text>

        {/* Loader */}
        <View style={styles.loaderTrack}>
          <Animated.View 
            style={[styles.loaderBar, { width: loaderWidth }]} 
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: { 
    flex:            1, 
    alignItems:      'center', 
    justifyContent:  'center',
  },
  icon: { 
    fontSize:     80, 
    marginBottom: 16 
  },
  logo: {
    fontSize:   52,
    fontWeight: '900',
    color:      '#fff',
    lineHeight: 56,
  },
  logoSetu: {
    fontSize:      52,
    fontWeight:    '900',
    color:         'rgba(255,255,255,0.85)',
    lineHeight:    56,
    marginBottom:  16,
  },
  tagline: {
    fontSize:      12,
    color:         'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    marginTop:     8,
  },
  loaderTrack: {
    marginTop:       48,
    width:           '50%',
    height:          3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius:    2,
    overflow:        'hidden',
  },
  loaderBar: {
    height:          '100%',
    backgroundColor: '#fff',
    borderRadius:    2,
  },
  version: {
    marginTop: 24,
    fontSize:  12,
    color:     'rgba(255,255,255,0.5)',
  },
});