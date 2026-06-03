package iut.sae;

import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/health", exchange -> {
            String response = "{\"status\":\"ok\"}";

            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

            exchange.sendResponseHeaders(200, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.close();
        });

        server.createContext("/api/bikes", exchange -> {
            try {
                // 1. Créer le client HTTP Java
                HttpClient client = HttpClient.newHttpClient();

                // 2. Requête vers les informations fixes
                HttpRequest requestInfo = HttpRequest.newBuilder().uri(URI.create("https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_information.json")).GET().build();
                HttpResponse<String> responseInfo = client.send(requestInfo, HttpResponse.BodyHandlers.ofString());

                // 3. Requête vers le statut en direct
                HttpRequest requestStatus = HttpRequest.newBuilder().uri(URI.create("https://api.cyclocity.fr/contracts/nancy/gbfs/v2/station_status.json")).GET().build();
                HttpResponse<String> responseStatus = client.send(requestStatus, HttpResponse.BodyHandlers.ofString());

                // 4. Fusionner les JSONS
                // On transforme les textes reçus en vrais objets JSON
                JSONObject infoRoot = new JSONObject(responseInfo.body());
                JSONArray infoStations = infoRoot.getJSONObject("data").getJSONArray("stations");

                JSONObject statusRoot = new JSONObject(responseStatus.body());
                JSONArray statusStations = statusRoot.getJSONObject("data").getJSONArray("stations");

                // On crée un dictionnaire (Map) pour retrouver le statut d'une station super vite via son ID
                Map<String, JSONObject> statusMap = new HashMap<>();
                for (int i = 0; i < statusStations.length(); i++) {
                    JSONObject status = statusStations.getJSONObject(i);
                    statusMap.put(status.get("station_id").toString(), status);
                }

                // On injecte les vélos dispos dans les infos de la station
                JSONArray mergedStations = new JSONArray();
                for (int i = 0; i < infoStations.length(); i++) {
                    JSONObject station = infoStations.getJSONObject(i);
                    String id = station.get("station_id").toString();
                    
                    JSONObject status = statusMap.get(id);
                    if (status != null) {
                        station.put("num_bikes_available", status.getInt("num_bikes_available"));
                        station.put("num_docks_available", status.getInt("num_docks_available"));
                    }
                    mergedStations.put(station);
                }

                // On crée le JSON final
                JSONObject finalJson = new JSONObject();
                finalJson.put("stations", mergedStations);
                String jsonFinal = finalJson.toString();

                // 5. Renvoyer le résultat
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                
                byte[] bytes = jsonFinal.getBytes("UTF-8");
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                
            } catch (Exception e) {
                e.printStackTrace();
                String error = "{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}";
                try {
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    exchange.getResponseBody().write(error.getBytes());
                } catch (Exception ex) {}
            } finally {
                exchange.close();
            }
        });

        server.start();

        System.out.println("Proxy lancé sur http://localhost:8080");
    }
}