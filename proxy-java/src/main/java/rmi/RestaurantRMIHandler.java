package rmi;

import rmi.sae.RestaurantService; // dependance au projet rmi

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

    public static String fetchTablesDisponibles(int idRest, String datetime) throws RemoteException, NotBoundException {
        Registry reg = LocateRegistry.getRegistry("localhost", 1099);
        RestaurantService service = (RestaurantService) reg.lookup("RestaurantService");
        return service.getTablesDisponiblesJson(idRest, datetime);
    }

    public static String reserverTable(String nom, String prenom, String tel, int nbC, int idRest, String datetime,
            int numTable) throws RemoteException, NotBoundException {
        Registry reg = LocateRegistry.getRegistry("localhost", 1099);
        RestaurantService service = (RestaurantService) reg.lookup("RestaurantService");
        return service.reserverTableJson(nom, prenom, tel, nbC, idRest, datetime, numTable);
    }
}
