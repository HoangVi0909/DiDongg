package com.example.__NguyenHoangVi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
public class DataImportController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/sql-file")
    public ResponseEntity<?> importSqlFile(@RequestParam String filePath) {
        try {
            StringBuilder sql = new StringBuilder();
            BufferedReader reader = new BufferedReader(new FileReader(filePath));
            String line;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("--")) {
                    sql.append(line).append(" ");
                    if (line.endsWith(";")) {
                        sql.setLength(sql.length() - 1); // Remove trailing ;
                        executeSql(sql.toString());
                        sql = new StringBuilder();
                    }
                }
            }
            reader.close();

            Map<String, String> response = new HashMap<>();
            response.put("message", "SQL file imported successfully");
            response.put("file", filePath);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private void executeSql(String sql) throws Exception {
        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        }
    }
}
