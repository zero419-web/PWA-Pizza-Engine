# 🍕 PIZZA ENGINE - PWA Resiliente (Motore Panzer v7)

Un'architettura per Progressive Web App (PWA) progettata per la massima resilienza e conformità alle linee guida tecniche AgID per la Pubblica Amministrazione.

## 🚀 Obiettivi del Progetto
Questo engine implementa strategie avanzate di gestione dinamica della connettività e tolleranza ai guasti, garantendo che le applicazioni web rimangano operative anche in condizioni di rete degradata o assente, seguendo i criteri di affidabilità richiesti per i servizi digitali pubblici.

## 🛠️ Caratteristiche Tecniche (Engine Panzer v7)
Il cuore del sistema è un Service Worker ad alta specializzazione con scope globale sulla root, che include:

- **Dynamic Adaptive Network Resiliency:** Algoritmo proprietario che adatta timeout (fino a 120s) e tentativi di recupero (max 5 retries) basandosi su 5 profili di velocità della rete (da *Ultrafast* a *Verylow*).
- **Network-First Predittivo con Cache Fallback:** Gestione della fetch condizionale. Il sistema intercetta la rete per garantire la massima freschezza dei dati di business; se la connettività è degradata (Lie-Fi) o scatta il timeout, abortisce la richiesta lato server e rilascia istantaneamente la risorsa locale, aggiornandola in background (Hot Update) non appena il segnale è stabile.
- **Binary Data Validation:** Controllo di integrità e sicurezza (*Anti-Cache Poisoning*) tramite Magic Numbers (firme esadecimali come `52494646` per WebP o `FFD8FF` per JPEG) e mappatura delle dimensioni minime (`minSizeMap`) per impedire il caching di risorse corrotte.
- **Offline Bunker Mode:** Generazione dinamica di fallback UI via SVG/DataURL integrati direttamente nel worker per garantire la continuità visiva in assenza totale di rete.
- **Conformità AgID:** Strutturato in pura architettura Vanilla JS (Zero Framework, Zero Dipendenze, 100% Codice Nativo) per facilitare il censimento su Developers Italia e il riuso software (Art. 69 CAD).

## 👤 Autore
**Valentino Aglianò** *Perito Industriale Informatico* *Istruttore Informatico - Idoneo Concorso Nazionale ASMEL 2025*

Professionista specializzato nello sviluppo di soluzioni software per la PA, con focus particolare su architetture PWA resilienti, gestione database nativi (SQLite/MySQL) e ottimizzazione delle performance client-side.

## ⚖️ Licenza
Questo progetto è rilasciato sotto licenza **EUPL 1.2 (European Union Public Licence)**. Consulta il file [`LICENSE`](LICENSE) per maggiori dettagli.

---
## 📚 Documentazione Ufficiale
Per l'architettura tecnica dettagliata, i diagrammi di flusso ASCII e gli esempi di utilizzo sul campo per Comuni e ASP, consulta la nostra [🌐 Wiki Ufficiale](../../wiki).
