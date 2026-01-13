/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { getApiUrl } from '../config/network';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showQRModal, setShowQRModal] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');

  // Thông tin ngân hàng của bạn
  const BANK_INFO = {
    bankName: 'Timo',
    accountNo: '0702812941',
    accountName: 'NGUYENHOANGVI',
    // Sử dụng QR code JPG từ ngân hàng
    qrImage: require('../assets/qr/bank-qr.jpg'),
  };

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (paymentMethod === 'BANK') {
      // Hiển thị QR code để chuyển khoản
      setShowQRModal(true);
    } else {
      // COD - Tạo đơn hàng ngay
      await createOrder('COD', 'pending');
    }
  };

  const createOrder = async (method: string, status: string, txCode?: string) => {
    try {
      const orderData = {
        customerName: name,
        phone: phone,
        address: address,
        paymentMethod: method,
        status: status,
        totalAmount: getCartTotal() + 30000,
        transactionCode: txCode || '', // Mã giao dịch từ ngân hàng
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      // Gọi API tạo đơn hàng
      const res = await fetch(`${getApiUrl()}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        Alert.alert('Thành công', 'Đặt hàng thành công!', [
          {
            text: 'Xem đơn hàng',
            onPress: () => router.push('/Orders' as any),
          },
          {
            text: 'Về trang chủ',
            onPress: () => router.push('/Customer' as any),
          },
        ]);
      } else {
        throw new Error('Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại!');
    }
  };

  const handlePaymentConfirm = () => {
    Alert.prompt(
      'Xác nhận thanh toán',
      'Vui lòng nhập mã giao dịch từ ngân hàng (6-10 ký tự):',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async (code?: string) => {
            if (!code || code.trim().length < 6) {
              Alert.alert('Lỗi', 'Mã giao dịch không hợp lệ. Vui lòng nhập ít nhất 6 ký tự!');
              return;
            }
            setTransactionCode(code.trim());
            setShowQRModal(false);
            await createOrder('BANK', 'paid', code.trim());
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Địa chỉ nhận hàng"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={styles.radio}>
              {paymentMethod === 'COD' && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'BANK' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('BANK')}
          >
            <View style={styles.radio}>
              {paymentMethod === 'BANK' && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
              <Text style={styles.paymentSubtext}>Quét QR để thanh toán</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng ({cartItems.length} sản phẩm)</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name} x {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              ₫{(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính:</Text>
          <Text style={styles.totalValue}>₫{getCartTotal().toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
          <Text style={styles.totalValue}>₫30.000</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
          <Text style={styles.grandTotalValue}>
            ₫{(getCartTotal() + 30000).toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
        <Text style={styles.orderButtonText}>Đặt hàng</Text>
      </TouchableOpacity>
    </ScrollView>

    {/* QR Code Payment Modal */}
    <Modal
      visible={showQRModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQRModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quét mã QR để thanh toán</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <Image
              source={BANK_INFO.qrImage}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.bankInfo}>
            <Text style={styles.bankInfoTitle}>Thông tin chuyển khoản</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngân hàng:</Text>
              <Text style={styles.infoValue}>{BANK_INFO.bankName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số tài khoản:</Text>
              <Text style={styles.infoValue}>{BANK_INFO.accountNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
              <Text style={styles.infoValue}>{BANK_INFO.accountName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số tiền:</Text>
              <Text style={[styles.infoValue, styles.amountText]}>
                ₫{(getCartTotal() + 30000).toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={styles.instructionText}>
            📱 Mở app ngân hàng → Quét QR → Xác nhận thanh toán{'\n'}
            💡 Sau khi chuyển tiền, bạn sẽ nhận được mã giao dịch từ ngân hàng
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handlePaymentConfirm}
          >
            <Text style={styles.confirmButtonText}>Nhập mã giao dịch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff5f5',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ee4d2d',
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
  },
  paymentContent: {
    flex: 1,
  },
  paymentSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  grandTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  orderButton: {
    backgroundColor: '#ee4d2d',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  bankInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bankInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ee4d2d',
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
