import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getApiUrl, logNetworkConfig } from '../config/network';
import { useCart } from '../context/CartContext';

export default function LoginScreen() {
  const router = useRouter();
  const { resetCart } = useCart();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logNetworkConfig();
  }, []);

  const handleLogin = async () => {
    if (!username?.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔐 Attempting login for user: ${username}`);
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      
      const text = await res.text();
      console.log(`📄 Response text: ${text}`);
      
      if (res.ok) {
        try {
          const user = JSON.parse(text);
          console.log('✅ User response:', user);
          
          // Reset cart khi login (đổi tài khoản) - phải chờ xong
          console.log('🗑️ Resetting cart...');
          await resetCart();
          console.log('✅ Cart reset done!');
          
          // Phân quyền theo role
          if (user && user.role) {
            const role = user.role.toUpperCase();
            if (role === 'ADMIN') {
              Alert.alert('✅ Đăng nhập thành công!', `Xin chào Admin ${user.fullName || user.username}`);
              router.push('/Admin');
            } else if (role === 'STAFF') {
              Alert.alert('✅ Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Staff');
            } else if (role === 'CUSTOMER') {
              Alert.alert('✅ Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Customer');
            } else {
              Alert.alert('✅ Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
              router.push('/Home');
            }
          } else {
            Alert.alert('✅ Đăng nhập thành công!', `Xin chào ${user.fullName || user.username}`);
            router.push('/Home');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          Alert.alert('Lỗi', 'Phản hồi không hợp lệ từ server');
        }
      } else {
        console.error(`❌ Login failed: ${res.status}`);
        try {
          const errorData = JSON.parse(text);
          Alert.alert('❌ Đăng nhập thất bại', errorData.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
        } catch {
          Alert.alert('❌ Đăng nhập thất bại', text || `Lỗi ${res.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Kiểm tra IP trong config/network.ts');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🍬</Text>
        </View>
        <Text style={styles.brandName}>Candy Shop</Text>
        <Text style={styles.brandTagline}>Kẹo ngon từ khắp nơi</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Vui lòng nhập thông tin của bạn</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ForgotPasswordScreen')}
          style={styles.forgotPasswordLink}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => router.push('/Register')} style={styles.registerSection}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 50,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff69b4',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#222',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff69b4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#ff69b4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#ff69b4',
    fontWeight: 'bold',
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
