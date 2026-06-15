package iut.sae;

import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpServer;
import rmi.RestaurantRMIHandler;

import io.github.cdimascio.dotenv.Dotenv;

public class Main {
    public static void main(String[] args) throws Exception {
        Dotenv dotenv = Dotenv.load();
        int proxyPort = Integer.parseInt(dotenv.get("PROXY_PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(proxyPort), 0);

        server.createContext("/api/health", exchange -> {
            String response = "{\"status\":\"ok\"}";

            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

            exchange.sendResponseHeaders(200, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.close();
        });

        server.createContext("/api/incidents", exchange -> {
            try {
                String jsonResponse = IncidentService.fetchIncidents();

                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

                byte[] bytes = jsonResponse.getBytes("UTF-8");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);

            } catch (Exception e) {
                e.printStackTrace();
                String error = "{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}";
                try {
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    exchange.getResponseBody().write(error.getBytes());
                } catch (Exception ex) {
                }
            } finally {
                exchange.close();
            }
        });

        // recuperation des restaurants
        server.createContext("/api/restaurants", exchange -> {

            String response;
            try {
                response = RestaurantRMIHandler.getInstance().fetchRestaurants();
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

                exchange.sendResponseHeaders(200, response.getBytes().length);
                exchange.getResponseBody().write(response.getBytes());
                exchange.close();
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    String err = "{\"success\":false,\"message\":\"Proxy Error (RMI Server might be down)\"}";
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.sendResponseHeaders(500, err.getBytes().length);
                    exchange.getResponseBody().write(err.getBytes());
                } catch (Exception ex) {
                }
            } finally {
                exchange.close();
            }

        });

        server.createContext("/api/tables", exchange -> {
            try {
                // on recupere l'id du restau et la date dans l'url
                String query = exchange.getRequestURI().getQuery();
                int idRest = -1;
                String datetime = "";
                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] pair = param.split("=");
                        if (pair.length > 1) {
                            if (pair[0].equals("idRest"))
                                idRest = Integer.parseInt(pair[1]);
                            if (pair[0].equals("datetime"))
                                datetime = java.net.URLDecoder.decode(pair[1], "UTF-8");
                        }
                    }
                }

                String response = RestaurantRMIHandler.getInstance().fetchTablesDisponibles(idRest, datetime);

                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                exchange.getResponseBody().write(response.getBytes());
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                exchange.close();
            }
        });

        server.createContext("/api/reservations", exchange -> {
            // on gere la methode options pour les cors
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            try {
                // lecture du corps de la requete json
                java.io.InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);

                // parsing json tres simple pour la demonstration
                String nom = extractJsonField(body, "nom");
                String prenom = extractJsonField(body, "prenom");
                String tel = extractJsonField(body, "telephone");
                int nbC = Integer.parseInt(extractJsonField(body, "nbConvives"));
                int idRest = Integer.parseInt(extractJsonField(body, "idRestaurant"));
                String datetime = extractJsonField(body, "datetime");
                int numTable = Integer.parseInt(extractJsonField(body, "numTable"));

                String response = RestaurantRMIHandler.getInstance().reserverTable(nom, prenom, tel, nbC, idRest, datetime, numTable);

                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                exchange.getResponseBody().write(response.getBytes());
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    String err = "{\"success\":false,\"message\":\"Proxy Error\"}";
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.sendResponseHeaders(500, err.getBytes().length);
                    exchange.getResponseBody().write(err.getBytes());
                } catch (Exception ex) {
                }
            } finally {
                exchange.close();
            }
        });

        server.start();

        System.out.println("Proxy lancé sur http://localhost:" + proxyPort);
    }

    private static String extractJsonField(String json, String field) {
        String search = "\"" + field + "\":";
        int start = json.indexOf(search);
        if (start == -1)
            return "";
        start += search.length();

        // ignorer les espaces
        while (start < json.length() && Character.isWhitespace(json.charAt(start)))
            start++;

        if (start < json.length() && json.charAt(start) == '"') {
            start++;
            int end = json.indexOf("\"", start);
            return end == -1 ? "" : json.substring(start, end);
        } else {
            int end = start;
            while (end < json.length() && !Character.isWhitespace(json.charAt(end)) && json.charAt(end) != ','
                    && json.charAt(end) != '}') {
                end++;
            }
            return json.substring(start, end);
        }
    }
}