// eslint-disable-next-line import/no-unresolved
import { getApiUrl } from '../config/network';

async function testCreateOrder() {
  const orderData = {
    customerName: 'Nguyễn Hoàng Vi Test',
    phone: '0909111222',
    address: '123 Lý Tự Trọng, TPHCM',
    paymentMethod: 'COD',
    status: 'pending',
    totalAmount: 200000,
    transactionCode: '',
    items: [],
  };

  console.log('📤 Sending order creation request...');
  console.log('API URL:', `${getApiUrl()}/api/orders`);
  console.log('Request data:', orderData);

  try {
    const response = await fetch(`${getApiUrl()}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('Order ID:', data.orderId);
    } else {
      console.log('❌ Error creating order:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testCreateOrder();
