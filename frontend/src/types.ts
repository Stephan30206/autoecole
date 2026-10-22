export interface Eleve {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    dateInscription: string;
}

export interface Moniteur {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    actif: boolean;
}

export interface Vehicule {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
    etat: string;
}

export interface Seance {
    id: number;
    dateSeance: string;
    heureDebut: string;
    duree: number;
    statut: string;
    eleveId: number;
    eleveNom: string;
    moniteurNom: string;
    vehicule: string;
}

export interface SeanceRequest {
    dateSeance: string;
    heureDebut: string;
    duree: number;
    idEleve: number;
    idMoniteur: number;
    idVehicule: number;
}

export interface Resultat {
    id: number;
    typeExamen: string;
    dateExamen: string;
    lieu: string;
    note: number | null;
    resultat: string;
}