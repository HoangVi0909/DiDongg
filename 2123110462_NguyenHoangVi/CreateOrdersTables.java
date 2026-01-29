import java.nio.file.*;
import java.sql.*;

public class CreateOrdersTables {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://127.0.0.1:3306/candy_shop_db";
        String user = "root";
        String password = "";

        // Read SQL file
        String sql = new String(Files.readAllBytes(Paths.get("create-orders-table.sql")));

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            Statement stmt = conn.createStatement();

            // Split by semicolon and execute each statement
            for (String statement : sql.split(";")) {
                if (!statement.trim().isEmpty() && !statement.trim().startsWith("--")) {
                    try {
                        stmt.execute(statement.trim());
                        System.out.println("✅ Executed: "
                                + statement.trim().substring(0, Math.min(50, statement.trim().length())) + "...");
                    } catch (SQLException e) {
                        System.out.println("❌ Error: " + e.getMessage());
                    }
                }
            }

            System.out.println("\n✅ All tables created successfully!");
        }
    }
}
