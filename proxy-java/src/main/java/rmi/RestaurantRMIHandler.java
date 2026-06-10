package rmi;

import rmi.sae.RestaurantService; // dépendance au projet RMI

import java.rmi.NotBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RestaurantRMIHandler {

    public static String fetchRestaurants() throws RemoteException, NotBoundException {

        Registry reg = LocateRegistry.getRegistry("localhost", 1099);
        RestaurantService service = (RestaurantService) reg.lookup("RestaurantService");

        return service.getRestaurantsJson();

    }
}
