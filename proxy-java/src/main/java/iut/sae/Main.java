package iut.sae;

import java.net.InetSocketAddress;

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
                } catch (Exception ex) {}
            } finally {
                exchange.close();
            }
        });

        server.start();

        System.out.println("Proxy lancé sur http://localhost:8080");
    }
}