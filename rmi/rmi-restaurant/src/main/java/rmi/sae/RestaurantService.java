package rmi.sae;

import java.rmi.Remote;
import java.rmi.RemoteException;

public interface RestaurantService extends Remote {
        String getRestaurantsJson() throws RemoteException;

        String getTablesDisponiblesJson(int idRestaurant, String datetime) throws RemoteException;

        String reserverTableJson(String nom, String prenom, String telephone, int nbConvives, int restaurantId,
                        String datetime, int numTable) throws RemoteException;
}