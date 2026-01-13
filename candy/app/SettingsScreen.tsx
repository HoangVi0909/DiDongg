import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotification: true,
    emailNotification: false,
    promotionNotification: true,
    orderNotification: true,
    darkMode: false,
    savePassword: true,
  });

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await AsyncStorage.setItem('@settings', JSON.stringify(newSettings));
  };

  const handleChangePassword = () => {
    router.push('/ChangePassword' as any);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có chắc muốn xóa bộ nhớ đệm? Điều này sẽ xóa dữ liệu tạm thời và có thể làm app chạy chậm hơn trong lần đầu sử dụng.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Về ứng dụng',
      'Candy Shop App\nPhiên bản: 1.0.0\n\n© 2026 Candy Shop\nAll rights reserved.',
      [{ text: 'Đóng' }]
    );
  };

  const handleTerms = () => {
    Alert.alert('Điều khoản', 'Tính năng đang phát triển');
  };

  const handlePrivacy = () => {
    Alert.alert('Chính sách', 'Tính năng đang phát triển');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      {/* Thông báo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông báo</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Thông báo đẩy</Text>
          <Switch
            value={settings.pushNotification}
            onValueChange={() => handleToggle('pushNotification')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Thông báo email</Text>
          <Switch
            value={settings.emailNotification}
            onValueChange={() => handleToggle('emailNotification')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Khuyến mãi</Text>
          <Switch
            value={settings.promotionNotification}
            onValueChange={() => handleToggle('promotionNotification')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Cập nhật đơn hàng</Text>
          <Switch
            value={settings.orderNotification}
            onValueChange={() => handleToggle('orderNotification')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Giao diện */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giao diện</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Chế độ tối</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={() => handleToggle('darkMode')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Bảo mật */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảo mật</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <Text style={styles.menuLabel}>🔒 Đổi mật khẩu</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Lưu mật khẩu</Text>
          <Switch
            value={settings.savePassword}
            onValueChange={() => handleToggle('savePassword')}
            trackColor={{ false: '#ddd', true: '#ee4d2d' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Khác */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khác</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <Text style={styles.menuLabel}>🗑️ Xóa bộ nhớ đệm</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
          <Text style={styles.menuLabel}>📄 Điều khoản sử dụng</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
          <Text style={styles.menuLabel}>🔒 Chính sách bảo mật</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
          <Text style={styles.menuLabel}>ℹ️ Về ứng dụng</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Candy Shop App v1.0.0</Text>
        <Text style={styles.footerSubtext}>© 2026 All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ee4d2d',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuLabel: {
    fontSize: 15,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
  },
});
