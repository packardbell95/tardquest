/**
 * Progress Bar Element for TardQuest
 *
 * This is a custom HTML element that displays a progress bar to represent a
 * quantifiable value between 0 and a specified maximum
 *
 * @element progress-bar
 *
 * @attribute {number} [value=0] - Current value shown by the progress bar
 * @attribute {number} [max=100] - Maximum value the bar can reach
 * @attribute {number} [height=14] - Height of the bar in pixels
 *
 * @attribute {number} [cautionAbovePercentage] - Triggers caution animation if percentage exceeds this value
 * @attribute {number} [cautionBelowPercentage] - Triggers caution animation if percentage is below this value
 * @attribute {number} [dangerAbovePercentage] - Triggers danger animation if percentage exceeds this value
 * @attribute {number} [dangerBelowPercentage] - Triggers danger animation if percentage is below this value
 *
 * @attribute {string} [emptyColor="#900"] - CSS color for the unfilled portion
 * @attribute {string} [filledColor="#090"] - CSS color for the filled portion
 */
class ProgressBar extends HTMLElement {
    #updateScheduled = false;
    #old = {
        percentage: 0,
        value: 0,
        max: 0,
    };

    static get observedAttributes() {
        return [
            'height',
            'emptyColor',
            'filledColor',
            'cautionAbovePercentage',
            'cautionBelowPercentage',
            'dangerAbovePercentage',
            'dangerBelowPercentage',
            'value',
            'max'
        ];
    }

    constructor() {
        super();

        this.#old.value = parseFloat(this.getAttribute('value'));
        this.#old.max = parseFloat(this.getAttribute('max'));
        if (this.#old.max !== 0) {
            this.#old.percentage =
                Math.min(Math.ceil((this.#old.value / this.#old.max) * 100), 100);
        }

        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = `
            @keyframes fade {
                50% { opacity: 0; }
            }
            .container {
                padding: 0 10px;
                color: #fff;
                text-align: right;
                height: 20px;
                position: relative;
            }
            .container > div {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            .container > .empty {
                z-index: 1;
            }
            .container > .filled {
                z-index: 2;
            }
            .container > .label {
                z-index: 3;
                left: -10px;
            }
            .caution {
                animation: fade 1s linear infinite;
            }
            .danger {
                animation: fade .25s linear infinite;
            }
        `;
        shadow.appendChild(style);

        this.container = document.createElement("div");
        this.container.classList.add('container');

        const $emptyBar = document.createElement("div");
        $emptyBar.classList.add('empty');

        const $filledBar = document.createElement("div");
        $filledBar.classList.add('filled');

        const $label = document.createElement("div");
        $label.classList.add('label');

        this.container.appendChild($emptyBar);
        this.container.appendChild($filledBar);
        this.container.appendChild($label);

        this.shadowRoot.appendChild(this.container);
    }

    connectedCallback() {
        this.updateDisplay();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        if (Object.keys(this.#old).includes(name)) {
            this.#old[name] = parseFloat(oldValue);
        }

        this.scheduleUpdate();
    }

    scheduleUpdate() {
        if (this.#updateScheduled) {
            return;
        }

        this.#updateScheduled = true;

        requestAnimationFrame(() => {
            this.#updateScheduled = false;
            this.updateDisplay();
        });
    }

    updateDisplay() {
        const $empty = this.container.querySelector(".empty");
        const $filled = this.container.querySelector(".filled");
        const $label = this.container.querySelector(".label");

        const duration = 250;
        const oldValue = this.#old.value;
        const newValue = parseFloat(this.getAttribute('value'));
        const oldMax = this.#old.max;
        const newMax = parseFloat(this.getAttribute('max'));
        const height = parseInt(this.getAttribute('height') || 14) + 'px';
        this.container.style.height = height;
        this.container.style.lineHeight = height;

        const filledColor = this.getAttribute('filledColor') || "#090";
        const emptyColor = this.getAttribute('emptyColor') || "#900";
        const value = parseFloat(this.#old.value || 0);
        const max = parseFloat(this.getAttribute('max') || 100);
        const oldPercentage = oldMax ? Math.min(Math.ceil((oldValue / oldMax) * 100), 100) : 0;
        const newPercentage = newMax ? Math.min(Math.ceil((newValue / newMax) * 100), 100) : 0;

        this.container.style.setProperty('--filledColor', filledColor);
        this.container.style.setProperty('--emptyColor', emptyColor);
        this.container.style.setProperty('--cutoff', `${oldPercentage}%`);
        this.container.style.transition = '--cutoff 3s';

        $empty.style.backgroundColor = emptyColor;

        $filled.style.background =
            `linear-gradient(
                90deg,
                var(--filledColor) 0%,
                var(--filledColor) var(--cutoff),
                transparent var(--cutoff),
                transparent 100%
            )`;
        $label.textContent = `${newValue}/${max}`;

        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Linear interpolation between oldPercentage and newPercentage
            const currentValue = (oldPercentage + (newPercentage - oldPercentage) * progress).toFixed(2);
            this.container.style.setProperty('--cutoff', `${currentValue}%`);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation has ended
                this.#old.value = newValue;
                this.#old.max = parseFloat(this.getAttribute('max'));
                this.#old.percentage = newPercentage;

                const status = this.getStatus(newPercentage);
                $empty.classList.toggle(
                    'caution',
                    status?.direction === 'below' && status?.level === 'caution'
                );

                $empty.classList.toggle(
                    'danger',
                    status?.direction === 'below' && status?.level === 'danger'
                );

                $filled.classList.toggle(
                    'caution',
                    status?.direction === 'above' && status?.level === 'caution'
                );

                $filled.classList.toggle(
                    'danger',
                    status?.direction === 'above' && status?.level === 'danger'
                );
            }
        }

        if (oldPercentage !== newPercentage) {
            requestAnimationFrame(animate);
        }
    }

    getStatus(activePercentage) {
        if (activePercentage === 0) {
            return null;
        }

        const dangerAbove = this.getAttribute('dangerAbovePercentage');
        if (dangerAbove !== null && activePercentage > dangerAbove) {
            return {
                level: "danger",
                direction: "above",
            };
        }

        const dangerBelow = this.getAttribute('dangerBelowPercentage');
        if (dangerBelow !== null && activePercentage < dangerBelow) {
            return {
                level: "danger",
                direction: "below",
            };
        }

        const cautionAbove = this.getAttribute('cautionAbovePercentage');
        if (cautionAbove !== null && activePercentage > cautionAbove) {
            return {
                level: "caution",
                direction: "above",
            };
        }

        const cautionBelow = this.getAttribute('cautionBelowPercentage');
        if (cautionBelow !== null && activePercentage < cautionBelow) {
            return {
                level: "caution",
                direction: "below",
            };
        }

        return null;
    }
}

customElements.define('progress-bar', ProgressBar);