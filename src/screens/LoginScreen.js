import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../utils/theme';

export default function LoginScreen({ navigation, route }) {
  const role = route?.params?.role || 'client';
  const { login, saveAuth } = useAuth();

  // Login method tabs
  const [activeTab, setTab] = useState('phone');

  // Email login
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Phone + password login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass]   = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Phone OTP login
  const [otpPhone, setOtpPhone]   = useState('');
  const [otp, setOtp]             = useState('');
  const [otpSent, setOtpSent]     = useState(false);
  const [otpTimer, setOtpTimer]   = useState(0);
  const [devOtp, setDevOtp]       = useState('');

  // Forgot password modal
  const [showForgot, setShowForgot]       = useState(false);
  const [forgotStep, setForgotStep]       = useState(1);
  const [forgotPhone, setForgotPhone]     = useState('');
  const [forgotOtp, setForgotOtp]         = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [forgotDevOtp, setForgotDevOtp]   = useState('');

  const [loading, setLoading] = useState(false);

  const gradientColors = role === 'halwai'
    ? ['#1B5E20', '#2E7D32']
    : ['#FF6F00', '#E65100'];

  const activeColor = role === 'halwai' ? COLORS.green : COLORS.saffron;

  const startTimer = (setter) => {
    setter(60);
    const interval = setInterval(() => {
      setter(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── Email Login ──────────────────────────────────────────────────────────
  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Toast.show({ type: 'error', text1: 'Enter email and password' });
    }
    try {
      setLoading(true);
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const { data } = await authAPI.loginEmail({ email, password, fcmToken });
      await saveAuth(data.token, data.user);
      Toast.show({ type: 'success', text1: 'Welcome back! 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Phone + Password Login ───────────────────────────────────────────────
  const handlePhoneLogin = async () => {
    if (!loginPhone || !loginPass) {
      return Toast.show({ type: 'error', text1: 'Enter phone and password' });
    }
    if (loginPhone.length !== 10) {
      return Toast.show({ type: 'error', text1: 'Enter valid 10 digit phone' });
    }
    try {
      setLoading(true);
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const { data } = await authAPI.loginPhone({
        phone: `+91${loginPhone}`,
        password: loginPass,
        fcmToken,
      });
      await saveAuth(data.token, data.user);
      Toast.show({ type: 'success', text1: 'Welcome back! 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Send OTP for login ───────────────────────────────────────────────────
  const handleSendLoginOTP = async () => {
    if (otpPhone.length !== 10) {
      return Toast.show({ type: 'error', text1: 'Enter valid 10 digit phone' });
    }
    try {
      setLoading(true);
      const { data } = await authAPI.sendOTP({ phone: `+91${otpPhone}` });
      if (data.devOtp) setDevOtp(data.devOtp);
      setOtpSent(true);
      startTimer(setOtpTimer);
      Toast.show({ type: 'success', text1: `OTP sent to +91 ${otpPhone} 📱` });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP Login ─────────────────────────────────────────────────────
  const handleOTPLogin = async () => {
    if (otp.length !== 6) {
      return Toast.show({ type: 'error', text1: 'Enter 6 digit OTP' });
    }
    try {
      setLoading(true);
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const { data } = await authAPI.loginOTP({
        phone:    `+91${otpPhone}`,
        otp,
        fcmToken,
      });
      await saveAuth(data.token, data.user);
      Toast.show({ type: 'success', text1: 'Login successful! 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password Step 1: Send OTP ────────────────────────────────────
  const handleForgotSendOTP = async () => {
    if (forgotPhone.length !== 10) {
      return Toast.show({ type: 'error', text1: 'Enter valid 10 digit phone' });
    }
    try {
      setLoading(true);
      const { data } = await authAPI.forgotPassword({ phone: `+91${forgotPhone}` });
      if (data.devOtp) setForgotDevOtp(data.devOtp);
      setForgotStep(2);
      Toast.show({ type: 'success', text1: 'OTP sent! 📱' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password Step 2: Reset Password ───────────────────────────────
  const handleResetPassword = async () => {
    if (forgotOtp.length !== 6) {
      return Toast.show({ type: 'error', text1: 'Enter 6 digit OTP' });
    }
    if (newPassword.length < 6) {
      return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    }
    if (newPassword !== confirmPass) {
      return Toast.show({ type: 'error', text1: 'Passwords do not match' });
    }
    try {
      setLoading(true);
      await authAPI.resetPassword({
        phone:       `+91${forgotPhone}`,
        otp:         forgotOtp,
        newPassword,
      });
      Toast.show({ type: 'success', text1: 'Password reset successfully! ✅' });
      setShowForgot(false);
      setForgotStep(1);
      setForgotPhone('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPass('');
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <LinearGradient colors={gradientColors} style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.icon}>{role === 'halwai' ? '👨‍🍳' : '🙋'}</Text>
            <Text style={s.title}>Welcome Back!</Text>
            <Text style={s.sub}>Sign in as {role === 'halwai' ? 'Halwai' : 'Customer'}</Text>
          </LinearGradient>

          {/* Login Method Tabs */}
          <View style={s.tabs}>
            {[
              { key: 'phone', label: '📱 Phone' },
              { key: 'otp',   label: '🔐 OTP' },
              { key: 'email', label: '📧 Email' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, activeTab === tab.key && s.tabActive]}
                onPress={() => setTab(tab.key)}
              >
                <Text style={[s.tabText, activeTab === tab.key && { color: activeColor, fontWeight: '700' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.form}>

            {/* Phone + Password Login */}
            {activeTab === 'phone' && (
              <>
                <Text style={s.tabTitle}>Login with Phone & Password</Text>
                <Text style={s.label}>Phone Number</Text>
                <View style={s.phoneRow}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={loginPhone}
                    onChangeText={setLoginPhone}
                    placeholder="10 digit number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.gray400}
                  />
                </View>

                <Text style={s.label}>Password</Text>
                <View style={s.passRow}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={loginPass}
                    onChangeText={setLoginPass}
                    placeholder="Enter your password"
                    secureTextEntry={!showLoginPass}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TouchableOpacity onPress={() => setShowLoginPass(!showLoginPass)} style={s.eyeBtn}>
                    <Text style={{ fontSize: 18 }}>{showLoginPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={s.forgotBtn}
                  onPress={() => { setShowForgot(true); setForgotStep(1); }}
                >
                  <Text style={[s.forgotText, { color: activeColor }]}>
                    Forgot Password? Reset via OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btn, loading && { opacity: 0.7 }]}
                  onPress={handlePhoneLogin}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={s.btnGradient}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In →</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* OTP Login */}
            {activeTab === 'otp' && (
              <>
                <Text style={s.tabTitle}>Login with Phone OTP</Text>
                <Text style={s.label}>Phone Number</Text>
                <View style={s.phoneRow}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={otpPhone}
                    onChangeText={setOtpPhone}
                    placeholder="10 digit number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.gray400}
                    editable={!otpSent}
                  />
                </View>

                {!otpSent ? (
                  <TouchableOpacity
                    style={[s.btn, loading && { opacity: 0.7 }]}
                    onPress={handleSendLoginOTP}
                    disabled={loading}
                  >
                    <LinearGradient colors={gradientColors} style={s.btnGradient}>
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send OTP 📱</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <>
                    {devOtp ? (
                      <View style={s.devOtpBox}>
                        <Text style={s.devOtpLabel}>Development OTP:</Text>
                        <Text style={s.devOtpValue}>{devOtp}</Text>
                      </View>
                    ) : null}

                    <Text style={s.otpSentText}>✅ OTP sent to +91 {otpPhone}</Text>
                    <Text style={s.label}>Enter OTP</Text>
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
                      onPress={handleOTPLogin}
                      disabled={loading}
                    >
                      <LinearGradient colors={gradientColors} style={s.btnGradient}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify & Login ✅</Text>}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.resendBtn}
                      onPress={otpTimer === 0 ? handleSendLoginOTP : null}
                      disabled={otpTimer > 0}
                    >
                      <Text style={[s.resendText, { color: otpTimer > 0 ? COLORS.gray400 : activeColor }]}>
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : '🔄 Resend OTP'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                      <Text style={s.changePhoneText}>← Change Number</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* Email Login */}
            {activeTab === 'email' && (
              <>
                <Text style={s.tabTitle}>Login with Email & Password</Text>
                <Text style={s.label}>Email Address</Text>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.gray400}
                />

                <Text style={s.label}>Password</Text>
                <View style={s.passRow}>
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPass}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                    <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={s.forgotBtn}
                  onPress={() => { setShowForgot(true); setForgotStep(1); }}
                >
                  <Text style={[s.forgotText, { color: activeColor }]}>
                    Forgot Password? Reset via OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btn, loading && { opacity: 0.7 }]}
                  onPress={handleEmailLogin}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={s.btnGradient}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In →</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register', { role })}
              style={s.registerBtn}
            >
              <Text style={s.registerText}>
                Don't have an account?{' '}
                <Text style={{ color: activeColor, fontWeight: '700' }}>Register Free</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Forgot Password Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showForgot}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForgot(false)}
      >
        <View style={m.overlay}>
          <View style={m.container}>
            <View style={m.header}>
              <Text style={m.title}>🔑 Reset Password</Text>
              <TouchableOpacity onPress={() => { setShowForgot(false); setForgotStep(1); }}>
                <Text style={m.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step 1: Enter Phone */}
            {forgotStep === 1 && (
              <>
                <Text style={m.desc}>
                  Enter your registered phone number to receive OTP
                </Text>
                <Text style={m.label}>Phone Number</Text>
                <View style={m.phoneRow}>
                  <View style={m.prefix}>
                    <Text style={m.prefixText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[m.input, { flex: 1 }]}
                    value={forgotPhone}
                    onChangeText={setForgotPhone}
                    placeholder="10 digit number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.gray400}
                  />
                </View>
                <TouchableOpacity
                  style={[m.btn, loading && { opacity: 0.7 }]}
                  onPress={handleForgotSendOTP}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={m.btnGradient}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={m.btnText}>Send OTP 📱</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: Enter OTP + New Password */}
            {forgotStep === 2 && (
              <>
                <Text style={m.desc}>
                  Enter OTP sent to +91 {forgotPhone} and set new password
                </Text>

                {forgotDevOtp ? (
                  <View style={s.devOtpBox}>
                    <Text style={s.devOtpLabel}>Development OTP:</Text>
                    <Text style={s.devOtpValue}>{forgotDevOtp}</Text>
                  </View>
                ) : null}

                <Text style={m.label}>Enter OTP</Text>
                <TextInput
                  style={[m.input, { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 8 }]}
                  value={forgotOtp}
                  onChangeText={setForgotOtp}
                  placeholder="------"
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor={COLORS.gray400}
                />

                <Text style={m.label}>New Password</Text>
                <TextInput
                  style={m.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min 6 characters"
                  secureTextEntry={true}
                  placeholderTextColor={COLORS.gray400}
                />

                <Text style={m.label}>Confirm New Password</Text>
                <TextInput
                  style={m.input}
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  placeholder="Re-enter new password"
                  secureTextEntry={true}
                  placeholderTextColor={COLORS.gray400}
                />

                <TouchableOpacity
                  style={[m.btn, loading && { opacity: 0.7 }]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient colors={gradientColors} style={m.btnGradient}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={m.btnText}>Reset Password ✅</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setForgotStep(1)}
                  style={{ alignItems: 'center', marginTop: 12 }}
                >
                  <Text style={{ fontSize: 13, color: COLORS.gray600 }}>← Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#fff' },
  header:  { padding: 24, paddingTop: 20, paddingBottom: 32 },
  backBtn: { marginBottom: 16 },
  backText:{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  icon:    { fontSize: 52, marginBottom: 8 },
  title:   { fontSize: 28, fontWeight: '900', color: '#fff' },
  sub:     { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: '#fff',
  },
  tab:          { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: COLORS.saffron },
  tabText:      { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  form:         { padding: 24 },
  tabTitle:     { fontSize: 16, fontWeight: '700', color: COLORS.gray800, marginBottom: 4 },
  label:        { fontSize: 13, fontWeight: '600', color: COLORS.gray800, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.gray200,
    borderRadius: 12, padding: 14, fontSize: 15,
    color: COLORS.gray800, backgroundColor: '#fff',
  },
  phoneRow:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  phonePrefix:    { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, backgroundColor: COLORS.gray100 },
  phonePrefixText:{ fontSize: 13, color: COLORS.gray800, fontWeight: '600' },
  passRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:         { padding: 12 },
  forgotBtn:      { alignSelf: 'flex-end', marginTop: 8 },
  forgotText:     { fontSize: 13, fontWeight: '600' },
  btn:            { borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  btnGradient:    { paddingVertical: 16, alignItems: 'center' },
  btnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
  otpSentText:    { fontSize: 13, color: COLORS.green, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  otpInput:       { textAlign: 'center', fontSize: 28, fontWeight: '800', letterSpacing: 10 },
  devOtpBox: {
    backgroundColor: '#FFF9C4', borderRadius: 12,
    padding: 14, marginTop: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#F9A825',
  },
  devOtpLabel:    { fontSize: 11, color: '#F57F17', marginBottom: 4 },
  devOtpValue:    { fontSize: 28, fontWeight: '900', color: '#E65100', letterSpacing: 8 },
  resendBtn:      { alignItems: 'center', marginTop: 12, padding: 8 },
  resendText:     { fontSize: 13, fontWeight: '600' },
  changePhoneText:{ textAlign: 'center', fontSize: 13, color: COLORS.gray600, marginTop: 8 },
  registerBtn:    { alignItems: 'center', marginTop: 24, padding: 8 },
  registerText:   { fontSize: 14, color: COLORS.gray600 },
});

// Modal styles
const m = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  title:    { fontSize: 18, fontWeight: '800', color: COLORS.gray800 },
  closeBtn: { fontSize: 18, color: COLORS.gray600, padding: 4 },
  desc:     { fontSize: 13, color: COLORS.gray600, marginBottom: 8, lineHeight: 20 },
  label:    { fontSize: 13, fontWeight: '600', color: COLORS.gray800, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.gray200,
    borderRadius: 12, padding: 14, fontSize: 15,
    color: COLORS.gray800, backgroundColor: '#fff',
  },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  prefix:   { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, backgroundColor: COLORS.gray100 },
  prefixText: { fontSize: 13, color: COLORS.gray800, fontWeight: '600' },
  btn:        { borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  btnGradient:{ paddingVertical: 16, alignItems: 'center' },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});