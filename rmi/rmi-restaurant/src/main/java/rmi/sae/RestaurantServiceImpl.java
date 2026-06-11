package rmi.sae;

import java.rmi.RemoteException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import rmi.sae.db.DBConnection;

public class RestaurantServiceImpl implements RestaurantService {

    @Override
    public String getRestaurantsJson() throws RemoteException {
        StringBuilder json = new StringBuilder();
        json.append("[");

        try (
                Connection conn = DBConnection.getInstance().getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT idRest, nomRest, latitude, longitude, ouvertureMin, fermetureMin FROM Restaurant");) {
            boolean first = true;
            while (rs.next()) {
                if (!first) {
                    json.append(",");
                }

                json.append("{")
                        .append("\"id\":")
                        .append(rs.getInt("idRest"))
                        .append(",")

                        .append("\"nom\":\"")
                        .append(rs.getString("nomRest"))
                        .append("\",")

                        .append("\"latitude\":")
                        .append(rs.getDouble("latitude"))
                        .append(",")

                        .append("\"longitude\":")
                        .append(rs.getDouble("longitude"))
                        .append(",")

                        .append("\"ouvertureMin\":")
                        .append(rs.getInt("ouvertureMin"))
                        .append(",")

                        .append("\"fermetureMin\":")
                        .append(rs.getInt("fermetureMin"))

                        .append("}");
                first = false;
            }
        } catch (SQLException e) {
            e.printStackTrace();

            return """
                    {
                        "success":false,
                        "message":"Erreur SQL"
                    }
                    """;
        }
        json.append("]");
        return json.toString();
    }

    @Override
    public String getTablesDisponiblesJson(int idRestaurant, String datetime) throws RemoteException {
        StringBuilder json = new StringBuilder();
        json.append("[");

        // le format de la date c'est "YYYY-MM-DD HH24:MI"
        // on remplace le t par un espace pour eviter les bugs sql
        datetime = datetime.replace("T", " ");

        try (Connection conn = DBConnection.getInstance().getConnection()) {
            String query = """
                        SELECT numTable, nbPlace
                        FROM TableResto
                        WHERE idRest = ?
                          AND numTable NOT IN (
                              SELECT numTable
                              FROM Reservation
                              WHERE dateRes < TO_DATE(?, 'YYYY-MM-DD HH24:MI') + 1/24
                                AND dateRes + 1/24 > TO_DATE(?, 'YYYY-MM-DD HH24:MI')
                          )
                    """;

            try (PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setInt(1, idRestaurant);
                ps.setString(2, datetime);
                ps.setString(3, datetime);

                ResultSet rs = ps.executeQuery();
                boolean first = true;
                while (rs.next()) {
                    if (!first) {
                        json.append(",");
                    }
                    json.append("{")
                            .append("\"numTable\":").append(rs.getInt("numTable")).append(",")
                            .append("\"nbPlace\":").append(rs.getInt("nbPlace"))
                            .append("}");
                    first = false;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }

        json.append("]");
        return json.toString();
    }

    @Override
    public String reserverTableJson(String nom, String prenom, String telephone, int nbConvives, int idRestaurant,
            String datetime, int numTable)
            throws RemoteException {

        datetime = datetime.replace("T", " ");

        try (Connection conn = DBConnection.getInstance().getConnection()) {
            conn.setAutoCommit(false);

            // 1. on verrouille la table pour pas que qqn la prenne en meme temps
            try (PreparedStatement psLock = conn
                    .prepareStatement("SELECT * FROM TableResto WHERE numTable = ? FOR UPDATE")) {
                psLock.setInt(1, numTable);
                ResultSet rsLock = psLock.executeQuery();
                if (!rsLock.next()) {
                    conn.rollback();
                    return """
                            {
                                "success":false,
                                "message":"Table introuvable"
                            }
                            """;
                }
            }

            // 2. on verifie que c'est bien disponible
            String checkQuery = """
                        SELECT 1 FROM Reservation
                        WHERE numTable = ?
                          AND dateRes < TO_DATE(?, 'YYYY-MM-DD HH24:MI') + 1/24
                          AND dateRes + 1/24 > TO_DATE(?, 'YYYY-MM-DD HH24:MI')
                    """;
            try (PreparedStatement psCheck = conn.prepareStatement(checkQuery)) {
                psCheck.setInt(1, numTable);
                psCheck.setString(2, datetime);
                psCheck.setString(3, datetime);
                ResultSet rsCheck = psCheck.executeQuery();
                if (rsCheck.next()) {
                    conn.rollback();
                    return """
                            {
                                "success":false,
                                "message":"Table deja reservee a cette heure"
                            }
                            """;
                }
            }

            // 3. on cree le client
            int idCli;
            try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery("SELECT NVL(MAX(idCli),0)+1 FROM Client")) {
                rs.next();
                idCli = rs.getInt(1);
            }

            // on met le nom et le prenom dans la bdd comme demande
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO Client(idCli, nom, prenom) VALUES (?, ?, ?)")) {
                ps.setInt(1, idCli);
                ps.setString(2, nom);
                ps.setString(3, prenom);
                ps.executeUpdate();
            }

            // 4. on enregistre la reservation
            int numRes;
            try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery("SELECT NVL(MAX(numRes),0)+1 FROM Reservation")) {
                rs.next();
                numRes = rs.getInt(1);
            }

            // on insert avec numres, dateres, nbpersonnes, tel, idcli, numtable
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO Reservation(numRes, dateRes, nbPersonnes, telephone, idCli, numTable) VALUES(?, TO_DATE(?, 'YYYY-MM-DD HH24:MI'), ?, ?, ?, ?)")) {
                ps.setInt(1, numRes);
                ps.setString(2, datetime);
                ps.setInt(3, nbConvives);
                ps.setString(4, telephone);
                ps.setInt(5, idCli);
                ps.setInt(6, numTable);
                ps.executeUpdate();
            }

            conn.commit();

            return """
                    {
                        "success":true,
                        "message":"Reservation effectuee"
                    }
                    """;

        } catch (Exception e) {
            e.printStackTrace();
            return """
                    {
                        "success":false,
                        "message":"Erreur reservation"
                    }
                    """;
        }
    }
}