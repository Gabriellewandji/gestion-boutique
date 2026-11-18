/* ===== Navigation + fonctions partagées ===== */

// --- Navigation entre les sections ---
const menulinks = document.querySelectorAll(".menu-link");
const sections = document.querySelectorAll(".tab-section");

function showSection(targetId) {
    let found = false;
    sections.forEach(section => {
        const match = "#" + section.id === targetId;
        section.classList.toggle("hidden", !match);
        if (match) found = true;
    });
    // si l'id est inconnu, on affiche la 1re section (client)
    if (!found && sections.length > 0) {
        sections[0].classList.remove("hidden");
        targetId = "#" + sections[0].id;
    }
    menulinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === targetId));
}

menulinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        history.pushState(null, null, targetId);   // met à jour l'URL sans recharger
        showSection(targetId);
    });
});

showSection(location.hash || "#client");   // affichage au chargement

// --- localStorage ---
const load = key => JSON.parse(localStorage.getItem(key)) || [];
const save = key => data => localStorage.setItem(key, JSON.stringify(data));

// protège contre l'injection HTML (on utilise innerHTML)
const esc = s => String(s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// remplit un <select> à partir d'une liste
function fillSelect(select, items, labelFn, placeholder) {
    const current = select.value;
    let html = '<option value="" disabled selected>' + placeholder + '</option>';
    items.forEach(i => {
        html += '<option value="' + i.id + '">' + esc(labelFn(i)) + '</option>';
    });
    select.innerHTML = html;
    if (items.some(i => String(i.id) === current)) select.value = current;
}

/* --- CRUD générique : Create / Read / Update / Delete ---
   key       : clé localStorage
   formId    : id du formulaire
   container : id de la div du tableau
   columns   : [{ title, value: item => texte }]
   emptyMsg  : message si la liste est vide                                  */
function setupCrud({ key, formId, container, columns, emptyMsg }) {
    const form = document.getElementById(formId);
    const box = document.getElementById(container);
    const submitBtn = form.querySelector("button[type=submit]");
    const cancelBtn = form.querySelector(".cancel");
    let editId = null;

    function render() {
        const items = load(key);
        if (items.length === 0) {
            box.innerHTML = '<p class="empty">' + emptyMsg + '</p>';
            return;
        }
        let html = '<table><thead><tr>';
        columns.forEach(c => { html += '<th>' + c.title + '</th>'; });
        html += '<th>Actions</th></tr></thead><tbody>';
        items.forEach(item => {
            html += '<tr>';
            columns.forEach(c => { html += '<td>' + esc(c.value(item)) + '</td>'; });
            html += '<td class="actions">' +
                '<button class="edit" data-id="' + item.id + '">Modifier</button> ' +
                '<button class="delete" data-id="' + item.id + '">Supprimer</button>' +
                '</td></tr>';
        });
        html += '</tbody></table>';
        box.innerHTML = html;
    }

    function resetForm() {
        form.reset();
        editId = null;
        submitBtn.textContent = "Ajouter";
        cancelBtn.classList.add("hidden");
    }

    // CREATE + UPDATE
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = {};
        [...form.elements].forEach(el => { if (el.name && el.type !== "radio") data[el.name] = el.value.trim(); });
        form.querySelectorAll("input[type=radio]:checked").forEach(r => data[r.name] = r.value);

        const items = load(key);
        if (editId) {
            const i = items.findIndex(it => it.id === editId);
            if (i !== -1) items[i] = { ...items[i], ...data };
        } else {
            items.push({ id: Date.now().toString(), ...data });
        }
        save(key)(items);
        resetForm();
        render();
        document.dispatchEvent(new Event("data-changed"));
    });

    // DELETE + préparation de l'UPDATE (délégation d'événements)
    box.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-id]");
        if (!btn) return;
        const id = btn.dataset.id;
        const items = load(key);

        if (btn.classList.contains("delete")) {
            if (!confirm("Supprimer cet élément ?")) return;
            save(key)(items.filter(it => it.id !== id));
            if (editId === id) resetForm();
            render();
            document.dispatchEvent(new Event("data-changed"));
        } else {
            const item = items.find(it => it.id === id);
            if (!item) return;
            Object.keys(item).forEach(k => {
                if (k !== "id" && form.elements[k]) form.elements[k].value = item[k];
            });
            editId = id;
            submitBtn.textContent = "Enregistrer";
            cancelBtn.classList.remove("hidden");
            form.scrollIntoView({ behavior: "smooth" });
        }
    });

    cancelBtn.addEventListener("click", resetForm);
    document.addEventListener("data-changed", render);   // rafraîchit les noms liés
    render();
}
