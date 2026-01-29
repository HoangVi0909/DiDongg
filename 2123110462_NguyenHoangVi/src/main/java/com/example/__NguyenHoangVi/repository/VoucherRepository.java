package com.example.__NguyenHoangVi.repository;

import com.example.__NguyenHoangVi.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    List<Voucher> findByIsActive(Boolean isActive);

    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.usedCount < v.maxUses")
    List<Voucher> findAvailableVouchers();

    @Query("SELECT v FROM Voucher v WHERE v.code = :code AND v.isActive = true")
    Optional<Voucher> findByCodeAndActive(@Param("code") String code);
}
