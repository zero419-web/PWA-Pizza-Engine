/**
 * 🛡️ PanzerSDK - Beta v1.0
 * 
 * Client Bridge v1.3 ( Bunker Mode 🛡️📦 )
 * 
 * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * 
 * 📜 License: EUPL-1.2
 */
export class PanzerSDK {
    constructor(options = {}) {
        this.swPath = options.swPath || './ServiceWorker.js';
        this.scope = options.scope || './';
        this.coreAssets = options.coreAssets || [
            './index.html',
            './Res-PA-manifest.json',
            './PWA.webmanifest',
            './ServiceWorker.js',
            './js/SDK.js',
            './js/app.js'
        ];

        // ⏱️ Timeout del Watchdog configurabile e modificabile nel tempo tramite le opzioni dell'SDK
        this.checkTimeout = options.checkTimeout || 5000;

        // 🎛️ Parametri di soglia quota configurabili e modificabili nel tempo tramite le opzioni dell'SDK
        this.quotaLimits = options.quotaLimits || {
            mobileMin: 2000,
            mobileMax: 2400,
            desktopMax: 5000
        };

        // 🛑 Configurazione dinamica personalizzabile per l'overlay Anti-Incognito (Contenuto, Colori e Azioni)
        this.incognitoBlocker = {
            Icons: options.incognitoBlocker?.CardIcon || '🕵️⚠️',
            ID: options.incognitoBlocker?.blockerID || 'panzer-incognito-blocker',
            title: options.incognitoBlocker?.title || "Modalità Incognito Rilevata",
            message: options.incognitoBlocker?.message || "Il motore di sicurezza e la stiva resiliente <strong>PANZER SDK</strong> non possono operare in ambienti di navigazione in incognito o sandbox restrittive su Chromium a causa delle limitazioni di persistenza dei dati.<br><br>Per utilizzare correttamente l'applicazione e garantire la continuità operativa, <strong>apri questa pagina in una finestra di navigazione normale</strong>.",
            buttonText: options.incognitoBlocker?.buttonText || "Ho capito, ricarica in modalità normale",
            buttonAction: options.incognitoBlocker?.buttonAction || (() => window.location.reload()),
            overlayBg: options.incognitoBlocker?.overlayBg || "rgba(15, 23, 42, 0.95)",
            cardBg: options.incognitoBlocker?.cardBg || "#1e293b",
            borderColor: options.incognitoBlocker?.borderColor || "#334155",
            titleColor: options.incognitoBlocker?.titleColor || "#f87171",
            textColor: options.incognitoBlocker?.textColor || "#94a3b8",
            buttonBg: options.incognitoBlocker?.buttonBg || "#3b82f6",
            buttonTextCol: options.incognitoBlocker?.buttonTextCol || "#ffffff"
        };

        // ⚙️ Hook di callback UI e Telemetria
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncRetry = options.onSyncRetry || (() => {});
        this.onPurgeComplete = options.onPurgeComplete || (() => {});
        this.onLogMessage = options.onLogMessage || (() => {});

        this._registerSW();
        
        // 🕵️‍♂️ Avvio automatico del watchdog ambientale e anti-incognito all'istanza dell'SDK usando il timeout configurabile
        this.initPwaEnvironmentCheck(this.checkTimeout);
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
     * 🕵️‍♂️ WATCHDOG AMBIENTALE: Rilevamento Incognito e Restrizioni Storage su Chromium
     * @param {number} timeoutMs Tempo limite di attesa per gli eventi di installazione (configurabile)
     */
    async initPwaEnvironmentCheck(timeoutMs) {
        if (!('serviceWorker' in navigator)) return;

        const os = this._getMobileOS();
        if (os === 'iOS') return;

        let profile;
        try {
            profile = await this._getFullBrowserProfile();
        } catch (e) {
            profile = { brands: [] };
        }

        const isChromium = profile.brands?.some(item =>
            item.brand.toLowerCase().includes('chrome') ||
            item.brand.toLowerCase().includes('chromium')
        ) || false;

        let estimate;
        try {
            estimate = await navigator.storage.estimate();
        } catch (err) {
            estimate = { quota: 0 };
        }
        
        const qMB = Math.round(estimate.quota / (1024 * 1024));

        // 📐 Valutazione dinamica basata sulle variabili di quota configurabili nell'istanza
        const limits = this.quotaLimits;
        let isSuspiciousQuota = (qMB >= limits.mobileMin && qMB <= limits.mobileMax);
        if (isChromium) {
            if (os === 'Android') {
                isSuspiciousQuota = (qMB >= limits.mobileMin && qMB <= limits.mobileMax);
            } else if (os === 'Desktop') {
                isSuspiciousQuota = (qMB < limits.desktopMax);
            }
        }

        const pwaEventRace = new Promise((resolve) => {
            const timer = setTimeout(() => {
                window.removeEventListener('beforeinstallprompt', eventHandler);
                resolve(false);
            }, timeoutMs);

            const eventHandler = (e) => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', eventHandler);
                e.preventDefault();
                window.deferredPrompt = e;
                resolve(true);
            };
            window.addEventListener('beforeinstallprompt', eventHandler);
        });

        const savedPoint = localStorage.getItem('pwa_check_point');
        const now = Date.now();

        if (savedPoint !== null) {
            const diffMinutes = (now - parseInt(savedPoint)) / (1000 * 60);
            if (diffMinutes > 60) return;
        } else {
            try {
                localStorage.setItem('pwa_check_point', now);
            } catch (e) {}

            if (isSuspiciousQuota) {
                setTimeout(() => {
                    if (isChromium) {
                        this._showIncognitoBlocker();
                    }
                }, 3000);
                return;
            }
        }

        let installEventTriggered = await pwaEventRace;
        const PWAisInstall = localStorage.getItem('pwa_app_Isinstall');

        if (isSuspiciousQuota && !installEventTriggered) {
            this.onLogMessage('warn', "PWA: Rilevata modalità Incognito / Sandbox restrittiva su Chromium.");
            if (isChromium && !PWAisInstall) {
                this._showIncognitoBlocker();
            }
        }
    }

    /**
     * 🛑 INTERFACCIA VISIVA DI BLOCCO (Anti-Incognito Overlay personalizzabile)
     */
    _showIncognitoBlocker() {
        const cfg = this.incognitoBlocker;
        if (document.getElementById(cfg.ID)) return;
        const blocker = document.createElement('div');
        blocker.id = cfg.ID;
        blocker.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: ${cfg.overlayBg}; z-index: 999999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            max-width: 500px; background: ${cfg.cardBg}; border: 1px solid ${cfg.borderColor}; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        `;

        card.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">${cfg.Icons}</div>
            <h2 style="color: ${cfg.titleColor}; margin-bottom: 12px; font-size: 22px;">${cfg.title}</h2>
            <p style="color: ${cfg.textColor}; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                ${cfg.message}
            </p>
        `;

        const button = document.createElement('button');
        button.textContent = cfg.buttonText;
        button.style.cssText = `
            background: ${cfg.buttonBg}; color: ${cfg.buttonTextCol}; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;
        `;
        button.onclick = () => {
            if (typeof cfg.buttonAction === 'function') {
                cfg.buttonAction();
            } else {
                window.location.reload();
            }
        };

        card.appendChild(button);
        blocker.appendChild(card);
        document.body.appendChild(blocker);
    }

    /**
     * 🧬 UTILITY PROFILO: Recupero dettagliato dei Client Hints del browser
     */
    async _getFullBrowserProfile() {
        let profile = { userAgent: navigator.userAgent, isHighEntropyDataAvailable: false, details: {} };
        if (navigator.userAgentData) {
            try {
                profile.details = await navigator.userAgentData.getHighEntropyValues([
                    "architecture", "model", "platform", "platformVersion", "fullVersionList", "bitness"
                ]);
                profile.isHighEntropyDataAvailable = true;
                profile.brands = navigator.userAgentData.brands;
                profile.mobile = navigator.userAgentData.mobile;
            } catch (error) {
                this.onLogMessage('error', `Errore nel recupero dei Client Hints: ${error.message}`);
            }
        }
        return profile;
    }

    /**
     * 📱 UTILITY OS: Riconoscimento rapido della piattaforma mobile o desktop
     */
    _getMobileOS() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
        if (/android/i.test(ua)) return 'Android';
        return 'Desktop';
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
