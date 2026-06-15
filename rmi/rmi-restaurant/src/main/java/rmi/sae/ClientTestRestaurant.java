package rmi.sae;

import io.github.cdimascio.dotenv.Dotenv;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class ClientTestRestaurant {

    public static void main(String[] args) throws Exception {

        Dotenv dotenv = Dotenv.load();
        String host = dotenv.get("RMI_REGISTRY_HOST", "charlemagne.iutnc.univ-lorraine.fr");
        int port = Integer.parseInt(dotenv.get("RMI_REGISTRY_PORT", "1099"));

        Registry reg = LocateRegistry.getRegistry(host, port);

        RestaurantService service = (RestaurantService) reg.lookup("RestaurantService");

        System.out.println(service.getRestaurantsJson());

        // exemple
        // System.out.println(service.reserverTableJson("Dupont", "Jean", "0612345678",
        // 4, 1, "2026-06-15 19:30", 1));
    }
}