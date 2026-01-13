import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getApiUrl, logNetworkConfig } from '../config/network';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logNetworkConfig();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔐 Attempting login for user: ${username}`);
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const text = await res.text();
      console.log(`📄 Response text: ${text}`);
      
      if (res.ok) {
        try {
          const user = JSON.parse(text);
          console.log('✅ User response:', user);
          
          // Phân quyền theo role
          if (user && user.role) {
            const role = user.role.toUpperCase();
            if (role === 'ADMIN') {
              Alert.alert('Đăng nhập thành công!', `Xin chào Admin ${user.fullName || user.username}`);
              router.push('/Admin');
            } else if (role === 'STAFF') {
              Alert.alert('Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Staff');
            } else if (role === 'CUSTOMER') {
              Alert.alert('Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Customer');
            } else {
              Alert.alert('Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Home');
            }
          } else {
            Alert.alert('Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
            router.push('/Home');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          Alert.alert('Lỗi', 'Phản hồi không hợp lệ từ server');
        }
      } else {
        console.error(`❌ Login failed: ${res.status}`);
        Alert.alert('Đăng nhập thất bại', text || `Lỗi ${res.status}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Kiểm tra IP trong config/network.ts');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
        </TouchableOpacity>
  <TouchableOpacity onPress={() => router.push('/Register')} style={styles.link}>
          <Text style={styles.linkText}>Chưa có tài khoản? <Text style={styles.linkHighlight}>Đăng ký</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    color: '#222',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 15,
  },
  linkHighlight: {
    color: '#0056b3',
    fontWeight: 'bold',
  },
});
