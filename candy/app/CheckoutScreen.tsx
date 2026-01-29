/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { getApiUrl } from '../config/network';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { setUserPhone } = useUser();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [phoneError, setPhoneError] = useState('');

  // Load user data from AsyncStorage khi component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('@user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('📦 Loaded user data:', { 
          fullName: user.fullName, 
          phone: user.phone, 
          address: user.address 
        });
        
        if (user.fullName) setName(user.fullName);
        if (user.phone) setPhone(user.phone);
        if (user.address) setAddress(user.address);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  // Thông tin ngân hàng của bạn
  const BANK_INFO = {
    bankName: 'Timo',
    accountNo: '0702812941',
    accountName: 'NGUYENHOANGVI',
    // Sử dụng QR code JPG từ ngân hàng
    qrImage: require('../assets/qr/bank-qr.jpg'),
  };

  // Tính tiền ship: nếu đơn >= 150k thì free ship
  const SHIPPING_THRESHOLD = 150000;
  const SHIPPING_FEE = 30000;
  
  const cartTotal = getCartTotal();
  const shippingFee = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalTotal = cartTotal + shippingFee;

  // Hàm validate số điện thoại
  const validatePhone = (phoneNumber: string): { valid: boolean; message?: string } => {
    // Loại bỏ khoảng trắng
    const cleanPhone = phoneNumber.trim();
    
    // Kiểm tra có chứa chữ không
    if (/[a-zA-Z]/.test(cleanPhone)) {
      return { valid: false, message: 'Số điện thoại không được chứa chữ!' };
    }
    
    // Kiểm tra chỉ có số và dấu ngoặc, dấu gạch ngang, dấu cộng
    if (!/^[\d\-\+\(\)\s]*$/.test(cleanPhone)) {
      return { valid: false, message: 'Số điện thoại chỉ được chứa số và ký tự đặc biệt cho định dạng!' };
    }
    
    // Lấy ra chỉ các ký tự số
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    
    // Kiểm tra đủ 10 số
    if (digitsOnly.length !== 10) {
      return { valid: false, message: `Số điện thoại phải đủ 10 số (hiện có ${digitsOnly.length} số)!` };
    }
    
    return { valid: true };
  };

  // Handler cho input số điện thoại - validate real-time
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    
    // Nếu rỗng, không hiển thị lỗi
    if (!text.trim()) {
      setPhoneError('');
      return;
    }
    
    // Validate khi người dùng đang nhập
    const validation = validatePhone(text);
    if (!validation.valid) {
      setPhoneError(validation.message || '');
    } else {
      setPhoneError('');
    }
  };

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
      return;
    }

    // Validate số điện thoại
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      showToast(phoneValidation.message || 'Số điện thoại không hợp lệ!', 'error');
      return;
    }

    if (paymentMethod === 'BANK') {
      // Hiển thị QR code để chuyển khoản
      setShowQRModal(true);
    } else {
      // COD - Tạo đơn hàng ngay
      showToast('📦 Đang xử lý đơn hàng...', 'info');
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
        totalAmount: finalTotal,
        transactionCode: txCode || '', // Mã giao dịch từ ngân hàng
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log('📤 Creating order with data:', orderData);
      console.log('🌐 API URL:', `${getApiUrl()}/api/orders`);

      // Gọi API tạo đơn hàng
      const res = await fetch(`${getApiUrl()}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('📥 Response status:', res.status);
      const responseData = await res.json();
      console.log('📥 Response data:', responseData);

      if (res.ok) {
        setOrderId(responseData.orderId);
        
        // Lưu số điện thoại (chỉ lấy chữ số) để dùng fetch orders sau này
        const cleanedPhone = phone.replace(/\D/g, '');
        setUserPhone(cleanedPhone);
        console.log('✅ Saved user phone (cleaned):', cleanedPhone);
        
        clearCart();
        
        if (method === 'BANK') {
          showToast('📦 Vui lòng đợi admin xác nhận thanh toán!', 'info');
        } else {
          showToast('✅ Đặt hàng thành công! Cảm ơn bạn!', 'success');
          setTimeout(() => {
            router.push('/Customer' as any);
          }, 2000);
        }
      } else {
        throw new Error(`API error: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      showToast('❌ Không thể tạo đơn hàng. Vui lòng thử lại!', 'error');
    }
  };

  const handlePaymentConfirm = async () => {
    setShowQRModal(false);
    showToast('✅ Đã chuyển khoản', 'success');
    showToast('📝 Đơn hàng đang chờ xác nhận từ shop...', 'info');
    
    // Tạo đơn hàng với trạng thái pending
    await createOrder('BANK', 'pending', 'online_payment');
    
    // Chuyển hướng về Customer sau 2 giây
    setTimeout(() => {
      router.push('/Customer' as any);
    }, 2000);
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
            style={[styles.input, phoneError && styles.inputError]}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            maxLength={20}
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}
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
          <Text style={styles.totalValue}>
            {shippingFee === 0 ? '🎉 Miễn phí' : `₫${shippingFee.toLocaleString()}`}
          </Text>
        </View>
        {shippingFee === 0 && (
          <View style={styles.freeShipNote}>
            <Text style={styles.freeShipText}>✨ Đơn hàng từ 150.000đ được miễn phí vận chuyển</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
          <Text style={styles.grandTotalValue}>
            ₫{finalTotal.toLocaleString()}
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
                ₫{finalTotal.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={styles.instructionText}>
            📱 Mở app ngân hàng → Quét QR → Xác nhận thanh toán{'\n'}
            💡 Sau khi chuyển tiền, nhấn nút dưới để xác nhận
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handlePaymentConfirm}
          >
            <Text style={styles.confirmButtonText}>✅ Đã chuyển khoản</Text>
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
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
    paddingHorizontal: 4,
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
  freeShipNote: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  freeShipText: {
    fontSize: 13,
    color: '#4caf50',
    fontWeight: '500',
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
