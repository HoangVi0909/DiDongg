import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { logNetworkConfig } from '../config/network';
import { NotificationPoller } from '@/components/NotificationPoller';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { UserProvider } from '../context/UserContext';
import { VoucherProvider } from '../context/VoucherContext';
import { AddressProvider } from '../context/AddressContext';
import { NotificationProvider } from '../context/NotificationContext';
import { ReviewProvider } from '../context/ReviewContext';
import { AdminProductProvider } from '../context/AdminProductContext';
import { AdminVoucherProvider } from '../context/AdminVoucherContext';
import { AdminNotificationProvider } from '../context/AdminNotificationContext';
import { AdminStatisticsProvider } from '../context/AdminStatisticsContext';

// Comment out để app không tự động redirect về tabs
// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Log network config khi app khởi động
  useEffect(() => {
    logNetworkConfig();
  }, []);

  return (
    <CartProvider>
      <UserProvider>
        <ToastProvider>
          <VoucherProvider>
            <AddressProvider>
              <NotificationProvider>
                <ReviewProvider>
                  <AdminProductProvider>
                    <AdminVoucherProvider>
                      <AdminNotificationProvider>
                        <AdminStatisticsProvider>
                          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                            <NotificationPoller />
                            <Stack initialRouteName="Login">
      <Stack.Screen name="Login" options={{ title: 'Đăng nhập', headerShown: false }} />
      <Stack.Screen name="Register" options={{ title: 'Đăng ký', headerShown: false }} />
      <Stack.Screen name="AdminLogin" options={{ title: 'Đăng nhập Admin', headerShown: false }} />
      <Stack.Screen name="Admin" options={{ title: 'Trang Admin', headerShown: false }} />
      <Stack.Screen name="AdminOrders" options={{ title: 'Quản lý đơn hàng', headerShown: true }} />
      <Stack.Screen name="AdminProducts" options={{ title: 'Quản lý sản phẩm', headerShown: true }} />
      <Stack.Screen name="AdminVouchers" options={{ title: 'Quản lý voucher', headerShown: true }} />
      <Stack.Screen name="AdminNotifications" options={{ title: 'Gửi thông báo', headerShown: true }} />
      <Stack.Screen name="AdminStatistics" options={{ title: 'Thống kê', headerShown: true }} />
      <Stack.Screen name="AdminOrdersStatus" options={{ title: 'Quản lý trạng thái đơn hàng', headerShown: true }} />
      <Stack.Screen name="Staff" options={{ title: 'Trang Nhân viên', headerShown: false }} />
      <Stack.Screen name="Customer" options={{ title: 'Trang Khách hàng', headerShown: false }} />
      <Stack.Screen name="ProductDetail" options={{ title: 'Chi tiết sản phẩm', headerShown: true }} />
      <Stack.Screen name="Cart" options={{ title: 'Giỏ hàng', headerShown: true }} />
      <Stack.Screen name="ProductList" options={{ title: 'Sản phẩm', headerShown: true }} />
      <Stack.Screen name="Favorites" options={{ title: 'Yêu thích', headerShown: true }} />
      <Stack.Screen name="Account" options={{ title: 'Tài khoản', headerShown: true }} />
      <Stack.Screen name="Orders" options={{ title: 'Đơn hàng', headerShown: true }} />
      <Stack.Screen name="Checkout" options={{ title: 'Thanh toán', headerShown: true }} />
      <Stack.Screen name="Voucher" options={{ title: 'Voucher', headerShown: true }} />
      <Stack.Screen name="Review" options={{ title: 'Đánh giá', headerShown: true }} />
      <Stack.Screen name="Home" options={{ title: 'Trang chủ', headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                            </Stack>
                            <StatusBar style="auto" />
                          </ThemeProvider>
                        </AdminStatisticsProvider>
                      </AdminNotificationProvider>
                    </AdminVoucherProvider>
                  </AdminProductProvider>
                </ReviewProvider>
              </NotificationProvider>
            </AddressProvider>
          </VoucherProvider>
        </ToastProvider>
      </UserProvider>
    </CartProvider>
  );
}
