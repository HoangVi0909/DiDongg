import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('✅ Thành công', data.message || 'Mã xác nhận đã được gửi đến email của bạn');
        setStep(2);
      } else {
        Alert.alert('Lỗi', data.error || 'Email không tồn tại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
      console.error(error);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!resetToken.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác nhận');
      return;
    }
    if (resetToken.length !== 6) {
      Alert.alert('Lỗi', 'Mã xác nhận phải có 6 chữ số');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: resetToken.trim(), newPassword: 'temp' })
      });
      const data = await res.json();
      if (data.error && data.error.includes('hết hạn')) {
        Alert.alert('Lỗi', 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại.');
        setStep(1);
      } else if (data.error && data.error.includes('không hợp lệ')) {
        Alert.alert('Lỗi', 'Mã xác nhận không đúng.');
      } else {
        Alert.alert('✅ Xác nhận mã thành công', 'Nhập mật khẩu mới');
        setStep(3);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
      console.error(error);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: resetToken.trim(), newPassword })
      });
      if (res.ok) {
        Alert.alert('✅ Thành công', 'Mật khẩu đã được đổi. Đăng nhập lại.');
        router.push('/Login');
      } else {
        const data = await res.json();
        Alert.alert('Lỗi', data.error || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🍬</Text>
        <Text style={styles.title}>Quên Mật Khẩu?</Text>
        <Text style={styles.subtitle}>
          {step === 1 && 'Nhập email để nhận mã xác nhận'}
          {step === 2 && 'Nhập mã từ email của bạn'}
          {step === 3 && 'Nhập mật khẩu mới'}
        </Text>
      </View>
      <View style={styles.formContainer}>
        {step === 1 && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>📧 Email</Text>
              <TextInput style={styles.input} placeholder="Nhập email của bạn" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!loading} />
            </View>
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleForgotPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi Mã Xác Nhận</Text>}
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>🔐 Mã Xác Nhận</Text>
              <TextInput style={styles.input} placeholder="Nhập mã (6 chữ số)" placeholderTextColor="#999" value={resetToken} onChangeText={setResetToken} keyboardType="numeric" maxLength={6} editable={!loading} />
            </View>
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Xác Nhận Mã</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)} disabled={loading}>
              <Text style={styles.backButtonText}>← Quay Lại</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>🔑 Mật Khẩu Mới</Text>
              <TextInput style={styles.input} placeholder="Nhập mật khẩu mới" placeholderTextColor="#999" value={newPassword} onChangeText={setNewPassword} secureTextEntry editable={!loading} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>✓ Xác Nhận Mật Khẩu</Text>
              <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" placeholderTextColor="#999" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!loading} />
            </View>
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đổi Mật Khẩu</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)} disabled={loading}>
              <Text style={styles.backButtonText}>← Quay Lại</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.linkContainer} onPress={() => router.push('/Login')} disabled={loading}>
          <Text style={styles.linkText}>Quay lại Đăng Nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { paddingTop: 60, paddingBottom: 30, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#c9185f', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  formContainer: { padding: 20 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, backgroundColor: '#fff', color: '#333' },
  button: { backgroundColor: '#c9185f', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { paddingVertical: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#c9185f', borderRadius: 10 },
  backButtonText: { color: '#c9185f', fontSize: 14, fontWeight: '600' },
  linkContainer: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: '#007bff', fontSize: 14, textDecorationLine: 'underline' },
});
