const nomCategorie = id => (load("CATEGORIE_LIST").find(c => c.id === id) || { nom: "(supprimée)" }).nom;

setupCrud({
    key: "PRODUIT_LIST",
    formId: "produitForm",
    container: "produits-table-container",
    emptyMsg: "Aucun produit enregistré.",
    columns: [
        { title: "Nom", value: p => p.nom },
        { title: "Prix", value: p => Number(p.prix).toFixed(2) },
        { title: "Stock", value: p => p.stock },
        { title: "Catégorie", value: p => nomCategorie(p.categorieId) }
    ]
});

const selCategorie = document.querySelector("#produitForm [name=categorieId]");
const refreshCategories = () =>
    fillSelect(selCategorie, load("CATEGORIE_LIST"), c => c.nom, "-- choisir une catégorie --");
document.addEventListener("data-changed", refreshCategories);
refreshCategories();
