// Configuration
let apiUrl = 'https://ml05.onrender.com/api';
let currentOverrides = {};
let rangeData = null;

// Éléments DOM
const modalOverlay = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// === Gestion de la modale ===
function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.style.display = "flex";
}

modalCloseBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
    }
});

// === Gestion des onglets ===
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// === Charger l'URL API au démarrage ===
window.addEventListener('DOMContentLoaded', () => {
    const savedUrl = localStorage.getItem('ml05_api_url');
    if (savedUrl) {
        apiUrl = savedUrl;
        document.getElementById('apiUrl').value = savedUrl;
    }
    
    // Charger les surcharges
    const savedOverrides = localStorage.getItem('ml05_overrides');
    if (savedOverrides) {
        currentOverrides = JSON.parse(savedOverrides);
        loadOverridesIntoForm();
    }
});

// === Collecter les surcharges depuis le formulaire ===
function collectOverrides() {
    const overrides = {};
    const overrideFields = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '10_modified', '20', '30', '40', '50', '60', '70', '80', '90',
        '100', '100_plural', '1000', '1000_plural', '1000000', '1000000_plural',
        '1000000000', '1000000000_plural'
    ];
    
    overrideFields.forEach(field => {
        const input = document.getElementById(`override_${field}`);
        if (input && input.value.trim()) {
            overrides[field] = input.value.trim();
        }
    });
    
    return Object.keys(overrides).length > 0 ? overrides : null;
}

// === Charger les surcharges dans le formulaire ===
function loadOverridesIntoForm() {
    Object.keys(currentOverrides).forEach(key => {
        const input = document.getElementById(`override_${key}`);
        if (input) {
            input.value = currentOverrides[key];
        }
    });
}

// === Réinitialiser les surcharges ===
function resetOverrides() {
    const overrideInputs = document.querySelectorAll('[id^="override_"]');
    overrideInputs.forEach(input => input.value = '');
    currentOverrides = {};
    localStorage.removeItem('ml05_overrides');
    showModal('Surcharges réinitialisées avec succès !');
}

// === Sauvegarder et retourner au générateur ===
function retourGenerateur() {
    // Sauvegarder l'URL API
    const newApiUrl = document.getElementById('apiUrl').value.trim();
    if (newApiUrl) {
        apiUrl = newApiUrl;
        localStorage.setItem('ml05_api_url', apiUrl);
    }
    
    // Sauvegarder les surcharges
    currentOverrides = collectOverrides() || {};
    localStorage.setItem('ml05_overrides', JSON.stringify(currentOverrides));
    
    // Retourner à l'onglet générateur
    document.querySelector('[data-tab="generator"]').click();
    showModal('Paramètres sauvegardés avec succès !');
}

// === Générer un nombre unique ===
async function genererNombre() {
    const number = parseInt(document.getElementById('numberToGenerate').value);
    
    // Validation
    if (!number || number < 1) {
        showModal('⚠️ Veuillez entrer un nombre valide (≥ 1)');
        return;
    }
    
    if (number > 999999999999) {
        showModal('⚠️ Nombre trop grand. Maximum : 999 999 999 999');
        return;
    }
    
    // Afficher loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    
    try {
        const response = await fetch(`${apiUrl}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: number,
                overrides: Object.keys(currentOverrides).length > 0 ? currentOverrides : undefined
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Afficher le résultat
        document.getElementById('resultText').textContent = data.texte;
        document.getElementById('result').style.display = 'block';
        
        // Cacher le JSON output s'il était visible
        document.getElementById('jsonOutput').style.display = 'none';
        
    } catch (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = '❌ Impossible de contacter l\'API. Vérifiez votre connexion ou l\'URL de l\'API dans les paramètres.';
        } else if (error.message.includes('503')) {
            errorMessage = '⏳ L\'API est en démarrage (cold start). Veuillez patienter 30-50 secondes et réessayer.';
        }
        
        showModal(errorMessage);
        
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// === Générer une plage de nombres ===
async function genererPlage() {
    const start = parseInt(document.getElementById('rangeStart').value);
    const end = parseInt(document.getElementById('rangeEnd').value);
    
    // Validation
    if (!start || !end || start < 1 || end < start) {
        showModal('⚠️ Veuillez entrer une plage valide (début ≥ 1, fin ≥ début)');
        return;
    }
    
    if (end - start + 1 > 1000) {
        showModal('⚠️ La plage ne peut pas dépasser 1000 nombres');
        return;
    }
    
    if (start > 999999999999 || end > 999999999999) {
        showModal('⚠️ Nombres trop grands. Maximum : 999 999 999 999');
        return;
    }
    
    // Afficher loading
    document.getElementById('loadingRange').style.display = 'block';
    document.getElementById('jsonOutput').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    
    try {
        const response = await fetch(`${apiUrl}/range`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start: start,
                end: end,
                overrides: Object.keys(currentOverrides).length > 0 ? currentOverrides : undefined
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        rangeData = data;
        
        // Afficher le JSON formaté
        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.textContent = JSON.stringify(data.result, null, 2);
        jsonOutput.style.display = 'block';
        
        showModal(`✅ ${data.range.size} nombres générés avec succès !`);
        
    } catch (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = '❌ Impossible de contacter l\'API. Vérifiez votre connexion ou l\'URL de l\'API dans les paramètres.';
        } else if (error.message.includes('503')) {
            errorMessage = '⏳ L\'API est en démarrage (cold start). Veuillez patienter 30-50 secondes et réessayer.';
        }
        
        showModal(errorMessage);
        
    } finally {
        document.getElementById('loadingRange').style.display = 'none';
    }
}

// === Exporter en JSON ===
function exporterJSON() {
    if (!rangeData || !rangeData.result) {
        showModal('⚠️ Veuillez d\'abord générer une plage de nombres');
        return;
    }
    
    // Créer le contenu JSON
    const jsonContent = JSON.stringify(rangeData.result, null, 2);
    
    // Créer un blob et télécharger
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nombres-pular-${rangeData.range.start}-${rangeData.range.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showModal('✅ Fichier JSON téléchargé avec succès !');
}

// === Gestion de la touche Enter ===
document.getElementById('numberToGenerate').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') genererNombre();
});

document.getElementById('rangeStart').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') genererPlage();
});

document.getElementById('rangeEnd').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') genererPlage();
});