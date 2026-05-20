import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { COLORS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

export default function ClientProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep]           = useState(1);
  const [deleteOtp, setDeleteOtp]             = useState('');
  const [devOtp, setDevOtp]                   = useState('');
  const [deleteLoading, setDeleteLoading]     = useState(false);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  // ─── Send Delete OTP ──────────────────────────────────────────────────────
  const handleSendDeleteOTP = async () => {
    try {
      setDeleteLoading(true);
      const { data } = await authAPI.sendDeleteOTP();
      if (data.devOtp) setDevOtp(data.devOtp);
      setDeleteStep(2);
      Toast.show({
        type:  'success',
        text1: '📱 OTP sent to your phone'
      });
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: err.response?.data?.message || 'Failed to send OTP'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Confirm Delete with OTP ──────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (deleteOtp.length !== 6) {
      return Toast.show({
        type:  'error',
        text1: 'Enter 6 digit OTP'
      });
    }
    try {
      setDeleteLoading(true);
      await authAPI.deleteAccount({ otp: deleteOtp });
      Toast.show({
        type:  'success',
        text1: 'Account deleted successfully'
      });
      setShowDeleteModal(false);
      logout();
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: err.response?.data?.message || 'Invalid OTP'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Menu Items ───────────────────────────────────────────────────────────
  const menuItems = [
    {
      icon:    '📋',
      label:   'My Bookings',
      desc:    'View all your bookings',
      color:   COLORS.saffronLight,
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      icon:    '💬',
      label:   'Messages',
      desc:    'Chat with halwais',
      color:   COLORS.infoLight,
      onPress: () => {},
    },
    {
      icon:    '🔔',
      label:   'Notifications',
      desc:    'Manage notifications',
      color:   '#FFF9C4',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon:    '❤️',
      label:   'Saved Halwais',
      desc:    'Your favourite halwais',
      color:   '#FCE4EC',
      onPress: () => {},
    },
    {
      icon:    '📍',
      label:   'My Address',
      desc:    'Manage delivery addresses',
      color:   COLORS.greenLight,
      onPress: () => {},
    },
    {
      icon:    '🔒',
      label:   'Privacy & Security',
      desc:    'Password and security settings',
      color:   COLORS.gray100,
      onPress: () => {},
    },
    {
      icon:    '❓',
      label:   'Help & Support',
      desc:    'Get help or contact us',
      color:   COLORS.saffronLight,
      onPress: () => {},
    },
    {
      icon:    '⭐',
      label:   'Rate the App',
      desc:    'Share your feedback',
      color:   '#FFF9C4',
      onPress: () => {},
    },
    {
      icon:    '🗑️',
      label:   'Delete Account',
      desc:    'Permanently delete your account',
      color:   COLORS.errorLight,
      onPress: () => setShowDeleteModal(true),
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#FF6F00', '#E65100']}
          style={s.header}
        >
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 40 }}>🙋</Text>
            </View>
            <TouchableOpacity style={s.editAvatarBtn}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.name}>{user?.name}</Text>
          {user?.email && (
            <Text style={s.email}>📧 {user?.email}</Text>
          )}
          <Text style={s.phone}>📱 +91 {user?.phone}</Text>

          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { icon: '📋', label: 'Bookings', value: '0' },
            { icon: '⭐', label: 'Reviews',  value: '0' },
            { icon: '❤️', label: 'Saved',    value: '0' },
          ].map((stat, index) => (
            <View
              key={stat.label}
              style={[
                s.statBox,
                index < 2 && {
                  borderRightWidth:  1,
                  borderRightColor:  COLORS.gray200
                }
              ]}
            >
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Info Card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>👤 Account Info</Text>
          {[
            ['Name',  user?.name  || 'Not set'],
            ['Phone', `+91 ${user?.phone}` || 'Not set'],
            ['Email', user?.email || 'Not added'],
            ['Role',  user?.role === 'client' ? '🙋 Customer' : '👨‍🍳 Halwai'],
          ].map(([label, value]) => (
            <View key={label} style={s.infoRow}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={s.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                s.menuItem,
                item.label === 'Delete Account' && s.menuItemDanger,
                index === menuItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[
                s.menuIconBox,
                { backgroundColor: item.color || COLORS.saffronLight }
              ]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={s.menuContent}>
                <Text style={[
                  s.menuLabel,
                  item.label === 'Delete Account' && { color: COLORS.error }
                ]}>
                  {item.label}
                </Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={s.appInfo}>
          <Text style={s.appName}>👨‍🍳 Halwai Setu</Text>
          <Text style={s.appVersion}>Version 1.0.0</Text>
          <Text style={s.appTagline}>
            Connecting you with the best halwais
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={s.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Delete Account Modal ──────────────────────────────────────────── */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeleteStep(1);
          setDeleteOtp('');
          setDevOtp('');
        }}
      >
        <View style={m.overlay}>
          <View style={m.container}>

            {/* Modal Header */}
            <View style={m.header}>
              <Text style={m.title}>🗑️ Delete Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteStep(1);
                  setDeleteOtp('');
                  setDevOtp('');
                }}
              >
                <Text style={m.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step 1: Warning */}
            {deleteStep === 1 && (
              <>
                <View style={m.warningBox}>
                  <Text style={m.warningIcon}>⚠️</Text>
                  <Text style={m.warningTitle}>
                    Are you sure?
                  </Text>
                  <Text style={m.warningDesc}>
                    This will permanently delete your account,
                    all bookings, messages and data.
                    This action cannot be undone!
                  </Text>
                </View>

                <Text style={m.phoneText}>
                  An OTP will be sent to:
                  {'\n'}📱 +91 {user?.phone}
                </Text>

                <TouchableOpacity
                  style={[m.deleteBtn, deleteLoading && { opacity: 0.7 }]}
                  onPress={handleSendDeleteOTP}
                  disabled={deleteLoading}
                >
                  {deleteLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={m.deleteBtnText}>
                        Send OTP to Delete 📱
                      </Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={m.cancelBtn}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={m.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: Enter OTP */}
            {deleteStep === 2 && (
              <>
                <Text style={m.otpDesc}>
                  Enter the OTP sent to +91 {user?.phone}
                  {'\n'}to confirm account deletion
                </Text>

                {/* Show dev OTP */}
                {devOtp ? (
                  <View style={m.devOtpBox}>
                    <Text style={m.devOtpLabel}>
                      Development OTP:
                    </Text>
                    <Text style={m.devOtpValue}>{devOtp}</Text>
                  </View>
                ) : null}

                <TextInput
                  style={m.otpInput}
                  value={deleteOtp}
                  onChangeText={setDeleteOtp}
                  placeholder="Enter 6 digit OTP"
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor={COLORS.gray400}
                />

                <TouchableOpacity
                  style={[m.deleteBtn, deleteLoading && { opacity: 0.7 }]}
                  onPress={handleConfirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={m.deleteBtnText}>
                        Confirm Delete Account 🗑️
                      </Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={m.cancelBtn}
                  onPress={() => {
                    setDeleteStep(1);
                    setDeleteOtp('');
                    setDevOtp('');
                  }}
                >
                  <Text style={m.cancelBtnText}>← Go Back</Text>
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
  safe:   { flex: 1, backgroundColor: COLORS.gray100 },
  header: { padding: 24, alignItems: 'center', paddingBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width:           90,
    height:          90,
    borderRadius:    45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     'rgba(255,255,255,0.5)',
  },
  editAvatarBtn: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: '#fff',
    alignItems:      'center',
    justifyContent:  'center',
  },
  name:  { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  editBtn: {
    backgroundColor:  'rgba(255,255,255,0.2)',
    borderRadius:     20,
    paddingHorizontal:20,
    paddingVertical:   8,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.4)',
  },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection:   'row',
    backgroundColor: '#fff',
    marginHorizontal:16,
    marginTop:       -20,
    borderRadius:    16,
    ...SHADOWS.md,
  },
  statBox:   { flex: 1, alignItems: 'center', padding: 16 },
  statIcon:  { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.saffron },
  statLabel: { fontSize: 11, color: COLORS.gray600, marginTop: 2 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    margin:          16,
    padding:         16,
    ...SHADOWS.sm,
  },
  infoTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    paddingVertical:  10,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  infoLabel: { fontSize: 13, color: COLORS.gray600 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray800 },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius:    16,
    marginHorizontal:16,
    marginBottom:    16,
    overflow:        'hidden',
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              12,
    padding:          14,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  menuItemDanger: { backgroundColor: '#FFF5F5' },
  menuIconBox: {
    width:          44,
    height:         44,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel:   { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  menuDesc:    { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  menuArrow:   { fontSize: 20, color: COLORS.gray400 },
  appInfo: { alignItems: 'center', paddingVertical: 16 },
  appName:    { fontSize: 16, fontWeight: '700', color: COLORS.gray800 },
  appVersion: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  appTagline: { fontSize: 12, color: COLORS.gray600, marginTop: 4 },
  logoutBtn: {
    marginHorizontal: 16,
    marginBottom:     16,
    padding:          16,
    borderRadius:     16,
    backgroundColor:  COLORS.errorLight,
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      '#FFCDD2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
});

const m = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent:  'flex-end',
  },
  container: {
    backgroundColor:     '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius:24,
    padding:             24,
    paddingBottom:       40,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   20,
  },
  title:    { fontSize: 18, fontWeight: '800', color: COLORS.gray800 },
  closeBtn: { fontSize: 20, color: COLORS.gray600, padding: 4 },
  warningBox: {
    backgroundColor: COLORS.errorLight,
    borderRadius:    16,
    padding:         16,
    alignItems:      'center',
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     '#FFCDD2',
  },
  warningIcon:  { fontSize: 40, marginBottom: 8 },
  warningTitle: {
    fontSize:     18,
    fontWeight:   '800',
    color:        COLORS.error,
    marginBottom: 8,
  },
  warningDesc: {
    fontSize:   13,
    color:      COLORS.error,
    textAlign:  'center',
    lineHeight: 20,
  },
  phoneText: {
    fontSize:   14,
    color:      COLORS.gray600,
    textAlign:  'center',
    marginBottom:16,
    lineHeight: 22,
  },
  deleteBtn: {
    backgroundColor: COLORS.error,
    borderRadius:    16,
    paddingVertical: 14,
    alignItems:      'center',
    marginBottom:    12,
  },
  deleteBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    borderRadius:    16,
    paddingVertical: 14,
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     COLORS.gray200,
  },
  cancelBtnText: { color: COLORS.gray600, fontSize: 15, fontWeight: '600' },
  otpDesc: {
    fontSize:     14,
    color:        COLORS.gray600,
    textAlign:    'center',
    lineHeight:   22,
    marginBottom: 16,
  },
  devOtpBox: {
    backgroundColor: '#FFF9C4',
    borderRadius:    12,
    padding:         14,
    alignItems:      'center',
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     '#F9A825',
  },
  devOtpLabel: { fontSize: 11, color: '#F57F17', marginBottom: 4 },
  devOtpValue: {
    fontSize:      28,
    fontWeight:    '900',
    color:         '#E65100',
    letterSpacing: 8,
  },
  otpInput: {
    borderWidth:   1.5,
    borderColor:   COLORS.gray200,
    borderRadius:  12,
    padding:       14,
    fontSize:      24,
    fontWeight:    '800',
    textAlign:     'center',
    letterSpacing: 8,
    color:         COLORS.gray800,
    marginBottom:  16,
  },
});