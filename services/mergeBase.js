function mergeNombresBase(defaultBase, overrides = {}) {
    if (typeof overrides !== 'object' || overrides === null) {
        return defaultBase;
    }

    const merged = { ...defaultBase };

    for (const key of Object.keys(overrides)) {
        if (key in defaultBase) {
            merged[key] = overrides[key];
        }
    }

    return merged;
}

module.exports = { mergeNombresBase };
