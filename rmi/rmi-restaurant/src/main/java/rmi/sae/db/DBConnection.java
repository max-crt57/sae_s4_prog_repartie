package rmi.sae.db;

import io.github.cdimascio.dotenv.Dotenv;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final DBConnection INSTANCE = new DBConnection();

    private DBConnection() {
    }

    public static DBConnection getInstance() {
        return INSTANCE;
    }

    public Connection getConnection() throws SQLException {
        Dotenv dotenv = Dotenv.load();

        String url = dotenv.get("DB_URL");
        String user = dotenv.get("DB_USER");
        String password = dotenv.get("DB_PASSWORD");

        return DriverManager.getConnection(url, user, password);
    }
}