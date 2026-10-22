import { useState } from "react";
import type { Eleve, Moniteur, Vehicule } from "../types";
import { creerSeance } from "../api";
import axios from "axios";

interface Props {
    eleve: Eleve;
    moniteurs: Moniteur[];
    vehicules: Vehicule[];
    onCreated: () => void;
}

export default function SeanceForm({ eleve, moniteurs, vehicules, onCreated }: Props) {
    const [dateSeance, setDateSeance] = useState("");
    const [heureDebut, setHeureDebut] = useState("09:00");
    const [duree, setDuree] = useState(60);
    const [idMoniteur, setIdMoniteur] = useState<number>(0);
    const [idVehicule, setIdVehicule] = useState<number>(0);
    const [erreur, setErreur] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setErreur("");
        try {
            await creerSeance({
                dateSeance, heureDebut, duree,
                idEleve: eleve.id, idMoniteur, idVehicule,
            });
            onCreated();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErreur(err.response?.data?.message ?? "Erreur lors de la creation");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
            <h3>Nouvelle séance pour {eleve.prenom} {eleve.nom}</h3>

            <input type="date" value={dateSeance} onChange={e => setDateSeance(e.target.value)} required />
            <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} required />
            <input type="number" min={15} step={15} value={duree}
                   onChange={e => setDuree(Number(e.target.value))} required />

            <select value={idMoniteur} onChange={e => setIdMoniteur(Number(e.target.value))} required>
                <option value={0} disabled>Choisir un moniteur</option>
                {moniteurs.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>

            <select value={idVehicule} onChange={e => setIdVehicule(Number(e.target.value))} required>
                <option value={0} disabled>Choisir un véhicule</option>
                {vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.marque} {v.modele} ({v.immatriculation})</option>
                ))}
            </select>

            <button type="submit">Programmer la séance</button>
            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}
        </form>
    );
}