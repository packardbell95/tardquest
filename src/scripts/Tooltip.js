const Tooltip = {
    delayTimeMs: 300,
    timer: null,
    display: (e) => {
        const trigger = e.target;
        const tooltip = trigger.querySelector("[role=tooltip]");
        if (!tooltip) {
            console.warn(
                "Cannot display tooltip: no tooltip found",
                { e }
            );
            return;
        }

        const { x, y, width, height } = trigger.getBoundingClientRect();

        tooltip.style.left = `${Math.floor(x)}px`;
        tooltip.style.top = `${Math.floor(y)}px`;
        tooltip.classList.add("active");
    },
    hide: (e) => {
        const tooltip = e.target.querySelector("[role=tooltip]");
        if (!tooltip) {
            console.warn(
                "Cannot hide tooltip: no tooltip found",
                { e }
            );
            return;
        }
        tooltip.classList.remove("active");
    },
    refresh: ($element) => {
        if (!$element.dataset.tooltiphtml) {
            console.warn("No tooltip data to refresh", { $element });
            return;
        }

        if ($element.querySelector('div[role="tooltip"]')) {
            console.warn("Element already has a tooltip", { $element });
            return;
        }

        let tooltip = document.createElement("div");

        tooltip.setAttribute("role", "tooltip");
        tooltip.setAttribute("inert", true);
        if ($element.dataset?.tooltipposition) {
            tooltip.classList.add($element.dataset.tooltipposition);
        }
        tooltip.innerHTML = $element.dataset.tooltiphtml;

        $element.appendChild(tooltip);

        $element.addEventListener("mouseenter", (e) => {
            clearTimeout(Tooltip.timer);

            Tooltip.timer = setTimeout(() => {
                Tooltip.display(e);
            }, Tooltip.delayTimeMs);
        });

        $element.addEventListener("mouseleave", (e) => {
            clearTimeout(Tooltip.timer);
            Tooltip.hide(e);
        });
    },
};
