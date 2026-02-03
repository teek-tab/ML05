function obtenirForme(baseKey, pluralKey, quantite, nombresBase) {
    return quantite === 1
        ? nombresBase[baseKey]
        : nombresBase[pluralKey] || nombresBase[baseKey];
}

function genererDizainesUnites(n, nombresBase) {
    if (n === 0) return null;

    if (n >= 1 && n <= 9) {
        return nombresBase[n];
    }

    if (n === 10) {
        return nombresBase[10];
    }

    if (n >= 11 && n <= 19) {
        return (nombresBase['10_modified'] || nombresBase[10]) +
               '-' + nombresBase[n % 10];
    }

    const d = Math.floor(n / 10) * 10;
    const u = n % 10;

    return u === 0
        ? nombresBase[d]
        : nombresBase[d] + ' e ' + nombresBase[u];
}

function genererEcriture(n, nombresBase) {
    if (nombresBase[n]) return nombresBase[n];

    let reste = n;
    const parties = [];

    const blocs = [
        [1000000000, '1000000000_plural'],
        [1000000, '1000000_plural'],
        [1000, '1000_plural'],
        [100, '100_plural']
    ];

    for (const [valeur, plural] of blocs) {
        if (reste >= valeur) {
            const q = Math.floor(reste / valeur);
            const forme = obtenirForme(valeur, plural, q, nombresBase);

            parties.push(
                q === 1
                    ? forme
                    : forme + ' ' + genererEcriture(q, nombresBase)
            );

            reste %= valeur;
        }
    }

    if (reste > 0) {
        const fin = genererDizainesUnites(reste, nombresBase);
        if (fin) parties.push(fin);
    }

    return parties.join(' ');
}

module.exports = { genererEcriture };
