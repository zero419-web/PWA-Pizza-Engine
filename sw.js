/*
 * 📄 DISCIPLINARE TECNICO DI CONFORMITÀ
 *
 * ⚙️ CORE: 🪖 PANZER v7.7+
 *
 *
 * 🛡️ REQUISITI OPERATIVI DI SISTEMA
 *
 * 1. 🧱🔀 ISOLAMENTO DEI FLUSSI:
 * Profilazione fisica del canale nello Scope isolato e protetto del Service Worker.
 *
 * 2. 🔀🎭 INSTRADAMENTO POLIMORFO:
 * Flusso Fluido d'ufficio basato su scansione ciclica 'for...in' e telemetria hardware.
 *
 * 3. 🩻🪨 RESILIENZA STRUTTURALE:
 * Meccanismo Smart Sync con campionamento RTT e interruzione atomica via AbortController.
 *
 * 4. 🪨🔬🧬 SW FORENSICS (DNA CHECK):
 * Ispezione biometrica sequenziale del payload su tre (3) scomparti stagni:
 * - FASE 1 (TESTA 🤯): Validazione Strict dei Magic Numbers contro attacchi di MIME-sniffing.
 * - FASE 2 (CODA 🚓🚓🚓): Verifica dei marcatori strutturali (Footer 👣) contro attacchi di tipo Append.
 * - FASE 3 (CORPO 🪵🧬): Analisi euristica stringente anti-script per l'intercettazione di vettori malevoli nei PDF.
 *
 * 5. 🌡️🛡 ️CPU THERMAL SHIELD:
 * Ottimizzatore adattivo del respiro dell'Event Loop via 'waitTillIdle' per la prevenzione del logoramento hardware.
 *
 * ⚙️️ NUCLEO: SERVICE WORKER (SW) 🪖 "PANZER V7.5"
 * 🎖 MILITARY EDITION (CRYPTOGRAPHIC VAULT AES-GCM 256-BIT)
 * Licenza di Distribuzione:
 * 🇪🇺📜 EUPL 1.2 (Conforme alle direttive CAD della PA 🏛️)
 *
 * Sviluppo Software e Ingegnerizzazione del Protocollo a cura di:
 * 👩‍💻🇮🇹 Valentino Aglianò - Perito Industriale Informatico (2013)
 * [ Istruttore Informatico - Idoneo Nazionale MaxConcorso ASMEL 2025 ]
 *
 *
 * 🛡 ️DIRECTIVE DI SICUREZZA ATTIVA E BONIFICA FORENSE (🔐 ZERO-TRUST POLICY 🚨)
 *
 * [🔑 MASTER KEY]:
 * Istanza crittografica non esportabile (CryptoKey) generata a runtime e isolata in RAM volatile.
 * [🗄️ PWA_VAULT]:
 * Persistenza protetta della chiave opaca in IndexedDB ➿ tramite algoritmo di clonazione strutturata (extractable: false).
 * [🫙 SANDBOX CONTENIMENTO]:
 * Iniezione perentoria di header CSP restrittivi per l'isolamento dei contenuti erogati a schermo.
 * [🦈 WATCHDOG LOOPBACK]:
 * Test atomico di cifratura/decrittazione simmetrica a runtime (🐦 vaultCanaryText) per la validazione della memoria.
 * [🚨🧼 EMERGENCY WIPE]:
 * Tabula rasa immediata, distruzione totale e bonifica delle cache in caso di fallimento strutturale del canarino.
 * [🚧🕵 ️ANTI-MEMORY INSPECTION]:
 * Sovrascrittura fisica e azzeramento dei buffer binari di transito (headBuffer, tailBuffer, fullBuffer), tramite metodo nativo 'Uint8Array.prototype.fill(0)' immediatamente post-elaborazione.
 *
 */

let encryptionKey = null;

 let isLogicEnabled = false;
 let syncAbortController = null;
const BASE_PATH = self.location.pathname.replace(/[^\/]+$/, "").replace(/\/+/g, '/');

/**
 * 📊 CONFIGURAZIONE GLOBALE (Dizionario dei Vincoli Operativi)
 * Definisce i parametri strutturali per la resilienza di rete, crittografia e tolleranza ai guasti.
 */

let globalAbortController = new AbortController();
const CONFIG = {
    ROOT: BASE_PATH,
        cacheName:      'PWA_PIZZA_ENGINE_v7.7',
    userCacheName: 'user_PWA_PIZZA_ENGINE_v7.7',
	vaultCanaryText: 'KANARY_OK_PANZER_KEY',
    userCacheTTL: 7,
    networkResilient: {
        maxRetries: 5,
        timeWaitSec: 3,
        profiles: {
            'Ultrafast': {
                limit: 12, timeout: 15
            },
            'Fast':      {
                limit: 8, timeout: 20
            },
            'Medium':    {
                limit: 4,  timeout: 45
            },
            'Low':       {
                limit: 2,  timeout: 90
            },
            'Verylow':   {
                limit: 1,  timeout: 120
            }
        }
    },
	minSizeMap: {
        'image': {
           'webp': 500,
           'jpeg': 5000,
           'jpg': 5000,
           'png': 500,
           'avif': 500,
           'svg': 100,
           'magicNumbers': {
               'header': [
                   '52494646', // WEBP/RIFF
                   'FFD8FF',   // JPEG
                   '89504E47', // PNG
                   '3C737667'  // SVG
                ],
               'footer': [
                   '49454E44AE426082', // PNG (IEND)
                   'FFD9',             // JPEG (EOI)
                   '3B',               // GIF (Terminator)
                   '3C2F7376673E'      // SVG (</svg>)
                ]
           },
           'useHeadProbe': true,
           'tolerance': 0.30,
           'defaultMin': 500
        },
        'pdf': {
           'firmato': 5000,
           'default': 10000,
           'magicNumbers': {
               'header': ['25504446'], // %PDF (Rilevazione universale)
               'footer': ['2525454F46']  // %%EOF (Rilevazione strutturale di coda)
           },
           'pdfMaliciousPatterns': [
               '/JavaScript',
               '/JS',
               '/Launch',
               '/OpenAction'
           ],
           'useHeadProbe': false,
           'tolerance': 0.30,
           'defaultMin': 1000
        },
        'code': {
            'html': 100,
            'css': 100,
            'js': 100,
            'json': 10,
            // Lasciati vuoti per garantire 0 falsi positivi nella PA
            'magicNumbers': {
                'header': [],
                'footer': []
            },
            'useHeadProbe': true,
            'tolerance': 0.20,
            'defaultMin': 100
        },
        'universal': {
            'tolerance': 0.05,
            'minAbsoluteByte': 64,
            'fallbackToGet': true
        }
    },
    coreAssets: [
		BASE_PATH,
		`${BASE_PATH}index.html`,
		`${BASE_PATH}style.css`,
		`${BASE_PATH}script.js`,
		`${BASE_PATH}db.json`,
		`${BASE_PATH}PWA.webmanifest`,
		`${BASE_PATH}sw/assets-manifest.json`,
		`${BASE_PATH}sw/icon/hicon.png`,
		`${BASE_PATH}sw/icon/menu96.png`,
		`${BASE_PATH}sw/icon/menu512.png`
	],
    manifestPath: `${BASE_PATH}sw/assets-manifest.json`,
    mappingLogic: {
		idKeys: [
			'id'
		],
        contexts: {
            'docs_it': { path: 'dir_img/pdf/ita/', ext: '.pdf' },
            'docs_en': { path: 'dir_img/pdf/eng/', ext: '.pdf' },
            'base':    { path: 'dir_img/',          ext: '.webp' }
        },
        parentSpecials: {
            'pizze':   { prefix: 'pz_', ext: '.webp' },
            'piatti':  { prefix: 'pi_', ext: '.webp' },
            'gallery': { prefix: '',    ext: '.jpg', isSequential: true }
        }
    },
	defPlaceHolderLogo: `${BASE_PATH}sw/icon/hicon.png`,
    defaultExt: '.webp',
    extensions: [
        'jpg', 'jpeg', 'png', 'webp',
        'pdf'
    ],
	extExlPHr: [
		'pdf', 'zip', 'doc', 'docx'
	],

    get syncRegex() {
        return new RegExp(`\\.(${this.extensions.join('|')})$`, 'i');
    },
    get allVariants() {
        const variants = [];
        this.extensions.forEach(ext => {
            variants.push('.' + ext.toLowerCase(), '.' + ext.toUpperCase());
        });
        return [...new Set(variants)];
    }
};

/*
 * 🚧 SBARRAMENTO LOGICO IN CASCATA 🚧
 * ❄️ DEEP FREEZE:
 * Ciclo ricorsivo di congelamento profondo.
 * Blocca CONFIG e qualsiasi sotto-oggetto presente o futuro.
 *
 * anti-Prototype Pollution
 * Hijacking a runtime
 */
const deepFreeze = (obj) => {
    if (obj && typeof obj === 'object') {
        Object.freeze(obj);
        for (const key of Object.getOwnPropertyNames(obj)) {
            const prop = obj[key];
            if (prop !== null && typeof prop === 'object' && !Object.isFrozen(prop)) {
                deepFreeze(prop);
            }
        }
    }
};
Object.freeze(deepFreeze);
deepFreeze(CONFIG);

/**
 * 🛡⏱️ SHIELD TEMPORALE (ANTI-TIMING ATTACK)
 * Livella il tempo di computazione percepito dall'esterno su una baseline fissa,
 * 🎲 aggiungendo un jitter stocastico per distruggere i profili statistici del 🔴 Red Team.
 * * PARAMETRI OPERATIVI DI INGRESSO:
 * @param {number} startTime - Marcatore temporale ad alta precisione (generato tramite performance.now())
 * acquisito all'inizio della sessione di scansione o transito di rete.
 * @param {number} targetBaselineMs - Finestra temporale minima nominale (espressa in millisecondi)
 * garantita per l'uniformazione della latenza verso l'esterno.
 */
const injectTimingNoise = async (startTime, targetBaselineMs = 45) => {
    try {
        const elapsed = performance.now() - startTime;

        if (elapsed < targetBaselineMs) {
            const padding = targetBaselineMs - elapsed;
            const jitter = Math.random() * (25 - 5) + 5;
            const totalShieldTime = Math.ceil(padding + jitter);

            await sleep(totalShieldTime);
        } else {
            const microJitter = Math.random() * (5 - 1) + 1;
            await sleep(Math.ceil(microJitter));
        }
    } catch (e) {
        // Fail-safe asettico...
    }
};
Object.freeze(injectTimingNoise);


/**
 * ⏳ Generatore di ritardo temporizzato isolato.
 * Blocca l'esecuzione sequenziale asincrona del ciclo per i secondi di resilienza configurati.
 * @param {number} ms - Tempo di sospensione espresso in millisecondi.
 * @returns {Promise<void>} Promessa risolta al termine del timeout.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
Object.freeze(sleep);

/**
 * ⏳💤 Ottimizzatore adattivo del respiro della CPU per Service Worker.
 * Misura lo stress attuale dell'Event Loop e calcola la pausa ideale.
 * @param {number} [minPauseMs=200] - Pausa minima richiesta (Base assoluta: 200ms).
 * @param {number} [timeoutMs=8000] - Tempo limite massimo (guardia) di sicurezza.
 * @returns {Promise<void>}
 */
const waitTillIdle = (minPauseMs = 200, timeoutMs = 8000) => {
    return new Promise((resolve) => {
        const pausaBaseMinima = Math.max(200, minPauseMs);
        const inizioTest = performance.now();
        const ATTESA_TEST_MS = 20; // Micro-timer
        setTimeout(() => {
            const fineTest = performance.now();
            const tempoEffettivo = fineTest - inizioTest;
            // Calcola lo sfasamento reale dell'Event Loop (drift)
            const driftEventLoop = Math.max(0, tempoEffettivo - ATTESA_TEST_MS);
            const coefficienteSensibilita = 25;
            let tempoRespiroCalcolato = pausaBaseMinima + (driftEventLoop * coefficienteSensibilita);
            tempoRespiroCalcolato = Math.min(tempoRespiroCalcolato, timeoutMs);
            console.log(`⏳ SW Drift: ${driftEventLoop.toFixed(1)}ms -> Pausa applicata: ${Math.round(tempoRespiroCalcolato)}ms`);
            setTimeout(resolve, tempoRespiroCalcolato);
        }, ATTESA_TEST_MS);
    });
};
Object.freeze(waitTillIdle);

/**
 * 🔍🧬 SW Forensics & DNA Check.
 * Esegue il campionamento dimensionale e l'analisi dei Magic Numbers (Firme Esadecimali)
 * sui payload telematici per intercettare file corrotti, tronchi o pacchetti malevoli (MIME-sniffing).
 * @param {Response|Blob} input - Il flusso dati grezzo intercettato dal network o dal cache layer.
 * @param {string} contentType - Intestazione MIME-Type ufficiale dichiarata dal server.
 * @param {number} [expectedSize=0] - Dimensione nominale attesa (Content-Length) per verifica tolleranza.
 * @param {boolean} [isEncrypted=false] - Flag di bypass firme per i flussi già cifrati nel Bunker.
 * @param {AbortSignal} [signals=null] - Segnale di interruzione atomica per processi pendenti.
 * @returns {Promise<{valid: boolean, blob: Blob|null}>} Esito della validazione con istanza blob pulita.
 */
const isValidBlob = async (input, contentType, expectedSize = 0, isEncrypted = false, signals = null) => {
    // ⏱️ Marcatore iniziale:
    const startForensicTime = performance.now();

    let signal = signals || null;
    let blob;
    let encoding = null;
    let finalContentType = contentType;
    let result = { valid: false, blob: null };

    if (input instanceof Response) {
        if (signal?.aborted) return result;
        encoding = input.headers.get('Content-Encoding');
        finalContentType = contentType || input.headers.get('Content-Type') || '';
        try {
            blob = await input.blob();
        } catch (e) {
            // 🪝🛡️⏱️ INNESTO:
            await injectTimingNoise(startForensicTime, 50);
            return result;
        }
    } else {
        blob = input;
    }
    if (!blob || !(blob instanceof Blob)) {
        // 🪝🛡️⏱️ INNESTO:
        await injectTimingNoise(startForensicTime, 50);
        return result;
    }

    const mainType = finalContentType.split('/')[0]?.toLowerCase() || '';
    const subType = finalContentType.split('/')[1]?.split(';')[0]?.toLowerCase() || '';
    const section = CONFIG.minSizeMap[mainType] || CONFIG.minSizeMap['code'] || null;

    const isTransformed = encoding !== null && encoding !== 'identity';
    let minSize = CONFIG.minSizeMap.universal.minAbsoluteByte;
    if (section) {
        const tolerance = section.tolerance || CONFIG.minSizeMap.universal.tolerance;
        const baseMin = section[subType] || section.defaultMin || section.default || 0;
        minSize = (expectedSize > 0) ? (expectedSize * (1 - tolerance)) : baseMin;
    }
    if (isEncrypted || isTransformed) minSize = CONFIG.minSizeMap.universal.minAbsoluteByte;
    if (blob.size < minSize) {
        // 🪝🛡️⏱️ INNESTO:
        await injectTimingNoise(startForensicTime, 50);
        console.log(`⚠️ SW Forensics: Asset scartato (${blob.size}b < Min: ${Math.round(minSize)}b) -> ${finalContentType}`);
        return result;
    }

    let headerBuffer = null;
    let tailBuffer = null;
    let fullBuffer = null;

    // 🧼 Funzione ausiliaria per la bonifica sicura della RAM
    const wipeRAM = () => {
        if (headerBuffer) new Uint8Array(headerBuffer).fill(0);
        if (tailBuffer) new Uint8Array(tailBuffer).fill(0);
        if (fullBuffer) new Uint8Array(fullBuffer).fill(0);
    };

    try {
        // --- 🛡️ FASE 1: ANALISI DEI MAGIC NUMBERS DI TESTA (HEADER) ---
        if (!isEncrypted && !isTransformed && section && section.magicNumbers?.header?.length > 0) {
            if (signal?.aborted) {
                wipeRAM();
                return result;
            }

            // Ampliata la finestra di lettura a 512 byte per SVG/XML per superare eventuali prologhi
            const isSvg = subType === 'svg' || finalContentType.includes('svg');
            const headerSliceSize = isSvg ? Math.min(blob.size, 512) : Math.min(blob.size, 12);

            headerBuffer = await blob.slice(0, headerSliceSize).arrayBuffer();
            let headerHex = Array.from(new Uint8Array(headerBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('').toUpperCase();

            const hasValidSig = section.magicNumbers.header.some(sig => headerHex.includes(sig.toUpperCase()));
            if (!hasValidSig) {
                if (!(subType === 'webp' && headerHex.startsWith('52494646') && headerHex.includes('57454250'))) {
                    // 🪝🛡️⏱️ INNESTO:
                    await injectTimingNoise(startForensicTime, 50);
                    console.log(`🛡️ SW Security: Firma [ TESTA ] fallita per ${finalContentType}.\nDNA  🧬: ${headerHex}`);
                    wipeRAM();
                    return result;
                }
            }
        }

        // --- 🛡️ FASE 2: ANALISI DEI MARCATORI DI CODA (FOOTER) ---
        if (!isEncrypted && !isTransformed && section && section.magicNumbers?.footer?.length > 0) {
            if (signal?.aborted) {
                wipeRAM();
                return result;
            }
            const fetchSize = Math.min(blob.size, 128);
            tailBuffer = await blob.slice(-fetchSize).arrayBuffer();
            const tailHex = Array.from(new Uint8Array(tailBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('').toUpperCase();

            const hasValidFooter = section.magicNumbers.footer.some(foot => tailHex.includes(foot.toUpperCase()));
            if (!hasValidFooter) {
                console.log(`🛡️ SW Security: Firma [ CODA ] fallita o corrotta per ${finalContentType}.\n👣 TAIL DNA 🧬: ${tailHex}`);
                wipeRAM();
                return result;
            }
        }

        // --- 🛡️ FASE 3: ANALISI EURISTICA ANTI-SCRIPT (SPECIFICA PER PDF) ---
        const isPdf = subType === 'pdf' || finalContentType.toLowerCase().includes('pdf');
        if (!isEncrypted && !isTransformed && isPdf && section?.pdfMaliciousPatterns) {
            if (signal?.aborted) {
                wipeRAM();
                return result;
            }

            // 🪨 HARDENING OPERATIVO:
            const localPatterns = [...(section.pdfMaliciousPatterns || [])];
            Object.freeze(localPatterns);

            // ⏳💤 Attivazione dell'ottimizzatore adattivo del respiro prima del carico computazionale pesante
            if (typeof waitTillIdle === 'function') {
                await waitTillIdle(200, 8000);
            }

            fullBuffer = await blob.arrayBuffer();
            let pdfTextContent = new TextDecoder('utf-8').decode(new Uint8Array(fullBuffer));

            // 🧯 Sanitizzazione sequenze esadecimali obfuscate (es. /Java#53cript -> /JavaScript)
            pdfTextContent = pdfTextContent.replace(/#([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

            for (const pattern of localPatterns) {
                if (pdfTextContent.includes(pattern)) {
                    // 🪝🛡️⏱️ INNESTO:
                    await injectTimingNoise(startForensicTime, 50);
                    console.log(`🛡️ SW Security: Blocco [ CORPO ] per ${finalContentType}.\n DNA 🧬: Vettore Malevolo Rilevato -> ${pattern}\n 📄🚨 Il [ PDF ] e Rigettato d'ufficio !`);
                    wipeRAM();
                    return result;
                }
            }
        }

        ✅ // Controllo finale di integrità di lettura strutturale del blob originale
        if (signal?.aborted) {
            wipeRAM();
            return result;
        }
        await blob.slice(-5).arrayBuffer();

    } catch (e) {
        // 🪝🛡️⏱️ INNESTO:
        await injectTimingNoise(startForensicTime, 50);
        wipeRAM();
        return result;
    }

    // 🧼 BONIFICA FINALE DELLA RAM
    wipeRAM();

    result.valid = true;
    result.blob = blob;
    // 🪨 HARDENING ESITO:
    Object.freeze(result);
    return result;
};
Object.freeze(isValidBlob);

/**
 * 🧲 SONDA TECNICA HEAD: Pre-ispezione preventiva delle risorse (Anti-MIME Sniffing).
 * Interroga l'endpoint remoto tramite metodo HEAD leggero per estrarre la dimensione nominale (Content-Length) ed il tipo MIME dichiarato dal server.
 * Interrompe l'esecuzione via AbortController in caso di superamento della soglia massima di latenza di 2.5 secondi.
 * @param {string} url - URI telematico della risorsa remota da scansionare.
 * @param {Object|null} rules - Configurazione dei vincoli e tolleranze estratti da CONFIG.minSizeMap.
 * @param {boolean} rules.useHeadProbe - Flag di abilitazione per l'attivazione della sonda HEAD.
 * @returns {Promise<{ok: boolean, size: number, type: string}>} Struttura di audit contenente lo stato del server, la dimensione in byte (-1 se assente) e il Content-Type.
 */
const performProbe = async (url, rules) => {

    if (!rules || rules.useHeadProbe === false) {
        return { ok: true, size: 0, type: '' };
    }

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
        const probe = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache',
            mode: 'cors',
			signal: syncAbortController ?
					AbortSignal.any([syncAbortController.signal, controller.signal]) :
					controller.signal
        });
        clearTimeout(timeoutId);
        if (probe.ok && probe.status === 200) {
            const contentLength = probe.headers.get('Content-Length');
            const contentType = (probe.headers.get('Content-Type') || '').toLowerCase();

            const size = contentLength ? parseInt(contentLength, 10) : -1;
            return {
                ok: true,
                size: size,
                type: contentType
            };
        }
    } catch (e) {

        if (e.name === 'AbortError') {
            console.info(`🧲⚠️ SW: Sonda HEAD in timeout per ${url}. Procedo con download.`);
        } else {
            console.info(`🧲❌ SW: Sonda HEAD fallita (CORS o Rete) per ${url}.`);
        }
    } finally {
        clearTimeout(timeoutId);
    }

    return {
        ok: CONFIG.minSizeMap.universal?.fallbackToGet ?? true,
        size: 0,
        type: ''
    };
};
Object.freeze(performProbe);

/**
 * 🔗 FLUSSI: Normalizzatore Strict degli URI Telematici.
 * Converte e depura qualsiasi stringa di percorso o URL in un cammino assoluto sterile privo di parametri di query superflui o doppi slash (//).
 * Reinstalla l'instradamento d'ufficio verso l'entrypoint index.html in caso di corrispondenza esatta con la radice (ROOT).
 * @param {string} url - Stringa grezza o percorso telematico intercettato dal network o dal database.
 * @returns {string} Percorso pulito e standardizzato per le chiavi di indicizzazione del database delle cache.
 */
const normalize = (url) => {

    if (!url || typeof url !== 'string' || url.startsWith('data:')) return url;

    try {

        const baseSafe = new URL(CONFIG.ROOT, self.location.origin).href;

        const resolved = new URL(url, baseSafe);

        let cleanPath = resolved.pathname.replace(/\/+/g, '/');

        const rootNormalized = CONFIG.ROOT.replace(/\/+/g, '/');
        if (cleanPath === rootNormalized || cleanPath === rootNormalized + '/') {

			const mainEntry = CONFIG.coreAssets.find(asset => asset.toLowerCase().includes('.html'));
			cleanPath = normalize(mainEntry);
        }

        return cleanPath;
    } catch (e) {

        return url.split('?')[0].replace(/\/+/g, '/');
    }
};
Object.freeze(normalize);

/**
 * 📥🚀 Smart Download Differito con Profilazione Dinamica.
 * Gestisce l'allineamento degli asset core e dinamici applicando le barriere di controllo
 * del network profile. Integra la crittografia asincrona nativa prima dello storage finale.
 * @param {string} url - Endpoint telematico della risorsa da storicizzare.
 * @param {Cache} cache - Riferimento all'istanza di destinazione (Bunker o Magazzino).
 * @param {boolean} [isCore=false] - Flag di marcatura per file critici di infrastruttura.
 * @param {string} [version=''] - Marcatore di versione telematico per l'audit di tracciabilità.
 * @param {number} [probeSize=0] - Dimensione preventiva ricavata da sonda HEAD.
 * @returns {Promise<string|boolean>} Stato finale dell'operazione ("DOWNLOADED", "ALREADY_OK", "variant_new" o false).
 */
const smartDownload = async (url, cache, isCore = false, version = '', probeSize = 0) => {
    // ⏱️ Marcatore di rete.
    const startNetworkTime = performance.now();
    const cleanKey = normalize(url);
    let isEncrypted = false;
    const isVaultReady = await verifyVaultIntegrity();
    if (!isVaultReady || !encryptionKey) {
        throw new Error("VAULT_LOCKED_NO_KEY");
    }
    const existing = await cache.match(cleanKey);
    if (existing) {
        const cachedVersion = existing.headers.get('X-PWA-Version');
        isEncrypted = existing.headers.get('X-PWA-Encrypted') === 'true';

        if (!isCore) {
            try {
                const blob = await existing.blob();

                if (await isValidBlob(blob, existing.headers.get('Content-Type'), 0, isEncrypted, syncAbortController?.signal)) {
                    return "ALREADY_OK";
                }
            } catch (e) {
                // 🛡️⏱️ INNESTO: 🪝
                await injectTimingNoise(startNetworkTime, 50);
            }
        }

        if (isCore) {

            if (version && cachedVersion === version.toString()) {
                return "ALREADY_OK";
            }

            try {
				const profile = getNetworkProfile(self.navigator);
				// 🛡️ ADATTAMENTO DINAMICO: Il timeout segue il profilo...
				const dynamicTimeout = (profile.timeout * 1000);
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), dynamicTimeout);
				const fetchSignal = syncAbortController
                ? AbortSignal.any([syncAbortController?.signal, controller?.signal])
                : controller?.signal;
                const head = await fetch(url, {
					method: 'HEAD',
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' },
                    mode: 'cors',
                    signal: fetchSignal
                });
                const serverLastMod = head.headers.get('Last-Modified');
                const localLastMod = existing.headers.get('X-PWA-LastMod');
                if (serverLastMod && localLastMod && serverLastMod === localLastMod) {
                    return "ALREADY_OK";
                }
            } catch (e) {
                // 🛡️⏱️ INNESTO: 🪝
                await injectTimingNoise(startNetworkTime, 50);
                return "ALREADY_OK";
            }
        }

        await cache.delete(cleanKey);
    }

    const ext = url.split('.').pop().toLowerCase();
    const rules = CONFIG.minSizeMap[ext] ||
                  (CONFIG.extensions.includes(ext) ? CONFIG.minSizeMap[ext === 'pdf' ? 'pdf' : 'image'] : null) ||
                  CONFIG.minSizeMap.universal;
    // 🔐 HARDENING LIVELLO INTERNO:
    if (rules) Object.freeze(rules);

    let finalProbeSize = probeSize;
    if (finalProbeSize === 0) {
        const probeResult = await performProbe(url, rules);
        if (!probeResult.ok && !rules.fallbackToGet) return false;
        finalProbeSize = probeResult.size;
    }

    const tryDL = async (targetUrl, useRetries = true, currentProbeSize = 0) => {
        const { maxRetries, timeWaitSec } = CONFIG.networkResilient;
        const attempts = useRetries ? maxRetries : 0;
        const profile = getNetworkProfile(self.navigator);
        for (let attempt = 0; attempt <= attempts; attempt++) {
            if (syncAbortController?.signal.aborted) return false;
            // 🛡️ ADATTAMENTO DINAMICO: Il timeout segue il profilo...
			const dynamicTimeout = (profile.timeout * 1000);
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), dynamicTimeout);

            const fetchSignal = syncAbortController
                ? AbortSignal.any([syncAbortController?.signal, controller?.signal])
                : controller?.signal;
            try {
                if (attempt > 0) await sleep(timeWaitSec * 1000);
                const fetchUrl = targetUrl.includes('?') ? `${targetUrl}&cb=${Date.now()}` : `${targetUrl}?cb=${Date.now()}`;

                const r = await fetch(fetchUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' },
                    mode: 'cors',
                    signal: fetchSignal
                });
                clearTimeout(timeoutId);
                if (r.ok || r.status === 304) {
                    try {
                        const contentType = r.headers.get('Content-Type') || '';

                        const expectedSize = parseInt(r.headers.get('Content-Length') || (currentProbeSize > 0 ? currentProbeSize : 0), 10);

                        const check = await isValidBlob(r, contentType, expectedSize, isEncrypted, fetchSignal);
                        if (!check.valid) {
                            // 🧼 BONIFICA DISTRUTTIVA: Polverizzazione immediata del payload malevolo in RAM prima del crash controllato
                            try {
                                const badBlob = check.blob || (r.clone ? await r.clone().blob() : null);
                                if (badBlob) {
                                    const badBuffer = await badBlob.arrayBuffer();
            new Uint8Array(badBuffer).fill(0);
                                }
                            } catch (clearErr) {
                                // 🛡️⏱️ INNESTO: 🪝
                                await injectTimingNoise(startNetworkTime, 50);
                                console.warn("🔬⚠️ SW Forensic: Errore durante la bonifica d'emergenza 🧼🚨", clearErr);
                            }
                            // 🏴‍☠️ ANTI-PROFILING: Lancio di un errore asettico privo di Stack Trace per accecare l'attaccante
                            const cleanError = new Error(`Integrità/DNA Fallito per ${targetUrl}`);
                            Object.defineProperty(cleanError, 'stack', { value: undefined, configurable: false, writable: false });
                            Object.freeze(cleanError);
                            throw cleanError;
                        }


						let finalBlob = check.blob;
						const newHeaders = new Headers(r.headers);
						if (version) newHeaders.set('X-PWA-Version', version.toString());
						newHeaders.set('X-PWA-Date', Date.now().toString());
						const lastMod = r.headers.get('Last-Modified');
						if (lastMod) newHeaders.set('X-PWA-LastMod', lastMod);

						if (encryptionKey) {
							finalBlob = await encryptBlob(finalBlob);
							newHeaders.set('X-PWA-Encrypted', 'true');
						}

						// Riferimento per la pulizia della Ram...
						let bufferToClear = (finalBlob instanceof Uint8Array) ? finalBlob : null;

						try {
							await cache.put(cleanKey, new Response(finalBlob, { status: 200, headers: newHeaders }));
							console.info(`📦🛡️ SW: Risorsa validata e salvata: ${targetUrl}`);
						} catch (cacheError) {
							if (await QuotaExceeded_User_Assets(cacheError) !== false) {
								try {
									await cache.put(cleanKey, new Response(finalBlob, { status: 200, headers: newHeaders }));
									console.info(`📦🛡️ SW: Risorsa salvata con successo dopo 🧹 pulizia: ${targetUrl}`);
								} catch (retryError) {
								    // 🪝🛡️⏱️ INNESTO:
								    await injectTimingNoise(startNetworkTime, 50);
									// 🏴‍☠️ ACCECAMENTO SUL RETRY:
									const cleanRetryErr = {};
									Object.defineProperties(cleanRetryErr, {
										name: { value: "FatalCacheStorageError", enumerable: true },
										message: { value: "Saturazione persistente o violazione del perimetro di archiviazione", enumerable: true },
										stack: { value: undefined, configurable: false, writable: false, enumerable: false }
									});
									Object.freeze(cleanRetryErr);

									console.error("🧹❌ SW: Fallimento critico anche dopo pulizia:", cleanRetryErr);
									throw cleanRetryErr;
								}
							} else {
							    // 🪝🛡️⏱️ INNESTO:
							    await injectTimingNoise(startNetworkTime, 50);
								throw cacheError;
							}
						} finally {
							if (bufferToClear) {
								bufferToClear.fill(0);
								// 🪝🛡️⏱️ INNESTO:
								await injectTimingNoise(startNetworkTime, 50);
								console.log(`🛡🧹️ SW: Bonifica RAM eseguita per: ${targetUrl}`);
							}
						}

                        const uCache = await caches.open(CONFIG.userCacheName);
                        await uCache.delete(cleanKey);

                        return "DOWNLOADED";
                    } catch (e) {
                        // 🛡️⏱️ INNESTO: 🪝
                        await injectTimingNoise(startNetworkTime, 50);
                        console.info(`🔍⚠️ SW: Scarto tecnico su ${targetUrl} -> ${e.message}`);
                        return false;
                    }
                }
                if (r.status === 404) break;
            } catch (e) {
                // 🛡️⏱️ INNESTO: 🪝
                await injectTimingNoise(startNetworkTime, 50);
                clearTimeout(timeoutId);

                if (!(await checkRealOnline('sync'))) {
                    throw new Error("PWA_Offline");
                }
            }
        }
        return false;
    };
    // 🔐 HARDENING LIVELLO INTERNO:
    Object.freeze(tryDL);

    const res = await tryDL(url, true, finalProbeSize);
    if (res === "DOWNLOADED") return "DOWNLOADED";
	if (res === "ALREADY_OK") return "ALREADY_OK";

	if (res === false) {
		const dotIdx = url.lastIndexOf('.');
		if (dotIdx !== -1) {
			const basePath = url.substring(0, dotIdx);
			for (let variantExt of CONFIG.extensions) {
				if (syncAbortController?.signal.aborted) return false;
				const alt = basePath + '.' + variantExt;
				if (alt !== url) {
					const altRes = await tryDL(alt, false, 0);
					if (altRes === "DOWNLOADED") return "variant_new";
				}
			}
		}
	}
    return false;
};
Object.freeze(smartDownload);

/**
 * 📡 Calcolo empirico del profilo del canale.
 * Analizza le metriche hardware fornite dal modulo Network Information API (RTT e Downlink).
 * @param {WorkerNavigator} [nav=self.navigator] - Interfaccia di profilazione del browser.
 * @returns {{limit: number, timeout: number}} Struttura dati del profilo di rete attivo.
 */
const getNetworkProfile = (nav) => {
    const profiles = CONFIG.networkResilient.profiles;
    if (!nav || !nav.connection) return profiles['Medium'];
    const conn = nav.connection;
    const downlink = parseFloat(conn.downlink || 0);
    const eff = String(conn.effectiveType || '').toLowerCase();
    let score = 0;
    let status = '';

    if (downlink >= 15)       score += 70;
    else if (downlink >= 5)   score += 50;
    else if (downlink >= 1.5) score += 30;
    else if (downlink >= 0.4) score += 20;
    else if (downlink >= 0.2) score += 10;

    if (eff.includes('4g'))      score += 20;
    else if (eff.includes('3g')) score += 10;
    else if (eff.includes('2g')) score += 5;

    if (score >= 80)      status = 'Ultrafast';
    else if (score >= 55) status = 'Fast';
    else if (score >= 35) status = 'Medium';
    else if (score >= 20) status = 'Low';
    else                  status = 'Verylow';

    if (downlink >= 0.20 && downlink < 0.4) {
        status = 'Low';
    }

    if (downlink > 0 && downlink < 0.20) {
        status = 'Verylow';
    }

    if (!nav.onLine) status = 'Verylow';

    return profiles[status] || profiles['Medium'];
};
Object.freeze(getNetworkProfile);

/**
 * 🔀 VERIFICA CONNETTIVITÀ: Controllo di soglia reale (Anti-Lie-Fi).
 * Interroga un endpoint tramite richiesta HEAD leggera per assicurarsi che internet sia operativo.
 * @returns {Promise<boolean>} Esito formale dello stato di connettività reale.
 */
const checkRealOnline = async (mode = 'fetch') => {
    const netProfile = getNetworkProfile(self.navigator);
    const profiles = CONFIG.networkResilient.profiles;
    const profileName = Object.keys(profiles).find(key =>
        profiles[key].limit === netProfile.limit &&
        profiles[key].timeout === netProfile.timeout
    ) || 'Medium';

    let timeoutMs = 3000;
    if (mode === 'sync') {
        if (navigator.connection && navigator.connection.saveData) return false;
        timeoutMs = Math.min(netProfile.timeout * 1000, 15000);
    } else {
        timeoutMs = (profileName === 'Fast' || profileName === 'ultrafast') ? 2500 : 5500;
    }
    try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), timeoutMs);
        const networkResponse = await fetch(BASE_PATH + '?t=' + Date.now(), {
            method: 'HEAD',
            cache: 'no-store',
            mode: 'no-cors',
			signal: syncAbortController ?
					AbortSignal.any([syncAbortController?.signal, controller?.signal]) :
					controller?.signal
        });
        clearTimeout(tId);
        return true;
    } catch (e) {
        console.log(`🌐❌ SW: Offline in ${mode} (Profilo: ${profileName})`);
        return false;
    }
};
Object.freeze(checkRealOnline);

/**
 * 📡 REGISTRO DI CANALE: Canale di Comunicazione Inter-Processo (IPC / PostMessage).
 * Intercetta i comandi operativi e i payload relazionali trasmessi dal frontend.
 * Gestisce l'attivazione dei cicli di Smart Sync, le verifiche temporizzate del caveau,
 * l'estrazione crittografica delle chiavi e la cancellazione d'urgenza dei registri.
 * @param {ExtendableMessageEvent} e - Evento di messaggistica intercettato contenente il comando (e.data.type).
 */
let isNewInstallation = false;
let isSyncing = false;
self.addEventListener('message', (event) => {
    const eventDataSnapshot = event.data;
    if (eventDataSnapshot?.type === 'INIT_DB') {

        if (isSyncing) {
            if (syncAbortController) {
                syncAbortController.abort();
                console.info("🚫⚠️ PWA: Abort old Process...");
            }
            isSyncing = false;
        }

        const localController = new AbortController();
		const combinedSignal = globalAbortController?.signal
			? AbortSignal.any([globalAbortController.signal, localController.signal])
			: localController.signal;
		syncAbortController = {
			signal: combinedSignal,
			abort: () => localController.abort()
		};

        isSyncing = true;
        const currentVersion = eventDataSnapshot?.version;
        isLogicEnabled = true;

        const performSync = async (event) => {
			// ⏱️ Marcatore di rete.
			const startNetworkTime = performance.now();
            let hasActuallyChanged = false;
            let realServerVersion = currentVersion;
            const clients = await self.clients.matchAll();
            const broadcast = (msg) => clients.forEach(c => c.postMessage(msg));

            let uniqueList = [];
			let List_File_Download = null;
            let completed = 0;
			let completed_ok = 0;
            let failed = 0;
            let rfailed = 0;
            let variantsFound = 0;

			const netProfile = getNetworkProfile(self.navigator);
			const isCriticalLow = (netProfile.limit === CONFIG.networkResilient.profiles['Verylow'].limit);
				broadcast({ type: 'SYNC_START' });
		try {
				if ((!await checkRealOnline('sync')) || isCriticalLow) {
					console.log("📡❌ SW: Rete assente al decollo. Abort !");
					if (syncAbortController) syncAbortController.abort();
					isSyncing = false;
					broadcast({ type: 'SYNC_RETRY' });
					return;
				}
				const cache = await caches.open(CONFIG.cacheName);

				const cacheKeys = await cache.keys();
				const isCacheEmpty = cacheKeys.length === 0;

				let IsCFUD = false;
				const mainEntry = CONFIG.coreAssets.find(a => a.toLowerCase().includes('.html'));
				if (mainEntry && !isNewInstallation && !isCacheEmpty) {
					try {

						const radarRes = await fetch(mainEntry + '?t=' + Date.now(), {
								cache: 'no-store',
								signal: syncAbortController?.signal
							});
						if (radarRes.ok && radarRes.status === 200) {
							const radarText = await radarRes.text();
							const match = radarText.match(/ver_site\s*:\s*['"]([^'"]+)['"]/i);
							const serverV = match ? match[1] : null;
							if (serverV && serverV !== currentVersion) {
								const vServer = serverV.split('.');
								const vLocal = currentVersion.split('.');

								if (vServer[0] !== vLocal[0] || vServer[1] !== vLocal[1]) {
									console.info(`💥 SW Radar: Rilevato Major Update (${currentVersion} -> ${serverV}). Tabula Rasa Core File !`);
									CoreAssets_Destroy_Caches(serverV);
									return;
								}

								console.info(`⚙️🎯 SW Radar: Patch rilevata (${serverV})`);
								realServerVersion = serverV;
								IsCFUD = true;
								hasActuallyChanged = true;
							}
						}
					} catch (e) {
						// 🏴‍☠️ ANTI-PROFILING:
						const cleanManifestErr = {};
						Object.defineProperties(cleanManifestErr, {
							name: { value: "CoreFileError", enumerable: true },
							message: { value: "Procedura di sincronizzazione degradata a standard", enumerable: true },
							stack: { value: undefined, configurable: false, writable: false, enumerable: false }
						});
						Object.freeze(cleanManifestErr);
						console.warn("⚠️ SW: Fallimento..., procedo con Sync standard.", cleanManifestErr);
					}
				}

				console.info(`⚙️📥 SW: Avvio download file core...`);
				broadcast({ type: 'SYNC_PROGRESS' });
				const coreResults = [];
				let coreLimit = getNetworkProfile(self.navigator).limit;
				for (let i = 0; i < CONFIG.coreAssets.length; i += coreLimit) {
					if (syncAbortController?.signal.aborted) {
						throw new Error("SYNC_ABORTED_DURING_CORE");
					}
					coreLimit = getNetworkProfile(self.navigator).limit;
					const coreChunk = CONFIG.coreAssets.slice(i, i + coreLimit);
					const chunkPromises = coreChunk.map(url => smartDownload(url, cache, true, realServerVersion));
					let coreAbortListener;
					const coreAbortPromise = new Promise((_, reject) => {
						if (syncAbortController?.signal.aborted) {
							reject(new Error("SYNC_ABORTED_DURING_CORE"));
							return;
						}
						coreAbortListener = () => reject(new Error("SYNC_ABORTED_DURING_CORE"));
						syncAbortController?.signal.addEventListener('abort', coreAbortListener);
					});
					let chunkResults;
					try {
						chunkResults = await Promise.race([
							Promise.allSettled(chunkPromises),
							coreAbortPromise
						]);
						if (coreAbortListener) syncAbortController?.signal.removeEventListener('abort', coreAbortListener);
					} catch (coreRaceError) {
						if (coreAbortListener) syncAbortController?.signal.removeEventListener('abort', coreAbortListener);
						throw coreRaceError;
					}
					coreResults.push(...chunkResults);
					if (IsCFUD) {
						chunkResults.forEach((res, index) => {
							const url = coreChunk[index];
							const isDownloaded = res.status === 'fulfilled' && res.value === "DOWNLOADED";
							if (isDownloaded) {
								console.info(`⚙️ SW: asset core scaricato: ${url}`);
							}
						});
					}
					await waitTillIdle(200);
				}
				const core_Down_OK = coreResults.filter(r => r.status === 'fulfilled' && r.value === "DOWNLOADED").length;
				console.info(`✅⚙️ SW: Core File Scaricati effettivi da rete: ${core_Down_OK}/${coreResults.length}`);

				console.info(`⚙️📜 SW: Avvio Raccolta Lista File dal Manifest...`);
				const manifestList = [];
				if ((!await checkRealOnline('sync')) || isCriticalLow) {
					console.log("📡❌ SW Stop: Rete persa durante il 🔄 sync.");
					if (syncAbortController) {
						syncAbortController.abort();
					}
					isSyncing = false;
					broadcast({ type: 'SYNC_RETRY' });
					return;
				}
				try {
					const manifestRes = await fetch(CONFIG.manifestPath, {
						cache: 'no-cache',
						signal: syncAbortController?.signal
					});
					if (!manifestRes || !manifestRes.ok || manifestRes.status !== 200) {
						throw new Error(`MANIFEST_SERVER_ERROR_STATUS_${manifestRes?.status}`);
					}
					broadcast({ type: 'SYNC_PROGRESS' });
					let structured;
					try {
						structured = await manifestRes.json();
					} catch (jsonErr) {
						throw new Error("MANIFEST_JSON_CORRUPTED");
					}
					if (Array.isArray(structured)) {
						structured.forEach(group => {
							const directory = group.dir || "";
							if (group.files && Array.isArray(group.files)) {
								group.files.forEach(f => {
									const fullPath = normalize(CONFIG.ROOT + directory + f);
									manifestList.push(fullPath);
								});
							}
						});
					}
					console.info(`✅📜 SW: Lista completata. File raccolti dal manifest: ${manifestList.length}`);
				} catch (e) {
					console.error("🚫⚠️ SW: Errore Critico durante l'elaborazione dell'Assets Manifest:", e.message);
					throw new Error("ASSETS_MANIFEST_CORRUPTED");
				}

                const db = eventDataSnapshot?.data;
                const scanSet = new Set();
                const knownDirs = new Set(Object.values(CONFIG.mappingLogic.contexts).map(c => c.path));

/**
 * 🧠🧬 Universal Object Scanner Deep Validation.
 * Esegue la scansione ricorsiva polimorfa del database fornito in input il file db.json,
 * isolando chiavi identificative e percorsi per agganciare in modo predittivo gli asset extra correlati.
 * @param {Object} obj - Il nodo o sotto-albero JSON da sottoporre a ispezione.
 * @param {string} [currentCtx='base'] - Contesto logico di instradamento per l'assegnazione delle directory.
 * @param {string} [parentKey=''] - Identificativo del nodo padre per l'attivazione di logiche speciali.
 * @param {number} [depth=0] - Contatore di profondità per la prevenzione di loop di memoria (Stack Overflow).
 */
                const universalScanner = async (obj, currentCtx = 'base', parentKey = '', depth = 0) => {
                    if (!obj || typeof obj !== 'object' || depth > 12) return;
					if (syncAbortController?.signal.aborted) return;
                    for (const [key, val] of Object.entries(obj)) {
                        if (syncAbortController?.signal.aborted) return;

                        if (typeof val === 'object' && val !== null) {
                            let nextCtx = currentCtx;
                            if (parentKey === 'pdf' && (key === 'it' || key === 'en')) nextCtx = `docs_${key}`;
                            else if (CONFIG.mappingLogic.contexts[key]) nextCtx = key;
                            await universalScanner(val, nextCtx, key, depth + 1);
                            continue;
                        }
						if (typeof val === 'string') {
                            const trimmed = val.trim();
                            if (trimmed.length > 150 || (trimmed.split(' ').length - 1) > 2) {
                                continue;
                            }
                        }
                        const valStr = String(val).trim();
                        if (valStr.length < 2) continue;

                        const logic = CONFIG.mappingLogic.parentSpecials[parentKey] ||
                                      CONFIG.mappingLogic.contexts[currentCtx] ||
                                      CONFIG.mappingLogic.contexts['base'];
                        const isExplicitFile = CONFIG.syncRegex.test(valStr);
                        const isIdKey = CONFIG.mappingLogic.idKeys.includes(key.toLowerCase()) || /^[0-9]+$/.test(valStr);
                        if (isExplicitFile || isIdKey) {
                            let fileToProbe = valStr;
                            if (isIdKey && !isExplicitFile) {
                                fileToProbe = (logic.prefix || "") + valStr + (logic.ext || CONFIG.defaultExt);
                            }
                            const cleanDir = logic.path.replace(/^(\.\.\/|\.\/)+/, '');
                            const primaryUrl = normalize(CONFIG.ROOT + cleanDir + fileToProbe);

                            const targets = [primaryUrl];

                            if (isExplicitFile) {
                                knownDirs.forEach(d => {
                                    targets.push(normalize(CONFIG.ROOT + d.replace(/^(\.\.\/|\.\/)+/, '') + valStr));
                                });
                            }
                            await Promise.all([...new Set(targets)].map(async (url) => {

                                if (scanSet.has(url) || manifestList.includes(url)) return;

                                try {
                                    const timeoutSignal = AbortSignal.timeout(2500);
									const combinedSignal = syncAbortController ?
										AbortSignal.any([syncAbortController.signal, timeoutSignal]) :
										timeoutSignal;
									const probe = await fetch(url, {
										method: 'HEAD',
										cache: 'no-cache',
										signal: combinedSignal
									});
                                    if (probe.ok && probe.status === 200) {
                                        scanSet.add(url);
                                        console.info(`🎯🕵️‍♂️ SW Scanner: Asset Agganciato -> ${url}`);

                                        if (logic.isSequential && /\d+/.test(fileToProbe)) {
                                            const nextUrl = url.replace(/\d+/, n => parseInt(n) + 1);
                                            if (!scanSet.has(nextUrl) && !manifestList.includes(nextUrl)) {
												const nextProbe = await fetch(nextUrl, {
														method: 'HEAD',
														cache: 'no-cache',
														signal: combinedSignal
													});
                                                if (nextProbe.ok && nextProbe.status === 200) scanSet.add(nextUrl);
                                            }
                                        }
                                    }
                                } catch (e) {
									// 🪝🛡️⏱️ INNESTO:
									await injectTimingNoise(startNetworkTime, 45);
								}
                            }));
                        }
                    }
                };
                // 🔐 HARDENING LIVELLO INTERNO:
                Object.freeze(universalScanner);

                console.info("️🧠🧬 SW: Avvio Universal Scanner...");
                await universalScanner(db);
                console.info(`🎯🏁 SW: Analisi terminata. Asset extra trovati: ${scanSet.size}`);

                const fullWorkSet = new Set([...manifestList, ...Array.from(scanSet)]);
                const coreNormalized = CONFIG.coreAssets.map(a => normalize(a));
                console.info(`⛓️ SW: Unificazione completata. Risorse totali da elaborare: ${fullWorkSet.size}`);
                uniqueList = Array.from(fullWorkSet).filter(url => {
                    const norm = normalize(url);

                    if (coreNormalized.includes(norm) || norm === '/' || norm === CONFIG.ROOT) {
                        return false;
                    }
                    const ext = url.split('.').pop().toLowerCase();
                    const isAllowed = CONFIG.extensions.includes(ext);
                    if (!isAllowed) {
                        console.log(`📄⚠️ SW: Estensione .${ext} non autorizzata, risorsa esclusa: ${url}`);
                    }
                    return isAllowed;
                });
                console.info(`🚜 SW: Rastrellamento terminato. ${uniqueList.length} risorse pronte per la stiva (esclusi Core Assets).`);

                let limit = getNetworkProfile(self.navigator).limit;
				List_File_Download = uniqueList.length;
                for (let i = 0; i < List_File_Download; i += limit) {
                    if (syncAbortController?.signal.aborted) return;
                    if ( !(await checkRealOnline('sync')) ) { isSyncing = false; return; }
					if ((!await checkRealOnline('sync')) || (limit === CONFIG.networkResilient.profiles['Verylow'].limit)) {
						console.log("📡❌ SW Stop: Rete persa o Verylow, durante il 🔄 sync.");
						if (syncAbortController) {
							syncAbortController.abort();
						}
						isSyncing = false;
						broadcast({ type: 'SYNC_RETRY' });
						return;
					}
					limit = getNetworkProfile(self.navigator).limit;
                    const group = uniqueList.slice(i, i + limit);

					console.info(`🗃️🚀 SW: Sync 🗂️ [ ${Math.floor(i/limit) + 1} / ${Math.ceil(List_File_Download/limit)} ] (${group.length} 📄)`);

					let abortListener;
					const abortPromise = new Promise((_, reject) => {
						if (syncAbortController?.signal.aborted) {
							reject(new Error("SYNC_ABORTED_DURING_CHUNK"));
							return;
						}
						abortListener = () => reject(new Error("SYNC_ABORTED_DURING_CHUNK"));
						syncAbortController?.signal.addEventListener('abort', abortListener);
					});
					let results;
					try {
						results = await Promise.race([
							Promise.allSettled(group.map(url => smartDownload(url, cache, false, realServerVersion))),
							abortPromise
						]);
						if (abortListener) syncAbortController?.signal.removeEventListener('abort', abortListener);
						await waitTillIdle(200);
					} catch (raceError) {
						if (abortListener) syncAbortController?.signal.removeEventListener('abort', abortListener);
						throw raceError;
					}
					results.forEach((res, index) => {
						const url = group[index];
                        if (res.status === 'fulfilled') {
                            const val = res.value;
                            if (val === "DOWNLOADED" || val === "variant_new") {
                                completed++;
                                if (val.includes("variant")) variantsFound++;
                            } else if (val === "ALREADY_OK" || val === "variant" || val === true) {

								console.info(`📄✅ SW: Già aggiornato: ${url}`);
								completed_ok++;
                            } else if (val === false) {

								console.info(`📄❌ SW: Fallimento validazione/download su: ${url}`);
                                failed++;
                                completed++;
                            }
                        } else {
							console.info(`📄⚠️ SW: Errore critico nel processo per: ${url}`, res.reason);
							if (res.reason && ( res.reason.message.includes('VAULT') )){
								throw res.reason;
							}
                            rfailed++;
                            completed++;
                        }
                    });

					if(completed > 0){
						broadcast({
							type: 'SYNC_PROGRESS',
							details: {
								percent: Math.floor((completed / List_File_Download) * 100),
								current: completed,
								total: uniqueList.length,
								request_failed: rfailed,
								failed_assets: failed
							}
						});
					}
                }

				if (syncAbortController?.signal.aborted) return;
                const expectedPaths = new Set([...coreNormalized, normalize(CONFIG.ROOT), ...uniqueList]);
                const allCachedRequests = await cache.keys();
                for (const request of allCachedRequests) {
                    const cleanPathInCache = normalize(new URL(request.url).pathname);
                    if (!expectedPaths.has(cleanPathInCache)) {
                        if (!cleanPathInCache.includes(CONFIG.manifestPath)) {
                            await cache.delete(request);
                        }
                    }
                }

		} catch (err) {
		    // 🪝🛡️⏱️ INNESTO:
		    await injectTimingNoise(startNetworkTime, 50);
		    // Interruzione immediata e atomica delle pipeline di rete pendenti
		    if (syncAbortController) syncAbortController.abort();
		    // Estrazione preventiva dei metadati dell'errore prima della sterilizzazione
		    const errorMessage = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
		    const isIntegritaError = errorMessage.includes('Integrità');

		    // 🏴‍☠️ ANTI-PROFILING: Generazione di un clone d'errore asettico e privo di Stack Trace
		    const cleanError = {};
		    Object.defineProperties(cleanError, {
		        name: { value: "SyncError", enumerable: true },
		        message: { value: isIntegritaError ? "Errore di Integrità rilevato su un asset" : "Errore operativo durante il Sync", enumerable: true },
		        stack: { value: undefined, configurable: false, writable: false, enumerable: false }
		    });
		    Object.freeze(cleanError);

		    // Ispezione forense e logging differenziato in base alla severità
		    if (isIntegritaError) {
		        console.error("🚨 SW: Errore di Integrità critico rilevato su un asset.", cleanError);
		    } else {
		        console.warn("🔄⚠️ SW: Errore Sync", cleanError);
		    }
		} finally {
				console.info(`✅ SW: SYNC Completata. Total file Download: ${completed} - Exclud(IsBunker): ${completed_ok}`);
				isNewInstallation = false;
                isSyncing = false;
				if (syncAbortController?.signal.aborted) {
					syncAbortController = null;
					broadcast({ type: 'SYNC_RETRY' });
					return;
				}
                syncAbortController = null;
                await sleep(500);

                broadcast({
                    type: 'SYNC_END',
                    hasChanged: hasActuallyChanged,
                    serverVersion: realServerVersion,
                    details: {
                        total: ( List_File_Download - completed_ok ),
                        completed: completed,
                        failed: failed,
                        request_failed: rfailed,
                        FileVarExt: variantsFound
                    }
                });
            }
        };
        // 🔐 HARDENING LIVELLO INTERNO:
        Object.freeze(performSync);
        event.waitUntil(performSync(event));
    }
});

/**
 * 🚦👮‍♂️ Regolatore di Flusso Polimorfo.
 * Determina in tempo reale la strategia di erogazione (Network-First o Stale-While-Revalidate)
 * analizzando lo stato hardware della rete (RTT/Downlink) e la disponibilità della cache locale.
 * @param {Response} hasCache - Istanza della risorsa eventualmente già presente a livello locale.
 * @param {WorkerNavigator} [nav=self.navigator] - Interfaccia di profilazione delle metriche hardware di rete.
 * @returns {string} Stringa di comando identificativa della strategia strategica ('NetworkFirst' | 'SWR').
 */
const assegnaFlussoPolimorfo = (hasCache, nav = self.navigator) => {
	const netProfile = getNetworkProfile(nav);
	const profiles = CONFIG?.networkResilient?.profiles;
	const profileName = Object.keys(profiles).find(key =>
        profiles[key].limit === netProfile.limit &&
        profiles[key].timeout === netProfile.timeout
    ) || 'Medium';
    switch (profileName) {
        case 'Ultrafast':
        case 'Fast':
            return 'NetworkFirst';
        case 'Medium':
            return hasCache ? 'SWR' : 'NetworkFirst';
        case 'Low':
        case 'Verylow':
        default:
            if (hasCache) {
                console.info(`🌐👮‍♂️ SW: Rete Degradata, [ ${profileName} ].\n SWR(Sate-While-Revlidate), ON per continuità operativa...`);
                return 'SWR';
            }
            return 'NetworkFirst';
    }
}

const CORE_ASSETS_SET = new Set(
    (CONFIG.coreAssets || []).map(asset => {
        return normalize(asset);
    })
);
Object.freeze(assegnaFlussoPolimorfo);

/**
 * 🚦 SMITIZZAZIONE E INTERCETTAZIONE: Vigile Urbano e Gateway di Sicurezza Net-Layer.
 * Intercetta ogni singola richiesta telematica in uscita dal frontend dell'applicazione.
 * Applica i filtri di normalizzazione degli URI, isola le richieste core e devia l'instradamento
 * verso le strategie crittografiche del Bunker (AES-GCM) o verso il Magazzino di cache utente.
 * @param {FetchEvent} e - Evento di recupero della risorsa telematica.
 * @returns {void} Sblocca il thread rispondendo direttamente tramite e.respondWith().
 */
const BROKEN_IMAGE_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="21" x2="21" y2="3"/><path d="M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M21 15l-5-5L5 21"/></svg>`;
const GLOBAL_BROKEN_BLOB = new Blob([BROKEN_IMAGE_SVG_STRING], { type: 'image/svg+xml' });
Object.freeze(GLOBAL_BROKEN_BLOB);

let globalPlaceholderBlob = null;

self.addEventListener('fetch', (event) => {
	// 🚧 SEZIONE I: NORMALIZZAZIONE E FILTRAGGIO FLUSSI IN INGRESSO
    // Isola lo scope della richiesta, pulisce l'URI telematico rimuovendo i parametri di query e verifica i bypass.
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    const cleanPath = normalize(url.pathname);
    event.respondWith((async () => {
        // ⏱️ Marcatore iniziale:
        const startFetchTime = performance.now();
        let finalPath = cleanPath;

		if (finalPath === normalize(BASE_PATH) || finalPath.endsWith('/')) {
			const mainEntry = CONFIG.coreAssets.find(asset => asset.toLowerCase().includes('.html'));
			finalPath = normalize(mainEntry);
		}
        const mainCache = await caches.open(CONFIG.cacheName);
        const userCache = await caches.open(CONFIG.userCacheName);
        const existsInMain = await mainCache.match(finalPath, { ignoreSearch: true });
		const cached = existsInMain || await userCache.match(finalPath, { ignoreSearch: true });

		const isCoreAsset = CORE_ASSETS_SET.has(finalPath);
        const shouldBeEncrypted = isCoreAsset || existsInMain;
		const targetCache = shouldBeEncrypted ? "📦🛡️ (Bunker)" : "📦🔓 (Magazzino)";

		if (event.request.url.includes('favicon.ico')) {
            return new Response(null, { status: 204 });
        }
// 🌐 SEZIONE II: FLUSSO DI INSTRADAMENTO RETE ATTIVA (ONLINE GATEWAY)
// Se la telemetria rileva connettività reale, attiva il canale polimorfo dando priorità alla rete
// o avviando la routine di sincronizzazione asincrona e aggiornamento dei magazzini in background.
		const finalStrategy = assegnaFlussoPolimorfo(cached, self.navigator);
		const isOnline = await checkRealOnline('fetch');
		if (isOnline) {
            try {
                const currentProfile = getNetworkProfile(self.navigator);
                const TIMEOUT_MS = currentProfile.timeout * 1000;
                const controller = new AbortController();
                const tId = setTimeout(() => controller.abort(), TIMEOUT_MS);
				const fetchSignal = globalAbortController
                ? AbortSignal.any([globalAbortController?.signal, controller?.signal])
                : controller?.signal;

                const networkResponse = await fetch(event.request, {
                    cache: 'no-cache',
                    signal: fetchSignal
                });
                clearTimeout(tId);
                if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
					if (!isLogicEnabled || isSyncing) {
						// 🛡️ SBARRAMENTO: Intercettazione congelata fino al completamento del Sync...
						return networkResponse;
					}

                    const responseClone = networkResponse.clone();
                    event.waitUntil((async () => {
						try {
							const isOk = await verifyVaultIntegrity();
							if (!isOk || !encryptionKey) throw new Error("VAULT_LOCKED_NO_KEY");
							if (!responseClone || !isLogicEnabled || isSyncing) return;

							const contentType = responseClone.headers.get('Content-Type') || '';
							const lastMod = responseClone.headers.get('Last-Modified');
							const localLastMod = existsInMain ? existsInMain.headers.get('X-PWA-LastMod') : null;
							const UserlocalLastMod = cached ? cached.headers.get('X-PWA-LastMod') : null;

							if (lastMod && ((localLastMod && lastMod === localLastMod) || (UserlocalLastMod && lastMod === UserlocalLastMod))) {
								return;
							}

							const check = await isValidBlob(responseClone, contentType, 0, false, controller.signal);
							if (check.valid) {
								let finalBlob = check.blob;
								const updatedHeaders = new Headers(responseClone.headers);
								updatedHeaders.set('X-PWA-Date', Date.now().toString());
								if (lastMod) updatedHeaders.set('X-PWA-LastMod', lastMod);

								console.info(`🔄💾 SW: [ ${targetCache} ], ♻️ File: ${finalPath}`);

								if (shouldBeEncrypted) {
									finalBlob = await encryptBlob(finalBlob);
									updatedHeaders.set('X-PWA-Encrypted', 'true');
								}

								const targetCacheObj = shouldBeEncrypted ? mainCache : userCache;
								let bufferToClear = (finalBlob instanceof Uint8Array) ? finalBlob : null;

								try {
									await targetCacheObj.put(finalPath, new Response(finalBlob, {
										status: responseClone.status,
										statusText: responseClone.statusText,
										headers: updatedHeaders
									}));
									console.info(`✅🔄💾 SW: [ ${targetCache} ], Aggiornamento - File: ${finalPath}`);
								} catch (cacheError) {
								    // 🏴‍☠️ ACCECAMENTO INTERMEDIO:
									const cleanCacheErr = {};
									Object.defineProperties(cleanCacheErr, {
										name: { value: "CacheWriteError", enumerable: true },
										message: { value: "Impossibile allocare la risorsa nel segmento isolato", enumerable: true },
										stack: { value: undefined, configurable: false, writable: false, enumerable: false }
									});
									Object.freeze(cleanCacheErr);
									console.error(`💥⚠️ SW: Fallimento scrittura in ${targetCache} - File: ${finalPath}`, cleanCacheErr);
									if (await QuotaExceeded_User_Assets(cacheError) !== false) {
										try {
											await targetCacheObj.put(finalPath, new Response(finalBlob, {
												status: responseClone.status,
												statusText: responseClone.statusText,
												headers: updatedHeaders
											}));
											console.info(`✅🔄💾 SW: [ ${targetCache} ], Salvataggio riuscito dopo pulizia: ${finalPath}`);
										} catch (retryError) {
										    // 🏴‍☠️ ACCECAMENTO SUL RETRY: Distruzione dello Stack Trace sul fallimento definitivo
											const cleanRetryErr = {};
										Object.defineProperties(cleanRetryErr, {
										    name: { value: "FatalCacheStorageError", enumerable: true },
										  message: { value: "Saturazione persistente o violazione del perimetro di archiviazione", enumerable: true },
										    stack: { value: undefined, configurable: false, writable: false, enumerable: false }
											});
										Object.freeze(cleanRetryErr);
										console.error("🧹❌ SW: Fallimento critico anche dopo pulizia:", cleanRetryErr);
											throw cleanRetryErr; // Rilanciamo l'errore già accecato verso il catch superiore
										}
									} else {
										console.warn("📦⚠️ SW: Update cache fallito:", cleanCacheErr);
										throw cleanCacheErr; // Rilanciamo l'errore già accecato verso il catch superiore
									}
								} finally {
									if (bufferToClear) {
										bufferToClear.fill(0);
										console.log(`🛡️🧹 SW: Bonifica RAM eseguita per: ${finalPath}`);
									}
								}
							} else {
								throw new Error(`Integrità/DNA Fallito per ${finalPath}`);
							}
						} catch (err) {
						    // 🪝🛡️⏱️ INNESTO TEMPORALE ANTI-PROFILING NELLA PIPELINE DI BACKGROUND
							if (typeof injectTimingNoise === 'function') await injectTimingNoise(startFetchTime, 30);

							// 🏴‍☠️ ACCECAMENTO: Sterilizzazione radicale dello Stack Trace del fallimento DNA/Scrittura
							const cleanErr = {};
							Object.defineProperties(cleanErr, {
								name: { value: "ForensicValidationError", enumerable: true },
								message: { value: err && err.message ? String(err.message) : "Eccezione controllata nel modulo Fetch Vault", enumerable: true },
								stack: { value: undefined, configurable: false, writable: false, enumerable: false }
							});
							Object.freeze(cleanErr);
							console.error("💥💾 SW: Errore fatale nel flusso di salvataggio in fetch: ", cleanErr);
						}
					})());
                    console.info(`⚡👮‍♂️ SW: [ ${targetCache} ] | Strategia Esecutiva: [ ${finalStrategy} ] \n 🌐 Rete: status [ 200 OK ] | Azione: ${(finalStrategy === 'SWR' && cached) ? 'Erogazione da Cache 📦 + Update differito in Background ♻️🔄' : 'Erogazione da Rete WEB 🌐'}. Risorsa: ${finalPath}`);
                    if(!(finalStrategy === 'SWR' && cached)){
                        return networkResponse;
                    }
					// 🗄️ Decade Verso la SEZIONE III
                }
                if (networkResponse && networkResponse.status === 404) {
                    if (cached) {
                        console.info("📦♻️ SW: 404 Online, Resilienza ON: ", finalPath);

                    } else {
                        return networkResponse;
                    }
                }
            } catch (e) {
                // 🪝🛡️⏱️ INNESTO TEMPORALE IN CASO DI CRASH DURANTE IL FETCH DI RETE
				if (typeof injectTimingNoise === 'function') await injectTimingNoise(startFetchTime, 25);
            }
        }
		if (cached) {
			// 🗄️ SEZIONE III: FALLBACK LOCALE E COERENZA INTERNA (CACHE HIT LAYER)
			// Intercetta la risorsa memorizzata localmente nelle stive. Se l'asset appartiene al Bunker Core,
			// devia il flusso verso il modulo di decrittazione asincrona nativa per ripristinare il plaintext.
            if (cached.headers.get('X-PWA-Encrypted') === 'true') {
                try {
                    const isOk = await verifyVaultIntegrity();
                    if (!isOk || !encryptionKey) throw new Error("VAULT_LOCKED_NO_KEY");
                    const buffer = await cached.arrayBuffer();
                    let decrypted = await decryptBuffer(buffer);

                    const detectedContentType = cached.headers.get('Content-Type') || '';
                    const dotIdx = finalPath.lastIndexOf('.');
                    const ext = dotIdx !== -1 ? finalPath.substring(dotIdx + 1).toLowerCase() : '';

                    const secureHeaders = new Headers({
                        'Content-Type': detectedContentType,
                        'X-PWA-Source': 'Bunker-Decrypted',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    });

                    if (ext && CONFIG.extExlPHr.includes(ext)) {
                        secureHeaders.set('Content-Disposition', `inline; filename="secure_document.${ext}"`);
                    }

                    const outResponse = new Response(decrypted, { headers: secureHeaders });
					console.log(`🛡️🧹 SW: Bonifica RAM eseguita per: ${finalPath}`);
					new Uint8Array(buffer).fill(0);
                    if (decrypted instanceof ArrayBuffer) new Uint8Array(decrypted).fill(0);
                    decrypted = null;
					console.info(`💾🛡️ SW: Risorsa estratta dal, ${targetCache}`);
                    return outResponse;
                } catch (err) {
                    	// 🪝🛡️⏱️ INNESTO TEMPORALE SU FALLIMENTO DECRITTAZIONE (PREVIENE TIMING ATTACKS SULLE CHIAVI)
					if (typeof injectTimingNoise === 'function') await injectTimingNoise(startFetchTime, 40);
					 // 🛡🧼 BONIFICA DI EMERGENZA RAM:
                    if (typeof buffer !== 'undefined' && buffer instanceof ArrayBuffer) {
                        new Uint8Array(buffer).fill(0);
                    }
                    if (typeof decrypted !== 'undefined' && decrypted instanceof ArrayBuffer) {
                        new Uint8Array(decrypted).fill(0);
                    }
                    decrypted = null;

					// 🏴‍☠️ ACCECAMENTO: Rimozione totale delle tracce crittografiche dall'oggetto errore
					const cleanDecryptErr = {};
					const isVaultError = err && err.message && err.message.includes('VAULT');
					Object.defineProperties(cleanDecryptErr, {
						name: { value: "CryptoShieldError", enumerable: true },
						message: { value: isVaultError ? "VAULT_LOCKED_NO_KEY" : "Decryption integrity violation", enumerable: true },
						stack: { value: undefined, configurable: false, writable: false, enumerable: false }
					});
					Object.freeze(cleanDecryptErr);
                    console.error("❌🔑 SW: Decrittazione fallita per:", finalPath);
                    if (isVaultError) {
						// 🚧 Violazione o blocco del caveau. Negazione formale dell'accesso alla risorsa telematica.
                        return new Response("⚠️🛡️Security Violation: 🗄️🚫 Vault Error...", { status: 403 });
                    } else {
                        const deletedMain = await mainCache.delete(finalPath, { ignoreSearch: true });
                        if (deletedMain) {
                            console.log(`⚠️🧹 SW: Risorsa Corrotta nel (🛡️ Bunker), ✅ eliminata correttamente: ${finalPath}`);
                            return new Response(null, { status: 404, statusText: "Resource Corrupted & Deleted" });
                        }
                    }
                    throw cleanDecryptErr; // Rilancia l'errore sterilizzato
                }
            } else {
				console.info(`💾🛡️ SW: Risorsa estratta dal, ${targetCache}`);
                return cached;
            }
        } else {
			// 🖼️ SEZIONE IV: FILTRO MULTIMEDIALE ED EROGAZIONE PLACEHOLDER (GRAPHIC RESILIENCE)
			// Gestisce gli asset grafici analizzando l'estensione del percorso. Il blocco opera su due livelli:
			// 1) Rilevamento e deviazione su estensioni varianti (altPath) con tracciamento forense via console.info.
			// 2) Fallback finale con iniezione del vettore statico base64 (CONFIG.fallbackImage) in caso di assenza totale.
            const dotIdx = finalPath.lastIndexOf('.');
            if (dotIdx !== -1) {
                const basePath = finalPath.substring(0, dotIdx);
                for (let variantExt of CONFIG.extensions) {
                    const altPath = basePath + '.' + variantExt;

                    if (altPath === finalPath) continue;
                    const altCached = await mainCache.match(altPath, { ignoreSearch: true }) ||
                                      await userCache.match(altPath, { ignoreSearch: true });
                    if (altCached) {
                        const contentTypeIMG = altCached.headers.get('Content-Type') || '';

                        if (contentTypeIMG.includes('image/')) {
                            console.info(`🛸🎯 SW Recovery: Trovata variante -> ${altPath}`);
                            try {
                                if (altCached.headers.get('X-PWA-Encrypted') === 'true') {
                                    const buffer = await altCached.clone().arrayBuffer();
                                    let decrypted = await decryptBuffer(buffer);

                                    const variantExtLower = variantExt.toLowerCase();
                                    const secureHeaders = new Headers({
                                        'Content-Type': contentTypeIMG,
                                        'X-PWA-Source': 'Bunker-Recovered-Decrypted',
                                        'X-PWA-Original-Path': altPath,
                                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                                        'Pragma': 'no-cache',
                                        'Expires': '0'
                                    });

                                    if (CONFIG.extExlPHr.includes(variantExtLower)) {
                                        secureHeaders.set('Content-Disposition', `inline; filename="secure_document.${variantExtLower}"`);
                                    }

                                    const outResponse = new Response(decrypted, { headers: secureHeaders });
									new Uint8Array(buffer).fill(0);
                                    if (decrypted instanceof ArrayBuffer) new Uint8Array(decrypted).fill(0);
                                    decrypted = null;
									return outResponse;
                                }

                                return altCached.clone();
                            } catch (decryptErr) {
                                console.error(`❌🔑 SW Recovery: Variante ${altPath} corrotta o non decifrabile.`);
                                continue;
                            }
                        }
                    }
                }
            }
        }
        const contentsType = event.request.headers.get('Accept') || "";
        const isHTML = contentsType.includes('text/html');
        const isExcluded = CONFIG.extExlPHr.some(ext => finalPath.toLowerCase().endsWith('.' + ext));
        const imageExtensions = CONFIG.extensions.filter(ext => !CONFIG.extExlPHr.includes(ext));
        const imgRegex = new RegExp(`\\.(${imageExtensions.join('|')})$`, 'i');
        const isImageRequest = (contentsType.includes('image/') && !isHTML) || imgRegex.test(finalPath);
        if (isImageRequest || isHTML) {
            const placeholderPath = normalize(CONFIG.defPlaceHolderLogo);
            const placeholder = await caches.match(placeholderPath);
            if (placeholder) {
                try {
					if (globalPlaceholderBlob === null) {
						if (placeholder.headers.get('X-PWA-Encrypted') === 'true') {
							const buffer = await placeholder.arrayBuffer();
							let decrypted = await decryptBuffer(buffer);
							globalPlaceholderBlob = new Blob([decrypted], { type: placeholder.headers.get('Content-Type') });
							decrypted = null;
						} else {
							globalPlaceholderBlob = await placeholder.blob();
						}
					}
                    if (isImageRequest && !isHTML && !isExcluded) {
                        console.info(`🖼️🩹 SW Placeholder: Emergenza -> ${finalPath}`);
                        return new Response(globalPlaceholderBlob, {
                            headers: {
                                'Content-Type': placeholder.headers.get('Content-Type') || 'image/png',
                                'X-PWA-Source': 'Bunker-Placeholder'
                            }
                        });
                    }
                } catch (err) {
                    console.error("❌ SW: Errore decriptazione placeholder:", err);
                }
            } else {
                if (isImageRequest && !isHTML && !isExcluded) {
                    console.info(`🖼️🩹❌ SW Placeholder Fallback: Emergenza -> ${finalPath}`);
                    return new Response(GLOBAL_BROKEN_BLOB, {
                        headers: {
                            'Content-Type': 'image/svg+xml',
                            'X-PWA-Source': 'SW-Emergency-SVG'
						}
					});
				}
			}
		}
	// 🖥️ SEZIONE V: DISPOSITIVO DI TOLLERANZA AI GUASTI (CRITICAL FALLBACK BLOCK)
    // Isola l'ambiente di runtime in caso di avaria totale (assenza di rete e di cache). Evita il crash
    // erogando l'interfaccia di cortesia sterile a tolleranza di guasto (503) con marcatura forense.
		if (!isImageRequest && isExcluded) {
			console.info("📦❌ SW: Recupero fallito per:", finalPath);
		}
		if (isCoreAsset && !isNewInstallation) {
			console.log(`📡❌ SW CORE: Rete off-line per risorsa critica -> ${finalPath}`);
			CoreAssets_Destroy_Caches();
		}
        if (isHTML) {
            return await generateErrorPage(globalPlaceholderBlob, url.pathname);
        }
        return new Response('📡🚫 Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
        });

    })());
});

/**
 * 📥🏛️ INSTALLAZIONE SW: Inizializzazione Core e Pre-Cache.
 * Dispone il caricamento forzato dei moduli di sistema e impone il bypass
 * dei tempi di attesa tramite self.skipWaiting() per l'allineamento immediato del Panzer.
 * @param {ExtendableEvent} e - Evento di installazione intercettato dal browser.
 */
self.addEventListener('install', (event) => {
	isNewInstallation = true;
    console.info("🛠️ SW: Installazione in corso...");
    event.waitUntil((async () => {
        const key = await getStoredKey();
        if (key) {
            console.info("🔑️ SW: Vault inizializzato durante l'installazione.");
        } else {
            console.info("⚠️ SW: Vault fallito, verrà ritentato all'attivazione.");
        }
		self.skipWaiting();
        await caches.open(CONFIG.cacheName);
        await caches.open(CONFIG.userCacheName);
    })());
});

/**
 * ⚡⚙️ ATTIVAZIONE SW: Bonifica Archivi e Sblocco Interfaccia.
 * Esegue il subentro immediato nei frontend attivi (clients.claim) e avvia
 * la purga automatica dei magazzini di cache obsoleti non conformi alla versione corrente.
 * @param {ExtendableEvent} e - Evento di attivazione del ciclo di vita.
 */
self.addEventListener('activate', (event) => {
	console.info("⚡ SW: attivazione...");
    event.waitUntil(
        Promise.all([

            caches.keys().then(keys => {
                return Promise.all(
                    keys.map(k => {
                        if (k !== CONFIG.cacheName && k !== CONFIG.userCacheName) {
							console.info(`🧹📦 SW: Remove Old cache version: ${k}`);
							return caches.delete(k);
                        }
                    })
                );
            }),

            (async () => {
				try {
					encryptionKey = await getStoredKey();
					console.info("🗄️✅ SW: Vault Unlock Ok.");
					console.info("🛡️🔍 SW: Check di Sicurezza...");
					await deepVaultValidation();
					console.info("🛡️✅ SW: Integrità Bunker confermata.");
					await cleanUserCache();
				} catch (err) {
					console.error("⚡🚨 SW: Erorre: ", err.message);
				}
            })()
        ]).then(() => self.clients.claim())
    );
});


self.addEventListener('online', () => {
    console.info("📡📶 SW: Rete rilevata! Pronto per nuovi comandi.");
});

/**
 * 🚨💾 GESTIONE EMERGENZA STORAGE: Risoluzione errore di quota superata.
 * Interviene quando il Service Worker rileva un errore di 'QuotaExceededError' causato dal riempimento dello spazio di archiviazione disponibile.
 * Avvia una procedura di emergenza per tentare la pulizia della cache utente e ripristinare la funzionalità del sistema.
 * Restituisce true se l'errore era di tipo QuotaExceeded (e la procedura è stata tentata), false altrimenti.
 * In caso di fallimento della procedura di pulizia, logga l'errore critico per il debug diagnostico e restituisce l'errore.
 * @param {Error} e - L'oggetto errore catturato che ha scatenato la procedura.
 * @returns {Promise<boolean|Error>} - True se l'errore è stato gestito, False se l'errore non era di quota, Error in caso di fallimento.
 */
const QuotaExceeded_User_Assets = async (e) => {
	if (e.name === 'QuotaExceededError') {
		console.log("🚨 SW: Storage Pieno!\n Emergency !\n🧹 cleanUserCache !");
		try {
			await cleanUserCache(true);
			await waitTillIdle(500);
			return true;
		} catch(err) {
			console.error("🧹❌ SW: Errore critico durante la pulizia della cache: ", err);
			return err;
		}
	} else {
		return false;
	}
};
Object.freeze(QuotaExceeded_User_Assets);

/**
 * 🗑️ EVACUAZIONE E AGGIORNAMENTO: Purga mirata dei file d'infrastruttura critica.
 * Interviene in caso di Major Update o disallineamento atomico per distruggere esclusivamente i Core Assets da tutte le cache di sistema.
 * Invia una notifica di emergenza in broadcast a tutti i client attivi imponendo il ricaricamento forzato (Reload) dell'applicazione.
 * Protegge il browser da attacchi di Denial of Service interni bloccando l'esecuzione se richiamata a distanza inferiore di 20 secondi dall'ultima esecuzione.
 * @param {string|null} [serverV=null] - Stringa identificativa della nuova versione telematica rilevata dal Radar del server.
 * @returns {Promise<void>}
 */
let lastReloadCommandTime = 0;
const CoreAssets_Destroy_Caches = async (serverV = null) => {
	const now = Date.now();
	if (now - lastReloadCommandTime < 20000) { return; }
	lastReloadCommandTime = now;
	try {
		const keys = await caches.keys();
		await Promise.all(keys.map(async (k) => {
			const cacheX = await caches.open(k);
			await Promise.all(Array.from(CORE_ASSETS_SET).map(asset => cacheX.delete(asset)));
		}));
		console.log("🗑️ SW: Asset core Distrutti con successo...");
		const allClients = await self.clients.matchAll();
		allClients.forEach(client => {
			client.postMessage({
				type: 'CORE_UPDATE_RELOAD',
				sSV: serverV,
				timestamp: now
			});
		});
	} catch (err) {
	    // 🏴‍☠️ ANTI-PROFILING:
	    const cleanErr = {};
		Object.defineProperties(cleanErr, {
			name: { value: "CacheEvacuationError", enumerable: true },
			message: { value: "Fallimento procedura di emergenza evacuazione", enumerable: true },
			stack: { value: undefined, configurable: false, writable: false, enumerable: false }
		});
		Object.freeze(cleanErr);
		console.error("🚫 SW: Fallimento Distruzione dei file [ ⚙️ CORE ] dalla cache.", cleanErr);
	}
};
Object.freeze(CoreAssets_Destroy_Caches);

/**
 * 💣🔥 PROCEDURA DISTRUTTIVA D'URGENZA: Tabula Rasa dei DATI.
 * Esegue l'epurazione perentoria e simultanea di tutti i segmenti di cache memorizzati
 * (Bunker e Magazzino) a seguito di un alert di sicurezza o violazione dei dati (Data Breach).
 * @param {string} reason - Verbale motivazionale che ha scatenato la purga di sistema.
 * @returns {Promise<boolean>} Conferma di avvenuta cancellazione dei registri locali.
 */
const Destroy_ALL_Caches = async (err = null) => {
	globalAbortController.abort();
    globalAbortController = new AbortController();
	console.error("💣 SW: Errore critico rilevato, Avvio Distruzione Totale!", err);
	const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    const allClients = await self.clients.matchAll();
	allClients.forEach(client => {
		client.postMessage({ type: 'CORE_UPDATE_RELOAD', msg: 'DESTROY_ALL_CACHE', msg_err: err });
	});
};
Object.freeze(Destroy_ALL_Caches);

/**
 * 🗄🐺️🐤 WATCHDOG DI SICUREZZA: Ispezione Forense dell'Integrità Crittografica.
 * Esegue un test di cifratura/decrittazione simmetrica (Canary Loopback) per rilevare violazioni hardware.
 * Integra una gara asincrona adattiva (Thermal Shield Race via waitTillIdle) per isolare falsi positivi di I/O.
 * @throws {Error} VAULT_COMPROMISED_AND_CLEANED - Se viene rilevata una violazione strutturale dei dati.
 */
const deepVaultValidation = async () => {
    let db = null;
    try {
        let realKey = null;
        let isIOStable = false;
         // 🎲 JITTERING: Calcola un tempo casuale tra 250ms e 600ms
        const randomTimeoutMs = Math.random() * (600 - 250) + 250;

        // ⏳💤  Il Timeout si adatta dinamicamente allo stress attuale dell'Event Loop
        const thermalShieldRace = (async () => {
            await waitTillIdle(200, Math.ceil(randomTimeoutMs));
            throw new Error("THERMAL_SHIELD_TIMEOUT");
        })();

        // 🏁 GARA ADATTIVA: L'operazione sul disco contro il respiro della CPU
        try {
            realKey = await Promise.race([
                (async () => {
                    db = await new Promise((resolve, reject) => {
                        const req = indexedDB.open("PWA_Vault", 1);
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(new Error("VAULT_DB_ACCESS_ERROR"));
                    });
                    const resKey = await new Promise((resolve, reject) => {
                        const tx = db.transaction("keys", "readonly");
                        const req = tx.objectStore("keys").get("master_key");
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(new Error("VAULT_KEY_READ_ERROR"));
                    });
                    db.close();
                    db = null;
                    return resKey;
                })(),
                thermalShieldRace
            ]);

            // Se IndexedDB vince la gara contro il respiro della CPU, il canale I/O è reattivo e stabile
            isIOStable = true;

        } catch (raceErr) {
            if (raceErr.message === "THERMAL_SHIELD_TIMEOUT") {
                console.warn("🌡️🛡️  SW: ️ THERMAL SHIELD\n L'Event Loop 🔁 o 1️⃣/0️⃣ sono saturi.\n 🚧 Sbarramento adattivo ✅.");
                isIOStable = false;
            } else {
                if (db) { try { db.close(); } catch(e){} db = null; }
                throw raceErr;
            }
        }

        // --- VERDETTO GEOMETRICO SULL'ASSENZA DELLA CHIAVE ---
        if (!realKey) {
            if (isIOStable) {
                // 🚨 SCENARIO ATTACCO (Test DevTools): Canale sano e reattivo, ma record rimosso dolosamente.
                console.error("🗄️🚨 SW: CANALE REATTIVO MA CHIAVE ASSENTE!\n Rilevata rimozione dolosa dal disco. 💾");
                throw new Error("VAULT_SECURITY_BREACH_INTEGRITY");
            } else {
                // FALSO POSITIVO: La CPU o il disco erano bloccati. Attivazione Bunker Shield protettivo.
                throw new Error("VAULT_EMPTY_TEMPORARY");
            }
        }

        // --- DECRITTAZIONE REGOLARE DEL CANARINO ---
        const canaryText = CONFIG.vaultCanaryText;
        const testKey = realKey;
        try {
            encryptionKey = testKey;
            const testBlob = new Blob([canaryText], { type: "text/plain" });
            const encryptedBlob = await encryptBlob(testBlob);
            const decryptedBuffer = await decryptBuffer(await encryptedBlob.arrayBuffer());
            const decryptedText = new TextDecoder().decode(decryptedBuffer);
            if (decryptedText !== canaryText) {
                throw new Error("VAULT_SECURITY_BREACH_INTEGRITY");
            }
            encryptionKey = testKey;
        } catch (cryptoErr) {
            encryptionKey = null;
            throw new Error("VAULT_SECURITY_BREACH_INTEGRITY");
        }

    } catch (err) {
        if (db) {
            try {
				db.close();
			} catch(e){
				// 🏴‍☠️ ANTI-PROFILING:
				if (typeof injectTimingNoise === 'function') await injectTimingNoise(performance.now(), 35);
			}
        }
        if (err.message === "VAULT_SECURITY_BREACH_INTEGRITY") {
            // 💣 EMERGENCY WIPE
            console.error("🗄️🚨 SW: INTEGRITÀ CRITTOGRAFICA FALLITA! - Avvio distruzione Dati...");
            try {
                await Destroy_ALL_Caches("VAULT_COMPROMISED");
                await new Promise((resolve) => {
                    const req = indexedDB.deleteDatabase("PWA_Vault");
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                });
                console.log("🗄️🔥 SW: Tabula rasa completata con successo.");
            } catch (purgErr) {
                console.error("🗄️⚠️ SW: Errore durante la purga del sistema:", purgErr);
            }
            encryptionKey = null;
            throw new Error("VAULT_COMPROMISED_AND_CLEANED");
        }
        console.error("🗄️⚠️ SW: Accesso Vault -> (Security Violation)");
        throw new Error("VAULT_TEMPORARILY_LOCKED");
    }
};
Object.freeze(deepVaultValidation);


/**
 * 🗄️⏳ VERIFICA: Controllo Temporizzato del Caveau.
 * Gestisce l'ancora temporale del Watchdog assicurando la validità della chiave a intervalli regolari.
 * @returns {Promise<boolean>} Esito dello stato di sblocco e integrità del caveau.
 */
let lastVaultCheck = 0;
let isCanaryLock = false;
const CHECK_INTERVAL = 300000;
const verifyVaultIntegrity = async () => {
    const now = Date.now();
    if (encryptionKey !== null && (now - lastVaultCheck < CHECK_INTERVAL)) return true;
    // 🛡️ CONTROLLO ADATTIVO ANTI-CONCORRENZA
    if (isCanaryLock) {
        if (encryptionKey !== null) return true;
        const inizioInseguimento = Date.now();
        const TIMEOUT_GUARDIA_MS = 8000;
        // Ciclo finché il primo thread non finisce e rilascia il lock
        while (isCanaryLock) {
            // Se superiamo gli 8 secondi di guardia totale, interrompiamo per evitare deadlock di sistema
            if (Date.now() - inizioInseguimento > TIMEOUT_GUARDIA_MS) {
                console.log("🗄🐺️🚨 SW: Timeout di guardia superato in coda di attesa!");
                break;
            }
            // applica la pausa proporzionale al carico hardware
            await waitTillIdle(200, 2000);
        }
        return encryptionKey !== null;
    }
    isCanaryLock = true;
    try {
        await deepVaultValidation();
        lastVaultCheck = Date.now();
        isCanaryLock = false;
        return true;
    } catch (err) {
        isCanaryLock = false;
        console.warn("🗄🐺️⚠️ SW: Validazione temporaneamente fallita: ", err.message);
        return false;
    }
};
Object.freeze(verifyVaultIntegrity);

/**
 * 🔑 GESTIONE STORAGE CHIAVI: Estrazione e Clonazione Strutturata.
 * Recupera l'oggetto CryptoKey opaco da IndexedDB o provvede alla generazione univoca via Web Crypto API.
 * @returns {Promise<CryptoKey|null>} L'istanza della chiave simmetrica non esportabile (extractable: false).
 */
const getStoredKey = async () => {
    if (encryptionKey !== null) return encryptionKey;
    return new Promise(async (resolve) => {
        try {
            const dbs = indexedDB.databases ? await indexedDB.databases() : [];
            const vaultExists = dbs.some(db => db.name === "PWA_Vault");
            const request = indexedDB.open("PWA_Vault", 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("keys")) {
                    db.createObjectStore("keys");
                }
            };
            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction("keys", "readwrite");
                const store = transaction.objectStore("keys");
                const getReq = store.get("master_key");
                getReq.onsuccess = async () => {
                    let key = getReq.result;
                    if (!key) {
                        if (vaultExists) {
							// 💥 FORENSIC ALERT: DB presente ma chiave assente. Possibile attacco di estrazione forzata. Blocco dell'istanza.
                            console.error("⚠️💣 ANOMALIA CRITICA: Vault compromesso, chiave sparita!");
                            encryptionKey = null;
                            db.close();
                            resolve(null);
                            return;
                        }
                        console.info("🔑 SW: Primo avvio, inizializzazione chiave...");
                        key = await crypto.subtle.generateKey(
                            { name: "AES-GCM", length: 256 },
                            false,
                            ["encrypt", "decrypt"]
                        );
                        store.put(key, "master_key");
                    }
                    encryptionKey = key;
                    transaction.oncomplete = () => db.close();
                    resolve(key);
                };
                getReq.onerror = async () => {
					// 🏴‍☠️ ANTI-PROFILING:
					if (typeof injectTimingNoise === 'function') await injectTimingNoise(performance.now(), 40);
                    console.info("❌ SW: Errore lettura store chiavi");
                    db.close();
                    resolve(null);
                };
            };
            request.onerror = async (err) => {
                // 🏴‍☠️ ANTI-PROFILING:
                if (typeof injectTimingNoise === 'function') await injectTimingNoise(performance.now(), 40);
                console.info("❌ SW: Errore apertura IndexedDB Vault");
                resolve(null);
            };
        } catch (criticalErr) {
            // 🏴‍☠️ ANTI-PROFILING:
			if (typeof injectTimingNoise === 'function') await injectTimingNoise(performance.now(), 40);
            const cleanErr = {};
            Object.defineProperties(cleanErr, {
			name: { value: "Vault-Critical-Error", enumerable: true },
			message: { value: "Fallimento Critico Apertura del Vault", enumerable: true },
			stack: { value: undefined, configurable: false, writable: false, enumerable: false }
            });
            Object.freeze(cleanErr);
            console.error("❌ SW: Fallimento critico sistema Vault", cleanErr);
            encryptionKey = null;
            resolve(null);
        }
    });
};
Object.freeze(getStoredKey);

/**
 * 🔐 ARCHITETTURA BUNKER: Cifratura asincrona dei flussi di memoria.
 * Cifra un Blob tramite algoritmo simmetrico AES-GCM a 256 bit e ripulisce la RAM tramite .fill(0).
 * @param {Blob} blob - Il file binario grezzo da sottoporre a cifratura.
 * @returns {Promise<Blob>} Il pacchetto protetto unificato contenente [12B IV + Ciphertext].
 */
const encryptBlob = async (blob) => {
    if (!encryptionKey) {
       throw new Error("CRYPTO_KEY_UNAVAILABLE_IN_RAM");
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    let buffer = await blob.arrayBuffer();
    let ciphertext = null;
    let combined = null;
    try {
        ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            encryptionKey,
            buffer
        );
		// 🚨 ZERO-TRUST: Sovrascrittura immediata del plaintext in RAM per prevenire Memory Inspection di terze parti.
        new Uint8Array(buffer).fill(0);
        buffer = null;

        combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        const outBlob = new Blob([combined], { type: blob.type });

        combined.fill(0);
        combined = null;
        ciphertext = null;

        return outBlob;
    } catch (err) {
        console.error("❌🛡️ SW: Errore durante la cifratura del file.");
        if (buffer instanceof ArrayBuffer) new Uint8Array(buffer).fill(0);
        if (combined instanceof Uint8Array) combined.fill(0);
        throw err;
    }
};
Object.freeze(encryptBlob);

/**
 * 🔓 DISPOSITIVO DECRITTAZIONE: Ripristino Flussi protetti estratti da Bunker.
 * Isola il vettore IV da 12 byte, decifra il payload e azzera immediatamente i buffer cifrati di transito.
 * @param {ArrayBuffer} buffer - Il blocco binario grezzo estratto dalla stiva cache.
 * @returns {Promise<ArrayBuffer>} Il buffer plaintext decifrato pronto per l'erogazione sterile al frontend.
 */
const decryptBuffer = async (buffer) => {
    if (!encryptionKey) {
        throw new Error("CRYPTO_KEY_UNAVAILABLE_IN_RAM");
    }
    let data = new Uint8Array(buffer);
    try {
        const iv = data.subarray(0, 12);
        const ciphertext = data.subarray(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            encryptionKey,
            ciphertext
        );
		// 🚨 ZERO-TRUST: Distruzione perentoria del buffer cifrato originale dopo il completamento della decrittazione.
        data.fill(0);
        data = null;

        return decrypted;
    } catch (err) {
        console.error("❌🛡️ SW: Fallimento decrittazione.\nDati non integri o chiave errata.");
        if (data) data.fill(0);
        throw new Error("VAULT_LOCKED_DECRYPTION", { cause: err });
    }
};
Object.freeze(decryptBuffer);

/**
 * 🧬 INTEGRITÀ FORENSE: Calcolo dell'Impronta Digitale (Checksum).
 * Genera l'hash esadecimale univoco di un blocco dati binario tramite le librerie native Web Crypto API.
 * Garantisce la bonifica immediata della memoria RAM (Zero-Trust) sovrascrivendo il buffer plaintext transitorio tramite fill(0).
 * @param {Blob} blob - Il flusso binario grezzo sul quale calcolare l'impronta digitale di integrità.
 * @param {string} [algo='SHA-256'] - Algoritmo di hashing normato standard per il calcolo ('SHA-256' | 'SHA-384' | 'SHA-512').
 * @returns {Promise<string|null>} Stringa esadecimale rappresentante il checksum dell'asset, o null in caso di fallimento critico.
 */
const getHash = async (blob, algo = 'SHA-256') => {
    let buffer = null;
    let hashBuffer = null;
    try {
        buffer = await blob.arrayBuffer();
        hashBuffer = await crypto.subtle.digest(algo, buffer);

        new Uint8Array(buffer).fill(0);
        buffer = null;

        const hashArray = new Uint8Array(hashBuffer);
        const hashHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return hashHex;
    } catch (err) {
        // 🏴‍☠️ ANTI-PROFILING:
		if (typeof injectTimingNoise === 'function') await injectTimingNoise(performance.now(), 35);
        const cleanHashErr = {};
        Object.defineProperties(cleanHashErr, {
            name: { value: "HashCalculationError", enumerable: true },
            message: { value: "Impossibile processare impronta digitale", enumerable: true },
            stack: { value: undefined, configurable: false, writable: false, enumerable: false }
        });
        Object.freeze(cleanHashErr);
        console.error("🧬❌ SW: Errore calcolo Hash:", cleanHashErr);
        if (buffer instanceof ArrayBuffer) new Uint8Array(buffer).fill(0);
        return null;
    }
};
Object.freeze(getHash);

/**
 * 🧹 MANUTENZIONE ORDINARIA: Purga selettiva e monitoraggio dello spazio di archiviazione (TTL).
 * Analizza le intestazioni di tracciabilità 'X-PWA-Date' per eliminare dal Magazzino i file che hanno superato il Time-To-Live massimo di 7 giorni.
 * In caso di saturazione dello storage (QuotaExceededError) o comando di sicurezza, esegue d'ufficio la tabula rasa radicale dell'intera userCache.
 * @param {boolean} [forceAll=false] - Se impostato su true, forza l'azzeramento perentorio e immediato di tutto il Magazzino senza controlli temporali.
 * @returns {Promise<void>}
 */
const cleanUserCache = async (forceAll = false) => {
    const cache = await caches.open(CONFIG.userCacheName);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = (CONFIG.userCacheTTL * 24 * 60 * 60 * 1000);
    for (const request of requests) {
        if (forceAll) {

            await cache.delete(request);
            continue;
        }

        const response = await cache.match(request);
        const date = response?.headers.get('X-PWA-Date');
        if (date && (now - parseInt(date, 10)) > maxAge) {
            console.info(`📜📦 SW: TTL Scaduto, Del: ${request.url}`);
            await cache.delete(request);
        }
    }
    if (forceAll) {
        console.info("🧹 SW: UserCache svuotata, recupera spazio critico.");
    }
};
Object.freeze(cleanUserCache);

/**
 * 🖥️🚨 INTERFACCIA DI CORTESIA: Generatore Statico Fallback Digitale (503).
 * Rilascia al frontend un documento HTML sterile d'emergenza in modalità provvisoria Della Risorsa Non Trovata.
 * @param {string} logoBlob - Blob di byte del logo dell Ente, se null inserisce un generica imagine Icona (!) rossa.
 * @param {string} failedPath - URI telematico della risorsa che ha generato il blocco.
 * @returns {Promise<Response>} Flusso HTML di cortesia iniettato con header di sicurezza.
 */
const generateErrorPage = async(logoBlob, failedPath) => {
    const svgNewLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+";
    let imgContent = svgNewLogo;

    if (logoBlob instanceof Blob) {
        try {
            imgContent = await new Promise((res) => {
                const r = new FileReader();
                r.onloadend = () => res(r.result);
                r.readAsDataURL(logoBlob);
            });
        } catch (e) {
			// 🏴‍☠️ ANTI-PROFILING:
			const cleanAssetErr = {};
			Object.defineProperties(cleanAssetErr, {
				name: { value: "AssetLoadingError", enumerable: true },
				message: { value: "Fallimento decodifica risorsa grafica di fallback", enumerable: true },
				stack: { value: undefined, configurable: false, writable: false, enumerable: false }
			});
			Object.freeze(cleanAssetErr);
			console.warn("⚠️ SW: ErrorPage B64 Not Blob...", cleanAssetErr);
		}
    }
    const p = decodeURIComponent(failedPath || '???');
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#000;font-family:sans-serif;color:#fff;overflow:hidden}.box{width:95vw;height:95vh;border:2px solid red;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;box-sizing:border-box;padding:20px}h2{color:#ff4444;margin:5px 0;font-size:1.2rem}p{color:#bbb;font-style:italic;margin:2px 0;font-size:0.9rem}small{color:#aaa;margin-top:25px;font-size:0.65rem;word-break:break-all;max-width:90%;border-top:1px solid #222;padding-top:10px}img{max-width:140px;max-height:30vh;margin-bottom:20px;object-fit:contain}</style></head><body><div class="box"><img src="${imgContent}"><h2>Risorsa non disponibile &#x1F4E1;&#x274C;</h2><h2>Resource not available &#x1F4E1;&#x274C;</h2><small>&#x1F4C4;&#x274C; ${p}</small></div></body></html>`;
    return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }});
};
Object.freeze(generateErrorPage);
