/**
 * ⚡ App Controller - Dashboard PA & Gestione UI
 * v1.9.3
 *
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * * 📜 License: EUPL-1.2
 */
import { PanzerSDK } from './SDK.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ⚙️ Funzione Parametrica per definire i Core Assets
    const getDefinedCoreAssets = () => [
        './',
        './index.html',
        './js/pdf_min.js',
        './js/pdf_worker_min.js',
        './js/app.js',
        './js/SDK.js',
        './ServiceWorker.js',
        './PA_PWA.webmanifest',
        './icon.png',
        './Res-PA-manifest.json'
    ];
    const getDefined_scope = '/PWA-Pizza-Engine/SDK_BETA/';
    const getDefined_swPath = './ServiceWorker.js';
    
    // 🎯 DOM UI Elements
    const statusBadge = document.getElementById('PA-status-badge');
    const btnSync = document.getElementById('PA-btn-sync');
    const btnPurge = document.getElementById('PA-btn-purge');
    const btnClearLog = document.getElementById('PA-btn-clear-log');
    const btnRefreshStorage = document.getElementById('PA-btn-refresh-storage');

    const progressBar = document.getElementById('PA-progress-bar');
    const progressText = document.getElementById('PA-progress-text');

    const metricCompleted = document.getElementById('metric-completed');
    const metricTotal = document.getElementById('metric-total');
    const metricFailed = document.getElementById('metric-failed');
    const metricRetries = document.getElementById('metric-retries');

    const terminalOutput = document.getElementById('PA-terminal-output');
    const storageTbody = document.getElementById('PA-storage-tbody');
    const storageSearch = document.getElementById('PA-storage-search');
    const toggleCoreAssets = document.getElementById('PA-toggle-core-assets');

    // 🔒 Modal Sandbox CSP & Zoom
    const sandboxModal = document.getElementById('PA-sandbox-modal');
    const sandboxFrame = document.getElementById('PA-sandbox-frame');
    const sandboxTitle = document.getElementById('PA-sandbox-title');
    const btnCloseSandbox = document.getElementById('PA-btn-close-sandbox');
    const btnZoomIn = document.getElementById('PA-btn-zoom-in');
    const btnZoomOut = document.getElementById('PA-btn-zoom-out');

    let manifestCache = null;
    let activeObjectUrl = null;
    let activeWorkerObjectUrl = null;
    let currentZoom = 1.0;
    let totalCombinedCount = 0;

    const logToTerminal = (level, text) => {
        const timeString = new Date().toLocaleTimeString('it-IT', { hour12: false });
        const line = document.createElement('div');
        const classMap = {
            info: 'log-info',
            success: 'log-success',
            warn: 'log-warn',
            error: 'log-error',
            sync: 'log-sync',
            vault: 'log-vault'
        };
        line.className = `terminal-line ${classMap[level] || 'log-info'}`;
        line.textContent = `[${timeString}] ${text}`;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const setStatusBadge = (stateText, badgeClass) => {
        statusBadge.textContent = stateText;
        statusBadge.className = `badge-status ${badgeClass}`;
    };

    // 🔍 Helper per l'inferenza del MIME Type in assenza di header corretti
    const detectMimeType = (url, headerType) => {
        if (headerType && headerType !== 'application/octet-stream' && headerType !== 'text/plain') {
            return headerType;
        }
        const ext = url.split('.').pop().toLowerCase();
        const mimeMap = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'pdf': 'application/pdf'
        };
        return mimeMap[ext] || headerType || 'application/octet-stream';
    };

    // 🔍 Zoom dinamico per PDF (Canvas)
    const applyZoom = () => {
        try {
            const iframeDoc = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;
            const canvases = iframeDoc.querySelectorAll('canvas');
            if (canvases.length > 0) {
                canvases.forEach(canvas => {
                    const baseW = parseFloat(canvas.dataset.baseWidth);
                    const baseH = parseFloat(canvas.dataset.baseHeight);
                    if (baseW && baseH) {
                        canvas.style.width = (baseW * currentZoom) + 'px';
                        canvas.style.height = (baseH * currentZoom) + 'px';
                    }
                });
                logToTerminal('vault', `🔍 Zoom visore PDF impostato al ${Math.round(currentZoom * 100)}%`);
            }
        } catch (e) {
            console.warn("Zoom custom limitato o non applicabile a questo tipo di risorsa.", e);
        }
    };

    // Gestori eventi Zoom
    btnZoomIn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.25, 3.0);
        applyZoom();
    });

    btnZoomOut.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.25, 0.5);
        applyZoom();
    });

        // 🔒 Visore Sandbox.
    const openInSandbox = async (url, fileName) => {
        try {
            currentZoom = 1.0;
            logToTerminal('vault', `🫙🔒 Apertura visore sicuro per: ${fileName || url}`);
            
            let response = null;
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    const cache = await caches.open(name);
                    response = await cache.match(url) 
                             || await cache.match(url.replace('./', '')) 
                             || await cache.match(window.location.origin + url.replace('.', ''));
                
                    if (response) {
                        logToTerminal('success', `🟢 Trovato in cache (${name}) per: ${url}`);
                        break;
                    }
                }
            }
            if (!response) {
                logToTerminal('warn', `⚠️ Risorsa non in cache, recupero di rete: ${url}`);
                response = await fetch(url);
            }
            if (!response || !response.ok) throw new Error(`HTTP ${response?.status || 'Risorsa irreperibile'}`);

            const blob = await response.blob();
            const rawMime = response.headers.get('Content-Type') || blob.type;
            const mimeType = detectMimeType(url, rawMime);

            if (activeObjectUrl) {
                URL.revokeObjectURL(activeObjectUrl);
            }
            activeObjectUrl = URL.createObjectURL(blob);

            let renderedContentHtml = '';

            // 🖼️ 1. GESTIONE IMMAGINI
            if (mimeType.startsWith('image/')) {
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html lang="it">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            html, body {
                                width: 100%;
                                height: 100%;
                                background-color: #090d16;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: auto;
                                -webkit-overflow-scrolling: touch;
                            }
                            .container {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                padding: 10px;
                            }
                            img {
                                max-width: 100%;
                                max-height: 100%;
                                object-fit: contain;
                                border-radius: 4px;
                                box-shadow: 0 4px 25px rgba(0,0,0,0.8);
                            }
                        </style>
                    </head>
                    <body oncontextmenu="return false;">
                        <div class="container">
                            <img src="${activeObjectUrl}" alt="Immagine Protetta" />
                        </div>
                    </body>
                    </html>
                `;
            } else if (mimeType.includes('pdf')) {
                // 📄 2. GESTIONE PDF
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html lang="it">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            html, body {
                                width: 100%;
                                height: 100%;
                                background-color: #0f172a;
                                overflow: hidden;
                            }
                            embed, object {
                                width: 100%;
                                height: 100%;
                                border: none;
                            }
                            .fallback {
                                color: #f8fafc;
                                font-family: sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100%;
                                text-align: center;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body oncontextmenu="return false;">
                        <object data="${activeObjectUrl}" type="application/pdf">
                            <embed src="${activeObjectUrl}" type="application/pdf" />
                            <div class="fallback">
                                <p>Il tuo browser non supporta la visualizzazione diretta dei PDF. <br><a href="${activeObjectUrl}" target="_blank" style="color: #60a5fa;">Scarica il documento</a></p>
                            </div>
                        </object>
                    </body>
                    </html>
                `;
            } else {
                // 📄 3. FALLBACK GENERICO
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html lang="it">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { background: #090d16; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin:0; }
                        </style>
                    </head>
                    <body>
                        <p>Formato risorsa non visualizzabile direttamente.</p>
                    </body>
                    </html>
                `;
            }

            sandboxFrame.removeAttribute('sandbox');
            sandboxFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
            sandboxFrame.src = 'about:blank';
            sandboxFrame.srcdoc = renderedContentHtml;

            sandboxTitle.textContent = `🔎🔒 Visore Sicuro \n ${fileName || url}`;
            sandboxModal.classList.add('active');

            logToTerminal('success', `🛡️ Risorsa aperta correttamente nel visore.`);
        } catch (err) {
            logToTerminal('error', `❌ Errore apertura visore: ${err.message}`);
        }
    };

    const closeSandbox = () => {
        sandboxModal.classList.remove('active');
        sandboxFrame.srcdoc = '';
        sandboxFrame.src = 'about:blank';

        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
        if (activeWorkerObjectUrl) {
            URL.revokeObjectURL(activeWorkerObjectUrl);
            activeWorkerObjectUrl = null;
        }
        logToTerminal('info', '🔒 Visore Sandbox CSP chiuso.');
    };

    btnCloseSandbox.addEventListener('click', closeSandbox);

    // 🚀 Inizializzazione SDK con Passaggio Parametrico dei Core Assets
    const sdk = new PanzerSDK({
        swPath: getDefined_swPath,
        scope: getDefined_scope,
        coreAssets: getDefinedCoreAssets(),
        checkTimeout: 6660,
        incognitoBlocker: {
            Icons: `⚠️ ❌🕵️`,
            ID: 'PA_popup_Incognite',
            title: "Modalità Protetta Richiesta",
            message: "Il sistema di sicurezza <strong>🪖 PANZER SDK</strong> richiede una sessione di navigazione standard per garantire la persistenza dei documenti della Pubblica Amministrazione.<br><br>Ti invitiamo ad aprire l'applicazione in una <strong>finestra di navigazione normale</strong>.",
            buttonText: "🔄 Ricarica in modalità normale",
            buttonAction: () => {
                localStorage.removeItem('pwa_check_point');
                window.location.reload();
            },
            overlayBg: "rgba(15, 23, 42, 0.98)",
            cardBg: "#1e293b",
            borderColor: "#475569",
            titleColor: "#f87171",
            textColor: "#cbd5e1",
            buttonBg: "#2563eb",
            buttonTextCol: "#ffffff"
        },
        onLogMessage: (level, msg) => logToTerminal(level, msg),
        onSyncStart: () => {
            setStatusBadge('⚡ Sincronizzazione...', 'badge-sync');
            const coreCount = getDefinedCoreAssets().length;
            const totalFiles = totalCombinedCount > 0 ? totalCombinedCount : coreCount;
            metricTotal.textContent = totalFiles;
            metricCompleted.textContent = '0';
            progressBar.value = 0;
            progressText.textContent = `0% ( 0 / ${totalFiles} )`;
        },
        onProgress: (details) => {
            if (details) {
                const coreCount = getDefinedCoreAssets().length;
                const grandTotal = totalCombinedCount > 0 ? totalCombinedCount : (coreCount + (details.total || 0));
                const completedTotal = coreCount + (details.current || 0);
                const pct = grandTotal > 0 ? Math.min(100, Math.round((completedTotal / grandTotal) * 100)) : (details.percent ? Math.round(details.percent) : 0);

                progressBar.value = pct;
                progressText.textContent = `${pct}% ( ${completedTotal} / ${grandTotal} )`;

                metricCompleted.textContent = completedTotal;
                metricTotal.textContent = grandTotal;
                metricFailed.textContent = details.request_failed || 0;
                metricRetries.textContent = details.retries || 0;
            }
        },
        onSyncRetry: (details) => {
            setStatusBadge('🔄 Retry Rete...', 'badge-warn');
            if (details) {
                if (details.retries !== undefined) metricRetries.textContent = details.retries;
                if (details.request_failed !== undefined) metricFailed.textContent = details.request_failed;
            }
        },
        onComplete: (data) => {
            progressBar.value = 100;
            progressText.textContent = '100% ( Completato )';
            setStatusBadge('🛡️🗄️ Stiva Pronta', 'badge-ready');
            const grandTotal = totalCombinedCount > 0 ? totalCombinedCount : getDefinedCoreAssets().length;
            metricCompleted.textContent = grandTotal;
            metricTotal.textContent = grandTotal;
            if (data) {
                metricFailed.textContent = data.request_failed || 0;
                metricRetries.textContent = data.retries || 0;
            }
            renderStorageTable();
        },
        onPurgeComplete: () => {
            progressBar.value = 0;
            progressText.textContent = '0% ( 0 / 0 )';
            metricCompleted.textContent = '0';
            metricTotal.textContent = '0';
            metricFailed.textContent = '0';
            metricRetries.textContent = '0';
            setStatusBadge('🗑️⚡ Purgato', 'badge-init');
            renderStorageTable();
        },
        onError: (err) => {
            setStatusBadge('🚨 Errore Sync', 'badge-error');
        }
    });

    // 📂 Rendering Tabella Ispezione Stiva
    const renderStorageTable = async () => {
        const showCore = toggleCoreAssets ? toggleCoreAssets.checked : true;

        const coreAssetObjects = showCore ? getDefinedCoreAssets().map(url => {
            let mime = 'text/plain';
            if (url.endsWith('.js')) mime = 'application/javascript';
            else if (url.endsWith('.html') || url === '/') mime = 'text/html';
            else if (url.endsWith('.json') || url.endsWith('.webmanifest')) mime = 'application/json';
            else if (url.endsWith('.png')) mime = 'image/png';
            else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) mime = 'image/jpeg';

            return {
                url: url,
                type: mime,
                category: 'System Core',
                size: 0
            };
        }) : [];

        const manifestAssets = (manifestCache && manifestCache.assets) ? manifestCache.assets : [];

        const assetMap = new Map();
        [...coreAssetObjects, ...manifestAssets].forEach(item => {
            if (!assetMap.has(item.url)) {
                assetMap.set(item.url, item);
            }
        });

        const allAssets = Array.from(assetMap.values());

        const filterQuery = storageSearch.value.toLowerCase().trim();
        const filteredAssets = allAssets.filter(asset => {
            const url = (asset.url || '').toLowerCase();
            const type = (asset.type || '').toLowerCase();
            const category = (asset.category || '').toLowerCase();
            return url.includes(filterQuery) || type.includes(filterQuery) || category.includes(filterQuery);
        });

        if (filteredAssets.length === 0) {
            storageTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nessuna risorsa trovata per il filtro applicato.</td></tr>`;
            return;
        }

        const assetsWithCacheState = await Promise.all(
            filteredAssets.map(async (asset) => {
                let isCached = false;
                if ('caches' in window) {
                    try {
                        isCached = !!(await caches.match(asset.url));
                    } catch (e) {
                        isCached = false;
                    }
                }
                return { asset, isCached };
            })
        );

        storageTbody.innerHTML = '';

        for (const { asset, isCached } of assetsWithCacheState) {
            const tr = document.createElement('tr');
            const sizeFormatted = asset.size ? (asset.size / 1024).toFixed(1) + ' KB' : 'N/A (Core)';
            const cacheBadge = isCached
                ? `<span style="color: var(--accent-green); font-weight: bold;">🟢🗄️ Cifrato</span>`
                : `<span style="color: var(--text-muted);">🔴🗄️ Non Presente</span>`;

            tr.innerHTML = `
                <td><strong>${asset.url}</strong> <br><small style="color: var(--text-muted);">Cat: ${asset.category || 'N/A'}</small></td>
                <td><code>${asset.type || 'unknown'}</code></td>
                <td>${sizeFormatted}</td>
                <td>${cacheBadge}</td>
                <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <a href="${asset.url}" target="_blank" class="btn btn-sm">🔓👁️💾 Apri</a>
                        <button class="btn btn-sm btn-sandbox-trigger" data-url="${asset.url}" style="border-color: var(--accent-purple); color: var(--accent-purple);">🔒👁️ S.CSP ❌💾</button>
                    </div>
                </td>
            `;
            storageTbody.appendChild(tr);
        }

        storageTbody.querySelectorAll('.btn-sandbox-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetUrl = e.currentTarget.getAttribute('data-url');
                openInSandbox(targetUrl, targetUrl.split('/').pop());
            });
        });

        logToTerminal('vault', `📂 Ispezione stiva aggiornata: ${filteredAssets.length} risorse visualizzate.`);
    };

    // 📦 Caricamento Manifesto
    try {
        logToTerminal('info', '📦 Recupero file [ ./Res-PA-manifest.json ] ...');
        const res = await fetch('./Res-PA-manifest.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        manifestCache = await res.json();
        logToTerminal('success', `✅ Manifesto caricato: ${manifestCache.ente} (v${manifestCache.version})`);
        
        totalCombinedCount = new Set([...getDefinedCoreAssets(), ...manifestCache.assets.map(a => a.url)]).size;
        metricTotal.textContent = totalCombinedCount;
        setStatusBadge('⚡ Inattivo', 'badge-init');
        renderStorageTable();

    } catch (err) {
        logToTerminal('error', `❌ Errore caricamento Res-PA-manifest.json: ${err.message}`);
        setStatusBadge('🚨 Errore Manifesto', 'badge-error');
    }

    // 🎮 Event Handlers
    btnSync.addEventListener('click', () => {
      setTimeout(() => {
        if (!manifestCache) {
            logToTerminal('error', '❌ Manifesto asset non disponibile.');
            return;
        }

        logToTerminal('sync', '🚀 Avvio sincronizzazione completa (Core + Manifesto Assets)...');
        sdk.initDB(manifestCache.version, manifestCache, getDefinedCoreAssets());
      }, 666);
    });

    btnPurge.addEventListener('click', () => {
        if (confirm('🚨 Confermi la purga totale della stiva e della cache locale?')) {
            sdk.purgeVault();
        }
    });

    btnClearLog.addEventListener('click', () => {
        terminalOutput.innerHTML = '';
        logToTerminal('info', '🧹 Console pulita.');
    });

    btnRefreshStorage.addEventListener('click', () => {
        renderStorageTable();
    });

    storageSearch.addEventListener('input', () => {
        renderStorageTable();
    });

    if (toggleCoreAssets) {
        toggleCoreAssets.addEventListener('change', () => {
            renderStorageTable();
        });
    }
    setTimeout(() => {
        btnSync.click();
    }, 2500);
});