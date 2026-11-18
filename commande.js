const trouver = (key, id) => load(key).find(i => i.id === id);

setupCrud({
    key: "COMMANDE_LIST",
    formId: "commandeForm",
    container: "commandes-table-container",
    emptyMsg: "Aucune commande enregistrée.",
    columns: [
        { title: "Client", value: o => (trouver("CLIENT_LIST", o.clientId) || { nom: "(supprimé)" }).nom },
        { title: "Produit", value: o => (trouver("PRODUIT_LIST", o.produitId) || { nom: "(supprimé)" }).nom },
        { title: "Quantité", value: o => o.quantite },
        { title: "Total", value: o => {
            const p = trouver("PRODUIT_LIST", o.produitId);
            return p ? (p.prix * o.quantite).toFixed(2) : "-";
        } }
    ]
});

const selClient = document.querySelector("#commandeForm [name=clientId]");
const selProduit = document.querySelector("#commandeForm [name=produitId]");
function refreshCommandeSelects() {
    fillSelect(selClient, load("CLIENT_LIST"), c => c.nom, "-- choisir un client --");
    fillSelect(selProduit, load("PRODUIT_LIST").filter(p => p.stock === "disponible"),
        p => p.nom + " (" + Number(p.prix).toFixed(2) + ")", "-- choisir un produit --");
}
document.addEventListener("data-changed", refreshCommandeSelects);
refreshCommandeSelects();
