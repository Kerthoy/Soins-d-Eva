document.addEventListener("DOMContentLoaded", function () {
    console.log("Valeur brute de localStorage:", localStorage.getItem("reservations"));
    console.log("Valeur brute de localStorage:", localStorage.getItem("blockedSlots"));

    setTimeout(function () {
        window.history.replaceState(null, "", window.location.pathname);
    }, 100);

    // Récupération des réservations stockées
    let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
    let blockedSlots = JSON.parse(localStorage.getItem('blockedSlots')) || []; 


    // Définition des prix des soins
    var prixSoin = {
        "Le Miracle Face": 90,
        "Le Miracle Face - La Cure": 350,
        "Face Lift": 90,
        "Le Soin Better Aging": 120,
        "Le Soin Better Aging - Expert": 150,
        "Drainage Lymphatique": 150,
        "Drainage Lymphatique - La Cure": 600,
        "Massage Relaxant": 90,
        "Massage Relaxant - Complet": 130,
        "Yoga Facial": 70,
        "Auto Massage": 70,
    };

    // Fonction pour récupérer les paramètres de l'URL
    function getUrlParams() {
        var params = new URLSearchParams(window.location.search);
        var soin = params.get("soin");
        var duree = params.get("duree");

        return {soin, duree};
    }

    // Récupérer les paramètres de l'URL
    var { soin, duree } = getUrlParams();

    // Récupération des paramètres URL
    var params = new URLSearchParams(window.location.search);

    var ajouterSoinBtn = document.getElementById("ajouter-soin-btn");
    var listeSoins = document.getElementById("liste-soins");
    var soinsSelectionnes = document.getElementById("soins-selectionnes");

    let soinsSupplementaires = params.get("soinsSupplementaires")
    ? JSON.parse(decodeURIComponent(params.get("soinsSupplementaires")))
    : [];

    function cleanURL() {
        if (window.location.href.includes("soinsSupplementaires")) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    }

    cleanURL();
    
    var monthName = document.getElementById("month-name");
    var montControls = document.getElementById("month-controls")
    var calendarContainer = document.getElementById("calendar");
    var prevMonthButton = document.getElementById("prev-month");
    var nextMonthButton = document.getElementById("next-month");

    document.getElementById("month-name").classList.add("hidden");
    document.getElementById("month-controls").classList.add("hidden");
    document.getElementById("calendar").classList.add("hidden");
    document.getElementById("prev-month").classList.add("hidden");
    document.getElementById("next-month").classList.add("hidden");

    var slots = document.querySelectorAll(".slot");
    var reserveButton = document.getElementById("reserve-button");

    reserveButton.classList.add("hidden");

    var selection = document.getElementById("selection");
    var mainContainer = document.querySelector(".selection-container");

    var selectedSlot = null;
    var selectedDate = null;
    var currentMonth = new Date();

    var today = new Date();

    if (!soin || !duree) {
        listeSoins.classList.remove("hidden");

        reserveButton.classList.add("hidden");

        // Masquer le conteneur de sélection
        document.querySelector("#selection-container").classList.add("hidden");

        // Masquer tout le calendrier
        document.getElementById("month-name").classList.add("hidden");
        document.getElementById("month-controls").classList.add("hidden");
        document.getElementById("calendar").classList.add("hidden");
        document.getElementById("prev-month").classList.add("hidden");
        document.getElementById("next-month").classList.add("hidden");

        document.getElementById("selection").classList.add("hidden");

        // Masquer le bouton "Ajouter un soin..."
        document.getElementById("ajouter-soin-btn").classList.add("hidden");
    } else {
        // Afficher les données du soin dans le bloc sélection client
        document.getElementById("soin-nom").textContent = soin;
        document.getElementById("soin-duree").textContent = duree;

        // Attribuer le prix en fonction du soin
        if (soin in prixSoin) {
            var prix = prixSoin[soin];
        
            var prixElement = document.getElementById("soin-prix");
        
            // Si l'élément #soin-prix existe
            if (prixElement) {
                prixElement.textContent = prix + "€"; 
            }
        } else {
            var prixElement = document.getElementById("soin-prix");
            if (prixElement) {
                prixElement.textContent = "Prix non disponible";  // Message par défaut si pas de prix trouvé
            }
        }        
        

        // Afficher calendrier
        document.getElementById("month-name").classList.remove("hidden");
        document.getElementById("month-controls").classList.remove("hidden");
        document.getElementById("calendar").classList.remove("hidden");
        document.getElementById("prev-month").classList.remove("hidden");
        document.getElementById("next-month").classList.remove("hidden");
    }
    
    // Fonction pour mettre à jour l'URL et masquer les paramètres
    function updateURL() {
        var params = new URLSearchParams(window.location.search);
        params.set("soinsSupplementaires", encodeURIComponent(JSON.stringify(soinsSupplementaires)));
        var newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
    }

    // Suppression du soin déjà présent au chargement de la page
    var soinExistants = document.querySelectorAll(".soin-details .close-btn");

    soinExistants.forEach(btn => {
        btn.addEventListener("click", function () {
            if (confirm("Êtes-vous sûr de vouloir supprimer ce soin ?")) {
                var soinBloc = this.closest(".soin-details");
                soinBloc.remove();
                verifierNbSoins();

                // Mettre à jour l'URL en supprimant soin, duree et prix
                var params = new URLSearchParams(window.location.search);

                // Vérifier si le soin principal est supprimé
                if (!document.querySelector(".soin-details")) {
                    // Si plus de soins principaux, mettre soin, duree, prix à null
                    params.delete("soin");
                    params.delete("duree");
                    params.delete("prix");
                }

                // Remplacer l'URL sans recharger la page
                var newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.replaceState(null, "", newUrl);
            }
        });
    });

    function showSlots() {
        var slots = document.getElementById("slots");
    
        slots.classList.remove("hidden");
        slots.style.display = "block";
        slots.style.opacity = "0"; 
        slots.style.transform = "translateY(40px)"; 
    
        setTimeout(() => {
            slots.style.transition = "opacity 0.6s ease-out, transform 1.1s ease-out";
            slots.style.opacity = "1";
            slots.style.transform = "translateY(0)";
        }, 50);
    }    

    function disableReservedSlots(selectedDate) {
        // Récupère toutes les réservations et les créneaux bloqués dans le localStorage
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        let blockedSlots = JSON.parse(localStorage.getItem('blockedSlots')) || []; 
    
        // Filtrer les réservations qui correspondent à la date et au lieu sélectionnés
        var reservedSlots = reservations
            .filter(reservation => reservation.date === selectedDate) 
            .filter(reservation => reservation.location === "4, bd Victor Hugo 83150 Bandol")
            .map(reservation => reservation.creneau); 
    
        // Filtrer les créneaux bloqués pour le lieu et la date
        var blockedSlotsForDateAndLocation = blockedSlots
            .filter(slot => slot.location === "4, bd Victor Hugo 83150 Bandol" && slot.date === selectedDate)
            .map(slot => slot.creneau);
    
        // Désactive les créneaux réservés et masque les créneaux bloqués pour ce jour et lieu
        document.querySelectorAll(".slot").forEach(slot => {
            var slotTime = slot.textContent.trim(); 
    
            // Si ce créneau est réservé pour le lieu et la date, on le désactive
            if (reservedSlots.includes(slotTime)) {
                slot.classList.add("reserved"); 
                slot.disabled = true; // Désactive le créneau réservé
                slot.hidden = false; // Assure qu'il reste visible (juste désactivé)
            } 
            // Si ce créneau est bloqué pour le lieu et la date, on le cache (hidden)
            else if (blockedSlotsForDateAndLocation.includes(slotTime)) {
                slot.classList.add("blocked");
                slot.hidden = true; // Cache le créneau bloqué
            }
            // Si ce créneau est libre, on le réactive et le rend visible
            else {
                slot.classList.remove("reserved", "blocked"); 
                slot.disabled = false; 
                slot.hidden = false;
            }
        });
    
        // Vérifier si tous les créneaux sont bloqués pour cette date
        var allSlotsForSelectedDate = document.querySelectorAll(".slot"); // Récupère tous les créneaux du jour
    
        // Si tous les créneaux sont bloqués ou réservés
        var allSlotsAreBlocked = Array.from(allSlotsForSelectedDate).every(slot => {
            var slotTime = slot.textContent.trim(); 
            return reservedSlots.includes(slotTime) || blockedSlotsForDateAndLocation.includes(slotTime);
        });
    
        // Désactiver le bouton "Day-button" du jour concerné si tous les créneaux sont bloqués
        var dayButton = document.querySelector(`.day-button[data-date="${selectedDate}"]`);
    
        if (allSlotsAreBlocked && dayButton) {
            dayButton.disabled = true;
        } else if (dayButton) {
            // Réactiver le bouton si ce n'est pas le cas
            dayButton.disabled = false;
        }
    }
        
    

    // Masquer les créneaux au chargement
    document.getElementById("slots").style.display = 'none';

    function updateCalendar() {
        var month = currentMonth.getMonth();
        var year = currentMonth.getFullYear();
        var monthNames = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"
        ];
    
        monthName.textContent = `${monthNames[month]} ${year}`;
        calendarContainer.innerHTML = '';
    
        var firstDayOfMonth = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Détecte si l'écran est plus petit que 600px
        var isMobile = window.matchMedia("(max-width: 600px)").matches;
    
        // Change les noms des jours si l'écran est petit
        var weekdays = isMobile ? ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'] : 
                                  ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
        weekdays.forEach(day => {
            var dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendarContainer.appendChild(dayHeader);
        });
    
        var adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    
        for (let i = 0; i < adjustedFirstDay; i++) {
            var emptyDay = document.createElement('div');
            calendarContainer.appendChild(emptyDay);
        }
    
        var today = new Date();
        today.setHours(0, 0, 0, 0);
    
        for (let i = 1; i <= daysInMonth; i++) {
            var dayButton = document.createElement('button');
            dayButton.classList.add('day-button');
            dayButton.textContent = i;
    
            var dayDate = new Date(year, month, i);
            dayDate.setHours(0, 0, 0, 0);
    
            // Format : Jour Mois Année
            var formattedDate = `${("0" + i).slice(-2)}-${("0" + (month + 1)).slice(-2)}-${year}`;
    
            dayButton.setAttribute("data-date", formattedDate); 
    
            if (dayDate < today) {
                dayButton.classList.add("non-clickable");
                dayButton.disabled = true;
            }
    
            dayButton.addEventListener('click', function(event) {
                if (dayButton.disabled) {
                    event.preventDefault();  // Empêche l'action du clic
                    event.stopImmediatePropagation();  // Empêche la propagation de l'événement
                    console.log("Ce jour est désactivé, vous ne pouvez pas cliquer dessus.");
                }
            });
    
            calendarContainer.appendChild(dayButton);
    
            // ✅ Ajout de l'événement pour stocker la date sélectionnée
            dayButton.addEventListener("click", function() {
                // Supprimer la classe "selected" des autres boutons
                document.querySelectorAll(".day-button.selected").forEach(button => button.classList.remove("selected"));
                this.classList.add("selected");
    
                // Vérifier si le bouton est désactivé
                if (this.classList.contains("non-clickable")) return;
    
                // ✅ Mettre à jour la date sélectionnée
                var selectedDate = this.getAttribute("data-date");
                localStorage.setItem("date", selectedDate); // Stocke la date sous la clé "date"
    
                checkConditions();
                showSlots();
                disableReservedSlots(selectedDate, localStorage.getItem("location") || "4, bd Victor Hugo 83150 Bandol");
            });
            
            calendarContainer.appendChild(dayButton);
        }
    
        document.querySelectorAll('.day-button').forEach(dayButton => {
            var selectedDate = dayButton.getAttribute("data-date");
            disableReservedSlots(selectedDate);
        });
    }
    
    
    slots.forEach(slot => {
        slot.addEventListener("click", () => {
            if (slot.disabled) return;

            if (selectedSlot) {
                selectedSlot.classList.remove("selected");
            }
            slot.classList.add("selected");
            selectedSlot = slot;
            checkConditions();
        });
    });

    // Initialisation : centrer
    mainContainer.style.display = "flex";
    mainContainer.style.flexDirection = "row";
    mainContainer.style.alignItems = "flex-start"; // Alignement en haut
    mainContainer.style.justifyContent = "center";
    mainContainer.style.marginBottom = "10px";
    mainContainer.style.marginTop = "20px";  // Marge en haut

    function showReserveButton() {
        var reserveButton = document.getElementById("reserve-button");
    
        reserveButton.classList.remove("hidden");
        reserveButton.style.display = "block";
        reserveButton.style.opacity = "0"; 
        reserveButton.style.transform = "translateY(40px)"; 
    
        setTimeout(() => {
            reserveButton.style.transition = "opacity 0.6s ease-out, transform 1.1s ease-out";
            reserveButton.style.opacity = "1";
            reserveButton.style.transform = "translateY(0)";
        }, 50);
    }    


    function checkConditions() {
        if (selectedDate && selectedSlot) {
            reserveButton.classList.remove("hidden");
        } else {
            reserveButton.classList.add("hidden");
        }
    }
    
    prevMonthButton.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateCalendar();
    });

    nextMonthButton.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateCalendar();
    });

    updateCalendar();

    slots.forEach(slot => {
        slot.addEventListener("click", () => {
            if (selectedSlot) {
                selectedSlot.classList.remove("selected");
            }
            slot.classList.add("selected");
            selectedSlot = slot;
            checkConditions();
            showReserveButton();
        });
    });
    

    function verifierNbSoins() {
        var nbSoins = document.querySelectorAll(".soin-details").length;
        if (nbSoins === 0) {
            soinsSelectionnes.classList.remove("hidden");
        }
        document.getElementById("ajouter-soin-btn").classList.remove("hidden");
    }

    ajouterSoinBtn.addEventListener("click", function () {
        listeSoins.classList.toggle("hidden");
        monthName.classList.add("hidden");
        montControls.classList.add("hidden");
        calendarContainer.classList.add("hidden");
        prevMonthButton.classList.add("hidden");
        nextMonthButton.classList.add("hidden");
        reserveButton.classList.add("hidden");
        document.getElementById("slots").style.display = 'none';
    });

    document.querySelectorAll(".btn-reserver").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.preventDefault();

            selection.classList.remove("hidden");

            monthName.classList.remove("hidden");
            montControls.classList.remove("hidden");
            calendarContainer.classList.remove("hidden");
            prevMonthButton.classList.remove("hidden");
            nextMonthButton.classList.remove("hidden");

            var soinNom = this.getAttribute("data-soin");
            var soinDuree = this.getAttribute("data-duree");
            var soinPrix = this.getAttribute("data-prix");

            var newSoinBloc = document.createElement("div");
            newSoinBloc.classList.add("soin-details");
            newSoinBloc.innerHTML = `
                <span class="close-btn">&times;</span>
                <div class="soin-nom">${soinNom}</div>
                <div class="details-bas">
                    <span>${soinDuree}</span>
                    <span>${soinPrix}</span>
                </div>
            `;

            newSoinBloc.querySelector(".close-btn").addEventListener("click", function () {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce soin ?")) {
                    newSoinBloc.remove();
                    soinsSupplementaires = soinsSupplementaires.filter(soin => soin.soinNom !== soinNom);
                    updateURL();
                    verifierNbSoins();
                }
            });

            soinsSelectionnes.appendChild(newSoinBloc);
            soinsSupplementaires.push({
                soinNom: soinNom,
                soinPrix: soinPrix
            });

            listeSoins.classList.add("hidden");
            ajouterSoinBtn.classList.remove("hidden");
        });
    });

    
    reserveButton.addEventListener("click", function () {
        var selectedSlot = document.querySelector(".slot.selected"); 
        var selectedTime = selectedSlot ? selectedSlot.textContent.trim() : null;
        var selectedDate = localStorage.getItem("date"); // 🔥 Récupération de la date stockée
    
        if (!selectedTime || !selectedDate) { // Vérifie si la date et le créneau sont bien définis
            console.log("Aucun créneau ou date sélectionné, opération annulée.");
            return; // Annule l'opération si l'un des deux est manquant
        }
    
        // Vérifier si le soin principal est toujours présent
        var soinElement = document.getElementById("soin-nom");
        var soinPrincipal = soinElement && soinElement.textContent.trim() ? soinElement.textContent.trim() : null;
    
        var soinsSupplementairesEncoded = encodeURIComponent(JSON.stringify(soinsSupplementaires));
    
        if (!soinPrincipal) {
            // Soin principal supprimé => on envoie uniquement la date, le créneau et les soins supplémentaires
            localStorage.setItem("reservationDetails", JSON.stringify({
                date: selectedDate,
                creneau: selectedTime,
                soinsSupplementaires: soinsSupplementaires.length > 0 ? soinsSupplementaires : null,
            }));
    
            var url = `formulaire.html?ldate=${encodeURIComponent(selectedDate)}&creneau=${encodeURIComponent(selectedTime)}&soinsSupplementaires=${soinsSupplementairesEncoded}&location=${encodeURIComponent('4, bd Victor Hugo 83150 Bandol')}`;
            window.location.href = url;
        } else {
            // Récupérer l'élément contenant le prix affiché
            var prixElement = document.getElementById("soin-prix");
            let prixSoinPrincipal = prixElement && prixElement.textContent ? prixElement.textContent.replace("€", "").trim() : null;
            
            // Convertir le prix en nombre
            prixSoinPrincipal = prixSoinPrincipal ? parseFloat(prixSoinPrincipal) : null;
    
            // Enregistre normalement avec soin principal et soins supp
            localStorage.setItem("reservationDetails", JSON.stringify({
                soin: soinPrincipal,
                date: selectedDate,
                creneau: selectedTime,
                prix: prixSoinPrincipal,
                location: "4, bd Victor Hugo 83150 Bandol",
                soinsSupplementaires: soinsSupplementaires.length > 0 ? soinsSupplementaires : null,
            }));
    
            var url = `formulaire.html?soin=${encodeURIComponent(soinPrincipal)}&duree=${encodeURIComponent(duree)}&prix=${encodeURIComponent(prixSoinPrincipal)}&ldate=${encodeURIComponent(selectedDate)}&creneau=${encodeURIComponent(selectedTime)}&soinsSupplementaires=${soinsSupplementairesEncoded}&location=${encodeURIComponent('4, bd Victor Hugo 83150 Bandol')}`;
            window.location.href = url;
        }    

    
    
        
    });
});