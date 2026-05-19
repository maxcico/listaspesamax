# 🛒 ListaSpesaMax

App Android per gestire le liste della spesa in modo semplice e veloce, con dispensa personale e categorie personalizzabili.

## 📥 Scarica l'APK

[**⬇️ Scarica l'ultima versione**](https://github.com/maxcico/listaspesamax/releases/tag/ListaSpesaMax)

Vai sulla pagina della release, scarica il file `.apk` e installalo sul tuo telefono Android (potrebbe servirti abilitare "Installa app da fonti sconosciute" nelle impostazioni di sicurezza).

## ✨ Funzionalità

- **Liste multiple** — crea quante liste vuoi, ognuna con il suo nome
- **Dispensa personale** — una libreria di prodotti riutilizzabili con quantità e unità di misura predefinite
- **Categorie a colori** — Frutta & Verdura, Carne & Pesce, Latticini, Bevande, Snack, Surgelati e altre, completamente personalizzabili (icona + colore)
- **Pagina categorie dedicata** — scegli prima la categoria, poi vedi solo i prodotti di quella sezione
- **Sezione "Acquistati"** in fondo alla lista — gli item spuntati si spostano automaticamente in basso con un separatore visivo
- **Tap per aggiungere / rimuovere** dalla dispensa alla lista in un solo gesto
- **Condivisione** della lista via WhatsApp / Messaggi / qualunque app di condivisione
- **Persistenza locale** — tutto salvato sul telefono, nessun account, nessun cloud

## 🛠️ Stack

- React Native + Expo (SDK 51)
- AsyncStorage per la persistenza locale
- Build via EAS Build

## 🚀 Sviluppo

```bash
npm install
npx expo start
```

Build release Android:

```bash
eas build --platform android --profile production
```
