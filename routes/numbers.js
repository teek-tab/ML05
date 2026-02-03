const express = require('express');
const router = express.Router();

const defaultBase = require('../config/nombresBase.default.json');
const { genererEcriture } = require('../services/generator');
const { mergeNombresBase } = require('../services/mergeBase');

// Constantes de validation
const MAX_NUMBER = 999999999999;
const MAX_RANGE_SIZE = 1000;

router.post('/convert', (req, res) => {
    const { number, overrides } = req.body;

    // Validation du nombre
    if (!Number.isInteger(number) || number < 1) {
        return res.status(400).json({ error: 'Nombre invalide (doit être un entier >= 1)' });
    }

    // Limite maximale pour éviter surcharge
    if (number > MAX_NUMBER) {
        return res.status(400).json({ 
            error: `Nombre trop grand (maximum: ${MAX_NUMBER})` 
        });
    }

    const nombresBaseFinal = mergeNombresBase(defaultBase, overrides);

    const texte = genererEcriture(number, nombresBaseFinal);

    res.json({
        number,
        texte,
        overridesApplied: overrides ? Object.keys(overrides) : []
    });
});

router.post('/range', (req, res) => {
    const { start, end, overrides } = req.body;

    // Validation des bornes
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        return res.status(400).json({ error: 'Plage invalide (start et end doivent être des entiers, start >= 1, end >= start)' });
    }

    // Limite maximale pour chaque nombre
    if (start > MAX_NUMBER || end > MAX_NUMBER) {
        return res.status(400).json({ 
            error: `Nombres trop grands (maximum: ${MAX_NUMBER})` 
        });
    }

    // Limite de la taille de la plage pour éviter surcharge serveur
    const rangeSize = end - start + 1;
    if (rangeSize > MAX_RANGE_SIZE) {
        return res.status(400).json({ 
            error: `Plage trop grande (maximum: ${MAX_RANGE_SIZE} nombres). Utilisez une plage plus petite.` 
        });
    }

    const nombresBaseFinal = mergeNombresBase(defaultBase, overrides);
    const result = {};

    for (let i = start; i <= end; i++) {
        result[i] = genererEcriture(i, nombresBaseFinal);
    }

    res.json({
        range: { start, end, size: rangeSize },
        result
    });
});

module.exports = router;