import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../utils/theme';

export default function RegisterScreen({ navigation, route }) {
  const role = route?.params?.role || 'client';
  const { saveAuth } = useAuth();

  const [step, setStep]             = useState(1); // 1=phone, 2=otp, 3=details
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState('');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [otpTimer, setOtpTimer]     = useState(0);
  const [devOtp, setDevOtp]         = useState('');

  const startTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      return Toast.show({ type: 'error', text1: 'Enter valid 10 digit phone number' });
    }
    try {
      setLoading(true);
      const { data } = await authAPI.sendOTP({ phone: `+91${phone}` });
      if (data.devOtp) setDevOtp(data.devOtp);
      startTimer();
      setStep(2);
      Toast.show({ type: 'success', text1: `OTP sent to +91 ${phone} 📱` });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      return Toast.show({ type: 'error', text1: 'Enter 6 digit OTP' });
    }
    setStep(3);
  };

  // Step 3: Complete Registration
  const handleRegister = async () => {
    if (!name) {
      return Toast.show({ type: 'error', text1: 'Name is required' });
    }
    if (email && !email.includes('@')) {
      return Toast.show({ type: 'error', text1: 'Enter valid email address' });
    }
    if (password && password.length < 6) {
      return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    }
    if (password && password !== confirm) {
      return Toast.show({ type: 'error', text1: 'Passwords do not match' });
    }

    try {
      setLoading(true);
      const { data } = await authAPI.register({
        name,
        phone:    `+91${phone}`,
        email:    email || undefined,
        otp,
        password: password || undefined,
        role,
      });
      await saveAuth(data.token, data.user);
      Toast.show({ type: 'success', text1: 'Account created! Welcome 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const gradientColors = role === 'halwai'
    ? ['#1B5E20', '#2E7D32']
    : ['#FF6F00', '#E65100'];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient colors={gradientColors} style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.icon}>{role === 'halwai' ? '👨‍🍳' : '🙋'}</Text>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.sub}>Register as {role === 'halwai' ? 'Halwai / Cook' : 'Customer'}</Text>

            {/* Step Indicator */}
            <View style={s.stepRow}>
              {[1, 2, 3].map(i => (
                <View key={i} style={s.stepItem}>
                  <View style={[s.stepCircle, step >= i && s.stepCircleActive]}>
                    <Text style={[s.stepNum, step >= i && { color: '#fff' }]}>{i}</Text>
                  </View>
                  <Text style={s.stepLabel}>
                    {i === 1 ? 'Phone' : i === 2 ? 'OTP' : 'Details'}
                  </Text>
                  {i < 3 && <View style={[s.stepLine, step > i && s.stepLineActive]} />}
                </View>
              ))}
            </View>
          </LinearGradient>

          <View style={s.form}>

            {/* STEP 1: Phone Number */}
            {step === 1 && (
              <>
                <Text style={s.stepTitle}>📱 Enter Phone Number</Text>
                <Text style={s.stepDesc}>
                  We will send an OTP to verify your number
                </Text>
                <Text style={s.label}>Phone Number *</Text>
                <View style={s.phoneRow}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10 digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.gray400}
                  />
                </View>

                <TouchableOpacity
                  style={[s.btn, loading && { opacity: 0.7 }]}
                  onPress={handleSendOTP}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={s.btnGradient}>
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.btnText}>Send OTP 📱</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login', { role })}
                  style={s.loginLink}
                >
                  <Text style={s.loginText}>
                    Already have an account?{' '}
                    <Text style={{ color: COLORS.saffron, fontWeight: '700' }}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <>
                <Text style={s.stepTitle}>🔐 Verify OTP</Text>
                <Text style={s.stepDesc}>
                  Enter the 6 digit OTP sent to +91 {phone}
                </Text>

                {/* Show OTP in dev mode */}
                {devOtp ? (
                  <View style={s.devOtpBox}>
                    <Text style={s.devOtpLabel}>Development OTP:</Text>
                    <Text style={s.devOtpValue}>{devOtp}</Text>
                  </View>
                ) : null}

                <Text style={s.label}>Enter OTP *</Text>
                <TextInput
                  style={[s.input, s.otpInput]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="------"
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor={COLORS.gray400}
                />

                <TouchableOpacity
                  style={[s.btn, loading && { opacity: 0.7 }]}
                  onPress={handleVerifyOTP}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={s.btnGradient}>
                    <Text style={s.btnText}>Verify OTP ✅</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Resend */}
                <TouchableOpacity
                  style={s.resendBtn}
                  onPress={otpTimer === 0 ? handleSendOTP : null}
                  disabled={otpTimer > 0}
                >
                  <Text style={[s.resendText, otpTimer > 0 && { color: COLORS.gray400 }]}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : '🔄 Resend OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} style={s.changePhone}>
                  <Text style={s.changePhoneText}>← Change Phone Number</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: Account Details */}
            {step === 3 && (
              <>
                <Text style={s.stepTitle}>👤 Your Details</Text>
                <Text style={s.stepDesc}>
                  Fill in your details to complete registration
                </Text>

                <Text style={s.label}>Full Name *</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.gray400}
                />

                <Text style={s.label}>Email Address (Optional)</Text>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com (optional)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.gray400}
                />

                <Text style={s.label}>Password (Optional)</Text>
                <Text style={s.hintText}>
                  Set a password if you want to login without OTP
                </Text>
                <View style={s.passRow}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min 6 characters (optional)"
                    secureTextEntry={!showPass}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                    <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                {password ? (
                  <>
                    <Text style={s.label}>Confirm Password</Text>
                    <TextInput
                      style={s.input}
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Re-enter password"
                      secureTextEntry={!showPass}
                      placeholderTextColor={COLORS.gray400}
                    />
                  </>
                ) : null}

                {/* Role Badge */}
                <View style={[s.roleBadge, {
                  backgroundColor: role === 'halwai' ? COLORS.greenLight : COLORS.saffronLight
                }]}>
                  <Text style={{ fontSize: 20 }}>{role === 'halwai' ? '👨‍🍳' : '🙋'}</Text>
                  <Text style={[s.roleText, {
                    color: role === 'halwai' ? COLORS.green : COLORS.saffron
                  }]}>
                    Registering as {role === 'halwai' ? 'Halwai / Cook' : 'Customer'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[s.btn, loading && { opacity: 0.7 }]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={s.btnGradient}>
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.btnText}>Create Account 🎉</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  header:  { padding: 24, paddingTop: 20, paddingBottom: 32 },
  backBtn: { marginBottom: 16 },
  backText:{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  icon:    { fontSize: 48, marginBottom: 8 },
  title:   { fontSize: 26, fontWeight: '900', color: '#fff' },
  sub:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem:{ flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
  stepNum:  { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  stepLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginLeft: 4, marginRight: 4 },
  stepLine: { width: 20, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
  form:     { padding: 24 },
  stepTitle:{ fontSize: 20, fontWeight: '800', color: COLORS.gray800, marginBottom: 6 },
  stepDesc: { fontSize: 13, color: COLORS.gray600, marginBottom: 16, lineHeight: 20 },
  label:    { fontSize: 13, fontWeight: '600', color: COLORS.gray800, marginBottom: 6, marginTop: 14 },
  hintText: { fontSize: 11, color: COLORS.gray400, marginBottom: 6, marginTop: -4 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.gray200,
    borderRadius: 12, padding: 14, fontSize: 15,
    color: COLORS.gray800, backgroundColor: '#fff',
  },
  phoneRow:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  phonePrefix:    { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, backgroundColor: COLORS.gray100 },
  phonePrefixText:{ fontSize: 13, color: COLORS.gray800, fontWeight: '600' },
  passRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:   { padding: 12 },
  otpInput: { textAlign: 'center', fontSize: 28, fontWeight: '800', letterSpacing: 10 },
  devOtpBox: {
    backgroundColor: '#FFF9C4', borderRadius: 12,
    padding: 14, marginBottom: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#F9A825',
  },
  devOtpLabel: { fontSize: 11, color: '#F57F17', marginBottom: 4 },
  devOtpValue: { fontSize: 28, fontWeight: '900', color: '#E65100', letterSpacing: 8 },
  btn:          { borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  btnGradient:  { paddingVertical: 16, alignItems: 'center' },
  btnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn:    { alignItems: 'center', marginTop: 16, padding: 8 },
  resendText:   { fontSize: 13, color: COLORS.saffron, fontWeight: '600' },
  changePhone:  { alignItems: 'center', marginTop: 8 },
  changePhoneText: { fontSize: 13, color: COLORS.gray600 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, marginTop: 16,
  },
  roleText:  { fontSize: 14, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20, padding: 8 },
  loginText: { fontSize: 14, color: COLORS.gray600 },
});