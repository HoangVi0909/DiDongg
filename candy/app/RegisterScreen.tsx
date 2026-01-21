import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getApiUrl } from '../config/network';

// ...existing code...


// ...existing code...
export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Client-side validation
    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password, 
          fullName: fullName.trim(), 
          email: email.trim(), 
          status: 1, 
          role: 'customer' 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('✅ Đăng ký thành công!', 'Bạn có thể đăng nhập ngay.');
        router.push('/Login');
      } else {
        // Server validation errors
        Alert.alert('❌ Đăng ký thất bại', data.error || 'Vui lòng thử lại');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối server. Kiểm tra IP trong config/network.ts');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🍬</Text>
        </View>
        <Text style={styles.brandName}>Candy Shop</Text>
        <Text style={styles.brandTagline}>Kẹo ngon từ khắp nơi</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Vui lòng điền thông tin của bạn</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#aaa"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        
        <TouchableOpacity onPress={() => router.push('/Login')} disabled={loading}>
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Text style={styles.loginLink}>Đăng nhập ngay</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 14,
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
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
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
