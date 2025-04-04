document.addEventListener("DOMContentLoaded", function () {
    var reservationDetails = JSON.parse(localStorage.getItem("reservationDetails"));
    emailjs.init("ozNyarxJVstgl7vvQ"); 
    console.log("Données récupérées du localStorage :", reservationDetails);

    setTimeout(function () {
        window.history.replaceState(null, "", window.location.pathname);
    }, 100);

    if (reservationDetails) {
        const soinsSupplementaires = reservationDetails.soinsSupplementaires || [];
        localStorage.setItem("soinsSupplementaires", JSON.stringify(soinsSupplementaires));

        var dateCreneauElement = document.getElementById("date-value");

        if (reservationDetails.date && reservationDetails.creneau && dateCreneauElement) {
            // Convertir la date de "DD-MM-YYYY" vers "Jour Mois Année"
            const [day, month, year] = reservationDetails.date.split("-");
            const monthNames = [
                "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
            ];
        
            const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1].toUpperCase()} ${year}`;
        
            dateCreneauElement.textContent = `${formattedDate} à ${reservationDetails.creneau}`;
            console.log("Date et créneau affichés :", formattedDate, reservationDetails.creneau);
        } else {
            console.log("Les détails de réservation sont manquants ou incorrects.");
        }
        

        var urlParams = new URLSearchParams(window.location.search);
        var locationValue = urlParams.get("location");
        var locationElement = document.getElementById("location-value");
        if (locationElement && locationValue) {
            locationElement.textContent = decodeURIComponent(locationValue);
        }

        var soinContainer = document.getElementById("soins-supp-container");
        var soinValueElement = document.getElementById("soin-value");
        let soinsAffiches = [];

        // 📌 Gestion du soin principal
        if (reservationDetails.soin) {
            soinsAffiches.push(reservationDetails.soin);
        }

        // 📌 Gestion des soins supplémentaires
        if (reservationDetails.soinsSupplementaires && Array.isArray(reservationDetails.soinsSupplementaires)) {
            for (var i = 0; i < reservationDetails.soinsSupplementaires.length; i++) {
                var supp = reservationDetails.soinsSupplementaires[i];
                soinsAffiches.push(supp.soinNom);
            }
        }

        // 📌 Affichage des soins
        if (soinsAffiches.length > 0) {
            soinValueElement.innerHTML = soinsAffiches.map(soin => `<p class="styled-text">${soin}</p>`).join('');
        }

        // 📌 Affichage du container des soins supplémentaires
        if (reservationDetails.soinsSupplementaires && reservationDetails.soinsSupplementaires.length > 0) {
            soinContainer.classList.remove("hidden");
        } else {
            soinContainer.classList.add("hidden");
        }

        // 📌 Gestion des prix
        var prixContainer = document.getElementById("prix-supp-container");
        var prixValueElement = document.getElementById("prix-detail-value");
        var totalPrixContainer = document.getElementById("total-prix-container");
        var totalPrixElement = document.getElementById("total-prix-value");
        let prixTotal = 0;
        let prixAffiches = [];

        if (reservationDetails.prix !== null && reservationDetails.prix !== undefined) {
            let prixSoin = parseFloat(reservationDetails.prix);
            if (!isNaN(prixSoin)) {
                prixAffiches.push(`${prixSoin}€`);
                prixTotal += prixSoin;
            }
        }

        if (reservationDetails.soinsSupplementaires && Array.isArray(reservationDetails.soinsSupplementaires)) {
            for (var i = 0; i < reservationDetails.soinsSupplementaires.length; i++) {
                var supp = reservationDetails.soinsSupplementaires[i];
                let prixSupp = parseFloat(supp.soinPrix);
                if (!isNaN(prixSupp)) {
                    prixAffiches.push(`${prixSupp}€`);
                    prixTotal += prixSupp;
                }
            }
        }

        totalPrixElement.textContent = `${prixTotal.toFixed(2)}€`;

        // 📌 Affichage des prix
        if (prixAffiches.length > 0) {
            prixValueElement.innerHTML = prixAffiches.map(prix => `<p class="styled-text">${prix}</p>`).join('');
            prixContainer.classList.remove("hidden");
        } else {
            prixContainer.classList.add("hidden");
        }

        if (prixAffiches.length > 1) {
            totalPrixElement.textContent = `${prixTotal}€`;
            totalPrixContainer.classList.remove("hidden");
        } else {
            totalPrixContainer.classList.add("hidden");
        }

        // 📌 Activation du bouton de confirmation
        const confirmButton = document.getElementById("confirm-button");
        const nom = document.getElementById("nom");
        const prenom = document.getElementById("prenom");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");

        function checkFormCompletion() {
            confirmButton.disabled = !(nom.value.trim() && prenom.value.trim() && email.value.trim() && phone.value.trim());
        }

        nom.addEventListener("input", checkFormCompletion);
        prenom.addEventListener("input", checkFormCompletion);
        email.addEventListener("input", checkFormCompletion);
        phone.addEventListener("input", checkFormCompletion);

        confirmButton.addEventListener("click", function () {
        const soinsSupplementaires = JSON.parse(localStorage.getItem("soinsSupplementaires")) || [];

    // Récupération des données du formulaire
    const reservationData = {
        nom: nom.value.trim(),
        prenom: prenom.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        soin: reservationDetails.soin || "",
        prix: reservationDetails.prix ? `${reservationDetails.prix}€` : "",
        totalPrix: `${prixTotal.toFixed(2)}€`,
        location: document.getElementById("location-value").textContent,
        date: reservationDetails.date,
        creneau: reservationDetails.creneau,
        infoComplementaires: document.getElementById("infoComplementaires").value,
        soinsSupplementaires: soinsSupplementaires // Déjà stocké sous le bon format
    };

    function sauvegarderReservationDansLocalStorage(reservationData) {
        let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    
        reservations.push(reservationData);
    
        localStorage.setItem("reservations", JSON.stringify(reservations));
    }

    sauvegarderReservationDansLocalStorage(reservationData);

   // Remplacer soin et prix par le premier soinSupp si soin principal est vide
if (!reservationData.soin && soinsSupplementaires.length > 0) {
    // Remplace soin principal par le 1er soin supp
    reservationData.soin = soinsSupplementaires[0].soinNom || "Prestation non spécifiée";
    // Remplace prix principal par le 1er soinPrix
    reservationData.prix = soinsSupplementaires[0].soinPrix ? `${soinsSupplementaires[0].soinPrix}` : "Prix non spécifié";
    // Supprime le premier soin supplémentaire de la liste après remplacement
    soinsSupplementaires.shift();
}

    const prixList = [];
    if (reservationData.prix) prixList.push(reservationData.prix);
    soinsSupplementaires.forEach(supp => {
        if (supp.soinPrix) prixList.push(supp.soinPrix);
    });

    const multiplePrix = prixList.length > 1;

    function formatDateForEmail(dateString) {
        const monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
    
        const [day, month, year] = dateString.split("-");
        return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    

    var emailData = {
        ...reservationData,
        date: formatDateForEmail(reservationData.date),
        soinsSupplementaires: soinsSupplementaires.map(soin => ({
            soinNom: soin.soinNom,
            soinPrix: soin.soinPrix
        })),
        afficherTotal: multiplePrix
    };

    // Envoi via EmailJS
    emailjs.send("service_0ng92qr", "template_ybf7aeo", emailData)
        .then(function(response) {
            console.log("Succès de l'envoi EmailJS", response);
            window.location.href = "validation.html";
        })
        .catch(function(error) {
            console.error("Erreur d'envoi EmailJS", error);
        });

        });
    }
});
