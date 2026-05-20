export const COLORS = {
  saffron:      '#FF6F00',
  saffronLight: '#FFF3E0',
  saffronMid:   '#FFB74D',
  green:        '#1B5E20',
  greenLight:   '#E8F5E9',
  greenMid:     '#4CAF50',
  white:        '#FFFFFF',
  gray100:      '#F8F8F6',
  gray200:      '#EFEFED',
  gray400:      '#BDBDBD',
  gray600:      '#757575',
  gray800:      '#333333',
  error:        '#C62828',
  errorLight:   '#FFEBEE',
  warning:      '#E65100',
  info:         '#1565C0',
  infoLight:    '#E3F2FD',
  black:        '#000000',
  overlay:      'rgba(0,0,0,0.5)',
};

export const FONTS = {
  regular:  { fontFamily: 'System', fontWeight: '400' },
  medium:   { fontFamily: 'System', fontWeight: '500' },
  semibold: { fontFamily: 'System', fontWeight: '600' },
  bold:     { fontFamily: 'System', fontWeight: '700' },
  heavy:    { fontFamily: 'System', fontWeight: '900' },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 999,
};

export const EVENT_TYPES = [
  { key: 'wedding',   label: 'Wedding',   emoji: '💍', color: '#FFF3E0' },
  { key: 'party',     label: 'Party',     emoji: '🎉', color: '#E8F5E9' },
  { key: 'festival',  label: 'Festival',  emoji: '🪔', color: '#FFF9C4' },
  { key: 'catering',  label: 'Catering',  emoji: '🍽️', color: '#E3F2FD' },
  { key: 'corporate', label: 'Corporate', emoji: '🏢', color: '#EDE7F6' },
  { key: 'sweets',    label: 'Sweets',    emoji: '🍮', color: '#FCE4EC' },
];

export const BOOKING_STATUSES = {
  requested:   { label: 'Requested',   color: '#1565C0', bg: '#E3F2FD' },
  accepted:    { label: 'Accepted',    color: '#1B5E20', bg: '#E8F5E9' },
  rejected:    { label: 'Rejected',    color: '#C62828', bg: '#FFEBEE' },
  in_progress: { label: 'In Progress', color: '#FF6F00', bg: '#FFF3E0' },
  completed:   { label: 'Completed',   color: '#4CAF50', bg: '#E8F5E9' },
  cancelled:   { label: 'Cancelled',   color: '#757575', bg: '#EFEFED' },
};

// ⚠️ Change this to your computer IP address
export const API_BASE   = 'http://10.179.74.219:5000/api';
export const SOCKET_URL = 'http://10.179.74.219:5000';