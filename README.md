# PIZZA ENGINE - PWA Resiliente (Motore Panzer v7)

Un'architettura per Progressive Web App (PWA) progettata per la massima resilienza e conformità alle linee guida tecniche AgID per la Pubblica Amministrazione.

## 🚀 Obiettivi del Progetto
Questo engine implementa strategie avanzate di caching e gestione offline, garantendo che le applicazioni web rimangano operative anche in condizioni di connettività instabile, seguendo i criteri di accessibilità e affidabilità richiesti per i servizi digitali pubblici.

## 🛠 Caratteristiche Tecniche (Engine Panzer v7)
Il cuore del sistema è un Service Worker ad alta specializzazione che include:

- **Dynamic Adaptive Network Resiliency:** Algoritmo proprietario che adatta timeout (fino a 120s) e tentativi di recupero (max 5 retries) basandosi su 5 profili di velocità della rete (da *Ultrafast* a *Verylow*).
- **Binary Data Validation:** Controllo di integrità tramite Magic Numbers (firme esadecimali come `52494646` per WebP o `FFD8FF` per JPEG) e mappatura delle dimensioni minime (`minSizeMap`) per impedire il caching di risorse corrotte.
- **Cache-First Strategy:** Ottimizzazione dei tempi di caricamento con gestione differenziata tra Cache di Sistema e Cache Utente (TTL settimanale).
- **Offline Bunker Mode:** Generazione dinamica di fallback UI via SVG/DataURL integrati direttamente nel worker per garantire la continuità visiva in assenza totale di rete.
- **Conformità AgID:** Strutturato per facilitare il censimento su Developers Italia e il riuso software.

## 👤 Autore
**Valentino Aglianò** *Perito Industriale Informatico* *Istruttore Informatico - Idoneo Concorso Nazionale ASMEL 2025*

Professionista specializzato nello sviluppo di soluzioni software per la PA, con focus particolare su architetture PWA, gestione database (SQLite/MySQL) e sistemi resilienti.

## ⚖️ Licenza
Questo progetto è rilasciato sotto licenza **EUPL 1.2 (European Union Public Licence)**. Consulta il file [`LICENSE`](LICENSE) per maggiori dettagli.
