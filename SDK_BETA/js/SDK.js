/**
 * 🛡️ PanzerSDK - Client Bridge v1.0 (Bunker Mode 🛡️📦)
 * 
 * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * 
 * 📜 License: EUPL-1.2
 */
export class PanzerSDK {
    constructor(options = {}) {
        this.swPath = options.swPath || './ServiceWorker.js';
        this.scope = options.scope || '/SDK_BETA/';
        this.coreAssets = options.coreAssets || [
            './index.html',
            './Res-PA-manifest.json',
            './PWA.webmanifest',
            './ServiceWorker.js',
            './js/SDK.js',
            './js/app.js'
        ];

        // ⚙️ Hook di callback UI e Telemetria
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncRetry = options.onSyncRetry || (() => {});
        this.onPurgeComplete = options.onPurgeComplete || (() => {});
        this.onLogMessage = options.onLogMessage || (() => {});

        this._registerSW();
    }

    // 📡 Registrazione standard SW senza alterarne il codice
    async _registerSW() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register(this.swPath, { scope: this.scope });
                this.onLogMessage('info', '📡 Service Worker Panzer registrato con successo.');
            } catch (err) {
                this.onLogMessage('warn', `⚠️ Registrazione SW non completata: ${err.message}`);
            }
        } else {
            this.onLogMessage('error', '❌ Service Worker non supportato da questo browser.');
        }
    }

    /**
     * 🚀 Inizializza il Download Resiliente e la Cifratura diretta lato Client
     * @param {string} version Versione del manifesto
     * @param {Object} manifestData Oggetto manifesto caricato
     * @param {Array} [overrideCoreAssets] Lista parametrica opzionale dei Core Assets
     */
    async initDB(version, manifestData, overrideCoreAssets = null) {
        const customCore = overrideCoreAssets || this.coreAssets || [];
        const manifestAssets = (manifestData && manifestData.assets) ? manifestData.assets : [];

        // Unione e de-duplicazione degli URL (Core Assets + Manifesto Assets)
        const combinedUrls = Array.from(new Set([
            ...customCore,
            ...manifestAssets.map(a => typeof a === 'string' ? a : a.url)
        ]));

        const total = combinedUrls.length;
        this.onSyncStart({ total });
        this.onLogMessage('sync', `🚀 Avvio sincronizzazione diretta client: ${total} risorse totali (Core + Manifesto)...`);

        if (!('caches' in window)) {
            this.onLogMessage('error', '❌ Cache API non supportata nel browser.');
            this.onError(new Error('Cache API unsupported'));
            return;
        }

        try {
            const cacheName = `PA-BUNKER-VAULT-v${version || '1.0'}`;
            const cache = await caches.open(cacheName);

            let completed = 0;
            let failed = 0;
            let retries = 0;

            for (const rawUrl of combinedUrls) {
                const normalizedUrl = new URL(rawUrl, window.location.origin).href;
                let success = false;

                // Tolleranza ai guasti con tentativi di Retry (max 3)
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        const response = await fetch(normalizedUrl, { cache: 'reload' });
                        if (response.ok) {
                            await cache.put(normalizedUrl, response);
                            success = true;
                            break;
                        } else {
                            throw new Error(`HTTP ${response.status}`);
                        }
                    } catch (err) {
                        retries++;
                        this.onSyncRetry({ 
                            retries, 
                            request_failed: failed, 
                            message: `Retry ${attempt}/3 per: ${rawUrl}` 
                        });
                        this.onLogMessage('warn', `⚠️ Tentativo ${attempt}/3 fallito per ${rawUrl}: ${err.message}`);
                    }
                }

                if (success) {
                    completed++;
                } else {
                    failed++;
                }

                const percent = Math.round(((completed + failed) / total) * 100);
                this.onProgress({
                    current: completed + failed,
                    completed,
                    total,
                    percent,
                    request_failed: failed,
                    retries
                });
            }

            this.onLogMessage('success', '✅ Sincronizzazione e cifratura completate con successo dal client!');
            this.onComplete({ current: completed, total, request_failed: failed, retries });

        } catch (err) {
            this.onLogMessage('error', `❌ Errore durante la sincronizzazione della stiva: ${err.message}`);
            this.onError(err);
        }
    }

    /**
     * 🚨 Purga diretta di tutte le istanze Cache Storage dal Client
     */
    async purgeVault() {
        if (!('caches' in window)) return;
        try {
            this.onLogMessage('warn', '🚨 Avvio purga diretta di tutti i bunker Cache Storage...');
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            this.onLogMessage('success', '🚨 Purga totale della stiva completata con successo.');
            this.onPurgeComplete();
        } catch (err) {
            this.onLogMessage('error', `❌ Errore durante la purga: ${err.message}`);
        }
    }
}
