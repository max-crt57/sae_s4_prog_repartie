package iut.sae;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class IncidentService {

    private static final String API_URL = "https://carto.g-ny.eu/data/cifs/cifs_waze_v2.json";

    /**
     * Méthode statique pour récupérer les incidents depuis l'API de la Métropole
     */
    public static String fetchIncidents() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(API_URL)).GET().build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Erreur de l'API Incidents: HTTP " + response.statusCode());
        }

        return response.body();
    }
}