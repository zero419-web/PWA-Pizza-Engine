/**
 * CONFIGURAZIONE PWA
 * (Structured Manifest & Smart Sync Resident)
 *
 * Service Worker
 * Carrarmato Panzer v7.1
 * U-Boot - Stealth Edition (Encrypted)
 *
 * By Valentino Aglianò - Idoneo ASMEL 2025 !
 */

 // KEY ( IndexDB )
let encryptionKey = null;

 let isLogicEnabled = false;
 let syncAbortController = null;
const BASE_PATH = self.location.pathname.replace(/[^\/]+$/, "").replace(/\/+/g, '/');
const CONFIG = {
    ROOT: BASE_PATH,
        cacheName:      'PWA_PIZZA_ENGINE_v7.1',
    userCacheName: 'user_PWA_PIZZA_ENGINE_v7.1',
	vaultCanaryText: 'KANARY_CHECK_OK_PANZER_VAULT',
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
           'sigs': [
               '52494646',
               'FFD8FF',
               '89504E47',
               '3C737667'
            ],
           'useHeadProbe': true,
           'tolerance': 0.30,
           'defaultMin': 500
        },
        'pdf': {
           'firmato': 5000,
           'default': 10000,
           'sigs': ['25504446'],
           'useHeadProbe': false,
           'tolerance': 0.30,
           'defaultMin': 1000
        },
        'code': {
            'html': 100,
            'css': 100,
            'js': 100,
            'json': 10,
            'sigs': [],
            'useHeadProbe': true,
            'tolerance': 0.20,
            'defaultMin': 100
        },
        'universal': {
            'tolerance': 0.05,
            'minAbsoluteByte': 64
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitTillIdle = (timeoutMs = 8000) => {
    return new Promise((resolve) => {
        if ('requestIdleCallback' in self) {
            self.requestIdleCallback(() => resolve(), { timeout: timeoutMs });
        } else {
            setTimeout(resolve, 4000);
        }
    });
};

const isValidBlob = async (input, contentType, expectedSize = 0, isEncrypted = false, signals = null) => {
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
        } catch (e) { return result; }
    } else {
        blob = input;
    }
    if (!blob || !(blob instanceof Blob)) return result;

    const mainType = finalContentType.split('/')[0];
    const subType = finalContentType.split('/')[1]?.split(';')[0] || '';
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
        console.log(`⚠️ SW Forensics: Asset scartato (${blob.size}b < Min: ${Math.round(minSize)}b) -> ${finalContentType}`);
        return result;
    }

    if (!isEncrypted && !isTransformed && section && section.sigs?.length > 0) {
        try {
            if (signal?.aborted) return result;
            const headerBuffer = await blob.slice(0, 12).arrayBuffer();
            const headerHex = Array.from(new Uint8Array(headerBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('').toUpperCase();
            const hasValidSig = section.sigs.some(sig => headerHex.includes(sig.toUpperCase()));
            if (!hasValidSig) {
                if (!(subType === 'webp' && headerHex.startsWith('52494646') && headerHex.includes('57454250'))) {
                    console.log(`🛡️ SW Security: Firma fallita per ${finalContentType}. DNA: ${headerHex}`);
                    return result;
                }
            }
        } catch (e) { return result; }
    }

    try {
        if (signal?.aborted) return result;
        await blob.slice(-5).arrayBuffer();
    } catch (e) { return result; }

    result.valid = true;
    result.blob = blob;
    return result;
};

async function performProbe(url, rules) {

    if (!rules || rules.useHeadProbe === false) {
        return { ok: true, size: 0, type: '' };
    }

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 5000);
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
        if (probe.ok) {
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
}

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

async function smartDownload(url, cache, isCore = false, version = '', probeSize = 0) {
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
            } catch (e) {  }
        }

        if (isCore) {

            if (version && cachedVersion === version.toString()) {
                return "ALREADY_OK";
            }

            try {
				const profile = getNetworkProfile(self.navigator);
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), (profile?.timeout * 1000));
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

                return "ALREADY_OK";
            }
        }

        await cache.delete(cleanKey);
    }

    const ext = url.split('.').pop().toLowerCase();
    const rules = CONFIG.minSizeMap[ext] ||
                  (CONFIG.extensions.includes(ext) ? CONFIG.minSizeMap[ext === 'pdf' ? 'pdf' : 'image'] : null) ||
                  CONFIG.minSizeMap.universal;

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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), (profile?.timeout * 1000));

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
                            throw new Error(`Integrità/DNA Fallito per ${targetUrl}`);
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
                        try {

                            await cache.put(cleanKey, new Response(finalBlob, { status: 200, headers: newHeaders }));
                            console.info(`📦🛡️ SW: Risorsa validata e salvata: ${targetUrl}`);
                        } catch (cacheError) {
                            if (cacheError.name === 'QuotaExceededError') {
                                console.log("🚨 SW: Storage Pieno! Emergency Clean...");
                                await cleanUserCache(true);
                                await cache.put(cleanKey, new Response(finalBlob, { status: 200, headers: newHeaders }));
                            } else {
                                throw cacheError;
                            }
                        }

                        const uCache = await caches.open(CONFIG.userCacheName);
                        await uCache.delete(cleanKey);
                        return "DOWNLOADED";
                    } catch (e) {
                        console.info(`🔍⚠️ SW: Scarto tecnico su ${targetUrl} -> ${e.message}`);
                        return false;
                    }
                }
                if (r.status === 404) break;
            } catch (e) {
                clearTimeout(timeoutId);

                if (!(await checkRealOnline('sync'))) {
                    throw new Error("PWA_Offline");
                }
            }
        }
        return false;
    };

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
}

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

async function checkRealOnline(mode = 'fetch') {
    const netProfile = getNetworkProfile(self.navigator);
    const profiles = CONFIG.networkResilient.profiles;
    const profileName = Object.keys(profiles).find(key =>
        profiles[key].limit === netProfile.limit &&
        profiles[key].timeout === netProfile.timeout
    ) || 'Medium';

    if (mode === 'fetch') {

        if (profileName === 'Verylow' || profileName === 'Low') {
            console.info(`🌐🚫 SW Fetch: Profilo ${profileName}`);
            return false;
        }
    }
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
}

let isNewInstallation = false;
let isSyncing = false;
self.addEventListener('message', (event) => {
    if (event.data?.type === 'INIT_DB') {

        if (isSyncing) {
            if (syncAbortController) {
                syncAbortController.abort();
                console.info("🚫⚠️ PWA: Abort old Process...");
            }
            isSyncing = false;
        }

        syncAbortController = new AbortController();
        isSyncing = true;
        const currentVersion = event.data?.version;
        isLogicEnabled = true;

        const performSync = async (event) => {
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
					if (radarRes.ok) {
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
					console.info("⚠️ SW: Fallimento..., procedo con Sync standard.", e);
				}
			}

			console.info(`⚙️📥 SW: Avvio download file core...`);
			broadcast({ type: 'SYNC_PROGRESS' });
			const coreResults = await Promise.allSettled(
				CONFIG.coreAssets.map(url => smartDownload(url, cache, true, realServerVersion) )
			);
			if(IsCFUD){
				coreResults.forEach((res, i) => {
				const url = CONFIG.coreAssets[i];
				const isDownloaded = res.status === 'fulfilled' && res.value === "DOWNLOADED";
					if (isDownloaded) {
						console.info(`⚙️ SW: asset core: ${url}`);
					}
				});
			}
			await waitTillIdle(1000);

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
                    if (manifestRes.ok) {
						broadcast({ type: 'SYNC_PROGRESS' });
                        const structured = await manifestRes.json();
                        structured.forEach(group => {
                            const directory = group.dir || "";
                            group.files?.forEach(f => {
								const fullPath = normalize(CONFIG.ROOT + directory + f);
								manifestList.push(fullPath);

								console.info(`📄 SW: File rilevato -> ${fullPath}`);
                            });
                        });
						console.info(`✅📜 SW: Lista completata. File raccolti dal manifest: ${manifestList.length}`);
                    }
                } catch (e) { console.info("🚫⚠️ SW: Errore Assets Manifest", e); }

                const db = event.data.data;
                const scanSet = new Set();
                const knownDirs = new Set(Object.values(CONFIG.mappingLogic.contexts).map(c => c.path));

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
                                    if (probe.ok) {
                                        scanSet.add(url);
                                        console.info(`🎯🕵️‍♂️ SW Scanner: Asset Agganciato -> ${url}`);

                                        if (logic.isSequential && /\d+/.test(fileToProbe)) {
                                            const nextUrl = url.replace(/\d+/, n => parseInt(n) + 1);
                                            if (!scanSet.has(nextUrl) && !manifestList.includes(nextUrl)) {
												const nextProbe = await fetch(nextUrl, {
														method: 'HEAD',
														cache: 'no-cache',
														signal: syncAbortController
															? AbortSignal.any([syncAbortController.signal, AbortSignal.timeout(2500)])
															: AbortSignal.timeout(2500)
													});
                                                if (nextProbe.ok) scanSet.add(nextUrl);
                                            }
                                        }
                                    }
                                } catch (e) {}
                            }));
                        }
                    }
                };
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
                    const results = await Promise.allSettled(group.map(url => smartDownload(url, cache, false, realServerVersion)));

					await waitTillIdle(1000);
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
                console.info("🔄⚠️ SW: Errore Sync", err);
				if (syncAbortController) syncAbortController.abort();
				const isIntegritaError = err.message && err.message.includes('Integrità');
				if (isIntegritaError) {
					console.log("⚠️ SW: Errore di Integrità rilevato su un asset.");
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
        event.waitUntil(performSync(event));
    }
});

const CORE_ASSETS_SET = new Set(
    (CONFIG.coreAssets || []).map(asset => {
        return normalize(asset);
    })
);

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    const cleanPath = normalize(url.pathname);
    event.respondWith((async () => {
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

		const isOnline = await checkRealOnline('fetch');
		if (isOnline) {
            try {
                const currentProfile = getNetworkProfile();
                const TIMEOUT_MS = currentProfile.timeout * 1000;
                const controller = new AbortController();
                const tId = setTimeout(() => controller.abort(), TIMEOUT_MS);

                const networkResponse = await fetch(event.request, {
                    cache: 'no-cache',
                    signal: controller.signal
                });
                clearTimeout(tId);
                if (networkResponse && networkResponse.ok) {
					if (!isLogicEnabled || isSyncing) {

						return networkResponse;
					}

                    const responseClone = networkResponse.clone();
                    event.waitUntil((async () => {
                        try {
							const isOk = await verifyVaultIntegrity();
							if (!isOk || !encryptionKey) throw new Error("VAULT_LOCKED_NO_KEY");
							if (!responseClone || !isLogicEnabled || isSyncing) {

								return;
							}
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
                                    const encryptedBlob = await encryptBlob(finalBlob);
                                    updatedHeaders.set('X-PWA-Encrypted', 'true');
                                    await mainCache.put(finalPath, new Response(encryptedBlob, {
                                        status: responseClone.status,
                                        statusText: responseClone.statusText,
                                        headers: updatedHeaders
                                    }));
                                } else {
                                    await userCache.put(finalPath, new Response(finalBlob, {
                                        status: responseClone.status,
                                        statusText: responseClone.statusText,
                                        headers: updatedHeaders
                                    }));
                                }
								console.info(`✅🔄💾 SW: [ ${targetCache} ], Aggiornamento - File: ${finalPath}`);
                            }else{
								throw new Error(`Integrità/DNA Fallito per ${finalPath}`);
							}
                        } catch (cacheError) {
							console.log(`💥⚠️ SW: Fallimento scrittura in ${targetCache} - File: ${finalPath}`);
							console.log("📦⚠️ SW: Update cache fallito:", cacheError);
							throw cacheError;
						}
                    })());
                    return networkResponse;
                }
                if (networkResponse && networkResponse.status === 404) {
                    if (cached) {
                        console.info("📦♻️ SW: 404 Online, Resilienza ON: ", finalPath);

                    } else {
                        return networkResponse;
                    }
                }
            } catch (e) {
                console.info("📡⚠️ SW: Fallimento rete, recupero locale per:", finalPath);
            }
        }
		if (cached) {
            if (cached.headers.get('X-PWA-Encrypted') === 'true') {
                try {
                    const isOk = await verifyVaultIntegrity();
                    if (!isOk || !encryptionKey) throw new Error("VAULT_LOCKED_NO_KEY");
                    const buffer = await cached.arrayBuffer();
                    const decrypted = await decryptBuffer(buffer);

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

                    return new Response(decrypted, { headers: secureHeaders });
                } catch (err) {
                    console.info("❌🔑 SW: Decrittazione fallita per:", finalPath);
                    const isVaultError = err.message && err.message.includes('VAULT');
                    if (isVaultError) {
                        return new Response("⚠️🛡️Security Violation: 🗄️🚫 Vault Erorr...", { status: 403 });
                    } else {
                        const deletedMain = await mainCache.delete(finalPath, { ignoreSearch: true });
                        if (deletedMain) {
                            console.log(`⚠️🧹 SW: Risorsa Corrotta nel (🛡️ Bunker), ✅ eliminata correttamente: ${finalPath}`);
                            return new Response(null, { status: 404, statusText: "Resource Corrupted & Deleted" });
                        }
                    }
                    throw err;
                }
            } else {
                return cached;
            }
        } else {
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
                                    const decrypted = await decryptBuffer(buffer);

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

                                    return new Response(decrypted, { headers: secureHeaders });
                                }

                                return altCached.clone();
                            } catch (decryptErr) {
                                console.log(`❌🔑 SW Recovery: Variante ${altPath} corrotta o non decifrabile.`);
                                continue;
                            }
                        }
                    }
                }
            }
        }

        if (event.request.url.includes('favicon.ico')) {
            return new Response(null, { status: 204 });
        }
        let finalResponse = null;
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
                    let imageBlob;
                    if (placeholder.headers.get('X-PWA-Encrypted') === 'true') {
                        const buffer = await placeholder.arrayBuffer();
                        const decrypted = await decryptBuffer(buffer);
                        imageBlob = new Blob([decrypted], { type: placeholder.headers.get('Content-Type') });
                    } else {
                        imageBlob = await placeholder.blob();
                    }
                    if (isImageRequest && !isHTML && !isExcluded) {
                        console.info(`🖼️🩹 SW Placeholder: Emergenza -> ${finalPath}`);
                        return new Response(imageBlob, {
                            headers: {
                                'Content-Type': placeholder.headers.get('Content-Type') || 'image/png',
                                'X-PWA-Source': 'Bunker-Placeholder'
                            }
                        });
                    }

                    finalResponse = imageBlob;
                } catch (err) {
                    console.info("❌ SW: Errore decriptazione placeholder:", err);
                }
            } else {
                if (isImageRequest && !isHTML && !isExcluded) {
                    console.info(`🖼️🩹❌ SW Placeholder Fallback: Emergenza -> ${finalPath}`);

                    const brokenImgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="21" x2="21" y2="3"/><path d="M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M21 15l-5-5L5 21"/></svg>`;
                    const brokenBlob = new Blob([brokenImgSvg], { type: 'image/svg+xml' });
                    return new Response(brokenBlob, {
                        headers: {
                            'Content-Type': 'image/svg+xml',
                            'X-PWA-Source': 'SW-Emergency-SVG'
						}
					});
				}
			}
		}
		if (!isImageRequest && isExcluded) {
			console.info("📦❌ SW: Recupero fallito per:", finalPath);
		}
		if (isCoreAsset && !isNewInstallation) {
			console.log(`📡❌ SW CORE: Rete off-line per risorsa critica -> ${finalPath}`);
			CoreAssets_Destroy_Caches();
		}
        if (isHTML) {
            return await generateErrorPage(finalResponse, url.pathname);
        }
        return new Response('📡🚫 Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
        });

		
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

self.addEventListener('activate', (event) => {
	console.info("⚡ SW: attivazione...");
    event.waitUntil(
        Promise.all([

            caches.keys().then(keys => {
                return Promise.all(
                    keys.map(k => {
                        if (k !== CONFIG.cacheName && k !== CONFIG.userCacheName) {
							console.info(`🧹📦 PWA: Remove Old cache: ${k}`);
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
					console.info("⚡🚨 SW: Erorre: ", err.message);
				}
            })()
        ]).then(() => self.clients.claim())
    );
});

self.addEventListener('online', () => {
    console.info("📡📶 SW: Rete rilevata! Pronto per nuovi comandi.");
});



async function CoreAssets_Destroy_Caches(serverV = null) {
	const keys = await caches.keys();
	await Promise.all(keys.map(async (k) => {
		const cacheX = await caches.open(k);
		await Promise.all(Array.from(CORE_ASSETS_SET).map(asset => cacheX.delete(asset)));
	}));
	const allClients = await self.clients.matchAll();
	allClients.forEach(client => {
		client.postMessage({ type: 'CORE_UPDATE_RELOAD', sSV: serverV });
	});
}
async function Destroy_ALL_Caches(err = null) {
	console.log("💣 SW: Errore critico rilevato, Avvio Distruzione Totale!");
	const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    const allClients = await self.clients.matchAll();
	allClients.forEach(client => {
		client.postMessage({ type: 'CORE_UPDATE_RELOAD', msg: 'DESTROY_ALL_CACHE', msg_err: err });
	});
}

async function deepVaultValidation() {
    let db = null;
    try {
        if (encryptionKey !== null) {
            return;
        }
        db = await new Promise((resolve, reject) => {
            const req = indexedDB.open("PWA_Vault", 1);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error("VAULT_DB_ACCESS_ERROR"));
        });
        const realKey = await new Promise((resolve, reject) => {
            const tx = db.transaction("keys", "readonly");
            const req = tx.objectStore("keys").get("master_key");
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error("VAULT_KEY_READ_ERROR"));
        });
        db.close();
        db = null;
        if (!realKey) {
            throw new Error("VAULT_EMPTY_TEMPORARY");
        }
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
            try { db.close(); } catch(e){}
        }
        if (err.message === "VAULT_SECURITY_BREACH_INTEGRITY" || err.message === "VAULT_EMPTY_TEMPORARY") {
            console.log("🗄️🚨 SW: INTEGRITÀ CRITTOGRAFICA FALLITA! - Avvio distruzione Dati...");
            try {
                await Destroy_ALL_Caches("VAULT_COMPROMISED");
                await new Promise((resolve) => {
                    const req = indexedDB.deleteDatabase("PWA_Vault");
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                });
                console.log("🗄️🔥 SW: Tabula rasa completata con successo.");
            } catch (purgErr) {
                console.log("🗄️⚠️ SW: Errore durante la purga del sistema:", purgErr);
            }
            encryptionKey = null;
            throw new Error("VAULT_COMPROMISED_AND_CLEANED");
        }
        console.warn("🗄️⚠️ SW: Accesso Vault: (" + err.message + ")");
        throw new Error("VAULT_TEMPORARILY_LOCKED");
    }
}

let lastVaultCheck = 0;
const CHECK_INTERVAL = 300000;
async function verifyVaultIntegrity() {
    const now = Date.now();
    if (encryptionKey !== null && (now - lastVaultCheck < CHECK_INTERVAL)) return true;
    try {
        await deepVaultValidation();
        lastVaultCheck = Date.now();
        return true;
    } catch (err) {
        console.warn("⚠️ SW: Validazione temporaneamente fallita: ", err.message);
        return false;
    }
}

async function getStoredKey() {
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
                getReq.onerror = () => {
                    console.info("❌ SW: Errore lettura store chiavi");
                    db.close();
                    resolve(null);
                };
            };
            request.onerror = (err) => {
                console.info("❌ SW: Errore apertura IndexedDB Vault", err);
                resolve(null);
            };
        } catch (criticalErr) {
            console.info("❌ SW: Fallimento critico sistema Vault", criticalErr);
            encryptionKey = null;
            resolve(null);
        }
    });
}

async function encryptBlob(blob) {
    if (!encryptionKey) {
       throw new Error("CRYPTO_KEY_UNAVAILABLE_IN_RAM");
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const buffer = await blob.arrayBuffer();
    try {

        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            encryptionKey,
            buffer
        );
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        return new Blob([combined], { type: blob.type });
    } catch (err) {
        console.info("❌🛡️ SW: Errore durante la cifratura del file.");
        throw err;
    }
}

async function decryptBuffer(buffer) {
    if (!encryptionKey) {
        throw new Error("CRYPTO_KEY_UNAVAILABLE_IN_RAM");
    }
    try {
        const data = new Uint8Array(buffer);
        const iv = data.slice(0, 12);
        const ciphertext = data.slice(12);
        return await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            encryptionKey,
            ciphertext
        );
    } catch (err) {
        console.info("❌🛡️ SW: Fallimento decrittazione. Dati non integri o chiave errata.");
		throw new Error("VAULT_LOCKED_DECRYPTION", err);
    }
}

async function getHash(blob, algo = 'SHA-1') {
    try {

        const hashBuffer = await crypto.subtle.digest(algo, await blob.arrayBuffer());

        const hashArray = new Uint8Array(hashBuffer);
        let hashHex = '';
        for (let i = 0; i < hashArray.length; i++) {
            hashHex += hashArray[i].toString(16).padStart(2, '0');
        }
        return hashHex;
    } catch (err) {
        console.info(`🧬❌ SW: Errore calcolo hash (${algo}):`, err);
        return null;
    }
}

async function cleanUserCache(forceAll = false) {
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
}

async function generateErrorPage(logoBlob, failedPath) {

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
			console.log("⚠️ SW: ErrorPage B64 Not Blob...", e);
		}
    }
    const p = decodeURIComponent(failedPath || '???');
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#000;font-family:sans-serif;color:#fff;overflow:hidden}.box{width:95vw;height:95vh;border:2px solid red;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;box-sizing:border-box;padding:20px}h2{color:#ff4444;margin:5px 0;font-size:1.2rem}p{color:#bbb;font-style:italic;margin:2px 0;font-size:0.9rem}small{color:#444;margin-top:25px;font-size:0.65rem;word-break:break-all;max-width:90%;border-top:1px solid #222;padding-top:10px}img{max-width:140px;max-height:30vh;margin-bottom:20px;object-fit:contain}</style></head><body><div class="box"><img src="${imgContent}"><h2>Risorsa non disponibile &#x1F4E1;&#x274C;</h2><h2>Resource not available &#x1F4E1;&#x274C;</h2><small>&#x1F4C4;&#x274C; ${p}</small></div></body></html>`;
    return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }});
}
