package com.example.__NguyenHoangVi.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Database initialization configuration
 * Insert sample data after Hibernate creates tables
 */
@Configuration
public class DatabaseInitializationConfig {

    @Bean
    public CommandLineRunner initializeData(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection();
                    Statement statement = connection.createStatement()) {

                System.out.println("🔄 Initializing database sample data...");

                // Check if data already exists
                var resultSet = statement.executeQuery("SELECT COUNT(*) as count FROM users WHERE username='admin'");
                resultSet.next();
                int adminCount = resultSet.getInt("count");

                if (adminCount == 0) {
                    insertSampleData(statement);
                    System.out.println("✅ Sample data inserted successfully!");
                } else {
                    System.out.println("✅ Sample data already exists.");
                }

            } catch (Exception e) {
                System.err.println("⚠️ Warning initializing data: " + e.getMessage());
                // Don't fail startup if sample data insertion fails
            }
        };
    }

    private void insertSampleData(Statement statement) throws Exception {
        // Insert default roles
        statement.executeUpdate("INSERT IGNORE INTO roles (name) VALUES ('ADMIN'), ('USER'), ('CUSTOMER')");

        // Insert default categories
        statement.executeUpdate("INSERT IGNORE INTO categories (name, description, status) VALUES " +
                "('Electronics', 'Electronic products', 1)," +
                "('Clothing', 'Clothing items', 1)," +
                "('Books', 'Books and literature', 1)");

        // Insert sample products
        statement.executeUpdate(
                "INSERT IGNORE INTO products (name, description, price, quantity, stock_quantity, category_id, status) VALUES "
                        +
                        "('Laptop', 'High-performance laptop', 1000, 50, 50, 1, 1)," +
                        "('Shirt', 'Comfortable cotton shirt', 30, 100, 100, 2, 1)," +
                        "('Programming Book', 'Learn to code', 50, 25, 25, 3, 1)");

        // Insert default admin user (password: admin123 hashed with bcrypt)
        statement.executeUpdate(
                "INSERT IGNORE INTO users (username, email, password, full_name, phone, status, role) VALUES " +
                        "('admin', 'admin@example.com', '$2a$10$slYQmyNdGzin7olVN3p5OPST9/PgBkqquzi8Aml3UCXbVxtrq2C1m', 'Admin User', '0123456789', 1, 'ADMIN')");

        // Insert inventory for products
        statement.executeUpdate("INSERT IGNORE INTO inventory (product_id, quantity_in_stock, status) VALUES " +
                "(1, 50, 'in_stock'), (2, 100, 'in_stock'), (3, 25, 'in_stock')");
    }
}
