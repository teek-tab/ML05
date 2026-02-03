# ML05 - API de conversion de nombres en Pular

API REST pour convertir des nombres en leur écriture en langue Pular (Peul).

## 🚀 Installation
```bash
git clone https://github.com/ton-username/ML05.git
cd ML05
npm install
```

## ▶️ Lancement
```bash
node server.js
```

L'API sera disponible sur `http://localhost:3000`

## 📡 Endpoints

### POST /api/convert
Convertit un nombre unique.

**Requête :**
```json
{
  "number": 17,
  "overrides": {
    "10_modified": "sappoyy"
  }
}
```

**Réponse :**
```json
{
  "number": 17,
  "texte": "sappoyy-jee'ɗiɗi",
  "overridesApplied": ["10_modified"]
}
```

### POST /api/range
Convertit une plage de nombres.

**Limites :** 
- Nombre max : 999 999 999 999
- Plage max : 1000 nombres

## 🛠️ Technologies
- Node.js
- Express
- CORS

## 📄 Licence
MIT
```

### **b) Ajouter un `.gitignore`**
```
node_modules/
.env
*.log
.DS_Store
