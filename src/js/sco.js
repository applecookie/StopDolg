import convertColors from './ansiColors';

document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementsByTagName('body')[0];
    const head = document.getElementsByTagName('head')[0];

    // append style
    const elStyle = document.createElement('link');
    elStyle.type = 'text/css';
    elStyle.rel = 'stylesheet';
    elStyle.href = '/.dev/css/sco.css';
    head.appendChild(elStyle);

    // append widget if on .dev path
    if (/\/\.dev(\/|$)/i.test(location.pathname)) {
        const elWidget = document.createElement('div');
        elWidget.id = 'site-conveyer-widget';
        elWidget.innerHTML = '<header><a href="/">Back to your project</a></header>';
        body.appendChild(elWidget);

        return;
    }

    // append overlay
    const elOverlay = document.createElement('div');
    elOverlay.id = 'site-conveyer-overlay';
    elOverlay.innerHTML = '<header>SiteConveyer</header><div class="site-conveyer-overlay-errors"></div>';
    body.appendChild(elOverlay);

    // append widget
    const elWidget = document.createElement('div');
    elWidget.id = 'site-conveyer-widget';
    elWidget.innerHTML = '<header><a href="/.dev">SiteConveyer</a></header>';
    body.appendChild(elWidget);

    // append websocket script
    const elScript = document.createElement('script');
    elScript.async = true;
    elScript.src = '/.dev/js/vendor/sco-io.js';
    body.appendChild(elScript);

    const overlay = document.getElementById('site-conveyer-overlay');
    const content = overlay.querySelector('.site-conveyer-overlay-errors');
    const overlayOn = () => {
        body.style.overflow = 'hidden';
        overlay.classList.add('__active');
    };
    const overlayOff = () => {
        overlay.classList.remove('__active');
        body.style.overflow = null;
    };

    let socket;
    const onConnect = () => {
        socket.on('error', errors => {
            if (errors && errors.length) {
                let res = '';
                errors.forEach(err => {
                    res += `
                        <div class="site-conveyer-overlay-error">
                            <header>
                                Error "${err.name}" in ${err.plugin}${err.fileName ? ` at ${err.fileName}` : ''}:
                            </header>
                            <pre><code>${err.message}${err.codeFrame ? `\n\n${convertColors(err.codeFrame)}` : ''}</code></pre>
                        </div>
                    `;
                });

                content.innerHTML = res.replace(/>\s*</, '><').trim();

                overlayOn();
            } else {
                overlayOff();
            }
        });
    };
    const connect = () => {
        if (typeof io === 'function') {
            socket = io('http://localhost:9000');
            onConnect();
        } else {
            setTimeout(connect, 200);
        }
    };
    connect();
});
