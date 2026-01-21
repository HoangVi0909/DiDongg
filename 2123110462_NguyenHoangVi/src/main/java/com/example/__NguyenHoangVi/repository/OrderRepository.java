package com.example.__NguyenHoangVi.repository;

import com.example.__NguyenHoangVi.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);

    List<Order> findByPhone(String phone);
}
