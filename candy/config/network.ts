/**
 * ============================================================
 * NETWORK CONFIGURATION - CẤU HÌNH MẠNG
 * ============================================================
 * 
 * 🔴 QUAN TRỌNG: Khi đổi mạng WiFi, chỉ cần sửa IP ở đây!
 * 
 * Cách lấy IP máy tính:
 * - Windows: Mở CMD → gõ "ipconfig" → tìm IPv4 Address
 * - Mac: System Preferences → Network → WiFi → IP Address
 * 
 * Ví dụ: 192.168.1.105, 192.168.0.100, 10.0.0.5, v.v.
 */

// ============================================================
// 👇 SỬA IP Ở ĐÂY KHI ĐỔI MẠNG WIFI 👇
// ============================================================
export const LOCAL_IP = '10.212.147.127';
// ============================================================

export const API_PORT = '8080';

export const getApiUrl = () => {
  return `http://${LOCAL_IP}:${API_PORT}/api`;
};

// URL để test kết nối backend
export const getHealthCheckUrl = () => {
  return `http://${LOCAL_IP}:${API_PORT}/api/categories`;
};

// Wrapper để fetch với error handling tốt hơn
export const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    console.log(`📡 FETCH: ${options?.method || 'GET'} ${url}`);
    const response = await fetch(url, options);
    
    console.log(`✅ Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error(`❌ Network Error:`, error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Log IP khi app khởi động (debug)
export const logNetworkConfig = () => {
  console.log('========================================');
  console.log('📡 NETWORK CONFIG');
  console.log('========================================');
  console.log(`🖥️  Backend IP: ${LOCAL_IP}`);
  console.log(`🔗 API URL: ${getApiUrl()}`);
  console.log(`🧪 Test URL: ${getHealthCheckUrl()}`);
  console.log('========================================');
  console.log('⚠️  Nếu lỗi Network Error:');
  console.log('   1. Kiểm tra Backend đang chạy (port 8080)');
  console.log('   2. Điện thoại cùng WiFi với máy tính');
  console.log('   3. Chạy "ipconfig" để lấy IP mới');
  console.log('   4. Sửa IP trong config/network.ts');
  console.log('   5. Backend đã cấu hình CORS đúng không?');
  console.log('========================================');
};