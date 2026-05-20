import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { halwaiAPI, authAPI } from '../../utils/api';
import { COLORS, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = [
  { key: 'wedding',   label: 'Wedding',   emoji: '💍' },
  { key: 'party',     label: 'Party',     emoji: '🎉' },
  { key: 'festival',  label: 'Festival',  emoji: '🪔' },
  { key: 'catering',  label: 'Catering',  emoji: '🍽️' },
  { key: 'corporate', label: 'Corporate', emoji: '🏢' },
  { key: 'sweets',    label: 'Sweets',    emoji: '🍮' },
];

const MENU_CATEGORIES = ['veg', 'non-veg', 'sweet', 'snack', 'beverage'];

export default function HalwaiProfileEdit({ navigation }) {
  const { user, logout } = useAuth();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setTab]         = useState('profile');

  // Profile fields
  const [bio, setBio]               = useState('');
  const [experience, setExperience] = useState('');
  const [basePrice, setBasePrice]   = useState('');
  const [minGuests, setMinGuests]   = useState('');
  const [maxGuests, setMaxGuests]   = useState('');
  const [serviceRadius, setRadius]  = useState('');
  const [isAvailable, setAvailable] = useState(true);
  const [specs, setSpecs]           = useState([]);

  // Menu fields
  const [menu, setMenu]             = useState([]);
  const [menuName, setMenuName]     = useState('');
  const [menuPrice, setMenuPrice]   = useState('');
  const [menuCategory, setMenuCat]  = useState('veg');
  const [menuDesc, setMenuDesc]     = useState('');

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep]           = useState(1);
  const [deleteOtp, setDeleteOtp]             = useState('');
  const [devOtp, setDevOtp]                   = useState('');
  const [deleteLoading, setDeleteLoading]     = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await halwaiAPI.getMyProfile();
        const h = data.halwai;
        setBio(h.bio || '');
        setExperience(String(h.experience || ''));
        setBasePrice(String(h.basePricePerPlate || ''));
        setMinGuests(String(h.minGuests || ''));
        setMaxGuests(String(h.maxGuests || ''));
        setRadius(String(h.serviceRadius || ''));
        setAvailable(h.isAvailable ?? true);
        setSpecs(h.specialization || []);
        setMenu(h.menu || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleSpec = (key) => {
    setSpecs(prev =>
      prev.includes(key)
        ? prev.filter(s => s !== key)
        : [...prev, key]
    );
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await halwaiAPI.updateProfile({
        bio,
        experience:        parseInt(experience),
        basePricePerPlate: parseInt(basePrice),
        minGuests:         parseInt(minGuests),
        maxGuests:         parseInt(maxGuests),
        serviceRadius:     parseInt(serviceRadius),
        isAvailable,
        specialization:    specs,
      });
      Toast.show({
        type:  'success',
        text1: 'Profile updated successfully! ✅'
      });
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: err.response?.data?.message || 'Update failed'
      });
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = async () => {
    if (!menuName || !menuPrice) {
      return Toast.show({
        type:  'error',
        text1: 'Name and price are required'
      });
    }
    try {
      const { data } = await halwaiAPI.addMenuItem({
        name:          menuName,
        description:   menuDesc,
        pricePerPlate: parseInt(menuPrice),
        category:      menuCategory,
      });
      setMenu(data.menu);
      setMenuName('');
      setMenuPrice('');
      setMenuDesc('');
      Toast.show({
        type:  'success',
        text1: 'Menu item added! ✅'
      });
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: 'Failed to add menu item'
      });
    }
  };

  const deleteMenuItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Remove this item from your menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text:    'Delete',
          style:   'destructive',
          onPress: async () => {
            try {
              const { data } = await halwaiAPI.deleteMenuItem(itemId);
              setMenu(data.menu);
              Toast.show({
                type:  'success',
                text1: 'Item removed'
              });
            } catch (err) {
              Toast.show({
                type:  'error',
                text1: 'Failed to delete item'
              });
            }
          }
        }
      ]
    );
  };

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

  // ─── Confirm Delete ───────────────────────────────────────────────────────
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

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32']}
          style={s.header}
        >
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 44 }}>👨‍🍳</Text>
            </View>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email || user?.phone}</Text>

          {/* Availability Toggle */}
          <View style={s.availabilityRow}>
            <Text style={s.availabilityLabel}>
              {isAvailable ? '🟢 Available' : '🔴 Not Available'}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={setAvailable}
              trackColor={{
                false: COLORS.gray400,
                true:  COLORS.greenMid
              }}
              thumbColor="#fff"
            />
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={s.tabs}>
          {['profile', 'menu', 'account'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setTab(tab)}
            >
              <Text style={[
                s.tabText,
                activeTab === tab && s.tabTextActive
              ]}>
                {tab === 'profile'
                  ? '👤 Profile'
                  : tab === 'menu'
                  ? '🍽️ Menu'
                  : '⚙️ Account'
                }
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={s.formSection}>

            <Text style={s.label}>Bio</Text>
            <TextInput
              style={s.textarea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell clients about yourself..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={3}
            />

            <Text style={s.label}>Years of Experience</Text>
            <TextInput
              style={s.input}
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 10"
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={s.label}>Base Price per Plate (₹)</Text>
            <TextInput
              style={s.input}
              value={basePrice}
              onChangeText={setBasePrice}
              placeholder="e.g. 250"
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Min Guests</Text>
                <TextInput
                  style={s.input}
                  value={minGuests}
                  onChangeText={setMinGuests}
                  placeholder="50"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Max Guests</Text>
                <TextInput
                  style={s.input}
                  value={maxGuests}
                  onChangeText={setMaxGuests}
                  placeholder="1000"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            <Text style={s.label}>Service Radius (km)</Text>
            <TextInput
              style={s.input}
              value={serviceRadius}
              onChangeText={setRadius}
              placeholder="e.g. 50"
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={s.label}>Specializations</Text>
            <View style={s.specGrid}>
              {SPECIALIZATIONS.map(spec => (
                <TouchableOpacity
                  key={spec.key}
                  style={[
                    s.specChip,
                    specs.includes(spec.key) && s.specChipActive
                  ]}
                  onPress={() => toggleSpec(spec.key)}
                >
                  <Text style={{ fontSize: 18 }}>{spec.emoji}</Text>
                  <Text style={[
                    s.specText,
                    specs.includes(spec.key) && { color: COLORS.green }
                  ]}>
                    {spec.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.7 }]}
              onPress={saveProfile}
              disabled={saving}
            >
              <LinearGradient
                colors={['#1B5E20', '#2E7D32']}
                style={s.saveBtnGradient}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.saveBtnText}>Save Profile ✅</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

          </View>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <View style={s.formSection}>

            <Text style={s.sectionTitle}>➕ Add Menu Item</Text>
            <View style={s.addMenuCard}>
              <Text style={s.label}>Item Name</Text>
              <TextInput
                style={s.input}
                value={menuName}
                onChangeText={setMenuName}
                placeholder="e.g. Dal Makhani"
                placeholderTextColor={COLORS.gray400}
              />

              <Text style={s.label}>Description</Text>
              <TextInput
                style={s.input}
                value={menuDesc}
                onChangeText={setMenuDesc}
                placeholder="Optional description"
                placeholderTextColor={COLORS.gray400}
              />

              <Text style={s.label}>Price per Plate (₹)</Text>
              <TextInput
                style={s.input}
                value={menuPrice}
                onChangeText={setMenuPrice}
                placeholder="e.g. 150"
                keyboardType="numeric"
                placeholderTextColor={COLORS.gray400}
              />

              <Text style={s.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MENU_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      s.catChip,
                      menuCategory === cat && s.catChipActive
                    ]}
                    onPress={() => setMenuCat(cat)}
                  >
                    <Text style={[
                      s.catText,
                      menuCategory === cat && { color: '#fff' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={s.addMenuBtn}
                onPress={addMenuItem}
              >
                <Text style={s.addMenuBtnText}>+ Add to Menu</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>
              🍽️ Current Menu ({menu.length} items)
            </Text>
            {menu.length === 0 ? (
              <Text style={s.emptyText}>
                No menu items yet. Add some above!
              </Text>
            ) : (
              menu.map(item => (
                <View key={item._id} style={s.menuItem}>
                  <View style={s.menuItemLeft}>
                    <Text style={s.menuItemName}>{item.name}</Text>
                    <Text style={s.menuItemDesc}>{item.description}</Text>
                    <Text style={s.menuItemCat}>{item.category}</Text>
                  </View>
                  <View style={s.menuItemRight}>
                    <Text style={s.menuItemPrice}>
                      ₹{item.pricePerPlate}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteMenuItem(item._id)}
                      style={s.deleteBtn}
                    >
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <View style={s.formSection}>

            {/* Account Info */}
            <View style={s.infoCard}>
              <Text style={s.sectionTitle}>👤 Account Info</Text>
              {[
                ['Name',  user?.name  || 'Not set'],
                ['Phone', `+91 ${user?.phone}` || 'Not set'],
                ['Email', user?.email || 'Not added'],
                ['Role',  '👨‍🍳 Halwai'],
              ].map(([label, value]) => (
                <View key={label} style={s.infoRow}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={s.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={s.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              style={s.deleteAccountBtn}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.85}
            >
              <Text style={s.deleteAccountText}>🗑️ Delete Account</Text>
              <Text style={s.deleteAccountDesc}>
                Permanently delete your account and all data
              </Text>
            </TouchableOpacity>

          </View>
        )}

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
                  <Text style={m.warningTitle}>Are you sure?</Text>
                  <Text style={m.warningDesc}>
                    This will permanently delete your halwai account,
                    all bookings, menu, portfolio and earnings data.
                    This action cannot be undone!
                  </Text>
                </View>

                <Text style={m.phoneText}>
                  An OTP will be sent to:{'\n'}
                  📱 +91 {user?.phone}
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

                {devOtp ? (
                  <View style={m.devOtpBox}>
                    <Text style={m.devOtpLabel}>Development OTP:</Text>
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
  loader: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  header:          { padding: 24, alignItems: 'center', paddingBottom: 28 },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     'rgba(255,255,255,0.4)',
  },
  name:  { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  availabilityRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              12,
    backgroundColor:  'rgba(255,255,255,0.15)',
    borderRadius:     20,
    paddingHorizontal:16,
    paddingVertical:   8,
  },
  availabilityLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabs: {
    flexDirection:    'row',
    backgroundColor:  '#fff',
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
  },
  tab: {
    flex:           1,
    paddingVertical:14,
    alignItems:     'center',
  },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: COLORS.green },
  tabText:       { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  tabTextActive: { color: COLORS.green, fontWeight: '700' },
  formSection:   { padding: 16 },
  sectionTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        COLORS.gray800,
    marginBottom: 12,
    marginTop:    8,
  },
  label: {
    fontSize:     13,
    fontWeight:   '600',
    color:        COLORS.gray800,
    marginBottom: 6,
    marginTop:    14,
  },
  input: {
    borderWidth:     1.5,
    borderColor:     COLORS.gray200,
    borderRadius:    12,
    padding:         13,
    fontSize:        14,
    color:           COLORS.gray800,
    backgroundColor: '#fff',
  },
  textarea: {
    borderWidth:      1.5,
    borderColor:      COLORS.gray200,
    borderRadius:     12,
    padding:          13,
    fontSize:         14,
    color:            COLORS.gray800,
    textAlignVertical:'top',
    minHeight:        80,
    backgroundColor:  '#fff',
  },
  row: { flexDirection: 'row', gap: 12 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specChip: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              6,
    paddingHorizontal:12,
    paddingVertical:   8,
    borderRadius:     20,
    borderWidth:      1.5,
    borderColor:      COLORS.gray200,
    backgroundColor:  '#fff',
  },
  specChipActive: {
    borderColor:     COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  specText: { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  saveBtn:        { borderRadius: 16, overflow: 'hidden', marginTop: 24 },
  saveBtnGradient:{ paddingVertical: 16, alignItems: 'center' },
  saveBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  addMenuCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    20,
    borderWidth:     1,
    borderColor:     COLORS.gray200,
    ...SHADOWS.sm,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       COLORS.gray200,
    marginRight:       8,
    backgroundColor:   '#fff',
  },
  catChipActive: {
    backgroundColor: COLORS.green,
    borderColor:     COLORS.green,
  },
  catText:       { fontSize: 12, color: COLORS.gray600, fontWeight: '500' },
  addMenuBtn: {
    backgroundColor: COLORS.green,
    borderRadius:    12,
    padding:         14,
    alignItems:      'center',
    marginTop:       16,
  },
  addMenuBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyText: {
    textAlign:      'center',
    color:          COLORS.gray400,
    fontSize:       14,
    paddingVertical:24,
  },
  menuItem: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    backgroundColor:  '#fff',
    borderRadius:     12,
    padding:          14,
    marginBottom:     10,
    borderWidth:      1,
    borderColor:      COLORS.gray200,
    ...SHADOWS.sm,
  },
  menuItemLeft:  { flex: 1 },
  menuItemName:  { fontSize: 14, fontWeight: '700', color: COLORS.gray800 },
  menuItemDesc:  { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  menuItemCat: {
    fontSize:      11,
    color:         COLORS.green,
    marginTop:     4,
    textTransform: 'capitalize',
  },
  menuItemRight: { alignItems: 'flex-end', gap: 8 },
  menuItemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.green },
  deleteBtn: {
    padding:         6,
    backgroundColor: COLORS.errorLight,
    borderRadius:    8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    16,
    ...SHADOWS.sm,
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
  logoutBtn: {
    marginBottom:    12,
    padding:         16,
    borderRadius:    16,
    backgroundColor: COLORS.errorLight,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#FFCDD2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  deleteAccountBtn: {
    padding:         16,
    borderRadius:    16,
    backgroundColor: '#3D0000',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#7D0000',
  },
  deleteAccountText: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#FF6B6B',
  },
  deleteAccountDesc: {
    fontSize:  11,
    color:     '#FF9999',
    marginTop: 4,
  },
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
    fontSize:    14,
    color:       COLORS.gray600,
    textAlign:   'center',
    marginBottom:16,
    lineHeight:  22,
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