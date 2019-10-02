function tooltip(getTooltipOpts) {
    document.addEventListener('mouseover', e => {
        let el = e.target;
        let opts = getTooltipOpts(el);

        if (!opts) {
            el = el.parentElement;
            opts = el && getTooltipOpts(el);
        }

        opts && tooltip.show(el, opts, true);
    });
}

tooltip.show = (el, opts, isAuto) => {
    const fallbackAttrib = 'data-tooltip';
    opts = opts || {};

    (el.tooltip || Tooltip(el, opts)).show();

    function Tooltip(el, opts) {
        let tooltipEl;
        let showTimer;
        let text;

        el.addEventListener('mousedown', autoHide);
        el.addEventListener('mouseleave', autoHide);

        function show() {
            text = el.title || el.getAttribute(fallbackAttrib) || text;
            el.title = '';
            text && !showTimer && (showTimer = setTimeout(fadeIn, isAuto ? 150 : 1))
        }

        function autoHide() {
            tooltip.hide(el, true);
        }

        function hide(isAutoHiding) {
            if (isAuto === isAutoHiding) {
                showTimer = clearTimeout(showTimer);
                var parent = tooltipEl && tooltipEl.parentNode;
                parent && parent.removeChild(tooltipEl);
                tooltipEl = undefined;
            }

            if (text !== el.getAttribute(fallbackAttrib)) {
                el.title = text;
            }
        }

        function fadeIn() {
            if (!tooltipEl) {
                tooltipEl = createTooltip(el, text, opts);
            }
        }

        return el.tooltip = {
            show,
            hide,
        };
    }

    function createTooltip(el, text) {
        const tooltipEl = document.createElement('div');

        tooltipEl.classList.add('tooltip');
        tooltipEl.innerHTML = `<div class="tooltip__content">${text}</div>`;

        el.appendChild(tooltipEl);

        const tooltipRight = tooltipEl.getBoundingClientRect().right;
        const pageRight = document.body.clientWidth;

        if (tooltipRight > pageRight - 15) {
            tooltipEl.classList.add('_reverse');
        }
        tooltipEl.classList.add('_visible');

        return tooltipEl;
    }
};

tooltip.hide = (el, isAuto) => {
    el.tooltip && el.tooltip.hide(isAuto);
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tooltip;
}

tooltip(el => el.classList.contains('tooltip__reference'));
