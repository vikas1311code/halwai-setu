import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { messageAPI } from '../utils/api';
import { COLORS, SOCKET_URL } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { bookingId, receiverId, receiverName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [connected, setConnected] = useState(false);
  const [sending, setSending]     = useState(false);

  const socketRef = useRef(null);
  const listRef   = useRef(null);

  // ─── Load message history ────────────────────────────────────────────────
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await messageAPI.getByBooking(bookingId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [bookingId]);

  // ─── Socket connection ───────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout:    10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('user:join', user._id);
    });

    socket.on(`chat:${bookingId}`, (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.find(m => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId, user._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setText('');
    setSending(true);

    // Optimistic update
    const optimistic = {
      _id:       `temp_${Date.now()}`,
      senderId:  { _id: user._id, name: user.name },
      message:   trimmed,
      timestamp: new Date(),
      isTemp:    true,
    };
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();

    try {
      // Send via REST API
      await messageAPI.send({
        bookingId,
        receiverId,
        message: trimmed,
      });

      // Also emit via socket for real-time
      socketRef.current?.emit('chat:send', {
        bookingId,
        senderId:   user._id,
        receiverId,
        message:    trimmed,
      });

    } catch (err) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      Toast.show({
        type:  'error',
        text1: 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return senderId === user._id || senderId?.toString() === user._id?.toString();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour:   '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }) => {
    const isMe = isMyMessage(item);
    const messages_list = messages;
    const prevMsg = index > 0 ? messages_list[index - 1] : null;
    const showAvatar = !isMe && (
      !prevMsg || isMyMessage(prevMsg)
    );

    return (
      <View style={[
        cs.msgWrapper,
        isMe ? cs.msgWrapperRight : cs.msgWrapperLeft
      ]}>
        {/* Avatar for receiver */}
        {!isMe && (
          <View style={[
            cs.msgAvatar,
            { opacity: showAvatar ? 1 : 0 }
          ]}>
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
        )}

        {/* Message Bubble */}
        <View style={[
          cs.bubble,
          isMe ? cs.bubbleMe : cs.bubbleThem,
          item.isTemp && { opacity: 0.7 },
        ]}>
          <Text style={[
            cs.msgText,
            isMe && { color: '#fff' }
          ]}>
            {item.message}
          </Text>
          <Text style={[
            cs.msgTime,
            isMe
              ? { color: 'rgba(255,255,255,0.7)' }
              : { color: COLORS.gray400 }
          ]}>
            {formatTime(item.timestamp)}
            {item.isTemp ? ' ⏳' : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderDateSeparator = (date) => (
    <View style={cs.dateSeparator}>
      <View style={cs.dateLine} />
      <Text style={cs.dateText}>{date}</Text>
      <View style={cs.dateLine} />
    </View>
  );

  return (
    <SafeAreaView style={cs.safe} edges={['top']}>
      {/* Header */}
      <View style={cs.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={cs.backBtn}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <View style={cs.headerAvatar}>
          <Text style={{ fontSize: 22 }}>👨‍🍳</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={cs.headerName}>
            {receiverName || 'Chat'}
          </Text>
          <Text style={[
            cs.headerStatus,
            { color: connected ? COLORS.greenMid : COLORS.gray400 }
          ]}>
            {connected ? '● Online' : '○ Connecting...'}
          </Text>
        </View>

        <TouchableOpacity style={cs.callBtn}>
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={cs.loadingContainer}>
          <ActivityIndicator color={COLORS.saffron} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={renderMessage}
          contentContainerStyle={cs.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={cs.emptyChat}>
              <Text style={{ fontSize: 48 }}>💬</Text>
              <Text style={cs.emptyChatText}>
                Start the conversation!
              </Text>
              <Text style={cs.emptyChatSubText}>
                Send a message to {receiverName}
              </Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={cs.inputArea}>
          {/* Attachment Button */}
          <TouchableOpacity style={cs.attachBtn}>
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={cs.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray400}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[
              cs.sendBtn,
              (!text.trim() || sending) && { opacity: 0.5 }
            ]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontSize: 18 }}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              12,
    padding:          12,
    paddingHorizontal:16,
    borderBottomWidth:1,
    borderBottomColor:COLORS.gray200,
    backgroundColor:  '#fff',
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: COLORS.saffronLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerName:   { fontSize: 16, fontWeight: '700', color: COLORS.gray800 },
  headerStatus: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  callBtn:      { padding: 8 },
  loadingContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding:        16,
    paddingBottom:  8,
    flexGrow:       1,
  },
  msgWrapper: {
    flexDirection: 'row',
    marginBottom:  6,
    alignItems:    'flex-end',
    gap:           6,
  },
  msgWrapperRight: { justifyContent: 'flex-end' },
  msgWrapperLeft:  { justifyContent: 'flex-start' },
  msgAvatar: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: COLORS.gray100,
    alignItems:      'center',
    justifyContent:  'center',
  },
  bubble: {
    maxWidth:     '75%',
    padding:      10,
    paddingHorizontal:14,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor:  COLORS.saffron,
    borderBottomRightRadius:4,
  },
  bubbleThem: {
    backgroundColor:  COLORS.gray100,
    borderBottomLeftRadius:4,
  },
  msgText: {
    fontSize:   14,
    color:      COLORS.gray800,
    lineHeight: 20,
  },
  msgTime: {
    fontSize:  10,
    marginTop: 4,
    textAlign: 'right',
  },
  dateSeparator: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
    marginVertical: 12,
  },
  dateLine: {
    flex:            1,
    height:          1,
    backgroundColor: COLORS.gray200,
  },
  dateText: { fontSize: 11, color: COLORS.gray400 },
  emptyChat: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     80,
  },
  emptyChatText:    {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.gray800,
    marginTop:  12,
  },
  emptyChatSubText: {
    fontSize:  13,
    color:     COLORS.gray600,
    marginTop: 6,
  },
  inputArea: {
    flexDirection:    'row',
    gap:              8,
    padding:          12,
    paddingHorizontal:16,
    borderTopWidth:   1,
    borderTopColor:   COLORS.gray200,
    alignItems:       'flex-end',
    backgroundColor:  '#fff',
  },
  attachBtn: { padding: 8 },
  input: {
    flex:             1,
    backgroundColor:  COLORS.gray100,
    borderRadius:     24,
    paddingHorizontal:16,
    paddingVertical:  10,
    fontSize:         14,
    color:            COLORS.gray800,
    maxHeight:        100,
  },
  sendBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: COLORS.saffron,
    alignItems:      'center',
    justifyContent:  'center',
  },
});