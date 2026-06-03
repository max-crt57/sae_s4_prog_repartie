package rmi.sae;
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface RestaurantService extends Remote {
        String getRestaurantsJson() throws RemoteException;

        String reserverTableJson(String nom, String prenom, String telephone, int nbConvives, int restaurantId) throws RemoteException;
}