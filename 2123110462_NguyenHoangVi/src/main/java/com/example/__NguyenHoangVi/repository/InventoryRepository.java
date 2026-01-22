package com.example.__NguyenHoangVi.repository;

import com.example.__NguyenHoangVi.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.status = :status")
    List<Inventory> findByStatus(@Param("status") String status);

    @Query("SELECT i FROM Inventory i WHERE i.quantityInStock < i.reorderLevel")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.quantityInStock = 0")
    List<Inventory> findOutOfStockItems();
}
