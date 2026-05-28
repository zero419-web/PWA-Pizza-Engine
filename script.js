let site_title_now = document.title;
let errorLog = [];

let DATA = null;
let specialsTimer = null;
const FRONTEND_BASE = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
let File_Json_DB = `${FRONTEND_BASE}db.json`;
let File_SW = `${FRONTEND_BASE}sw.js`;

const FORMATS = ['webp', 'jpg', 'png', 'jpeg'];

let isTransitioning = false;

window.addEventListener('load', () => {

if (window.matchMedia('(display-mode: standalone)').matches) {
console.log('PWA: Già in esecuzione come app.');

        Sw_PwA_calls(1);
        return;
    }

    initPwaCheck(5000);

});

async function Sw_PwA_calls(X = 0){
    if (X === 1){
if (typeof initPwaLogic === "function") {

    initPwaLogic();
}
    }
    if (X === 2){

if (typeof enablePWAButton === "function") {
	enablePWAButton();
}
    }

    if(X === 4){

if (typeof handleIncognitoMode === "function"){
    handleIncognitoMode();
}
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    Sw_PwA_calls(2);
});
async function initPwaCheck(timeoutMs) {
if (!('serviceWorker' in navigator)){
    return false;
}

    const d = DATA?.[lang];
    const os = getMobileOS();
    if (os === 'iOS') {
        Sw_PwA_calls(1);
        return;
    }

    let profile;
    try {
        profile = await getFullBrowserProfile();
    } catch (e) {
        profile = { brands: [] };
    }

const isChromium = profile.brands?.some(item =>
item.brand.toLowerCase().includes('chrome') ||
item.brand.toLowerCase().includes('chromium')) || false;

const estimate = await navigator.storage.estimate();
const qMB = Math.round(estimate.quota / (1024 * 1024));

let isSuspiciousQuota = (qMB >= 2000 && qMB <= 2400);
if (isChromium) {
    if(getMobileOS() === 'Android'){
        isSuspiciousQuota = (
            (qMB >= 2000 && qMB <= 2400)
            );
    }else if(getMobileOS() === 'Desktop'){
        isSuspiciousQuota = (
            (qMB < 5000)
            );
    }
}

const pwaEventRace = new Promise((resolve) => {
        const timer = setTimeout(() => {
            window.removeEventListener('beforeinstallprompt', eventHandler);

            resolve(false);
        }, timeoutMs);

        function eventHandler(e) {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', eventHandler);
            e.preventDefault();
           window.deferredPrompt = e;
           Sw_PwA_calls(2);
           resolve(true);
        }
        window.addEventListener('beforeinstallprompt', eventHandler);
    });

const savedPoint = localStorage.getItem('pwa_check_point');
    const now = Date.now();

    if (savedPoint !== null) {
        const diffMinutes = (now - parseInt(savedPoint)) / (1000 * 60);

        if (diffMinutes > 60) {
            Sw_PwA_calls(1);
            return 0;
        }
    }else{

        try {
localStorage.setItem('pwa_check_point', now);
        } catch(e) {}
if(isSuspiciousQuota){
    setTimeout(() => {
        SetupdatePwaStatus('sw_not_work');
    }, 3000);
        return 0;
}
    }

const swPromise = initPwaLogic(true);

const eventPromise = pwaEventRace;

const isSWRA = await swPromise;
let installEventTriggered = await eventPromise;

const PWAisInstall = localStorage.getItem('pwa_app_Isinstall');
if(PWAisInstall === 'true'){
if (!isSuspiciousQuota && !installEventTriggered) {
installEventTriggered = true;
}

}
    try {

if (isSuspiciousQuota && !installEventTriggered && isSWRA) {
console.log("PWA: Quota sospetta e nessun evento. Attendo timeout...");
await new Promise(res => setTimeout(res, timeoutMs));
           }

if (isSuspiciousQuota && !installEventTriggered) {
console.warn("PWA: Conferma Incognito dopo timeout.");
    if (isChromium) {
        if (!PWAisInstall) {
            Sw_PwA_calls(4);
        }else{
            SetupdatePwaStatus('sw_not_work');
        }
    } else {
const msg1 = d?.ErrMsgBox_msg1 ?? '';
if(msg1 !== ''){ showErrorPanel(msg1); }
        Sw_PwA_calls(1);
    }
    return;
}

console.log("PWA: Utente legittimo.");
        Sw_PwA_calls(1);
    } catch (error) {
console.error("PWA: Error (is sandbox).", error);
        if (isChromium) {
            Sw_PwA_calls(4);
        } else {
const msg1 = d?.ErrMsgBox_msg1 ?? '';
if(msg1 !== ''){ showErrorPanel(msg1); }
            Sw_PwA_calls(1);
        }
    }
}

async function getFullBrowserProfile() {
    let profile = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        isHighEntropyDataAvailable: false,
        details: {}
    };

    if (navigator.userAgentData) {
        try {
            const highEntropyData = await navigator.userAgentData.getHighEntropyValues([
                "architecture",
                "model",
                "platform",
                "platformVersion",
                "fullVersionList",
                "bitness"
            ]);

            profile.details = highEntropyData;
            profile.isHighEntropyDataAvailable = true;

            profile.brands = navigator.userAgentData.brands;
            profile.mobile = navigator.userAgentData.mobile;
        } catch (error) {
            console.error("Errore nel recupero dei Client Hints:", error);
        }
    }

    return profile;
}

const getMobileOS = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
    if (/android/i.test(ua)) return 'Android';
    return 'Desktop';
};

let IsTheme = (function() {
    try {
    const savedTheme = localStorage.getItem('user_preferred_theme');
    if (savedTheme) {
        if (savedTheme === 'light') document.body.classList.add('light-theme');
        return savedTheme;
    }

    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const defaultTheme = prefersLight ? 'light' : 'dark';
    if (defaultTheme === 'light') document.body.classList.add('light-theme');
    localStorage.setItem('user_preferred_theme', defaultTheme);
    return defaultTheme;
    } catch (e) {
        return 'dark';
    }
})();

let lang = (function() {

    const savedLang = localStorage.getItem('user_preferred_lang');
    if (savedLang) return savedLang;

const browserLang = navigator.language || navigator.userLanguage;
const defaultLang = browserLang.startsWith('it') ? 'it' : 'en';

    localStorage.setItem('user_preferred_lang', defaultLang);
    return defaultLang;
})();

function PopupModal(x = true) {
	document.body.classList.toggle('no-scroll', x);
}

function resetSpecialsTimer() {
    if (specialsTimer) {
        clearTimeout(specialsTimer);
        specialsTimer = null;
    }
}

window.onerror = function(msg, url, line) {

    if (msg.includes("ServiceWorker") || msg.includes("QuotaExceededError") || msg.includes("IDBDatabase")) {
const d = DATA?.[lang];
const warning = d?.ErrMsgBox_warning ?? '';
if(warning !== ''){ showErrorPanel(warning); }
    } else {
const report = `⚠️ : ${msg}\n ↳📍 [ ${line} ]\n 🌐  ➔ ${url}`;
        showErrorPanel(report);
    }

    return false;
};

function fillPlaceholder(template, placeholder, value) {
    if (!template || typeof template !== 'string') return template;
    return template.replaceAll(placeholder, value);
}

async function loadImageAsync(imgElement, folder, ID) {
    imgElement.src = window.APP_CONFIG.svg_loading;
    for (const ext of FORMATS) {
        const cleanExt = ext.replace(/^\./, "");
        const url = `${folder}${ID}.${cleanExt}`;
        const success = await new Promise((resolve) => {
            const tempImg = new Image();
            tempImg.onload = () => resolve(true);
            tempImg.onerror = () => resolve(false);
            tempImg.src = url;
        });
        if (success) {

            imgElement.src = url;
            return true;
        }
    }
    return false;
}

function showErrorPanel(msg, X = false) {
    const panel = document.getElementById('error-monitor');
    if (panel) {
        panel.style.display = 'block';
const Obj = document.getElementById('error-msg');
        if(X){
            Obj.innerHTML = msg;
        }else{
            Obj.innerText = msg;
        }
    }
}
function resetSystem() {
    if (typeof _emergencyReset === 'function') {
        _emergencyReset();
    } else {

        const cleanPath = window.location.origin + window.location.pathname;
        window.location.replace(cleanPath + "?refresh=" + new Date().getTime());
    }
document.body.classList.remove('error-locked');
}
function CallErrorFailureBox(){
document.getElementById('critical-failure').style.display = 'flex';
    document.title = "Critical Erorr !";
    document.body.classList.add('error-locked');
}

async function init() {

    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug');

    if (debugMode === 'high') {
        CallErrorFailureBox();
       return;
    }
    try {
		if (!DATA) {
			try {
				const response = await fetch(File_Json_DB);
				console.log("PWA - fetch: ", File_Json_DB);
				if (!response.ok) {
					throw new Error(`Error HTTP! state: ${response.status}`);
					console.error("PWA Error: Not Respond ", File_Json_DB);
				}
				DATA = await response.json();
				console.log("PWA: Charge DATA from DB json...");
			}catch(error){
				console.log("PWA Error: JSON not valid...", error);
				CallErrorFailureBox();
				setTimeout(() => {

					window.location.href = window.location.pathname;
				}, 30000);
			}
		}

		window._scriptLoaded = true;
        if (window._watchdog) {
            clearTimeout(window._watchdog);
			console.log("watchdog OFF");
        }

        if (debugMode === 'low') {
            setTimeout(() => {
				window.onerror(`DEBUG:\nSimulazione errore caricamento icone UI`, 'script.js', 102);
            }, 1000);
        }

        render();

        const c = DATA?.config;

        if (c?.urlParamMenu && urlParams.has(c?.urlParamMenu)) {
            handleDoc(c?.pdf?.[lang]?.pdfMenu);
        }

    } catch (err) {
		console.error("Errore Caricamento:", err);
		errorLog.push(`CRITICAL: ${err.message}`);
		if(window._scriptLoaded !== true){
			if (window._watchdog) {
				clearTimeout(window._watchdog);
			}
			CallErrorFailureBox();
		}
    }
}

document.addEventListener('DOMContentLoaded', init);

function sendErrorFeedback(severity) {

    const c = DATA ? DATA.config : {
        name: window.APP_CONFIG.name,
        tel: window.APP_CONFIG.tel
    };

    let cleanTel = c.tel.replace(/\D/g, '');

    if (!cleanTel.startsWith('39') && cleanTel.startsWith('3')) {
        cleanTel = '39' + cleanTel;
    }

    const logs = errorLog.length > 0 ? errorLog.join(" | ") : "Nessun errore rilevato (Debug Manuale)";

var gearUrl = "%E2%9A%99%EF%B8%8F";
var warnUrl = "%E2%9A%A0%EF%B8%8F";
var sirenUrl = "%F0%9F%9A%A8";

    var iconUrl = (severity === 'low') ? warnUrl : sirenUrl;
    var statusText = (severity === 'low') ? "ANOMALIA MINORE" : "ERRORE CRITICO";

    var msgPart1 = "* REPORT TECNICO [" + c.name + "] *\n\n";
    var msgPart2 = "--STATO: " + statusText + "\n" +"Rilevata anomalia durante la navigazione." + "\n\n" +
"* LOG: *\n" + logs.split(" | ").join("\n");

    var fullTextUrl = gearUrl +"%20"+ encodeURIComponent(msgPart1) +
                      iconUrl +"%20"+ encodeURIComponent(msgPart2);

    var waUrl = "https://api.whatsapp.com/send/?phone=" + cleanTel + "&text=" + fullTextUrl;

    window.open(waUrl, '_blank');
}

function render() {
if(!DATA) return;
    const d = DATA[lang], c = DATA.config,
todayIdx = (new Date().getDay() + 6) % 7;

const flagIcon = lang === 'it' ? ICONS.eng : ICONS.ita;
const label = lang === 'it' ? 'EN' : 'IT';
const paths = DATA.config.paths;

const logoImg = document.getElementById('main-logo-img');
const logoContainer = document.getElementById('logo-header');

if (logoImg && c.heroImg && c.heroLow) {
    logoImg.alt = `Logo ${c.name}`;
    const highResPath = `${paths.base}${c.heroImg}`;
    const lowResPath = `${paths.base}${c.heroLow}`;

    logoContainer.style.backgroundImage = `url('${lowResPath}')`;

    const handleLogoLoaded = () => {
        logoImg.classList.add('visible');
        logoContainer.classList.add('loaded');
        setTimeout(() => {
logoContainer.style.backgroundImage = 'none';
        }, 850);
    };

    const imgData = new Image();
    imgData.src = highResPath;
    imgData.onload = function() {

        logoImg.dataset.loaded = "true";
        logoImg.src = this.src;

        if (logoImg.complete) {
            handleLogoLoaded();
        } else {
            logoImg.onload = handleLogoLoaded;
        }
    };

    imgData.onerror = () => {
console.error("Error: Charge Hero Jpg & Png.\nActived fallback SVG.");
        logoContainer.style.aspectRatio = "auto";
        logoImg.src = window.APP_CONFIG.svg_logo;
        if (logoImg.complete) {
            handleLogoLoaded();
        } else {
            logoImg.onload = handleLogoLoaded;
        }
    };
}

document.title = fillPlaceholder(d.site_title, '{name}', c.name);
site_title_now = document.title;

const isSpecialsActive = c.showSpecialsPopup === true;
const specialsClass = isSpecialsActive ? "nav-item" : "nav-item is-disabled";
const specialsAction = isSpecialsActive
    ? 'onclick="checkSpecials(true);"' : "";

    document.getElementById('nav-hook').innerHTML = `
        <a href="#logo-header" class="nav-brand" aria-label="HomePage" title="HomePage">${ICONS.brand}<span>${c.name}</span></a>
        <ul class="nav-links">
            <li>
            <a aria-label="${d?.nav[0]}" href="javascript:void(0)" role="button" ${specialsAction} class="${specialsClass}">
            ${ICONS.specials}
        <span id="Btn_sSpan" style="color:${Btn_sSpan_curentColor};">${d?.nav[0]}</span>
            </a>
        </li>
            <li><a aria-label="${fillPlaceholder(d?.nav[1], '{name}', c?.name)}" href="#storia" class="nav-item">${ICONS.storia}<span>${fillPlaceholder(d?.nav[1], '{name}', c?.name)}</span></a></li>
            <li><a aria-label="${d?.nav[2]}" href="#prenota" class="nav-item">${ICONS.prenota}<span>${d?.nav[2]}</span></a></li>
            <li><a aria-label="${d?.nav[3]}" href="#menu" class="nav-item">${ICONS.menu}<span>${d?.nav[3]}</span></a></li>
            <li><a aria-label="${d?.nav[4]}" href="#galleria" class="nav-item">${ICONS.foto}<span>${d?.nav[4]}</span></a></li>
            <li><a aria-label="${d?.nav[5]}" href="#faq" class="nav-item">${ICONS.faq}<span>${d?.nav[5]}</span></a></li>
            <li><a aria-label="${d?.nav[6]}" href="#sicurezza" class="nav-item">${ICONS.safety}<span>${d?.nav[6]}</span></a></li>
            <li><a aria-label="${d?.nav[7]}" href="#orari" class="nav-item">${ICONS.orari}<span>${fillPlaceholder(d?.nav[7], '{name}', c.name)}</span></a></li>
            <li><a aria-label="${d?.nav[8]}" href="#contatti" class="nav-item">${ICONS.call}<span>${d?.nav[8]}</span></a></li>
            <li><a aria-label="${d?.nav[9]}" href="#footer-root" class="nav-item">${ICONS.legal_nav}<span>${d?.nav[9]}</span></a></li>
            <li>
            <a aria-label="${d?.nav[10]}" id="BLang" href="javascript:void(0)" role="button" onclick="switchLang()" class="nav-item">${flagIcon}
            <span>${d?.nav[10]}</span>
            </a>
            </li>

             <li>
            <a aria-label="${fillPlaceholder(d?.nav[11], '{istheme}', (IsTheme === 'dark' ? 'LIGHT' : 'DARK'))}" id="BTheme" href="javascript:void(0)" role="button" onclick="switchTheme(this)" class="nav-item">${ICONS.themeIcon}
            <span id="themeIcon-span">${fillPlaceholder(d?.nav[11], '{istheme}', (IsTheme === 'dark' ? 'LIGHT' : 'DARK'))}</span>
            </a>
            </li>
        </ul>`;

const brandBtnContainer = document.getElementById('brand-btn');
const brandBtnPWAContainer = document.getElementById('brand-btn-pwa');

if (!window.matchMedia('(display-mode: standalone)').matches) {
if (brandBtnContainer) {
brandBtnContainer.innerHTML = `<div class="vcard-wrapper">
<button onclick="downloadVCard()" class="vcard-btn-premium" aria-label="Vcard-Download">${ICONS.vcard}<span>
${d.brand_btn_text}</span></button></div>`;
}
const sdbb = window.getComputedStyle(brandBtnContainer);
if (brandBtnPWAContainer) {
brandBtnPWAContainer.innerHTML = `<div class="vcard-wrapper" style="${sdbb.display !== 'none' ? 'margin-top: 25px;' : 'margin-top: 35px;'}">
<button aria-label="Install-PWA" onclick="hPWAInstal(this);" class="vcard-btn-premium vcard-btn-premium_Disabled">${ICONS.PWA}<span>
${fillPlaceholder(d.brand_btn_PWA_text, '{name}', c.name)}</span></button></div>`;
}
}

document.getElementById('view-root').innerHTML = `<section id="storia">
    <div class="header-box">
        ${ICONS.storia}
        <h2>${d?.storia_title}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">
        <p>${fillPlaceholder(d?.storia_p, '{name}', c?.name)}</p>
        <br>
        <button aria-label="${d?.menu_btn}" onclick="handleDoc('${c?.pdf?.[lang]?.pdfMenu}', this)" class="btn-wa">
            ${d?.menu_btn}
        </button>
        <div class="chef-profile">
            <div class="chef-img-wrapper" onclick="openZoom('${c?.paths?.base}${DATA?.chef?.img}','${DATA?.chef?.nome}')">
			<img src="${c?.paths?.base}${DATA?.chef?.img}" class="chef-img" alt="${DATA?.chef?.nome}">
                <div class="zoom-icon-badge">
                    ${ICONS.zoom}
                </div>
            </div>
            <div class="chef-pro-desc">
            <h4>${DATA?.chef?.nome}</h4>
            <p>${lang==='it'?DATA?.chef?.it_bio:DATA?.chef?.en_bio}</p>
            </div>
        </div>
    </div>
</section>

<section id="prenota">
    <div class="header-box">
        ${ICONS.prenota}
        <h2>${d?.nav[2]}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">
        <div class="booking-grid">
		<form id="Prenotation-form">
            <div class="field">
                <label for="b-name">
                    ${d?.book_labels[0]}
                </label>
                <input type="text" id="b-name" oninput="this.classList.remove('error')" placeholder="${lang==='it'?'Nome o Cognome':'Name Or Surname'}">
            </div>
            <div class="field">
                <label for="b-date">
                    ${d?.book_labels[1]}
                </label>
                <input type="date" id="b-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="field">
                <label for="b-time">
                    ${d?.book_labels[2]}
                </label>
                <select id="b-time">
        ${c?.bookingTimes.map(t => `<option value="${t}" ${t==="19:30"?"selected":""}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="field">
                <label for="b-qty">
                    ${d?.book_labels[3]}
                </label>
                <select id="b-qty">
        ${Array.from({length: 10}, (_, i) => i + 1).map(n => {
    const isLast = n === 10;
    const value = isLast ? `${n}+` : n;
    const label = lang === 'it'
        ? (n === 1 ? 'Ospite' : 'Ospiti')
        : (n === 1 ? 'Guest' : 'Guests');
    const displayLabel = isLast ? `${n}+ ${label}` : `${n} ${label}`;
    const selected = n === 2 ? "selected" : "";
    return `<option value="${value}" ${selected}>${displayLabel}</option>`;
}).join('')}
                </select>
            </div>
            <button aria-label="${fillPlaceholder(d?.book_btn, '{name}', c?.name)}" onclick="showModal('book')" class="btn-wa">${fillPlaceholder(d?.book_btn, '{name}', c?.name)}</button>
			<br>
			<button type="reset" aria-label="Clear-Module" class="btn-wa">${d?.modal_no}</button>
		</form>
		</div>
        <div class="note-alert">${ICONS.info}
            <p>${d?.book_note}</p>
        </div>
    </div>
</section>

<section id="menu">
    <div class="header-box">
        ${ICONS.menu}
        <h2>${d?.nav[3]}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">
    <button aria-label="${d?.menu_btn}" onclick="handleDoc('${c?.pdf?.[lang]?.pdfMenu}', this)" id="btn-doc-menu" class="btn-wa">${d?.menu_btn}</button>
    </div>
</section>

<section id="galleria">
    <div class="header-box">${ICONS.foto}
        <h2>${d?.nav[4]}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">
        <div class="gallery-grid" id="gal-root">
        </div>
    </div>
</section>

<section id="faq">
    <div class="header-box">${ICONS.faq}
        <h2>${d?.faq_title}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">${d?.faqs.map((faq, i) => `<div class="faq-item" id="faq-${i}"><button class="faq-trigger" onclick="toggleFaq(${i})">${faq.q} <span>+</span></button><div class="faq-content">${fillPlaceholder(faq.a, '{name}', c?.name)}</div></div>`).join('')}
    </div>
</section>

<section id="sicurezza">
    <div class="header-box">
        ${ICONS.safety}
        <h2>${d?.nav[6]}</h2>
        <div class="divider"></div>
    </div>
    <div class="glass-card">
        <h3>
        ${d?.allergeni_title}
        </h3>
        <p>${d?.allergeni_p}</p>
    </div>
</section>

<section id="orari">
    <div class="header-box">
       ${ICONS.orari}
       <h2>${fillPlaceholder(d?.nav[7], '{name}','<br>'+ c?.name)}
       </h2>
       <div class="divider"></div>
    </div>
    <div class="glass-card">
        <h3>${d?.hours_title}</h3>
		${c?.[lang]?.days.map((day,i)=>`
		<div class="${i===todayIdx ? 'Today' : ''}">
			<p class="${(!/\d/.test(c?.[lang]?.hours[i])) ? 'Today_h' : ''}">
				<span>${day}</span>
				<span>${c?.[lang]?.hours[i]}</span>
			</p>
		</div>`).join('')}
        <div class="note-alert">
        ${ICONS.info}
        <p id="Note-2">${d?.orari_note}</p>
        </div>
    </div>
</section>

<section id="contatti">
    <div class="header-box">
    ${ICONS.call}
        <h2>${d?.nav[8]}</h2>
        <div class="divider"></div>
    </div>
    <div class="contact-layout">
        <div class="glass-card">
            <h3>${d?.contact_title}</h3>
            <a aria-label="Call-1" href="tel:${c?.tel.replace(/\s/g,'')}" class="contact-link">${ICONS.call}
                <span>${c?.tel}</span>
            </a>
            <a aria-label="Call-2" href="tel:${c?.tel_fisso.replace(/\s/g,'')}" class="contact-link">${ICONS.tel_fisso}
            <span>${c?.tel_fisso}</span>
            </a>
            <a aria-label="E-mail" href="mailto:${c?.mail}" class="contact-link">${ICONS.mail}
                <span>${c?.mail}</span>
            </a>
            <div class="contact-link">
            ${ICONS.pin}
                <span>${c?.address}</span>
            </div>
${(c?.localFB && c?.localFB.trim() !== "") ? `<a aria-label="FaceBook" href="${c?.localFB}" target="_blank" class="contact-link">${ICONS.fb} <span>Facebook</span></a>` : ""}
${(c?.localIG && c?.localIG.trim() !== "") ? `<a aria-label="Instagram" href="${c?.localIG}" target="_blank" class="contact-link">${ICONS.ig} <span>Instagram</span></a>` : ""}
${(c?.localTT && c?.localTT.trim() !== "") ? `<a aria-label="TikTok" href="${c?.localTT}" target="_blank" class="contact-link">${ICONS.tt} <span>TikTok</span></a>` : ""}
${(c?.localTA && c?.localTA.trim() !== "") ? `<a aria-label="TripAdvisor" href="${c?.localTA}" target="_blank" class="contact-link">${ICONS.ta} <span>TripAdvisor</span></a>` : ""}
<div class="map-wrapper">
    <iframe
    id="desktop-map";
    class="map-box";
        width="100%";
        height="480";
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
		referrerpolicy="no-referrer-when-downgrade"
		src="https://www.google.com/maps/embed?${c?.map_embed}">
    </iframe>
    <a aria-label="${fillPlaceholder(d?.map_btn, '{name}', c?.name)}" href="${c?.map_link}" id="mobile-map-btn" target="_blank" class="map-btn-premium">
        <div>${ICONS.mapPin}</div>
        <div class="map-btn-text">
            <span class="map-btn-label">
            ${fillPlaceholder(d?.map_btn, '{name}', c?.name)}
            </span>
            <span class="map-btn-addr">
            ${c?.address}
            </span>
        </div>
    </a>
</div>
</div>
</div>
</section>`;

    document.getElementById('footer-root').innerHTML = `<div class="header-box">
     ${ICONS.legal_nav}
     <h2>${d?.nav[9]}</h2></div>
        <div class="legal-row">
            <a aria-label="P.IVA" onclick="copyPIVA()" id="piva-text">${ICONS.legal} P.IVA: <strong>${c?.piva}</strong></a>
            <a aria-label="Privacy Policy" onclick="handleDoc('${c?.pdf?.[lang]?.pdfPrivacy}')">Privacy Policy</a>
            <a aria-label="Cookie Policy" onclick="handleDoc('${c?.pdf?.[lang]?.pdfCookie}')">Cookie Policy</a>
        </div>
<p class="footer-privacy-note">
${d?.info_privacy_txt}</p><br>
        <div class="arch-sign">
            <span>Digital Architecture by</span>
            <a aria-label="LinkTree: Digital Architecture" href="${c?.architectLT}" target="_blank" class="arch-link-container">
<span class="arch-name">VALENTINO AGLIANÒ</span>
                <div class="arch-icon-wrapper">
                ${ICONS.arch}
                </div>
            </a>
           <span>
           ${window.APP_CONFIG.copyrite}
            <br>
            All rights reserved.
            <br>
            Site Version:
            ${window.APP_CONFIG.ver_site}
            </span>
        </div>`;

    const telClean = c?.tel.replace(/\s+/g,'');
    const telFissoClean = c?.tel_fisso ? c?.tel_fisso.replace(/\s+/g,'') : '';
    const waContainer = document.getElementById('wa-fixed-container');

waContainer.innerHTML = `<div class="floating-container">
    <div id="call-drawer" class="call-drawer">
${(telClean && telClean.trim() !== "") ? `<div class="drawer-icon icon-tel" role="button" tabindex="0" aria-label="Cell" title="Cell" data-href="tel:${telClean}">${ICONS.call}</div>` : ""}
${(telFissoClean && telFissoClean.trim() !== "") ? `<div class="drawer-icon icon-tel-fisso" role="button" tabindex="0" aria-label="Phone" title="Phone" data-href="tel:${telFissoClean}">${ICONS.tel_fisso}</div>` : ""}
${(c?.mail && c?.mail.trim() !== "") ? `<div class="drawer-icon icon-mail" role="button" tabindex="0" aria-label="e-mail" title="e-mail" data-href="mailto:${c?.mail}">${ICONS.mail}</div>` : ""}
            </div>
            <div role="button" tabindex="0" aria-label="WatshApp" onclick="showModal('info')" class="wa-float-main">${ICONS.wa}</div>
            <div id="social-drawer" class="social-drawer">
${(c?.localFB && c?.localFB.trim() !== "") ? `<div role="button" tabindex="0" aria-label="FaceBook" class="drawer-icon icon-fb" data-url="${c?.localFB}">${ICONS.fb}</div>` : ""}
${(c?.localIG && c?.localIG.trim() !== "") ? `<div role="button" tabindex="0" aria-label="Instagram" class="drawer-icon icon-ig" data-url="${c?.localIG}">${ICONS.ig}</div>` : ""}
${(c?.localTT && c?.localTT.trim() !== "") ? `<div role="button" tabindex="0" aria-label="TikTok" class="drawer-icon icon-tt" data-url="${c?.localTT}">${ICONS.tt}</div>` : ""}
${(c?.localTA && c?.localTA.trim() !== "") ? `<div role="button" tabindex="0" aria-label="TripAdvisor" class="drawer-icon icon-ta" data-url="${c?.localTA}">${ICONS.ta}</div>` : ""}
            </div>
<div id="feedback-drawer" class="fedback-drawer" role="button" tabindex="0" aria-label="FeedBack...">
<div id="sync-text">${d?.sync_running}</div>
<div class="status-dot dot-working" id="sync-dot"></div></div>
</div>`;

const DRAWER_IDS = [
    'call-drawer',
    'social-drawer',
    'feedback-drawer'
    ];

DRAWER_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.onclick = (e) => {
        e.stopPropagation();

        DRAWER_IDS.forEach(otherId => {
            if (otherId !== id) {
                const otherEl = document.getElementById(otherId);
                if (otherEl) otherEl.classList.remove('expanded');
            }
        });
        el.classList.toggle('expanded');
    };

el.querySelectorAll('.drawer-icon').forEach(icon => {
        icon.onclick = (e) => {
            if (el.classList.contains('expanded')) {
                e.stopPropagation();
                icon.blur();
    const href = icon.getAttribute('data-href');
    const url = icon.getAttribute('data-url');

                el.classList.remove('expanded');

                if (href) {
                    window.open(href, '_self');
                } else if (url) {
                    window.open(url, '_blank');
                }

            }
        };
    });
});

document.addEventListener('click', () => {
    DRAWER_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('expanded');
    });
});

    initGallery();

checkSpecials(false, false);

if (DATA.config["enablespecialsPop-up"] === true) {
    if (specialsTimer) clearTimeout(specialsTimer);
    specialsTimer = setTimeout(() => {
        const popup = document.getElementById('specials-popup');
        const container = document.getElementById('specials-container');

        if (popup && container && container.innerHTML.trim() !== "") {
            popup.style.display = 'flex';
            PopupModal();
            toggleFloatingButtons(false);

            specialsTimer = setTimeout(closeSpecials, 12000);
        }
    }, 5000);
}

    updateNavHeight();

    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.remove(), 500);
    }
}

function showModal(type) {
    if (!DATA || !DATA[lang]) return;
    const d = DATA[lang];
    const c = DATA.config;
    const m = document.getElementById('modal-overlay');
    const nameInput = document.getElementById('b-name');

    const titleEl = document.getElementById('modal-title');
    const textEl = document.getElementById('modal-text');
    const noteEl = document.getElementById('modal-note-highlight');
    const btnYes = document.getElementById('modal-btn-yes');
    const btnNo = document.getElementById('modal-btn-no');

    if (type === 'book') {
        if (!nameInput || !nameInput.value.trim()) {
            nameInput.classList.add('error');
            nameInput.focus();
            return;
        }
    }

    if (titleEl){ titleEl.innerText = d?.modal_t; }

    let sSpan = "";
    let isOpen = isLocalOpen();

    if (isOpen !== null) {

        const color = isOpen ? '#25d366' : '#ff4444';
        const label = isOpen ? (lang === 'it' ? 'APERTO ORA' : 'OPEN NOW') : (lang === 'it' ? 'CHIUSO ORA' : 'CLOSED NOW');

sSpan = `<div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><span style="font-weight:bold; font-size:0.8rem; letter-spacing:1px; color:${color};"> <span style="font-size:1.2rem; vertical-align:middle;">●</span> ${label}</span>`;

        if (isOpen === false && d?.modal_note_isOpen) {
sSpan += `<div style="margin-top:10px; padding:12px; border:1px solid var(--bronzo); background:rgba(115, 74, 38, 0.1); font-size:0.8rem; color:var(--text-p); line-height:1.5; white-space:pre-line; border-radius:4px;">${d.modal_note_isOpen}</div>`;
}
    sSpan += `</div>`;
    }

    if (textEl) {
        const baseText = (type === 'book') ? d?.modal_m_book : d?.modal_m_info;
        textEl.innerHTML = `<div>${baseText}</div>` + sSpan;
    }

    if (noteEl) {
        if (type === 'book' && d?.modal_note_confirm) {
            noteEl.innerText = d?.modal_note_confirm.replace('{name}', c?.name);
            noteEl.style.display = 'block';
        } else {
            noteEl.style.display = 'none';
        }
    }

    if (btnYes) btnYes.innerText = d?.modal_yes;
    if (btnNo) btnNo.innerText = d?.modal_no;

    btnYes.onclick = () => {
        m.style.display = 'none';
        if(typeof PopupModal === 'function') PopupModal(false);
        toggleFloatingButtons(true);
        sendWA(type === 'book' ? 'Book' : 'Info');
    };

    btnNo.onclick = () => {
        m.style.display = 'none';
        if(typeof PopupModal === 'function') PopupModal(false);
        toggleFloatingButtons(true);
    };

    if (m) {
        m.style.display = 'flex';
        if(typeof PopupModal === 'function') PopupModal();
        toggleFloatingButtons(false);
    }
}

function sendWA(type) {
    const c = DATA.config;
    const d = DATA[lang];
    const nameEl = document.getElementById('b-name');
    const nome = nameEl ? nameEl.value.trim() : "";

    const dateRaw = document.getElementById('b-date').value;
    const dateEU = dateRaw.split('-').reverse().join('/');
    const time = document.getElementById('b-time').value;
    const qty = document.getElementById('b-qty').value;

    const iCal   = "%F0%9F%93%85";
    const iInfo  = "%E2%84%B9%EF%B8%8F";
    const iCheck = "%E2%9C%85";
    const iPin   = "%F0%9F%93%8D";
    const iUser  = "%F0%9F%91%A4";
    const iClock = "%E2%8F%B0";
    const iGroup = "%F0%9F%91%A5";
    const NL     = "%0A";
    const SP     = "%20";

    let cleanTel = c?.tel.replace(/\D/g, '');
    if (!cleanTel.startsWith('39') && cleanTel.startsWith('3')) {
        cleanTel = '39' + cleanTel;
    }

    let fullTextUrl = "";

    if (type === 'Info') {
const msgInfo = fillPlaceholder(d?.wa_msg_info, '{name}', c?.name);

fullTextUrl = iInfo +SP+
encodeURIComponent(msgInfo) +NL+ iCheck +NL+NL;
    } else {
const titleBook = d?.wa_msg_book_title || "";
const baseMsg = fillPlaceholder(d?.wa_msg_book, '{name}', c?.name);

let p = baseMsg.split(/\{nome\}|\{data\}|\{ora\}|\{time\}|\{ospiti\}|\{guests\}/);

fullTextUrl = iCal +SP+ encodeURIComponent("*"+ titleBook.toUpperCase() +"*") +NL+
iPin +SP+ encodeURIComponent("*"+ c?.name +"*") +NL+NL +iUser +SP+ encodeURIComponent(p[0] || "") + encodeURIComponent(nome) +NL+
iCal +SP+ encodeURIComponent(p[1] || "") +  encodeURIComponent(dateEU) +NL+ iClock +SP+
encodeURIComponent(p[2] || "") + encodeURIComponent(time) +NL+ iGroup +SP+
encodeURIComponent(p[3] || "") +  encodeURIComponent(qty) + (p[4] ? encodeURIComponent(p[4]) : "") +NL+ iCheck
+NL+NL;
    }

    const waUrl = "https://api.whatsapp.com/send/?phone=" + cleanTel + "&text=" + fullTextUrl;

    window.open(waUrl, '_blank');
}

async function _checkRealOnlineStatus() {
    try {
        const response = await fetch(`${File_Json_DB}?t=${Date.now()}`, {
            method: 'HEAD',
            cache: 'no-store'
        });
		return response.ok;
    } catch (e) {
        return false;
    }
}
let initGallery_OnLine = null;
async function initGallery() {
	if( initGallery_OnLine === null){
		initGallery_OnLine = await _checkRealOnlineStatus();
    }
	const root = document.getElementById('gal-root');
    if (!root) return;
    root.innerHTML = "";
    const realGalleryCount = (DATA && DATA.gallery) ? DATA.gallery.length : 0;

const MAX_ATTEMPTS = 20;

    const loadSlot = async (id) => {

        if (!initGallery_OnLine && id > realGalleryCount) {
            return null;
        }
        const wrap = document.createElement('div');
        wrap.className = 'gal-card';
        const img = document.createElement('img');

        const found = await loadImageAsync(img, DATA?.config?.paths?.gallery, id);
        if (found) {

            if (!initGallery_OnLine) {
                try {
                    const response = await fetch(img.src, { method: 'HEAD' });
                    const isPlaceholder = response.headers.get('X-PWA-Source') === 'Bunker-Placeholder';
                    if (isPlaceholder) {
                        if (id > realGalleryCount) return null;

                        wrap.classList.add('img-corrupted');
                        wrap.style.border = "2px dashed red";
                        console.warn(`🚨 PWA Gallery: Risorsa ${id} mancante in cache.`);
                    }
                } catch (e) {
                    if (id > realGalleryCount) return null;
                }
            }

            const itemData = DATA?.gallery?.[id - 1]?.[lang] || "";

            wrap.innerHTML = `
                <div class="gal-img-wrapper">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                         class="gal-img"
                         loading="lazy"
                         alt="${itemData}">
                </div>
                <div class="zoom-icon-badge" title="Zoom">${ICONS.zoom}</div>
            `;
            const imgWrapper = wrap.querySelector('.gal-img-wrapper');
            const dummyImg = imgWrapper.querySelector('.gal-img');

            img.className = 'gal-img';
            img.loading = 'lazy';
            img.alt = itemData;

            imgWrapper.replaceChild(img, dummyImg);

            wrap.onclick = () => openZoom(img.src, itemData);
            return wrap;
        }
        return null;
    };

    for (let i = 1; i <= MAX_ATTEMPTS; i++) {

        if (!initGallery_OnLine && i > realGalleryCount) break;
        const slotDOM = await loadSlot(i);
        if (slotDOM) {
            root.appendChild(slotDOM);
        } else {
            if (i <= realGalleryCount) {
                console.warn(`⚠️ PWA Gallery: Risorsa critica ${i} non disponibile.`);
            }
        }
    }
}

const _loaderGif = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOdKcyKyvJWwiS6EHQHiuFAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRG9rxBQSOCqyK6xPLSm72Z1G2LIuE8kyVP6AkAAAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pL5ezPXIEMHnEfVIBhYQrJkaaqCAqaJEcCZ7DRGKAq7d6r6DL3WJ6is6RVOfpAlKMBIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqSUs96YpDT9f0f98S8Zctf00Sg5BCfscRAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOdKcyKyvJWwiS6EHQHiuFAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRG9rxBQSOCqyK6xPLSm72Z1G2LIuE8kyVP6AkAAAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pL5ezPXIEMHnEfVIBhYQrJkaaqCAqaJEcCZ7DRGKAq7d6r6DL3WJ6is6RVOfpAlKMBIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqSUs96YpDT9f0f98S8Zctf00Sg5BCfscRAAA7";
async function checkSpecials(isManual = false, shouldShow = true) {
    const container = document.getElementById('specials-container');
    const popup = document.getElementById('specials-popup');
    if (!container || !popup) return;

    if (isManual || shouldShow) {
        popup.style.display = 'flex';
        PopupModal();
        toggleFloatingButtons(false);
        const btnSpan = document.getElementById('Btn_sSpan');
        if (btnSpan) btnSpan.style.color = 'var(--rame)';
        Btn_sSpan_curentColor = 'var(--rame);';
    }

    container.innerHTML = "";
    let foundAny = false;

    const internalRenderSet = async (items, prefix, title) => {
        if (!items || items.length === 0) return;

        const h = document.createElement('div');
        h.className = 'special-section-title';
        h.innerText = title;
        container.appendChild(h);

        const cardProx = items.map(async (item) => {
            const card = document.createElement('div');
            card.className = 'special-item-card';
            const titolo = lang === 'it' ? item.it_t : item.en_t;
            const desc = lang === 'it' ? item.it_d : item.en_d;

            card.innerHTML = `
                <div class="special-top-area">
                    <div class="special-card-img-wrapper">
                        <img id="img-${prefix}${item.id}" src="" alt="${titolo}" class="special-img" loading="lazy">
                    </div>
                    <div class="zoom-icon-badge">${ICONS.zoom}</div>
                </div>
                <div class="special-text-content">
                    <h4>${titolo}</h4>
                    <div class="divider-oro"></div>
                    <p>${desc}</p>
                </div>`;

            container.appendChild(card);
            const imgEl = card.querySelector('.special-img');
            const imgWrapper = card.querySelector('.special-card-img-wrapper');

            const found = await loadImageAsync(imgEl, DATA.config.paths.specials, prefix + item.id);
            if (found) {
                foundAny = true;
                card.style.cursor = "pointer";
                card.onclick = () => openZoom(imgEl.src, titolo);
            } else {

                imgWrapper.style.display = 'none';
                card.style.borderRadius = "12px";
            }
        });

        await Promise.all(cardProx);
    };

    if (DATA?.config) {
        const sMap = DATA.config.specials_map || {};

        await Promise.all([
            internalRenderSet(DATA.specials.pizze, sMap.pizze || 'pz_', DATA[lang].specials_pizze_title),
            internalRenderSet(DATA.specials.piatti, sMap.piatti || 'pi_', DATA[lang].specials_piatti_title)
        ]);
    }

    if (!foundAny && popup.style.display === 'flex' && !isManual) {
        closeSpecials();
    }
}

function handleDoc(fileName, btn) {

	const urlsPaths = DATA?.config?.paths?.docs?.base;

    const fullUrl = urlsPaths + ( DATA?.config?.paths?.docs?.[lang]?.dir ) + fileName;

    if (window.innerWidth < 768) {
        window.open(fullUrl, '_blank');
        return;
    }

    const popup = document.getElementById('legal-popup');
    const iframe = document.getElementById('legal-iframe');

    if (popup && iframe) {
        iframe.src = fullUrl;
        popup.style.display = 'flex';

        PopupModal();
        toggleFloatingButtons(false);
    }
}

function openZoom(src, description = "") {
    const popup = document.getElementById('legal-popup');
    const iframe = document.getElementById('legal-iframe');
    const loaderGif = window.APP_CONFIG.svg_loading;
    let zoomImg = document.getElementById('modal-zoom-img');
    if (!zoomImg) {
        zoomImg = document.createElement('img');
        zoomImg.id = 'modal-zoom-img';
        zoomImg.loading = "lazy";
        zoomImg.style.cssText = "max-width:90%;height:75vh;max-height:80vh;object-fit:contain;display:none;margin:auto;box-shadow: 0 0 30px var(--Sshadow);background-color: inherit; transition: opacity 0.3s ease-in-out;";
        iframe.parentNode.insertBefore(zoomImg, iframe);
    }
    let zoomDesc = document.getElementById('modal-zoom-desc');
    if (!zoomDesc) {
        zoomDesc = document.createElement('p');
        zoomDesc.id = 'modal-zoom-desc';
        zoomDesc.style.cssText = "color:var(--oro); font-family:'Cinzel'; text-align:center; margin-top:15px; text-transform:uppercase; letter-spacing:1px; font-weight:bold;";
        zoomImg.parentNode.insertBefore(zoomDesc, zoomImg.nextSibling);
    }
    if (iframe) iframe.style.display = 'none';
    const lastDot = src.lastIndexOf('.');
    let basePath = src;
    if (lastDot !== -1 && (src.length - lastDot) <= 6) {
        basePath = src.substring(0, lastDot);
    }
    const activeFormats = (typeof FORMATS !== 'undefined' && Array.isArray(FORMATS)) ? FORMATS : ['webp', 'jpg', 'jpeg', 'png'];
    const prioritizedExts = [...new Set(activeFormats.map(e => e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`))];
    zoomImg.dataset.basePath = basePath;
    zoomImg.dataset.priorityList = JSON.stringify(prioritizedExts);
    zoomImg.dataset.attempt = "0";

    zoomImg.onerror = function() {
        let attempt = parseInt(this.dataset.attempt || "0");
        const priorityList = JSON.parse(this.dataset.priorityList || "[]");
        attempt++;
        this.dataset.attempt = attempt;
        if (attempt < priorityList.length) {
            const nextExt = priorityList[attempt];
            const nextSrc = `${this.dataset.basePath}${nextExt}`;
            if (nextSrc && !nextSrc.includes('undefined')) {
                console.warn(`Fallback Zoom: Tentativo ${attempt} -> ${nextSrc}`);
                loadInBuffer(nextSrc);
            }
        } else {
            this.onerror = null;
            this.style.opacity = "1";
            console.error("PWA Zoom: Nessun formato disponibile.");
            this.src = window.APP_CONFIG.svg_logo;
        }
    };

    const loadInBuffer = (targetSrc) => {
        const imgBuffer = new Image();
        imgBuffer.onload = function() {

            zoomImg.src = imgBuffer.src;
            zoomImg.style.opacity = "1";
        };
        imgBuffer.onerror = function() {

            zoomImg.onerror();
        };
        imgBuffer.src = targetSrc;
    };

    zoomImg.style.display = 'block';
    zoomImg.style.opacity = "1";
    zoomImg.src = loaderGif;

    loadInBuffer(basePath + prioritizedExts[0]);
    zoomImg.alt = description;
    zoomDesc.innerText = description;
    zoomDesc.style.display = description ? 'block' : 'none';
    if (popup) {
        popup.style.display = 'flex';
        if (typeof PopupModal === "function") PopupModal();
        if (typeof toggleFloatingButtons === "function") toggleFloatingButtons(false);
    }
}

function closeLegal() {
    const popup = document.getElementById('legal-popup');
    const iframe = document.getElementById('legal-iframe');
    const zoomImg = document.getElementById('modal-zoom-img');
    const zoomDesc = document.getElementById('modal-zoom-desc');

    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');

    if (zoomImg) {
        zoomImg.src = "";
        delete zoomImg.dataset.attempt;
        delete zoomImg.dataset.basePath;
    }

    if (popup) {
        popup.style.display = 'none';

        if (iframe) {
            iframe.src = "";
            iframe.style.display = 'block';
        }

        if (zoomImg) zoomImg.style.display = 'none';
        if (zoomDesc) zoomDesc.style.display = 'none';

        if (modalTitle) modalTitle.style.display = 'block';
        if (modalText) modalText.style.display = 'block';

        const specialsPopup = document.getElementById('specials-popup');
        const isSpecialsOpen = specialsPopup && specialsPopup.style.display === 'flex';

        if (!isSpecialsOpen) {

            PopupModal(false);
            toggleFloatingButtons(true);
        } else {

            PopupModal();
            toggleFloatingButtons(false);
        }
    }
}

function switchTheme() {
    if (isTransitioning) return;
    isTransitioning = true;
    const btn = document.activeElement;
    const body = document.body;

    body.classList.add('lang-transition');
    body.classList.add('theme-switching');
    setTimeout(() => {

        theme = (IsTheme === 'dark' ? 'light' : 'dark');

        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }

    IsTheme = theme;
    if(!DATA) return;
    const d = DATA[lang], c = DATA.config;
const T = document.getElementById('themeIcon-span');
T.innerHTML = fillPlaceholder(d.nav[11], '{istheme}', (IsTheme === 'dark' ? 'LIGHT' : 'DARK'));

localStorage.setItem('user_preferred_theme', theme);

    const activeBtn = document.activeElement;
    if (activeBtn && activeBtn.parentElement) {
        const clone = activeBtn.cloneNode(true);
        activeBtn.parentNode.replaceChild(clone, activeBtn);
    }
    body.classList.remove('theme-switching');

    setTimeout(() => {
        body.classList.remove('lang-transition');
        isTransitioning = false;
    }, 50);
    }, 450);
}

function switchLang() {
    if (isTransitioning) return;
    isTransitioning = true;
const mainContainer = document.querySelector('main');

    const currentAnchor = window.location.hash;
    if (currentAnchor) {
        sessionStorage.setItem('active_section', currentAnchor);
    }

mainContainer.classList.add('lang-transition');
    setTimeout(() => {
        lang = (lang === 'it' ? 'en' : 'it');
localStorage.setItem('user_preferred_lang', lang);

        render();
        SetupdatePwaStatus('ok');

        const targetAnchor = sessionStorage.getItem('active_section');

        if (targetAnchor) {
            const followAnchor = () => {
                const element = document.querySelector(targetAnchor);
                if (element) {

                    element.scrollIntoView({ behavior: 'instant' });
                } else {

                    requestAnimationFrame(followAnchor);
                }
            };
            requestAnimationFrame(followAnchor);
        }

    setTimeout(() => {
        mainContainer.classList.remove('lang-transition');
        isTransitioning = false;
    }, 50);

}, 450);}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('user_preferred_theme')) {
        if (e.matches) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
});

function closeSpecials() {
    document.getElementById('specials-popup').style.display = 'none';
    clearTimeout(specialsTimer);

    PopupModal(false);
    toggleFloatingButtons(true);
    if (specialsTimer) clearTimeout(specialsTimer);

}

function toggleFaq(index) {
    document.getElementById(`faq-${index}`).classList.toggle('active');
}

function isLocalOpen() {
    if (!DATA || !DATA.config || !DATA.config[lang]) return null;

try {
const adesso = new Date();
const oraAttuale = (adesso.getHours() * 100) + adesso.getMinutes();

const oggiIdx = (adesso.getDay() + 6) % 7;
const ieriIdx = (oggiIdx + 6) % 7;
const oreLocale = DATA.config[lang].hours;
const parseOra = (stringa) => {
const match = stringa.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
            if (!match) return 0;

let h = parseInt(match[1]);
const m = parseInt(match[2]);
const p = match[3] ? match[3].toLowerCase() : null;
    if (p) {

        if (p === "pm" && h < 12) h += 12;
        if (p === "am" && h === 12) h = 0;
    }

    return (h * 100) + m;
};

const verificaGiorno = (idx, checkNotte) => {
    const stringaOrario = oreLocale[idx];
    if (!stringaOrario) return false;

const turni = stringaOrario.split(/[\/\n]/);
    return turni.some(turno => {
        const parti = turno.split(/\s*-\s*/);
        if (parti.length !== 2) return false;

            const inizio = parseOra(parti[0]);
            const fine = parseOra(parti[1]);

                if (checkNotte) {
                    return (fine < inizio && oraAttuale < fine);
                } else {
                    let fineEffettiva = fine;
                    if (fine < inizio) fineEffettiva += 2400;
                    return oraAttuale >= inizio && oraAttuale < fineEffettiva;
                }
            });
        };

if (verificaGiorno(oggiIdx, false)) return true;
if (verificaGiorno(ieriIdx, true)) return true;

        return false;

    } catch (e) {
        console.error("Errore calcolo apertura:", e);
        return null;
    }
}

function downloadVCard() {
    const d = DATA[lang];
    const c = DATA.config;
    const logoB64 = "";
    const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${c.name}`,
        `ORG:${c.name}`,
        `TITLE:${fillPlaceholder(d.site_title,'{name}','')}`,
        `TEL;TYPE=CELL,VOICE:${c.tel}`,
        `TEL;TYPE=WORK,VOICE:${c.tel_fisso}`,
        `EMAIL:${c.mail}`,
        `ADR;TYPE=WORK,PREF:;;${c.address}`,
        `PHOTO;ENCODING=b;TYPE=PNG:${logoB64}`,
        "X-ABShowAs:COMPANY",
        `URL:${window.location.origin+FRONTEND_BASE}`,
        "REV:" + new Date().toISOString(),
        "END:VCARD"
    ].join("\n");

    const blob = new Blob([vcard], { type: 'text/x-vcard;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${c.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function copyPIVA() {
    const c = DATA.config;
    const d = DATA[lang];
navigator.clipboard.writeText(c.piva).then(() => {   const el = document.getElementById('piva-text'), old = el.innerHTML;
el.innerHTML = `<strong>${d.copy_msg}</strong>`;
setTimeout(() => { el.innerHTML = old;
window.open(c.AdE_link, '_blank'); }, 1200);
    });
}

function toggleFloatingButtons(show) {
    const container = document.getElementById('wa-fixed-container');
    if (container) {
        container.style.display = show ? 'block' : 'none';
    }
}

let lastNavHeight = 0;
const updateNavHeight = () => {
    const nav = document.querySelector('nav');
    if (nav) {
        const rect = nav.getBoundingClientRect();
        const currentHeight = Math.round(rect.height);
        if (Math.abs(currentHeight - lastNavHeight) >= 2) {
            document.documentElement.style.setProperty('--nav-h', currentHeight + "px");
            lastNavHeight = currentHeight;
        }
    }
};
setTimeout(updateNavHeight, 500);
window.addEventListener('resize', updateNavHeight);
window.addEventListener('load', updateNavHeight);

window.addEventListener('appinstalled', () => {
 console.log('PWA APP installata con successo');
 localStorage.setItem('pwa_app_Isinstall', 'true');
});

async function hPWAInstal(Z) {
    const os = getMobileOS();
    const isAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const PWAisInstall = localStorage.getItem('pwa_app_Isinstall');
if (window.deferredPrompt || PWAisInstall !== 'true') {

        window.deferredPrompt.prompt();
const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
console.log('Utente ha installato la PWA');

if(Z) Z.classList.add('vcard-btn-premium_Disabled');
        } else {
console.log('Utente ha annullato...');
        }
        window.deferredPrompt = null;
    } else {

        if (os === 'iOS') {
            const c = DATA.config;
            handleDoc(c.pdf?.[lang]?.pdfPWA);
        } else if (isAlreadyInstalled) {

alert("⚠️  APP Exist & Is Runing...  ⚠️");
if(Z){
Z.classList.add('vcard-btn-premium_Disabled');
}
        } else {
alert("🌐  Browser not Supported !  🛡\n\n  ● OR 🕵  Incognite Mode Actived  ⚠️️");
if(Z){
Z.classList.add('vcard-btn-premium_Disabled');
}
        }
    }
}
async function enablePWAButton() {

    const tryToUnlock = () => {
        const btn = document.querySelector('.vcard-btn-premium_Disabled');
        if (btn) {
            const PWAisInstall = localStorage.getItem('pwa_app_Isinstall');
            if (((window.deferredPrompt || getMobileOS() === 'iOS') && PWAisInstall !== 'true')) {
                btn.classList.remove('vcard-btn-premium_Disabled');
                return true;
            }
        }
        return false;
    };

    const checkBtnExist = setInterval(() => {
        if (tryToUnlock()) {
            clearInterval(checkBtnExist);
        }
    }, 50);

    const wakeUpDesktop = () => {
        if (tryToUnlock()) {
            cleanListeners();
        }
    };
    const cleanListeners = () => {
        clearInterval(checkBtnExist);
        window.removeEventListener('click', wakeUpDesktop);
        window.removeEventListener('touchstart', wakeUpDesktop);
        window.removeEventListener('mousemove', wakeUpDesktop);
    };
    window.addEventListener('click', wakeUpDesktop);
    window.addEventListener('touchstart', wakeUpDesktop);
    window.addEventListener('mousemove', wakeUpDesktop);

    setTimeout(() => {
        cleanListeners();
    }, 12000);
}

let IshandleIncognitoMode = false;
function handleIncognitoMode() {
    IshandleIncognitoMode = true;
    SetupdatePwaStatus('sw_not_work');
tornaSu();
    const d = DATA?.[lang];
    const ObjHtml = document.documentElement;
    const ISM = confirm(d.pwa_incognito_alert);
    if (!ISM) {
        navigator.clipboard.writeText(window.location.href).then( async () => {
    setTimeout(() => {
            alert(d.pwa_incognito_trash);
ObjHtml.classList.add('mode-incognite-trash');
        setTimeout(() => {
            document.body.innerHTML = "";
        }, 5000);
    }, 500);
        }).catch((err) => {
console.error("Error: ", err.name, err.message);

ObjHtml.classList.add('mode-incognite-trash-nuclear');
            setTimeout(() => { document.body.innerHTML = ""; }, 5000);
        });
    } else {
ObjHtml.classList.add('mode-incognite-active');
document.getElementById('BLang').classList.add('is-disabled');
document.getElementById('BTheme').classList.add('is-disabled');
    }
}
function tornaSu() {
document.documentElement.scrollTop = 0;

document.body.scrollTop = 0;
}

let isPwaAlreadySynced = false;
let pwaPendingPercent = null;
let pwaPendingFcurrent = null;
let pwaPendingFtotal = null;
let pwaPendingFfail = null;
let pwaPendingFfailr = null;
let pwaPendingFvarExt = null;
let lastUiUpdate = 0;

async function initPwaLogic(X = false, Xtime = 5000) {
    if (!('serviceWorker' in navigator)) return false;

    try {
const reg = await navigator.serviceWorker.register(File_SW, { scope: FRONTEND_BASE }).then((reg) => {
      console.log('📡 PWA: SW Registrato con successo per lo Scope:', reg.scope);
  }).catch((err) => {
      console.error('❌ PWA: Errore di registrazione SW: ', err);
	  console.error('Name: ', err.name);
      console.error('Msg: ', err.message);
  });

        const registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Ready')), Xtime))
        ]);

        const awaitActive = (r) => {
            return new Promise((resolve) => {
                if (r.active) return resolve(r.active);
                const sw = r.installing || r.waiting;
                if (!sw) return resolve(null);
                sw.addEventListener('statechange', (e) => {
                    if (e.target.state === 'activated') resolve(r.active);
                });
            });
        };

const activeWorker = await awaitActive(registration);

        if (activeWorker) {

if (!navigator.serviceWorker.controller) {
    console.log("PWA: Reclam controll...");

await new Promise(resolve => {
    navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
});
}

navigator.serviceWorker.removeEventListener('message', hSwMessages);
navigator.serviceWorker.addEventListener('message', hSwMessages);

            if (!X) {

                if (!DATA) {
const response = await fetch(File_Json_DB);
    DATA = await response.json();
    console.log("PWA: Data Ready...");
                }

                startSyncProcess(activeWorker);
            }
            return true;
        }
        return false;
    } catch (err) {
        console.error("PWA: Error logic:", err);
        return false;
    }
}

async function startSyncProcess(worker, isCache = false) {
    Watchdog_PwA();

    const lastSyncedVersion = localStorage.getItem('pwa_last_version');
    const currentVersion = window.APP_CONFIG.ver_site;

    if (!DATA) {
        console.error("PWA: Error Sync, DATA is Null !");
        SetupdatePwaStatus('sw_not_work');
        return;
    }

    if (!isPwaAlreadySynced || lastSyncedVersion !== currentVersion || isCache) {

        console.log(`PWA: Analisi allineamento... (Pagina: ${currentVersion} | Sigillo: ${lastSyncedVersion})`);

        if (lastSyncedVersion !== currentVersion) {
            SetupdatePwaStatus('update');
        } else {
            SetupdatePwaStatus('working');
        }

        setTimeout(() => {
            const target = navigator.serviceWorker.controller || worker;

            if (target) {
                console.log("PWA: Invio segnale INIT_DB al Service Worker...");

                target.postMessage({
                    type: 'INIT_DB',
                    data: DATA,
                    version: currentVersion
                });
            } else {
                console.warn("PWA: SW Controller non trovato, riprovo tra 2s...");
                setTimeout(() => startSyncProcess(null, isCache), 2000);
            }
        }, 200);

    } else {

        console.log("PWA: Sistema già allineato per questa sessione. V:", currentVersion);
        isPwaAlreadySynced = true;
        SetupdatePwaStatus('ok');
    }
}

if ('serviceWorker' in navigator) {
    const ERROR_WHITELIST = {
    validTargets: [
        '.jpg', '.jpeg', '.png', '.webp',
        '.pdf', 'DB', 'DATABASE', 'CRITICAL'
        ]
    };
}
function hSwMessages(event) {

    const ExfileCount = 0;
        const now = Date.now();
const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "\u2007" + s;
    return s;
};

        if (event.data.type === 'SYNC_START') {
    pwaPendingFcurrent = 0;
    pwaPendingFtotal = 0;
	pwaPendingFfail = 0;
    pwaPendingFfailr = 0;
    lastUiUpdate = 0;
SetupdatePwaStatus('start-sync');
        }

if (event.data.type === 'SYNC_PROGRESS') {

const { details = {} } = event.data;

if (details && Object.keys(details).length > 0) {

const {
    percent = 0,
    current = 0,
    total = 0,
    request_failed = 0,
	failed_assets = 0
} = details;

const uiCurrent = Math.max(0, current - ExfileCount);
const uiTotal = Math.max(0, total - ExfileCount);
const dynamicSize = uiTotal.toString().length;

    pwaPendingPercent = percent;
    pwaPendingFcurrent = uiCurrent;
    pwaPendingFtotal = uiTotal;

pwaPendingFfail = pad(failed_assets, dynamicSize);
pwaPendingFfailr = pad(request_failed, dynamicSize);
    const fPercent = pad(percent, 3);
    const fCurrent = pad(uiCurrent, dynamicSize);
    const fTotal   = pad(uiTotal, dynamicSize);

    const now = performance.now();

if(percent === 100 || (now - lastUiUpdate >= 25)) {
        lastUiUpdate = now;

updatePwaStatus('working',
`📡 [ <span class="num-stable">${fPercent}</span>% ]`,
`📥💾 [ <span class="num-stable">${fCurrent}</span> / <span class="num-stable">${fTotal}</span> ] ➡🚫 [ <span class="num-stable">${pwaPendingFfailr}</span> | <span class="num-stable">${pwaPendingFfail}</span> ]`
);
}
    }else{
        SetupdatePwaStatus('working');
    }
}

if (event.data.type === 'SYNC_END') {
    const { hasChanged, serverVersion } = event.data;
    const lastVer = localStorage.getItem('pwa_last_version');
    const currentHTMLVer = window.APP_CONFIG.ver_site;
    const alreadyRefreshed = sessionStorage.getItem('pwa_update_done');

    console.log("--- DEBUG PANZER ---");
    console.log("Server (SW) dice:", serverVersion);
    console.log("Sigillo (LocalDisk):", lastVer);
    console.log("Pagina (HTML-DOM):", currentHTMLVer);
    console.log("Download? ", hasChanged);
    console.log("--------------------");

    const { details = {} } = event.data;
    if (details && Object.keys(details).length > 0) {
        const {
            total = 0,
            completed = 0,
            failed = 0,
            request_failed = 0,
            FileVarExt = 0
        } = details;

        const uiCompl = Math.max(0, completed - ExfileCount);
        const uiTotal = Math.max(0, total - ExfileCount);
        const dynamicSize = uiTotal.toString().length;

        pwaPendingFcurrent = pad(uiCompl, dynamicSize);
        pwaPendingFtotal = pad(uiTotal, dynamicSize);
        pwaPendingFfail = pad(failed, dynamicSize);
        pwaPendingFfailr = pad(request_failed, dynamicSize);
        pwaPendingFvarExt = pad(FileVarExt, dynamicSize);

        const delay = (request_failed > 0) ? 500 : 4000;
        setTimeout(() => {
			if( request_failed > 0 || completed > 0 ){
				updatePwaStatus('complete',
					`🚫 [ <span class="num-stable">${pwaPendingFfailr}</span> ]`,
					`📥💾 [ <span class="num-stable">${pwaPendingFcurrent}</span> / <span class="num-stable">${pwaPendingFtotal}</span> ] ➡⚠️ [ <span class="num-stable">${pwaPendingFvarExt}</span> | <span class="num-stable">${pwaPendingFfail}</span> ] ✔`
				);
			}else{
				SetupdatePwaStatus('complete');
			}
        }, delay);

        if (details.request_failed === 0) {
            console.log("PWA: Sync completata con successo.");

            if (serverVersion) {
                localStorage.setItem('pwa_last_version', serverVersion);
            }

			if (hasChanged) {
				if (serverVersion !== currentHTMLVer) {

					console.log("🚀 PWA: New Version. Refresh in corso...");
				}else{

				}
				setTimeout(() => {

					if (window.db) window.db.close();

					navigator.serviceWorker.getRegistrations().then(registrations => {
						Promise.all(registrations.map(r => r.unregister())).then(() => {
							console.log("PWA: SW rimosso.");
							window.location.href = window.location.pathname;
						});
					});
				}, 500);
				return;
			}
            sessionStorage.removeItem('pwa_update_done');
            isPwaAlreadySynced = true;
        } else {
            isPwaAlreadySynced = false;
            console.warn("PWA: Sync parziale, alcuni file core o varianti sono falliti.");
        }
    } else {
        SetupdatePwaStatus('complete');
    }
}

if (event.data.type === 'CORE_UPDATE_RELOAD') {
	localStorage.setItem('pwa_last_version', event.data?.sSV);
    console.log("💥 PWA Core-Assets: Reset totale in corso...");

    if (window.db) window.db.close();

    navigator.serviceWorker.getRegistrations().then(registrations => {
        Promise.all(registrations.map(r => r.unregister())).then(() => {
			alert('💥 PWA CoreAssets: Reset, Push Ok to Refresh Now !');
			window.location.href = window.location.pathname;
        });
    });
}

        if (event.data.type === 'SW_ERROR') {
            const msg = event.data.message;
            const isAuthorized = ERROR_WHITELIST.validTargets.some(term =>
                msg.toLowerCase().includes(term.toLowerCase())
            );

            if (isAuthorized) {
const report = `⚠️ PWA SW: ${msg}`;
                if (typeof errorLog !== 'undefined') errorLog.push(report);
                if (typeof showErrorPanel === "function") showErrorPanel(report);
            } else {
                console.log("PWA info (Ignorato da Whitelist):", msg);
            }
        }

        if (event.data.type === 'SYNC_RETRY') {

SetupdatePwaStatus('offline');
        }
}
function updatePwaStatusHTML(e, msg, eXmsg, eXmsgF){
    if(eXmsg !== ''){
e.innerHTML = eXmsg +' '+ msg +'<br>'+ eXmsgF;
    }else{
    e.innerText = msg;
    }
}
function SetupdatePwaStatus(statusCode) {
    switch (statusCode) {
        case 'sw_not_work':
    updatePwaStatus('sw_not_work','⚠️🔌');
            break;

        case 'offline':
    updatePwaStatus('offline','📡🚫');
            break;

        case 'start-sync':
    updatePwaStatus('working','🔃');
            break;

        case 'working':
    updatePwaStatus('working','📶🔄');
            break;

        case 'complete':
    updatePwaStatus('complete','📴💾');
            break;

        case 'ok':
    updatePwaStatus('complete','✔');
            break;

        case 'update':
    updatePwaStatus('update','🚀');
            break;

        default:
    updatePwaStatus('working','❌🔃⚙️');

    }
}
function updatePwaStatus(status, eXmsg='', eXmsgF='') {
    const dot = document.getElementById('sync-dot');
    const text = document.getElementById('sync-text');
    if (!dot || !text || !DATA) return;
    const labels = DATA[lang];

    text.classList.add('sync-no-transition');

    if (status === 'offline') {
        dot.className = 'status-dot dot-offline';
updatePwaStatusHTML(text, labels.sync_offline, eXmsg, eXmsgF);

    } else if (status === 'sw_not_work') {
        dot.className = 'status-dot dot-offline';
updatePwaStatusHTML(text, labels.sync_SW_off, eXmsg, eXmsgF);

    } else if (status === 'complete') {
    dot.className = 'status-dot dot-complete';
updatePwaStatusHTML(text, labels.sync_complete, eXmsg, eXmsgF);

        document.title = site_title_now || document.title;
        setTimeout(() => {
text.classList.remove('sync-no-transition');
        }, 500);
    } else if (status === 'working') {
        dot.className = 'status-dot dot-working';

        const numericPercent = eXmsg ? parseInt(eXmsg.replace(/[^0-9]/g, '')) : 0;

        if (numericPercent % 5 === 0 || numericPercent === 100) {
            document.title = `(${numericPercent}%) ${site_title_now || 'ZC'}`;
        }

        text.style.opacity = '0.9';

updatePwaStatusHTML(text, labels.sync_running, eXmsg, eXmsgF);

        const _force = text.offsetHeight;

        text.style.opacity = '1';

        if (!isNaN(numericPercent)) {
            text.style.color = (numericPercent % 2 === 0) ? 'var(--text-p)' : 'var(--text-main)';
            text.style.opacity = (text.style.opacity === '0.99') ? '1' : '0.99';
        }

    } else if (status === 'update') {
      dot.className = 'status-dot dot-working';
updatePwaStatusHTML(text, labels.sync_update, eXmsg, eXmsgF);
    }
}

window.addEventListener('offline', () => {
initGallery_OnLine = false;
    if(IshandleIncognitoMode){ return; }
SetupdatePwaStatus('offline');
});
window.addEventListener('online', () => {
initGallery_OnLine = true;
    if(IshandleIncognitoMode){ return; }

    if ('serviceWorker' in navigator) {
        isPwaAlreadySynced = false;
        ReloadWS_PwA();
    }
});
function ReloadWS_PwA() {
setTimeout(async () => {

const ws = navigator.serviceWorker.controller;

    if (ws && !isPwaAlreadySynced) {
        initPwaLogic(true);
        startSyncProcess(ws, true);
        return;
    }
    if (!ws) {

const hasCache = await isCacheEmpty(false, 1, 1024, true);

    const isPwaReady = await initPwaLogic();
        if(!isPwaReady && hasCache){
alert("⚠️  Cache Not Found  ⚠️\n\n🌐  Web Site:  Reload.");
            setTimeout(() => {

				window.location.href = window.location.pathname;

            }, 500);
        }
    }
}, 1000);
}
async function isCacheEmpty(X = false, maxFiles = 1, maxSize = 1024, excludeUser = false) {
    const cacheNames = await caches.keys();
    if (cacheNames.length === 0) return true;

    let totalSize = 0;
    let totalFiles = 0;

for (const name of cacheNames) {

if (excludeUser && name.startsWith('user_')) {
console.log(`PWA: Salto controllo cache utente: ${name}`);
    continue;
}
    const cache = await caches.open(name);
    const requests = await cache.keys();

    if (!X) {
        if (requests.length > 0) return false;
    } else {

        for (const request of requests) {
    const response = await cache.match(request);
            if (response) {
        const blob = await response.blob();
            totalSize += blob.size;
            totalFiles++;
if (totalFiles > maxFiles || totalSize >= maxSize) return false;
            }
        }
    }
}
    return true;
}

async function Watchdog_PwA() {
if(IshandleIncognitoMode){ return; }
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {

    const activeWorker = registration.active;
        if (activeWorker) {

activeWorker.addEventListener('statechange', () => {
console.log("* Stato attuale del worker: ", activeWorker.state);
console.log("* navigator.onLine = ", navigator.onLine);
if (!navigator.onLine) {
    CallErrorFailureBox();
    return;
}

if (activeWorker.state === 'redundant') {
console.log("Watchdog PwA: SW Death...");
        ReloadWS_PwA();
                }
            });
        }
    });
}}

let Btn_sSpan_curentColor = '';
const ICONS = {
    brand: `<svg class="svg-ui" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h2v11H5V4.5C5 3.12 5.9 2 7 2zM5 15h4v7H5v-7z"/><path d="M14 2h1v7h-1V2zm3 0h1v7h-1V2zm3 0h1v7h-1V2zm-7.5 9c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2V9h-9v2zm1.5 4h6v7h-6v-7z"/></svg>`,
    specials: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
    storia: `<svg class="svg-ui" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h12v11.64c-.33-.4-.79-.64-1.3-.64H7.3c-.51 0-.97.24-1.3.64V4zm12 16H6v-1.36c.33.4.79.64 1.3.64h9.4c.51 0 .97-.24 1.3-.64V20z"/><rect x="8" y="7" width="8" height="1.5" rx="0.5"/><rect x="8" y="10" width="8" height="1.5" rx="0.5"/><rect x="8" y="13" width="5" height="1.5" rx="0.5"/></svg>`,
    prenota: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2v2zM19 21H5V8h14v13z"/></svg>`,
    menu: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 13l-1.5-1.5L10 15V4h3v11z"/></svg>`,
    foto: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
    faq: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
    safety: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
    orari: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
    call: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
	tel_fisso: `<svg class="svg-ui" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 9c1.38 0 2.5-1.12 2.5-2.5S20.88 4 19.5 4h-15C3.12 4 2 5.12 2 6.5S3.12 9 4.5 9h2c.55 0 1-.45 1-1V7h9v1c0 .55.45 1 1 1h2z"/><path fill-rule="evenodd" d="M21 19v-2c0-2.21-1.79-4-4-4H7c-2.21 0-4 1.79-4 4v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z M12 14.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z M12 15.2a0.6 0 1 1 0 1.2 0.6 0.6 0 0 1 0-1.2z M13.6 15.6a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M14.3 16.9a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M13.6 18.2a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M12 18.6a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M10.4 18.2a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M9.7 16.9a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z M10.4 15.6a0.5 0 1 1 0 1 0.5 0.5 0 0 1 0-1z" clip-rule="evenodd"/></svg>`,
    legal_nav: `<svg class="svg-ui" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    vcard: `<svg class="svg-ui" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
    PWA: `<svg class="svg-ui" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="none" /><g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 2L4 6v8l8 4 8-4V6l-8-4z"/><path d="M12 18V10"/><path d="M20 6l-8 4-8-4"/></g><text x="12" y="23" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="5" font-weight="900" stroke="none" fill="currentColor" style="user-select: none; letter-spacing: 0.5px;">PWA</text></svg>`,
    mail: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    pin: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    fb: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>`,
    ig: `<svg class="svg-ui" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    tt: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.02 1.64-.13.74.1 1.53.58 2.1.55.56 1.36.88 2.15.86 1.23-.04 2.32-.9 2.62-2.09.11-.41.14-.84.13-1.26.04-4.84.02-9.69.05-14.53z"/></svg>`,
    ta: `<svg class="svg-ui" fill="currentColor; width:24px;" viewBox="0 0 24 24"><path d="M22.46 6.13c-1.12.33-2.3.51-3.52.51-2.6 0-4.94-.82-6.94-2.18C10 5.82 7.66 6.64 5.06 6.64c-1.22 0-2.4-.18-3.52-.51.27.67.73 1.24 1.34 1.63C2.31 8.5 2 9.4 2 10.38c0 3.12 2.53 5.65 5.65 5.65 1.13 0 2.18-.33 3.07-.91l1.28 2.56 1.28-2.56c.89.58 1.94.91 3.07.91 3.12 0 5.65-2.53 5.65-5.65 0-.98-.31-1.88-.88-2.62.61-.39 1.07-.96 1.34-1.63zM7.65 14.5c-2.27 0-4.12-1.85-4.12-4.12S5.38 6.26 7.65 6.26s4.12 1.85 4.12 4.12-1.85 4.12-4.12 4.12zm8.7 0c-2.27 0-4.12-1.85-4.12-4.12s1.85-4.12 4.12-4.12 4.12 1.85 4.12 4.12-1.85 4.12-4.12 4.12zM7.65 8.44c-1.07 0-1.94.87-1.94 1.94s.87 1.94 1.94 1.94 1.94-.87 1.94-1.94-.87-1.94-1.94-1.94zm8.7 0c-1.07 0-1.94.87-1.94 1.94s.87 1.94 1.94 1.94 1.94-.87 1.94-1.94-.87-1.94-1.94-1.94zM7.65 9.71c-.37 0-.67.3-.67.67s.3.67.67.67.67-.3.67-.67-.3-.67-.67-.67zm8.7 0c-.37 0-.67.3-.67.67s.3.67.67.67.67-.3.67-.67-.3-.67-.67-.67z"/></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" class="svg-ui"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-12-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`,
    legal: `<svg class="legal-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2z"/></svg>`,
    info: `<svg class="svg-ui" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    wa: `<svg viewBox="0 0 24 24" fill="currentColor" width="35"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    tel: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path></svg>`,
    arch: `<svg class="arch-logo-svg" viewBox="0 0 24 24" fill="currentColor" style="width:64px; height:64px;"><path d="m13.511 5.832 3.323-2.673 2.134 2.122-2.66 3.338h4.692v3.001h-4.692l2.66 3.338-2.134 2.122-3.323-2.673v4.614h-3.022v-4.614l-3.323 2.673-2.134-2.122 2.66-3.338H3v-3.001h4.692l-2.66-3.338 2.134-2.122 3.323 2.673V1.219h3.022v4.613Z"/><path d="M10.489 18.168h3.022v4.613h-3.022v-4.613Z"/></svg>`,
    ita: `<svg class="svg-nav-flag" viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#ce2b37"/></svg>`,
    eng: `<svg class="svg-nav-flag" viewBox="0 0 60 30"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>`,
 zoom: `<svg class="svg-ui" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`,
 themeIcon: `<svg class="svg-ui" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.72 1.5-1.5 0-.44-.18-.86-.44-1.22-.26-.36-.44-.83-.44-1.28 0-.92.78-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z"></path></svg>`
};

document.addEventListener('DOMContentLoaded', () => {

	(function() {
    let lastPos = 0;
    let locked = false;

    window.addEventListener('scroll', () => {
        if (!locked) {
            lastPos = window.scrollY;
        }
    }, { passive: true });

    new MutationObserver(() => {
        const s = window.getComputedStyle(document.body);
        const isH = s.overflow === 'hidden' || s.height === '100vh' || s.maxHeight === '100vh';

        if (isH && !locked) {
            if (lastPos === 0) {
                lastPos = window.scrollY || document.documentElement.scrollTop;
            }

            Object.assign(document.body.style, {
                position: 'fixed',
                top: `-${lastPos}px`,
                width: '100%'
            });
            locked = true;
        } else if (!isH && locked) {

            const html = document.documentElement;
            const originalScrollBehavior = html.style.scrollBehavior;
            const bodyScrollBehavior = document.body.style.scrollBehavior;

            html.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';

            Object.assign(document.body.style, {
                position: '',
                top: '',
                width: ''
            });

            window.scrollTo(0, lastPos);

            requestAnimationFrame(() => {
                html.style.scrollBehavior = originalScrollBehavior;
                document.body.style.scrollBehavior = bodyScrollBehavior;
            });

            locked = false;
        }
    }).observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style']
    });
})();

});
