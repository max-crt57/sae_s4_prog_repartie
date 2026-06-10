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
    public String reserverTableJson(String nom, String prenom, String telephone, int nbConvives, int idRestaurant)
            throws RemoteException {
        try (Connection conn = DBConnection.getInstance().getConnection()) {
            conn.setAutoCommit(false);
            int idCli;

            // création du client
            try (
                    Statement st = conn.createStatement();

                    ResultSet rs = st.executeQuery("SELECT NVL(MAX(idCli),0)+1 FROM Client")) {
                rs.next();
                idCli = rs.getInt(1);
            }
            try (
                    PreparedStatement ps = conn.prepareStatement(
                            "INSERT INTO Client(idCli, nom, prenom, telephone) VALUES (?, ?, ?, ?)");) {
                ps.setInt(1, idCli);
                ps.setString(2, nom);
                ps.setString(3, prenom);
                ps.setString(4, telephone);
                ps.executeUpdate();
            }

            // on cherche une table libre

            int numTable = -1;
            try (
                    PreparedStatement ps = conn.prepareStatement(
                            "SELECT numTable FROM TableResto WHERE idRest = ? AND nbPlace >= ? FETCH FIRST 1 ROWS ONLY")) {
                ps.setInt(1, idRestaurant);
                ps.setInt(2, nbConvives);

                ResultSet rs = ps.executeQuery();

                if (rs.next()) {
                    numTable = rs.getInt("numTable");
                }
            }

            if (numTable == -1) {
                conn.rollback();
                return """
                        {
                            "success":false,
                            "message":"Aucune table disponible"
                        }
                        """;
            }

            // création d'une réservation
            int numRes;

            try (
                    Statement st = conn.createStatement();

                    ResultSet rs = st.executeQuery("SELECT NVL(MAX(numRes),0)+1 FROM Reservation");) {
                rs.next();
                numRes = rs.getInt(1);
            }

            try (
                    PreparedStatement ps = conn.prepareStatement(
                            "INSERT INTO Reservation(numRes, dateRes, idCli, numTable) VALUES(?, SYSDATE, ?, ?)");) {
                ps.setInt(1, numRes);
                ps.setInt(2, idCli);
                ps.setInt(3, numTable);
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

            return """
                    {
                        "success":false,
                        "message":"Erreur reservation"
                    }
                    """;
        }
    }
}