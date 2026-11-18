setupCrud({
    key: "CLIENT_LIST",
    formId: "clientForm",
    container: "clients-table-container",
    emptyMsg: "Aucun client enregistré.",
    columns: [
        { title: "Nom", value: c => c.nom },
        { title: "Tel", value: c => c.tel },
        { title: "Email", value: c => c.email }
    ]
});
