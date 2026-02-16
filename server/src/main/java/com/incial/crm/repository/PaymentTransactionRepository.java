package com.incial.crm.repository;

import com.incial.crm.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    /**
     * Find all payment transactions for a project, ordered by payment date (oldest first)
     */
    List<PaymentTransaction> findByProjectIdOrderByPaymentDateAsc(Long projectId);
    
    /**
     * Calculate sum of all payments for a project
     */
    @Query("SELECT COALESCE(SUM(pt.amountPaid), 0) FROM PaymentTransaction pt WHERE pt.projectId = :projectId")
    BigDecimal sumAmountPaidByProjectId(@Param("projectId") Long projectId);
    
    /**
     * Count number of payment transactions for a project
     */
    long countByProjectId(Long projectId);
}
