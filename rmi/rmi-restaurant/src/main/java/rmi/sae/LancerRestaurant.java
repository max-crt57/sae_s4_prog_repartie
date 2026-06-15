package rmi.sae;

import io.github.cdimascio.dotenv.Dotenv;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

public class LancerRestaurant {

    public static void main(String[] args) throws Exception {

        Dotenv dotenv = Dotenv.load();
        int port = Integer.parseInt(dotenv.get("RMI_REGISTRY_PORT", "1099"));

        // création du registre
        Registry reg = LocateRegistry.createRegistry(port);

        RestaurantService service = (RestaurantService) UnicastRemoteObject.exportObject(new RestaurantServiceImpl(),
                0);

        reg.rebind("RestaurantService", service);

        System.out.println("Service Restaurant pret et enregistre sur le port " + port);
        System.out.println("Appuyez sur Ctrl+C pour arreter le serveur.");

        // bloquer le thread principal pour garder le serveur rmi en vie
        Thread.currentThread().join();
    }
}