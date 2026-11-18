setupCrud({
    key: "CATEGORIE_LIST",
    formId: "categorieForm",
    container: "categories-table-container",
    emptyMsg: "Aucune catégorie. Ajoutez-en une pour pouvoir créer des produits.",
    columns: [{ title: "Nom", value: c => c.nom }]
});
