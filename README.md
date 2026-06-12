![LOGO](https://img.shields.io/badge/Core_PANZER_v7+-Logo-1f4e79)
<p align="center"><img src="https://raw.githubusercontent.com/zero419-web/PWA-Pizza-Engine/main/sw_logo.svg" width="200" alt="Panzer v7+ Core Logo"></p>

---

# 🍕 PIZZA ENGINE - PWA Resiliente ad Alta Sicurezza
( ⚙️🪖 Motore Panzer v7+ )
  - Un'architettura software sovrana per Progressive Web App (**PWA**) in modalità *Zero Trust*, progettata per la massima resilienza informatica, l'immunità forense ai guasti hardware e la conformità stringente alle linee guida tecniche **AgID** e al **Codice dell'Amministrazione Digitale (CAD)** per la Pubblica Amministrazione.

## 🚀 Obiettivi del Progetto
- Questo engine implementa strategie avanzate di computazione asincrona isolata, crittografia simmetrica client-side e tolleranza ai guasti di tipo militare. Garantisce che le applicazioni web e i dati sensibili della PA rimangano protetti e operativi anche in condizioni di rete degradata (Lie-Fi), assente o in caso di tentativi di manomissione fisica e data breach sul file system locale del client.

## 🛠️ Caratteristiche Core: ( ⚙️🪖 v7.5 )
- Il cuore del sistema è un **Service Worker (`sw.js`)** ad altissima specializzazione con scope globale sulla root, operante come entità autonoma e autosufficiente tramite i seguenti moduli nativi:

- **🔐🌡️🛡️ Jittered Thermal Shield Race (Watchdog di Sicurezza):** Ispezione forense profonda sul modulo `deepVaultValidation()`. Implementa una gara asincrona in tempo reale 🏁 (`Promise.race`) tra l'interrogazione a IndexedDB e lo **🌡️🛡️ Scudo Termico Adattivo con Jittering 🎲** (`waitTillIdle`). Il sistema calcola dinamicamente un'entropia temporale casuale (es. tra `250ms` e `600ms`) per scavalcare e mitigare i *Timing Attacks* statistici, isolando con certezza matematica i **falsi positivi di 1️⃣/0️⃣** (disco saturo o rallentamento hardware) dai reali tentativi dolosi di rimozione della chiave crittografica (`master_key`) eseguiti **tramite DevTools o Malware.**

- **🔄🌐🛡️🔗 Dynamic Adaptive Network Resiliency:** Algoritmo proprietario che calcola lo stato di salute della CPU e adatta dinamicamente i timeout di rete (fino a 120s) e i tentativi di recupero (max 5 retries) basandosi su 5 profili telemetrici hardware di velocità della connessione (da *Ultrafast* a *Verylow*).

- **🌐➡️💾 Network-First Predittivo con Cache Fallback:** Intercettazione condizionale degli eventi di fetch. Il sistema garantisce la freschezza dei dati di business interpellando la rete attiva; in caso di latenza degradata o Lie-Fi, interrompe atomicamente la richiesta lato server tramite `AbortController` e rilascia all'istante la risorsa locale cifrata, avviando un aggiornamento silente in background (*Hot Update*) non appena i canali telematici tornano stabili.
  
- **🔬🧬 SW Forensics (DNA Check & Binary Validation):** Controllo biometrico sequenziale del payload in transito su tre scomparti stagni per prevenire attacchi di *Cache Poisoning*:
  - *FASE 1 (Testa):* Validazione strict dei *Magic Numbers* (firme esadecimali immutabili come `52494646` per WebP o `FFD8FF` per JPEG) contro il MIME-sniffing.
  - *FASE 2 (Coda):* Verifica geometrica dei marcatori strutturali (*Footer*) contro attacchi di tipo append.
  - *FASE 3 (Corpo):* Analisi euristica stringente anti-script per intercettare ed eradicare vettori malevoli annidati nei file PDF.
  - *Abbinamento:* Mappatura delle dimensioni minime strutturali (`minSizeMap`) per il blocco immediato di file corrotti.

- **🛡️📴 Offline Bunker Mode & Emergency Wipe:** In assenza totale di rete o in caso di violazione dell'integrità crittografica, il Panzer si isola autonomamente. Se il Watchdog rileva una manomissione a canale stabile, attiva all'istante una contromisura distruttiva di emergenza (*Tabula Rasa*): pialla completamente il `Cache Storage` tramite `Destroy_ALL_Caches` ed esegue il drop nucleare del database locale (`indexedDB.deleteDatabase`), stroncando la sessione in un errore blindato di **HTTP 403 Forbidden**.

- **🔀📡 Architettura di Instradamento a 5 Sezioni (Fetch Strict Layer):** Il ciclo di vita di ogni singola richiesta telematica all'interno dell'evento `fetch` è compartimentato in cinque perimetri operativi rigidi per superare i capitolati di ispezione AgID:
  - *Sezione I (Normalizzazione & Filtraggio):* Depurazione degli URI telematici, rimozione dei parametri di query e sbarramento preventivo dei metodi HTTP non ammessi.
  - *Sezione II (Online Gateway):* Instradamento dinamico su rete attiva basato sul profilo hardware rilevato a runtime.
  - *Sezione III (Cache Hit Layer):* Intercettazione locale e re-routing verso il modulo di decrittazione asincrona nativa AES-GCM a 256-bit per gli asset protetti nel Bunker Core.
  - *Sezione IV (Filtro Multimediale & Graphic Resilience):* Gestione flessibile delle immagini tramite re-routing automatico sulle estensioni varianti e iniezione del vettore statico sterile in formato Base64 (`CONFIG.fallbackImage`) in caso di blackout del server.
  - *Sezione V (Critical Fallback Block):* Dispositivo di isolamento post-avaria per l'erogazione automatica dell'interfaccia di cortesia a tolleranza di guasto (Errore 503).

- **✉️↔️📬 Canale IPC PostMessage:** Ascoltatore formale per l'evento `message` deputato alla ricezione sicura dei comandi dal frontend, all'attivazione dei cicli di Smart Sync e al transito in RAM della chiave di cifratura non esportabile, isolata tramite l'algoritmo di clonazione strutturata della `Structured Clone API`.

- **🎖️ Conformità Costituzionale e Normativa PA:** Sviluppato interamente in pura architettura **Vanilla JS** (Zero Framework, Zero Dipendenze esterne, 100% Codice Nativo sul ferro) per garantire la massima efficienza, l'assenza totale di debiti tecnici e la piena rispondenza ai requisiti di digitalizzazione, accessibilità, censimento su Developers Italia e riuso software tra Pubbliche Amministrazioni previsto dall'**Art. 69 del CAD**.

## 👤 Autore
**Valentino Aglianò**
- Perito Industriale **Informatico** *(2013)*
- Istruttore Informatico: qualificatosi *Idoneo nel Concorso Nazionale ASMEL 2025* per **Profili IT della Pubblica Amministrazione.**

- Specialista nello sviluppo di soluzioni software ad alta resilienza ed ingegneria difensiva per **Enti Locali, Comuni e ASP**, con focus verticale su architetture PWA in Bunker Mode, gestione database nativi e ottimizzazione prestazionale client-side del codice telematico.

- 🛡️ Esperienza Operativa e Cyber Security:
- **🟣 Purple Team:** Specialista in sicurezza applicativa con competenze bilaterali.
- Unisce la mentalità offensiva del **🔴 Red Team** (analisi forense, individuazione di vettori di attacco e logiche difensive del **🔵 Blue Team** (blindatura dei sistemi, cifratura locale e mitigazione dei rischi telematici).
- **(2018/2019) Esperienza sul Campo (PA/Sanità):** Ha collaborato a livello tecnico-operativo e *ufficioso* per strutture sanitarie locali (**ASP8**), maturando un forte orientamento alla **protezione del dato sensibile in ambienti critici.** *uso di ( SQLite.dll crypted )*

- **Focus Tecnologico:** Sviluppo di architetture PWA difensive basate sul ferro (Vanilla JS), **crittografia client-side**, gestione **database (DB)** nativi e aderenza rigida ai capitolati di riuso e accessibilità **AgID.**

## ⚖️ Licenza
- Questo progetto è rilasciato sotto licenza internazionale **EUPL 1.2 (European Union Public Licence)**, garantendo la piena *legalità del riuso*, la *trasparenza del codice sorgente* e la conformità ai **framework normativi dell'Unione Europea**. Consulta il file [`LICENSE`](LICENSE.md) per maggiori dettagli.

## 📚 Documentazione Ufficiale
- Per **l'analisi dei vettori crittografici**, le metriche forensi di stabilità del disco, i diagrammi di flusso dei moduli e gli scenari applicativi d'uso sul campo per **Comuni e Aziende Sanitarie**, consulta la nostra [🌐 Wiki Ufficiale](../../wiki).
