/**
 * ⚡ App Controller - Dashboard PA & Gestione UI
 * * 👤 Autore: Valentino Aglianó
 * Perito Informatico / Idoneo ASMEL 2025
 * * 📜 License: EUPL-1.2
 */
import { PanzerSDK } from './SDK.js';

document.addEventListener('DOMContentLoaded', async () => {
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

    // 🔒 Modal Sandbox CSP
    const sandboxModal = document.getElementById('PA-sandbox-modal');
    const sandboxFrame = document.getElementById('PA-sandbox-frame');
    const sandboxTitle = document.getElementById('PA-sandbox-title');
    const btnCloseSandbox = document.getElementById('PA-btn-close-sandbox');

    let manifestCache = null;
    let activeObjectUrl = null;

    // ⚙️ Funzione Parametrica per definire i Core Assets
    const getDefinedCoreAssets = () => [
        '/PWA-Pizza-Engine/SDK_BETA/',
        '/PWA-Pizza-Engine/SDK_BETA/index.html',
        '/PWA-Pizza-Engine/SDK_BETA/js/app.js',
        '/PWA-Pizza-Engine/SDK_BETA/js/SDK.js',
        '/PWA-Pizza-Engine/SDK_BETA/ServiceWorker.js',
        '/PWA-Pizza-Engine/SDK_BETA/PWA.webmanifest',
        '/PWA-Pizza-Engine/SDK_BETA/Res-PA-manifest.json'
    ];

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

    // 🔒 Visore Sandbox CSP con PDF.js e Scroll abilitato
    const openInSandbox = async (url, fileName) => {
        try {
            logToTerminal('vault', `🔒 Isolamento Sandbox CSP Ultra-Restrittivo avviato per: ${fileName || url}`);
            let response = ('caches' in window) ? await caches.match(url) : null;
            if (!response) response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            const mimeType = response.headers.get('Content-Type') || blob.type || 'text/plain';

            if (activeObjectUrl) {
                URL.revokeObjectURL(activeObjectUrl);
            }
            activeObjectUrl = URL.createObjectURL(blob);

            let renderedContentHtml = '';

            if (mimeType.startsWith('image/')) {
                // Rendering Immagine Protetta con Scroll
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; style-src 'unsafe-inline';">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
                            body { background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh; overflow:auto; padding:20px; }
                            img { max-width:100%; height:auto; object-fit:contain; pointer-events:none; -webkit-touch-callout:none; }
                        </style>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;">
                        <img src="${activeObjectUrl}" alt="Risorsa Cifrata Protetta" />
                    </body>
                    </html>
                `;
            } else if (mimeType.includes('pdf')) {
                // Rendering PDF Universale tramite PDF.js con SCROLL FLUIDO ABILITATO
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline'; connect-src blob: data:;">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
                            body, html { width:100%; height:100%; background:#111; overflow-y:auto; overflow-x:hidden; font-family:sans-serif; -webkit-overflow-scrolling: touch; }
                            #pdf-container { display:flex; flex-direction:column; align-items:center; padding:20px; gap:20px; width:100%; min-height:100%; }
                            canvas { max-width:100%; height:auto; box-shadow: 0 4px 15px rgba(0,0,0,0.8); background:#fff; border-radius:4px; pointer-events:none; -webkit-touch-callout:none; }
                            .loading { color:#fff; font-size:1rem; display:flex; justify-content:center; align-items:center; height:100vh; text-align:center; padding:20px; }
                        </style>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;">
                        <div id="loading" class="loading">⏳ Caricamento visore PDF di sicurezza...</div>
                        <div id="pdf-container"></div>
                        <script>
                            const pdfUrl = "${activeObjectUrl}";
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                            async function renderPDF() {
                               try {
                                   const loadingTask = pdfjsLib.getDocument(pdfUrl);
                                   const pdfDoc = await loadingTask.promise;
                                   document.getElementById('loading').style.display = 'none';
                                   const container = document.getElementById('pdf-container');

                                   for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                                       const page = await pdfDoc.getPage(pageNum);
                                       const scale = 1.5; 
                                       const viewport = page.getViewport({ scale: scale });

                                       const canvas = document.createElement('canvas');
                                       const context = canvas.getContext('2d');
                                       canvas.height = viewport.height;
                                       canvas.width = viewport.width;

                                       container.appendChild(canvas);

                                       await page.render({
                                           canvasContext: context,
                                           viewport: viewport
                                       }).promise;
                                   }
                               } catch (err) {
                                   document.getElementById('loading').style.display = 'none';
                                   document.getElementById('pdf-container').innerHTML = '<div style="color:#ff6b6b; padding:20px; text-align:center;">❌ Errore rendering PDF: ' + err.message + '</div>';
                               }
                            }
                            renderPDF();
                        <\/script>
                    </body>
                    </html>
                `;
            } else {
                // Rendering Generale / Testo / Altri Formati
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; frame-src blob:; object-src blob:;">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; }
                            body { background:#111; color:#fff; font-family:sans-serif; height:100vh; overflow:auto; padding:20px; }
                            iframe, object { width:100%; height:100%; border:none; }
                        </style>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;">
                        <object data="${activeObjectUrl}" type="${mimeType}">
                            <p style="color:#aaa; text-align:center;">Impossibile anteporre la risorsa nel visore diretto.</p>
                        </object>
                    </body>
                    </html>
                `;
            }

            sandboxFrame.removeAttribute('sandbox');
            sandboxFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts'); 
            sandboxFrame.srcdoc = renderedContentHtml;

            sandboxTitle.textContent = `🔒 Visore Cifrato Read-Only — ${fileName || url}`;
            
            sandboxModal.classList.add('active');
            document.body.style.overflow = 'hidden'; 

            logToTerminal('success', `🛡️ PDF/Risorsa renderizzato correttamente nel visore fullscreen con scroll attivo.`);
        } catch (err) {
            logToTerminal('error', `❌ Errore apertura Sandbox CSP: ${err.message}`);
        }
    };

    const closeSandbox = () => {
        sandboxModal.classList.remove('active');
        sandboxFrame.srcdoc = '';
        sandboxFrame.src = 'about:blank';
        document.body.style.overflow = ''; 
        
        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
            activeObjectUrl = null;
        }
        logToTerminal('info', '🔒 Visore Sandbox CSP chiuso.');
    };

    btnCloseSandbox.addEventListener('click', closeSandbox);

    // 🚀 Inizializzazione SDK con Passaggio Parametrico dei Core Assets
    const sdk = new PanzerSDK({
        swPath: '/PWA-Pizza-Engine/SDK_BETA/ServiceWorker.js',
        scope: '/PWA-Pizza-Engine/SDK_BETA/',
        coreAssets: getDefinedCoreAssets(),
        
        onLogMessage: (level, msg) => logToTerminal(level, msg),
        
        onSyncStart: () => {
            setStatusBadge('⚡ Sincronizzazione...', 'badge-sync');
        },
        
        onProgress: (details) => {
            if (details) {
                const pct = details.percent ? Math.round(details.percent) : 0;
                progressBar.value = pct;
                progressText.textContent = `${pct}% (${details.current || 0}/${details.total || 0})`;

                metricCompleted.textContent = details.current || 0;
                metricTotal.textContent = details.total || 0;
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
            progressText.textContent = '100% (Completato)';
            setStatusBadge('🛡️ Stiva Pronta', 'badge-ready');
            if (data) {
                if (data.current !== undefined) metricCompleted.textContent = data.current;
                if (data.total !== undefined) metricTotal.textContent = data.total;
                if (data.request_failed !== undefined) metricFailed.textContent = data.request_failed;
                if (data.retries !== undefined) metricRetries.textContent = data.retries;
            }
            renderStorageTable();
        },

        onPurgeComplete: () => {
            progressBar.value = 0;
            progressText.textContent = '0% (0/0)';
            metricCompleted.textContent = '0';
            metricTotal.textContent = '0';
            metricFailed.textContent = '0';
            metricRetries.textContent = '0';
            setStatusBadge('⚡ Purgato', 'badge-init');
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
                ? `<span style="color: var(--accent-green); font-weight: bold;">🟢 Cifrato & Locale</span>` 
                : `<span style="color: var(--text-muted);">⚪ Non Presente</span>`;

            tr.innerHTML = `
                <td><strong>${asset.url}</strong> <br><small style="color: var(--text-muted);">Cat: ${asset.category || 'N/A'}</small></td>
                <td><code>${asset.type || 'unknown'}</code></td>
                <td>${sizeFormatted}</td>
                <td>${cacheBadge}</td>
                <td>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <a href="${asset.url}" target="_blank" class="btn btn-sm">👁️ Apri Direct</a>
                        <button class="btn btn-sm btn-sandbox-trigger" data-url="${asset.url}" style="border-color: var(--accent-purple); color: var(--accent-purple);">🔒 Sandbox CSP</button>
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
        
        const totalCombinedCount = new Set([...getDefinedCoreAssets(), ...manifestCache.assets.map(a => a.url)]).size;
        metricTotal.textContent = totalCombinedCount;

        setStatusBadge('⚡ Inattivo', 'badge-init');
        renderStorageTable();

    } catch (err) {
        logToTerminal('error', `❌ Errore caricamento Res-PA-manifest.json: ${err.message}`);
        setStatusBadge('🚨 Errore Manifesto', 'badge-error');
    }

    // 🎮 Event Handlers
    btnSync.addEventListener('click', () => {
        if (!manifestCache) {
            logToTerminal('error', '❌ Manifesto asset non disponibile.');
            return;
        }

        logToTerminal('sync', '🚀 Avvio sincronizzazione completa (Core + Manifesto Assets)...');
        sdk.initDB(manifestCache.version, manifestCache, getDefinedCoreAssets());
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
});
