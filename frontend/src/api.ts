import axios from "axios";
import type {
    Eleve, Moniteur, Vehicule, Seance, SeanceRequest, Resultat,
} from "./types";

const http = axios.create({
    baseURL: "http://localhost:8080/api",
});

export const getEleves = () => http.get<Eleve[]>("/eleves").then(r => r.data);

export const getMoniteurs = () =>
    http.get<Moniteur[]>("/moniteurs", { params: { actifsSeulement: true } }).then(r => r.data);

export const getVehicules = () => http.get<Vehicule[]>("/vehicules").then(r => r.data);

export const getSeances = (eleveId: number) =>
    http.get<Seance[]>("/seances", { params: { eleveId } }).then(r => r.data);

export const creerSeance = (data: SeanceRequest) =>
    http.post<Seance>("/seances", data).then(r => r.data);

export const getResultats = (eleveId: number) =>
    http.get<Resultat[]>("/resultats", { params: { eleveId } }).then(r => r.data);