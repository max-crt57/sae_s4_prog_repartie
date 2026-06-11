import { Restaurant, TableResto } from './types';
import { getApiBase } from './api';

// variables globales pour conserver l'état de la réservation en cours
let currentRestauId: number | null = null;
let currentDatetime: string | null = null;
let currentGuests: number | null = null;

// verifier les tables et ouvrir la modale
export async function checkTablesAndOpenModal(restau: Restaurant) {
    // on recupere les champs de saisie de la popup
    const datetimeInput = document.querySelector('.leaflet-popup .popup-datetime') as HTMLInputElement;
    const guestsInput = document.querySelector('.leaflet-popup .popup-guests') as HTMLInputElement;

    const datetime = datetimeInput.value;
    const guests = guestsInput.value;

    // validation simple des champs
    if (!datetime || !guests) {
        alert("Veuillez remplir la date, l'heure et le nombre de convives.");
        return;
    }

    try {
        // requete get vers le proxy java pour recuperer les tables libres
        const response = await fetch(`${getApiBase()}/api/tables?idRest=${restau.id}&datetime=${encodeURIComponent(datetime)}`);
        if (!response.ok) throw new Error();

        const tables = await response.json();

        // on filtre les tables pour ne garder que celles qui ont assez de places
        const validTables = tables.filter((t: TableResto) => t.nbPlace >= parseInt(guests));

        if (validTables.length === 0) {
            alert("Aucune table assez grande n'est disponible à cette heure.");
            return;
        }

        // sauvegarde de l'etat courant de la reservation
        currentRestauId = restau.id;
        currentDatetime = datetime;
        currentGuests = parseInt(guests);

        // recuperation des elements de la modale html
        const modalTitle = document.getElementById('modal-rest-name') as HTMLElement;
        const tableSelect = document.getElementById('table-select') as HTMLSelectElement;
        const resMessage = document.getElementById('res-message') as HTMLElement;

        // mise a jour des informations textuelles
        modalTitle.textContent = restau.nom;
        document.getElementById('modal-date-display')!.textContent = new Date(datetime).toLocaleString('fr-FR');
        document.getElementById('modal-guests-display')!.textContent = guests;

        // remplissage du select avec les tables disponibles
        tableSelect.innerHTML = '';
        validTables.forEach((t: TableResto) => {
            const opt = document.createElement('option');
            opt.value = t.numTable.toString();
            opt.textContent = `Table n°${t.numTable} (${t.nbPlace} places)`;
            tableSelect.appendChild(opt);
        });

        // reinitialisation des messages et des champs de contact
        resMessage.textContent = '';
        (document.getElementById('res-nom') as HTMLInputElement).value = '';
        (document.getElementById('res-prenom') as HTMLInputElement).value = '';
        (document.getElementById('res-tel') as HTMLInputElement).value = '';

        // ouverture de la boite de dialogue
        const modal = document.getElementById('reservation-modal') as HTMLDialogElement;
        modal.showModal();

    } catch (err) {
        alert("Erreur lors de la récupération des tables.");
    }
}

// ecouteurs d'evenements pour la validation
export function setupReservationEvents() {
    const modal = document.getElementById('reservation-modal') as HTMLDialogElement;
    const closeModal = document.getElementById('close-modal') as HTMLElement;
    const btnConfirmRes = document.getElementById('btn-confirm-res') as HTMLButtonElement;
    const tableSelect = document.getElementById('table-select') as HTMLSelectElement;
    const resMessage = document.getElementById('res-message') as HTMLElement;

    // fermeture de la modale au clic sur le bouton fermer
    closeModal.addEventListener('click', () => modal.close());

    // clic sur le bouton de confirmation
    btnConfirmRes.addEventListener('click', async () => {
        const selectedTableVal = tableSelect.value;
        if (!selectedTableVal) {
            alert("Veuillez sélectionner une table.");
            return;
        }

        const nom = (document.getElementById('res-nom') as HTMLInputElement).value;
        const prenom = (document.getElementById('res-prenom') as HTMLInputElement).value;
        const tel = (document.getElementById('res-tel') as HTMLInputElement).value;

        // validation simple des coordonnees du client
        if (!nom || !prenom || !tel) {
            alert("Veuillez remplir vos coordonnées.");
            return;
        }

        // preparation de l'objet json a envoyer au serveur
        const payload = {
            idRestaurant: currentRestauId,
            datetime: currentDatetime,
            numTable: parseInt(selectedTableVal),
            nbConvives: currentGuests,
            nom: nom,
            prenom: prenom,
            telephone: tel
        };

        try {
            // requete post vers le proxy http java
            const response = await fetch(`${getApiBase()}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                // message de reussite et fermeture automatique apres 3 secondes
                resMessage.style.color = '#27ae60';
                resMessage.textContent = "Réservation confirmée !";
                setTimeout(() => modal.close(), 3000);
            } else {
                // affichage du message d'erreur renvoye par le serveur rmi
                resMessage.style.color = 'red';
                resMessage.textContent = data.message;
            }
        } catch (err) {
            resMessage.style.color = 'red';
            resMessage.textContent = "Erreur de connexion.";
        }
    });
}