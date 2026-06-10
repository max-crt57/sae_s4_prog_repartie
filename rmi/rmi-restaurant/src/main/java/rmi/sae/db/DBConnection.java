package rmi.sae.db;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import java.util.Properties;

public class DBConnection {

    private static final DBConnection INSTANCE = new DBConnection();

    private DBConnection() {
    }

    public static DBConnection getInstance() {
        return INSTANCE;
    }

    public Connection getConnection() throws SQLException {
        // on recupere les donnes depuis config.properties (dans src/main/resources)
        Properties prop = new Properties();
        // pas de FileInputStream car il nécessite un chemin absolu
        try (InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input == null) {
                System.err.println("Impossible de trouver config.properties dans le classpath.");
                return null;
            }
            prop.load(input);
        } catch (IOException ex) {
            System.err.println("Impossible de lire config.properties");
            ex.printStackTrace();
            return null;
        }

        String url = prop.getProperty("db.url");
        String user = prop.getProperty("db.user");
        String password = prop.getProperty("db.password");

        return DriverManager.getConnection(url, user, password);
    }
}