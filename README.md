![LOGO](https://img.shields.io/badge/Core_PANZER_v7-Logo-1f4e79)
<p align="center"><img src="https://raw.githubusercontent.com/zero419-web/PWA-Pizza-Engine/main/sw_logo.svg" width="200" alt="Panzer v7 Core Logo"></p>

---

# 🍕 PIZZA ENGINE - PWA Resiliente
( ⚙️🪖 Motore Panzer v7.3 )
  - Un'architettura per Progressive Web App (**PWA**) progettata per la massima resilienza e conformità alle linee guida tecniche **AgID** per la Pubblica Amministrazione.

## 🚀 Obiettivi del Progetto
Questo engine implementa strategie avanzate di gestione dinamica della connettività e tolleranza ai guasti, garantendo che le applicazioni web rimangano operative anche in condizioni di rete degradata o assente, seguendo i criteri di affidabilità richiesti per i servizi digitali pubblici.

## 🛠️ Caratteristiche: ( ⚙️🪖 v7.3 )
- ⚛️ Il cuore del sistema è un **Service Worker** ad alta specializzazione con scope globale sulla root, che include:

- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency:** Algoritmo proprietario che adatta timeout (fino a 120s) e tentativi di recupero (max 5 retries) basandosi su 5 profili di velocità della rete (da *Ultrafast* a *Verylow*).

- **🌐➡️💾 Network-First Predittivo con Cache Fallback:** Gestione della fetch condizionale. Il sistema intercetta la rete per garantire la massima freschezza dei dati di business; se la connettività è degradata (Lie-Fi) o scatta il timeout, abortisce la richiesta lato server e rilascia istantaneamente la risorsa locale, aggiornandola in background (Hot Update) non appena il segnale è stabile.
  
- **0️⃣1️⃣✅ Binary Data Validation:** Controllo di integrità e sicurezza (*Anti-Cache Poisoning*) tramite Magic Numbers (firme esadecimali come `52494646` per WebP o `FFD8FF` per JPEG) e mappatura delle dimensioni minime (`minSizeMap`) per impedire il caching di risorse corrotte.


- **🛡️📴 Offline Bunker Mode:** Generazione dinamica di fallback UI via SVG/DataURL integrati direttamente nel worker per garantire la continuità visiva in assenza totale di rete.

- **🔀📡 Architettura di Instradamento a 5 Sezioni (Fetch Strict Layer):** Il ciclo di vita delle richieste telematiche all'interno dell'evento `fetch` è stato rigidamente compartimentato per garantire la conformità ai capitolati di ispezione AgID tramite cinque perimetri operativi distinti:

  - *🧩 Sezione I (Normalizzazione & Filtraggio):* Depurazione degli URI telematici, rimozione dei parametri di query e sbarramento preventivo dei metodi non ammessi.

  - *🧩 Sezione II (Online Gateway):* Instradamento dinamico su rete attiva basato sul profilo hardware rilevato a runtime

  - *🧩 Sezione III (Cache Hit Layer):* Intercettazione locale e re-routing immediato verso il modulo di decrittazione asincrona nativa AES-GCM 256-bit per gli asset del Bunker Core.

  - *🧩 Sezione IV (Filtro Multimediale & Graphic Resilience):* Gestione flessibile delle immagini tramite due livelli di protezione: rilevamento e re-routing automatico sulle estensioni varianti, e iniezione del vettore statico sterile in formato Base64 (`CONFIG.fallbackImage`) in caso di assenza totale.

  - *🧩 Sezione V (Critical Fallback Block):* Dispositivo di isolamento post-avaria per l'erogazione dell'interfaccia di cortesia a tolleranza di guasto (Errore 503).

- **✉️↔️📬 Canale IPC PostMessage:** Implementazione di un ascoltatore formale per l'evento `message` deputato alla ricezione sicura dei comandi dal frontend, all'attivazione dei cicli di Smart Sync e al transito in RAM della chiave di cifratura non esportabile, isolata tramite l'algoritmo di clonazione strutturata della Structured Clone API.

- **🎖️ Conformità AgID:** Strutturato in pura architettura Vanilla JS (Zero Framework, Zero Dipendenze, 100% Codice Nativo) per facilitare il censimento su Developers Italia e il riuso software (Art. 69 CAD).

## 👤 Autore
**Valentino Aglianò**
- Perito Industriale **Informatico**
- Istruttore Informatico, Idoneo Concorso Nazionale ASMEL 2025

Professionista specializzato nello sviluppo di soluzioni software per la PA, con focus particolare su architetture PWA resilienti, gestione database nativi (SQLite/MySQL) e ottimizzazione delle performance client-side.

## ⚖️ Licenza
Questo progetto è rilasciato sotto licenza **EUPL 1.2 (European Union Public Licence)**. Consulta il file [`LICENSE`](LICENSE) per maggiori dettagli.

## 📚 Documentazione Ufficiale
Per l'architettura tecnica dettagliata, i diagrammi di flusso ASCII e gli esempi di utilizzo sul campo per Comuni e ASP, consulta la nostra [🌐 Wiki Ufficiale](../../wiki).
