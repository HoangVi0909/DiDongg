package com.example.__NguyenHoangVi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.*;

/**
 * Health check and diagnostic endpoints
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthCheckController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> healthStatus() {
        Map<String, Object> response = new HashMap<>();
        try {
            Connection connection = dataSource.getConnection();
            response.put("status", "healthy");
            response.put("database", "connected");

            // Check tables
            DatabaseMetaData metaData = connection.getMetaData();
            ResultSet tables = metaData.getTables(null, null, "%", new String[] { "TABLE" });
            List<String> tableNames = new ArrayList<>();
            while (tables.next()) {
                tableNames.add(tables.getString("TABLE_NAME"));
            }
            response.put("tables", tableNames);
            response.put("table_count", tableNames.size());

            connection.close();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "unhealthy");
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        try {
            Connection connection = dataSource.getConnection();
            connection.close();
            response.put("status", "success");
            response.put("message", "Database connection successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "failed");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
