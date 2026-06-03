package rmi.sae.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final DBConnection INSTANCE = new DBConnection();

    private final String url = "jdbc:oracle:thin:@charlemagne.iutnc.univ-lorraine.fr:1521:infodb";
    private final String user = LoginJDBC.username;
    private final String password = LoginJDBC.password;

    private DBConnection() {
    }

    public static DBConnection getInstance() {
        return INSTANCE;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }
}