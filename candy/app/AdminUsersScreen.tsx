import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../config/network';

const isWeb = Platform.OS === 'web';

interface User {
  id: string | number;
  fullName?: string; // API returns fullName
  name?: string; // Frontend uses name
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  status: number | 'active' | 'inactive'; // API returns number (1=active, 0=inactive)
  createdAt?: string;
  username?: string;
  address?: string;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const menuItems = [
    { id: 1, title: 'Trang chu', icon: '', route: '/AdminScreen' },
    { id: 2, title: 'Menu', icon: '', route: '#' },
    { id: 3, title: 'San pham', icon: '', route: '/AdminProductsScreen' },
    { id: 9, title: 'Don hang', icon: '', route: '/AdminOrders' },
    { id: 4, title: 'Voucher', icon: '', route: '/AdminVouchersScreen' },
    { id: 5, title: 'Nguoi dung', icon: '', route: '/AdminUsersScreen' },
  ];

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'staff' | 'admin';
    status: 'active' | 'inactive';
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
  });

  const roleOptions = ['customer', 'staff', 'admin'];
  const statusOptions = ['active', 'inactive'];

  // Convert API data format
  const convertUserFormat = (apiUsers: any[]) => {
    return apiUsers.map((user) => ({
      ...user,
      name: user.fullName || user.name,
      status: user.status === 1 ? 'active' : 'inactive',
    }));
  };

  // Fetch users từ API
  useEffect(() => {
    const fetchUsersOnMount = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching users from:', `${getApiUrl()}/api/users`);
        const response = await fetch(`${getApiUrl()}/api/users`);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Users data received:', data);
          const convertedUsers = convertUserFormat(data || []);
          console.log('✅ Converted users:', convertedUsers);
          setUsers(convertedUsers);
        } else {
          const errorText = await response.text();
          console.error('❌ Error response:', response.status, errorText);
          showToast(`Lỗi API: ${response.status}`, 'error');
        }
      } catch (error) {
        console.error('❌ Lỗi fetch users:', error);
        showToast('Lỗi kết nối API', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsersOnMount();
  }, [showToast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        showToast('Lỗi tải danh sách người dùng', 'error');
      }
    } catch (error) {
      console.error('Lỗi fetch users:', error);
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: typeof user.status === 'number' ? (user.status === 1 ? 'active' : 'inactive') : (user.status as 'active' | 'inactive'),
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Vui lòng điền đủ thông tin!', 'warning');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Email không hợp lệ!', 'warning');
      return;
    }

    try {
      let response;
      if (editingUser) {
        // Cập nhật người dùng
        response = await fetch(`${getApiUrl()}/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
          }),
        });

        if (response.ok) {
          showToast('✅ Cập nhật người dùng thành công!', 'success');
          fetchUsers();
        } else {
          showToast('❌ Cập nhật thất bại!', 'error');
        }
      } else {
        // Thêm người dùng mới
        response = await fetch(`${getApiUrl()}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
          }),
        });

        if (response.ok) {
          showToast('✅ Thêm người dùng thành công!', 'success');
          fetchUsers();
        } else {
          showToast('❌ Thêm người dùng thất bại!', 'error');
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Lỗi save user:', error);
      showToast('Lỗi kết nối API', 'error');
    }
  };

  const handleDeleteUser = async (user: User) => {
    const userName = user.name || user.fullName || 'người dùng';
    Alert.alert('Xóa người dùng', `Bạn chắc chắn xóa người dùng "${userName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const response = await fetch(`${getApiUrl()}/api/users/${user.id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              showToast('✅ Xóa người dùng thành công!', 'success');
              fetchUsers();
            } else {
              showToast('❌ Xóa thất bại!', 'error');
            }
          } catch (error) {
            console.error('Lỗi delete user:', error);
            showToast('Lỗi kết nối API', 'error');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // Lọc người dùng theo tên hoặc email
  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer':
        return '👤 Khách hàng';
      case 'staff':
        return '👨‍💼 Nhân viên';
      case 'admin':
        return '👑 Quản trị viên';
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? '🟢 Hoạt động' : '🔴 Không hoạt động';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10b981' : '#ef4444';
  };

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <Sidebar menuItems={menuItems} router={router} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
              <Text style={styles.addBtnText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Tìm kiếm theo tên hoặc email..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#ff6b35" />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {paginatedUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
                </View>
              ) : (
                <>
                  {paginatedUsers.map((user) => (
                    <View key={user.id} style={styles.userCard}>
                      <View style={styles.userHeader}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{user.name || user.fullName}</Text>
                          <Text style={styles.userEmail}>{user.email}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(user.status as string) },
                          ]}
                        >
                          <Text style={styles.statusText}>{getStatusLabel(user.status as string)}</Text>
                        </View>
                      </View>

                      <View style={styles.userDetails}>
                        <Text style={styles.detailText}>📱 {user.phone}</Text>
                        <Text style={styles.detailText}>🏷️ {getRoleLabel(user.role)}</Text>
                      </View>

                      <View style={styles.userActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.editBtn]}
                          onPress={() => handleOpenModal(user)}
                        >
                          <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.deleteBtn]}
                          onPress={() => handleDeleteUser(user)}
                        >
                          <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                      <TouchableOpacity
                        style={[styles.paginationBtn, currentPage === 1 && styles.disabled]}
                        onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <Text style={styles.paginationText}>← Trước</Text>
                      </TouchableOpacity>

                      <Text style={styles.paginationInfo}>
                        Trang {currentPage}/{totalPages}
                      </Text>

                      <TouchableOpacity
                        style={[styles.paginationBtn, currentPage === totalPages && styles.disabled]}
                        onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <Text style={styles.paginationText}>Tiếp →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          )}

          <Modal visible={showModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.label}>Họ và tên *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />

                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                  />

                  <Text style={styles.label}>Số điện thoại *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>Quyền</Text>
                  <View style={styles.roleContainer}>
                    {roleOptions.map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleBtn,
                          formData.role === role && styles.roleBtnActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            role: role as 'customer' | 'staff' | 'admin',
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.roleBtnText,
                            formData.role === role && styles.roleBtnTextActive,
                          ]}
                        >
                          {role === 'customer'
                            ? '👤 Khách'
                            : role === 'staff'
                            ? '👨‍💼 Nhân viên'
                            : '👑 Admin'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Trạng thái</Text>
                  <View style={styles.statusContainer}>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusBtn,
                          formData.status === status && styles.statusBtnActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            status: status as 'active' | 'inactive',
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.statusBtnText,
                            formData.status === status && styles.statusBtnTextActive,
                          ]}
                        >
                          {status === 'active' ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.submitBtn]}
                    onPress={handleSaveUser}
                  >
                    <Text style={styles.submitBtnText}>
                      {editingUser ? 'Cập nhật' : 'Thêm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }

  // Mobile version
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ff6b35" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {paginatedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          ) : (
            <>
              {paginatedUsers.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name || user.fullName}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(user.status as string) },
                      ]}
                    >
                      <Text style={styles.statusText}>{getStatusLabel(user.status as string)}</Text>
                    </View>
                  </View>

                  <View style={styles.userDetails}>
                    <Text style={styles.detailText}>📱 {user.phone}</Text>
                    <Text style={styles.detailText}>🏷️ {getRoleLabel(user.role)}</Text>
                  </View>

                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() => handleOpenModal(user)}
                    >
                      <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeleteUser(user)}
                    >
                      <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.paginationBtn, currentPage === 1 && styles.disabled]}
                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <Text style={styles.paginationText}>← Trước</Text>
                  </TouchableOpacity>

                  <Text style={styles.paginationInfo}>
                    Trang {currentPage}/{totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[styles.paginationBtn, currentPage === totalPages && styles.disabled]}
                    onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Text style={styles.paginationText}>Tiếp →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Quyền</Text>
              <View style={styles.roleContainer}>
                {roleOptions.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleBtn,
                      formData.role === role && styles.roleBtnActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        role: role as 'customer' | 'staff' | 'admin',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        formData.role === role && styles.roleBtnTextActive,
                      ]}
                    >
                      {role === 'customer'
                        ? '👤 Khách'
                        : role === 'staff'
                        ? '👨‍💼 Nhân viên'
                        : '👑 Admin'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.statusContainer}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusBtn,
                      formData.status === status && styles.statusBtnActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        status: status as 'active' | 'inactive',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        formData.status === status && styles.statusBtnTextActive,
                      ]}
                    >
                      {status === 'active' ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleSaveUser}
              >
                <Text style={styles.submitBtnText}>
                  {editingUser ? 'Cập nhật' : 'Thêm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Sidebar({ menuItems, router }: any) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Admin</Text>
        <Text style={styles.sidebarStatus}> Online</Text>
      </View>
      <Text style={styles.menuLabel}>MENU admin</Text>
      <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
        {menuItems.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.route !== '#' && router.push(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuArrow}></Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderRightColor: '#ecf0f1',
  },
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sidebarStatus: {
    fontSize: 12,
    color: '#27ae60',
    marginLeft: 4,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#95a5a6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  sidebarMenu: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
  },
  menuIcon: {
    fontSize: 18,
    color: '#ecf0f1',
    marginRight: 12,
    width: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#ecf0f1',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 16,
    color: '#95a5a6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  userCard: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  userDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  detailText: {
    fontSize: 12,
    color: '#555',
    marginVertical: 3,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#0ea5e9',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    marginVertical: 12,
  },
  paginationBtn: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  paginationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  paginationInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  roleBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  roleBtnTextActive: {
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  statusBtnTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#10b981',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
