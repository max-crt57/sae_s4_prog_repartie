package rmi.sae;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class ClientTestRestaurant {

    public static void main(String[] args) throws Exception {
        
        Registry reg = LocateRegistry.getRegistry("localhost",1099);

        RestaurantService service = (RestaurantService) reg.lookup("RestaurantService");

        System.out.println(service.getRestaurantsJson());

        //exemple
        //System.out.println(service.reserverTableJson("Dupont", "Jean", "0612345678", 4, 1));
    }
}