
/**
 * Intinya Biar Ringan
 * plugins/webfontloader.js
 *
 * Optimized WebFont loading:
 * - Only load needed weights (400,700)
 * - Use short timeout + graceful fallback
 * - Cache flag in localStorage to skip JS loader on repeat visits
 * - Add preconnect + direct stylesheet fallback (display=swap)
 */

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap';

function appendPreconnect() {
    if (!document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')) {
        const pre1 = document.createElement('link');
        pre1.rel = 'preconnect';
        pre1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(pre1);
    }
    if (!document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
        const pre2 = document.createElement('link');
        pre2.rel = 'preconnect';
        pre2.href = 'https://fonts.gstatic.com';
        pre2.crossOrigin = 'anonymous';
        document.head.appendChild(pre2);
    }
}

function appendStylesheet() {
    if (document.getElementById('gf-poppins')) return;
    const link = document.createElement('link');
    link.id = 'gf-poppins';
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
}

export async function loadFonts () {
    try {
        appendPreconnect();

        // Fast path: if fonts have been loaded before in this browser, skip JS loader cost.
        if (localStorage.getItem('fonts:poppins:loaded') === '1') {
            appendStylesheet();
            document.documentElement.classList.add('wf-active');
            return;
        }

        const webFontLoader = await import(/* webpackChunkName: "webfontloader" */ 'webfontloader');

        let settled = false;
        const timeoutMs = 2500; // keep UX snappy — bail out quickly if blocked by CSP/network

        // Safety net: if loader doesn't call back in time, inject stylesheet and continue.
        const timer = setTimeout(() => {
            if (!settled) {
                appendStylesheet();
                document.documentElement.classList.add('wf-inactive');
            }
        }, timeoutMs);

        webFontLoader.load({
            google: {
                // Only the weights you actually use; add others if REALLY needed.
                families: ['Poppins:400,700&amp;display=swap'],
            },
            timeout: timeoutMs,
            active() {
                settled = true;
                clearTimeout(timer);
                localStorage.setItem('fonts:poppins:loaded', '1');
                document.documentElement.classList.add('wf-active');
            },
            inactive() {
                settled = true;
                clearTimeout(timer);
                // Fallback stylesheet ensures text is visible with system fonts until fonts arrive.
                appendStylesheet();
                document.documentElement.classList.add('wf-inactive');
            },
        });
    } catch (e) {
        // Any failure: fall back to direct stylesheet — non-blocking render, display=swap.
        appendStylesheet();
        document.documentElement.classList.add('wf-inactive');
    }
}
