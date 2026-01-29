package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.Inventory;
import com.example.__NguyenHoangVi.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // Get all inventory
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Get low stock items
    @GetMapping("/low-stock")
    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    // Get out of stock items
    @GetMapping("/out-of-stock")
    public List<Inventory> getOutOfStockItems() {
        return inventoryRepository.findOutOfStockItems();
    }

    // Get inventory by status
    @GetMapping("/status/{status}")
    public List<Inventory> getByStatus(@PathVariable String status) {
        return inventoryRepository.findByStatus(status);
    }

    // Get inventory by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getInventoryByProduct(@PathVariable Long productId) {
        Optional<Inventory> inventory = inventoryRepository.findByProductId(productId);
        if (inventory.isPresent()) {
            return ResponseEntity.ok(inventory.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get inventory by ID
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        Optional<Inventory> inventory = inventoryRepository.findById(id);
        if (inventory.isPresent()) {
            return ResponseEntity.ok(inventory.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create inventory
    @PostMapping
    public ResponseEntity<Inventory> createInventory(@RequestBody Inventory inventory) {
        if (inventory.getProductId() == null) {
            return ResponseEntity.badRequest().build();
        }
        inventory.setLastUpdated(LocalDateTime.now());
        inventory.updateStatus();
        Inventory saved = inventoryRepository.save(inventory);
        return ResponseEntity.ok(saved);
    }

    // Update inventory quantity
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Inventory> inventory = inventoryRepository.findById(id);
        if (inventory.isPresent()) {
            Inventory inv = inventory.get();
            if (updates.containsKey("quantityInStock")) {
                inv.setQuantityInStock(((Number) updates.get("quantityInStock")).intValue());
            }
            if (updates.containsKey("reorderLevel")) {
                inv.setReorderLevel(((Number) updates.get("reorderLevel")).intValue());
            }
            if (updates.containsKey("reorderQuantity")) {
                inv.setReorderQuantity(((Number) updates.get("reorderQuantity")).intValue());
            }
            if (updates.containsKey("updatedReason")) {
                inv.setUpdatedReason((String) updates.get("updatedReason"));
            }
            inv.setLastUpdated(LocalDateTime.now());
            inv.updateStatus();
            Inventory updated = inventoryRepository.save(inv);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Add stock
    @PutMapping("/{id}/add")
    public ResponseEntity<Inventory> addStock(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Inventory> inventory = inventoryRepository.findById(id);
        if (inventory.isPresent()) {
            Inventory inv = inventory.get();
            Integer quantity = ((Number) request.get("quantity")).intValue();
            String reason = (String) request.getOrDefault("reason", "Manual addition");

            inv.setQuantityInStock(inv.getQuantityInStock() + quantity);
            inv.setLastRestocked(LocalDateTime.now());
            inv.setUpdatedReason(reason);
            inv.setLastUpdated(LocalDateTime.now());
            inv.updateStatus();

            Inventory updated = inventoryRepository.save(inv);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Remove stock
    @PutMapping("/{id}/remove")
    public ResponseEntity<Inventory> removeStock(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Inventory> inventory = inventoryRepository.findById(id);
        if (inventory.isPresent()) {
            Inventory inv = inventory.get();
            Integer quantity = ((Number) request.get("quantity")).intValue();
            String reason = (String) request.getOrDefault("reason", "Manual removal");

            if (inv.getQuantityInStock() < quantity) {
                return ResponseEntity.badRequest().build();
            }

            inv.setQuantityInStock(inv.getQuantityInStock() - quantity);
            inv.setUpdatedReason(reason);
            inv.setLastUpdated(LocalDateTime.now());
            inv.updateStatus();

            Inventory updated = inventoryRepository.save(inv);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete inventory
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventory(@PathVariable Long id) {
        Optional<Inventory> inventory = inventoryRepository.findById(id);
        if (inventory.isPresent()) {
            inventoryRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Inventory deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
