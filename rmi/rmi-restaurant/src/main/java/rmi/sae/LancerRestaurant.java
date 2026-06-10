package rmi.sae;

import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

public class LancerRestaurant {

    public static void main(String[] args) throws Exception {

        Registry reg = LocateRegistry.createRegistry(1099);

        RestaurantService service = (RestaurantService) UnicastRemoteObject.exportObject(new RestaurantServiceImpl(),
                0);

        reg.rebind("RestaurantService", service);

        System.out.println("Service Restaurant pret.");
        System.out.println("Appuyez sur Ctrl+C pour arreter le serveur.");

        // Bloquer le thread principal pour garder le serveur RMI en vie
        Thread.currentThread().join();
    }
}