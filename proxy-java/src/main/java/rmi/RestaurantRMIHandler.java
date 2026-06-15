package rmi;

import io.github.cdimascio.dotenv.Dotenv;
import rmi.sae.RestaurantService; // dependance au projet rmi

import java.rmi.NotBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RestaurantRMIHandler {

    private static RestaurantRMIHandler instance;

    private RestaurantService service;
    private final String host;
    private final int port;

    private RestaurantRMIHandler() throws RemoteException, NotBoundException {
        Dotenv dotenv = Dotenv.load();
        this.host = dotenv.get("RMI_REGISTRY_HOST", "charlemagne.iutnc.univ-lorraine.fr");
        this.port = Integer.parseInt(dotenv.get("RMI_REGISTRY_PORT", "1099"));
        connect();
    }

    private void connect() throws RemoteException, NotBoundException {
        Registry reg = LocateRegistry.getRegistry(host, port);
        this.service = (RestaurantService) reg.lookup("RestaurantService");
    }

    public static synchronized RestaurantRMIHandler getInstance() throws RemoteException, NotBoundException {
        if (instance == null) {
            instance = new RestaurantRMIHandler();
        }
        return instance;
    }

    public String fetchRestaurants() throws RemoteException, NotBoundException {
        try {
            return service.getRestaurantsJson();
        } catch (RemoteException e) {
            connect(); // Reconnexion si le serveur a redémarré
            return service.getRestaurantsJson();
        }
    }

    public String fetchTablesDisponibles(int idRest, String datetime) throws RemoteException, NotBoundException {
        try {
            return service.getTablesDisponiblesJson(idRest, datetime);
        } catch (RemoteException e) {
            connect();
            return service.getTablesDisponiblesJson(idRest, datetime);
        }
    }

    public String reserverTable(String nom, String prenom, String tel, int nbC, int idRest, String datetime,
            int numTable) throws RemoteException, NotBoundException {
        try {
            return service.reserverTableJson(nom, prenom, tel, nbC, idRest, datetime, numTable);
        } catch (RemoteException e) {
            connect();
            return service.reserverTableJson(nom, prenom, tel, nbC, idRest, datetime, numTable);
        }
    }
}
