# ListOn App — Guida Build APK

## Struttura file
```
liston-app/
├── App.js          ← codice principale (rinomina ListOnApp.js → App.js)
├── package.json
├── app.json
└── assets/         ← crea questa cartella con icon.png e adaptive-icon.png
```

---

## 🚀 Metodo 1 — Test rapido su Expo Snack (online, zero installazioni)

1. Vai su **https://snack.expo.dev**
2. Crea un nuovo progetto
3. Incolla il contenuto di `App.js` nel file `App.js`
4. Scannerizza il QR con l'app **Expo Go** dal tuo Android

---

## 🏗️ Metodo 2 — APK locale con Android Studio

### Requisiti
- Node.js 18+
- Android Studio + Android SDK
- Java JDK 17

### Passi

```bash
# 1. Crea progetto Expo
npx create-expo-app liston-app
cd liston-app

# 2. Copia i file
# - Sovrascrivi App.js con il contenuto di ListOnApp.js
# - Sostituisci package.json e app.json

# 3. Installa dipendenze
npm install

# 4. Genera il progetto Android nativo
npx expo prebuild --platform android

# 5. Build APK debug (per test)
cd android
./gradlew assembleDebug

# L'APK si trova in:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ☁️ Metodo 3 — APK con EAS Build (cloud, più semplice)

```bash
# 1. Installa EAS CLI
npm install -g eas-cli

# 2. Login Expo (account gratuito su expo.dev)
eas login

# 3. Configura build
eas build:configure

# 4. Build APK (gratuito, ~10 minuti)
eas build --platform android --profile preview

# Scarica l'APK dal link che ti viene fornito
```

### eas.json (aggiungi al progetto)
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## 📱 Installare l'APK su Android

1. Copia l'APK sul telefono (via cavo USB o WhatsApp)
2. Vai in **Impostazioni → Sicurezza → Origini sconosciute** → Attiva
3. Apri il file APK e installa

---

## 🎨 Personalizzare l'icona

Metti un'immagine 1024x1024px chiamata `icon.png` nella cartella `assets/`.
EAS Build la genera automaticamente in tutte le dimensioni.
