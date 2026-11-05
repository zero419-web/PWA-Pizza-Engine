/**
 * ⚡ App Controller - Dashboard PA & Gestione UI
 * v1.9.0
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
    // 🔍 Zoom iniziale fissato al 100%
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

    // 🔍 Funzione per applicare lo zoom dinamico responsive (Mobile & Desktop)
    const applyZoom = () => {
        try {
            const iframeDoc = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;

            // Gestione zoom per PDF (Canvas)
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
            }

            // Gestione zoom per Immagini
            const img = iframeDoc.querySelector('img');
            if (img) {
                if (!img.dataset.naturalWidth && img.naturalWidth) {
                    img.dataset.naturalWidth = img.naturalWidth;
                    img.dataset.naturalHeight = img.naturalHeight;
                }
                const natW = parseFloat(img.dataset.naturalWidth);
                if (natW) {
                    img.style.width = (natW * currentZoom) + 'px';
                    img.style.maxWidth = 'none';
                    img.style.height = 'auto';
                }
            }

            logToTerminal('vault', `🔍 Zoom visore impostato al ${Math.round(currentZoom * 100)}% (Scroll bidirezionale attivo)`);
        } catch (e) {
            console.warn("Zoom custom limitato da policy restrittive dell'iframe nativo.", e);
        }
    };

    // Gestori eventi Zoom
    btnZoomIn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.25, 3.0); // Zoom massimo al 300%
        applyZoom();
    });

    btnZoomOut.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.25, 0.5); // Zoom minimo al 50%
        applyZoom();
    });

    // 🔒 Visore Sandbox CSP con PDF.js a 100% di default, Scroll Bidirezionale & Ottimizzazione Touch
    const openInSandbox = async (url, fileName) => {
        try {
            currentZoom = 1.0; // Reset rigoroso al 100% all'apertura
            logToTerminal('vault', `🫙🔒 Isolamento Sandbox CSP, avviato per: ${fileName || url}`);
            
            let response = null;
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                logToTerminal('vault', `🔍 Cache disponibili: ${cacheNames.join(', ')}`);
    
                for (const name of cacheNames) {
                     const cache = await caches.open(name);
        
                    // Tentativo di match con diverse varianti di percorso per lo scope
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
                logToTerminal('warn', `⚠️ Risorsa non in cache, tentativo fetch di rete: ${url}`);
                response = await fetch(url);
            }
           if (!response || !response.ok) throw new Error(`HTTP ${response?.status || 'Risorsa irreperibile'}`);

           const blob = await response.blob();
           const mimeType = response.headers.get('Content-Type') || blob.type || 'application/pdf';

            if (activeObjectUrl) {
                URL.revokeObjectURL(activeObjectUrl);
            }
            activeObjectUrl = URL.createObjectURL(blob);

            let renderedContentHtml = '';

            if (mimeType.startsWith('image/')) {
                // Rendering Immagine Protetta con Scroll Bidirezionale e Touch Panning
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; style-src 'unsafe-inline'; frame-src blob:; object-src blob:;">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; }
                            body, html { width:100%; height:100%; background:#000; overflow:auto; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; }
                            #img-container { display:flex; justify-content:center; align-items:center; min-width:100%; min-height:100%; width:max-content; margin:0 auto; padding:40px 50vw; touch-action: pan-x pan-y; }
                            img { max-width:100%; height:auto; object-fit:contain; -webkit-touch-callout:none; touch-action: pan-x pan-y; flex-shrink: 0; pointer-events: none; }
                        </style>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;" onselectstart="return false;">
                        <div id="img-container" oncontextmenu="return false;">
                            <img src="${activeObjectUrl}"
                            alt="Risorsa Cifrata Protetta"
                            oncontextmenu="return false;"
                            ondragstart="return false;"
                            onload="this.dataset.naturalWidth=this.naturalWidth; this.dataset.naturalHeight=this.naturalHeight; this.style.width=this.naturalWidth+'px';" />
                        </div>
                        <script>
                            document.addEventListener('contextmenu', e => e.preventDefault());
                            document.addEventListener('dragstart', e => e.preventDefault());
                            document.addEventListener('keydown', e => {
                                if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u', 'i', 'c'].includes(e.key.toLowerCase())) {
                                    e.preventDefault();
                                }
                            });
                        </script>
                    </body>
                    </html>
                `;
            } else if (mimeType.includes('pdf')) {
                const PDFlibP = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                const workerBlobUrl = PDFlibP + 'js/pdf_worker_min.js';
                
                const PDFlib = PDFlibP + 'js/pdf_min.js';
                
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; script-src 'unsafe-inline' blob: data: http: https:; style-src 'unsafe-inline'; connect-src blob: data: http: https:;">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; user-select:none; -webkit-user-select:none; }
                            body, html {
                                width: 100%;
                                height: 100%;
                                background: #0f172a;
                                overflow: auto;
                                font-family: sans-serif;
                                -webkit-overflow-scrolling: touch;
                                touch-action: pan-x pan-y;
                            }
                            #pdf-wrapper {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                padding: 20px 10px;
                                min-width: 100%;
                                min-height: 100%;
                                width: max-content;
                                margin: 0 auto;
                                gap: 15px;
                            }
                            canvas {
                                max-width: 100%;
                                height: auto;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                                background: #fff;
                                border-radius: 6px;
                                pointer-events: auto;
                            }
                            .loading-box {
                                color: #f8fafc;
                                font-size: 1rem;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                text-align: center;
                                gap: 10px;
                            }
                            .error-msg {
                                color: #f87171;
                                background: #1e1b4b;
                                padding: 15px;
                                border-radius: 8px;
                                border: 1px solid #ef4444;
                                max-width: 90%;
                                word-break: break-all;
                            }
                        </style>
                        <script src="${PDFlib}"></script>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;">
                        <div id="loading" class="loading-box">
                            <div>⏳ Rendering PDF in corso...</div>
                        </div>
                        <div id="pdf-wrapper"></div>
                        <script>
                            const pdfUrl = "${activeObjectUrl}";
                            const workerUrl = "${workerBlobUrl}";
                
                            async function startRender() {
                                try {
                                    if (typeof pdfjsLib === 'undefined') {
                                        throw new Error("Libreria PDF non caricata.");
                                    }
                                    
                                    // Assegnazione del Worker via path nativo gestito dal SW
                                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                
                                    // Caricamento Documento
                                    const loadingTask = pdfjsLib.getDocument({
                                        url: pdfUrl,
                                        isEvalSupported: false,
                                        disableFontFace: true
                                    });
                
                                    const pdfDoc = await loadingTask.promise;
                                    document.getElementById('loading').style.display = 'none';
                                    const container = document.getElementById('pdf-wrapper');
                
                                    // Rendering Canvas Pagina per Pagina
                                    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                                        const page = await pdfDoc.getPage(pageNum);
                                        
                                        const unscaledViewport = page.getViewport({ scale: 1.0 });
                                        const screenWidth = Math.min(window.innerWidth - 30, 800);
                                        const scale = screenWidth / unscaledViewport.width;
                                        const viewport = page.getViewport({ scale: Math.max(scale, 1.0) });
                
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                
                                        canvas.dataset.baseWidth = viewport.width;
                                        canvas.dataset.baseHeight = viewport.height;
                
                                        container.appendChild(canvas);
                
                                        await page.render({
                                            canvasContext: context,
                                            viewport: viewport
                                        }).promise;
                                    }
                                } catch (err) {
                                    document.getElementById('loading').style.display = 'none';
                                    document.getElementById('pdf-wrapper').innerHTML = '<div class="error-msg">❌ Errore Visore Cifrato: ' + err.message + '</div>';
                                }
                            }
                
                            window.addEventListener('DOMContentLoaded', startRender);
                        </script>
                    </body>
                    </html>
                `;
            } else {
                // 📄 Rendering Generale / Testo / Altri Formati
                renderedContentHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; frame-src blob:; object-src blob:;">
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; }
                            body, html { width:100%; height:100%; background:#111; overflow:auto; -webkit-overflow-scrolling: touch; touch-action: pan-x pan-y; }
                            #pdf-container { width:max-content; min-width:100%; min-height:100%; margin:0 auto; display:flex; justify-content:center; align-items:center; padding:40px 50vw; touch-action: pan-x pan-y; }
                            iframe, object { width:100%; height:100%; border:none; touch-action: pan-x pan-y; flex-shrink: 0; }
                        </style>
                    </head>
                    <body oncontextmenu="return false;" ondragstart="return false;">
                        <div id="pdf-container">
                            <object data="${activeObjectUrl}" type="${mimeType}">
                                <p style="color:#aaa; text-align:center;">Impossibile anteporre la risorsa nel visore diretto.</p>
                            </object>
                        </div>
                    </body>
                    </html>
                `;
            }

            sandboxFrame.removeAttribute('sandbox');
            sandboxFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            sandboxFrame.srcdoc = renderedContentHtml;

            sandboxTitle.textContent = `🔎🔒 Visore Cifrato \n ${fileName || url}`;

            sandboxModal.classList.add('active');

            logToTerminal('success', `🛡️ PDF / Risorsa renderizzato ...`);
        } catch (err) {
            logToTerminal('error', `❌ Errore apertura Sandbox CSP: ${err.message}`);
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
        logToTerminal('info', '🔒 Visore Sandbox CSP chiuso.');
    };

    btnCloseSandbox.addEventListener('click', closeSandbox);

    // 🚀 Inizializzazione SDK con Passaggio Parametrico dei Core Assets
    const sdk = new PanzerSDK({
        swPath: getDefined_swPath,
        scope: getDefined_scope,
        coreAssets: getDefinedCoreAssets(),

        // ⏱️ Timeout personalizzato per il 🐺 Watchdog
        checkTimeout: 6660,

        // 🛑 Personalizzazione completa dell'overlay Anti-Incognito
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
            // Calcola il totale, file completati (Core già scaricati + Manifest in corso)
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

