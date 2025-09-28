/**
 * Tooltip for TardQuest
 *
 * This is a custom helper that provides a flexible way to create tooltips
 *
 * USAGE
 * To attach a tooltip to an element, the element must have a tooltipHtml data
 * attribute associated with it which contains the contents of the tooltip. Then
 * the element must be used to call Tooltip.initialize()
 *
 * If a tooltip's contents are updated dynamically, then Tooltip.refresh()
 * should be called on the element
 *
 * Tooltip Data Attributes
 * - tooltipHtml:           The HTML contents of the tooltip. This is required
 *                          in order for the tooltip to work
 *
 * - tooltipPosition:       Where the tooltip should appear relative to the
 *                          target element that's being hovered
 *                          Defaults to "right"
 *
 *                          The orthogonal positions have "start" and "end"
 *                          variants which basically set the alignment of the
 *                          tooltip in line with the triggering element.
 *                          Otherwise, these are centered
 *
 *                          Acceptable values:
 *                           - "right start"
 *                           - "right"
 *                           - "right end"
 *                           - "left start"
 *                           - "left"
 *                           - "left end"
 *                           - "top start"
 *                           - "top"
 *                           - "top end"
 *                           - "bottom start"
 *                           - "bottom"
 *                           - "bottom end"
 *                           - "top left"
 *                           - "top right"
 *                           - "bottom left"
 *                           - "bottom right"
 *
 * - tooltipGroupId:        Name of an optional group that the tooltip belongs
 *                          to. If a user activates two tooltips from the same
 *                          group, the first one would be closed immediately and
 *                          the second would appeaer immediately without fading
 *                          out or in first
 *
 * - hideAfterInteraction:  A boolean flag that, when set to true, will suppress
 *                          the tooltip for that group if the element has been
 *                          clicked. This is used to minimize redundant tooltips
 *                          for common interactions
 *                          Default: false
 *
 *
 * Tooltip Group Settings
 *
 * Tooltip.groupSettings is an object whose keys are group identifiers (see
 * tooltipGroupId above) and whose values are objects that may consist of the
 * following optional parameters:
 *
 *  - delayMs:              The length of the delay in milliseconds after a
 *                          target element is hovered before the tooltip starts
 *                          to appear
 *                          Default: 0
 *
 *  - hideAfterInteraction: See hideAfterInteraction above
 *                          Default: false
 *
 *  - position:             The display position of the tooltip relative to its
 *                          target. See "tooltipPosition" above for acceptable
 *                          values. This can be overridden by setting the
 *                          tooltipPosition attribute on the target element
 *                          Default: "right"
 */
const Tooltip = {
    /** Public properties/methods **/
    groupSettings: {},

    /**
     * Initializes a DOM element's tooltip interactions
     *
     * When called with an $element that has a `data-tooltiphtml` attribute,
     * the element will have mouse handlers attached to it that will take care
     * of the tooltip interactions automatically
     *
     * @param $element The DOM element receiving tooltip interactions
     */
    initialize: ($element) => {
        if (! $element.dataset.tooltiphtml) {
            console.warn("No tooltip data to initialize", { $element });
            return;
        }

        if ($element.dataset.tooltipid) {
            // Element already has a tooltip ID defined
            return;
        }

        $element.dataset.tooltipid = `tq_tooltip_${crypto.randomUUID()}`;
        $element.addEventListener("mouseenter", (e) => Tooltip._display(e));
        $element.addEventListener("click", (e) => Tooltip._checkInteraction(e));
        $element.addEventListener("mouseleave", (e) => Tooltip._hide(e));
    },

    /**
     * Refreshes the contents of an existing tooltip
     *
     * When called with an $element that has a `data-tooltiphtml` attribute,
     * the existing tooltip will be updated with the new content
     *
     * @param $element The DOM element with an existing tooltip to update
     */
    refresh: ($element) => {
        if (! $element.dataset.tooltipid) {
            console.warn("Cannot reload a nonexistent tooltip", { $element });
            return;
        }

        if (! $element.dataset.tooltiphtml) {
            console.warn(
                "Cannot refresh a tooltip with no content",
                { $element }
            );
            return;
        }

        const $tooltip = document.getElementById($element.dataset.tooltipid);
        if (! $tooltip) {
            return;
        }

        $tooltip.innerHTML = $element.dataset.tooltiphtml;

        if (Tooltip._isVisible($tooltip)) {
            const positions = Tooltip._getPosition($element, $tooltip);
            $tooltip.style.top = `${positions.top}px`;
            $tooltip.style.left = `${positions.left}px`;
        }
    },

    /** Private properties/methods. Don't hook into or call these directly **/

    _dismissalMs: 200,
    _dismissedGroups: {},
    _lastElementForGroup: {},
    _lastGroupDisplayMs: {},
    _lastGroupHideMs: {},

    _isVisible: ($element) => {
        const computedStyle = window.getComputedStyle($element);
        return computedStyle.visibility !== "hidden"
            && computedStyle.display !== "none"
            && computedStyle.opacity !== "0";
    },

    _getTooltip: ($target) => {
        const $existingTooltip =
            document.getElementById($target.dataset.tooltipid);
        if ($existingTooltip) {
            const animations = $existingTooltip.getAnimations();
            if (animations.length > 0) {
                animations[0].cancel();
            }

            return $existingTooltip;
        }

        const $tooltip = document.createElement("div");
        $tooltip.id = $target.dataset.tooltipid;
        $tooltip.setAttribute("role", "tooltip");
        $tooltip.setAttribute("inert", true);
        $tooltip.innerHTML = $target.dataset.tooltiphtml;
        $tooltip.style.visibility = "hidden";
        $tooltip.style.position = "absolute";
        document.body.appendChild($tooltip);

        const positions = Tooltip._getPosition($target, $tooltip);
        $tooltip.style.top = `${positions.top}px`;
        $tooltip.style.left = `${positions.left}px`;
        $tooltip.style.removeProperty("visibility");

        return $tooltip;
    },

    _groupedTooltipStillOpening: (groupId) => {
        const delayMs = Tooltip.groupSettings?.[groupId]?.delayMs || 0;
        if (! groupId || delayMs <= 0) {
            return false;
        }

        const lastGroupDisplayMs =
            Tooltip._lastGroupDisplayMs?.[groupId] || 0;
        const timeSinceLastGroupDisplay =
            performance.now() - lastGroupDisplayMs;
        return timeSinceLastGroupDisplay < delayMs;
    },

    _updateGroup: ($target, $tooltip) => {
        const tooltipId = $target.dataset?.tooltipid;
        const groupId = $target.dataset?.tooltipgroupid;
        if (! tooltipId || ! groupId) {
            return true;
        }

        if (Tooltip._groupedTooltipStillOpening(groupId)) {
            return false;
        }

        const recentlyHidden =
            performance.now() - (Tooltip._lastGroupHideMs[groupId] || 0) >=
            Tooltip._dismissalMs;
        if (recentlyHidden) {
            return false;
        }

        const lastTooltipId = Tooltip._lastElementForGroup?.[groupId];
        Tooltip._lastElementForGroup[groupId] = tooltipId;

        if (lastTooltipId && lastTooltipId !== tooltipId) {
            document.getElementById(lastTooltipId)?.remove();
            return true;
        }

        return false;
    },

    _groupDismissed: (groupId) => {
        if (! groupId || ! Tooltip._dismissedGroups?.[groupId]) {
            return false;
        }

        const lastDismissedMs =
            performance.now() - (Tooltip._lastGroupHideMs[groupId] || 0);
        return lastDismissedMs < Tooltip._dismissalMs;
    },

    _display: (e) => {
        const $target = e.target;
        const groupId = $target.dataset?.tooltipgroupid;

        if (groupId) {
            // Block the display if the group has been dismissed
            if (Tooltip._groupDismissed(groupId)) {
                return;
            }

            delete Tooltip._dismissedGroups[groupId];
        }

        const $tooltip = Tooltip._getTooltip($target);
        const delayMs = parseInt(
            Tooltip.groupSettings?.[groupId]?.delayMs ||
            0,
            10
        );

        $tooltip.style.zIndex = "100";
        $tooltip.classList.add("active");

        if (! Tooltip._updateGroup($target, $tooltip)) {
            const animation = $tooltip.animate([
                { opacity: 0, offset: 0, },
                { opacity: 0, offset: delayMs / (delayMs + 200) },
                { opacity: 1, offset: 1, }
            ], {
                duration: delayMs + 200,
                fill: "forwards"
            });

            if (groupId) {
                Tooltip._lastGroupDisplayMs[groupId] = performance.now();
            }
        }
    },

    _checkInteraction: (e) => {
        if (! Tooltip._shouldHideAfterInteraction(e)) {
            return;
        }

        const groupId = e.target.dataset?.tooltipgroupid;
        if (groupId) {
            Tooltip._dismissedGroups[groupId] = true;
        }

        Tooltip._hide(e);
    },

    _shouldHideAfterInteraction: (e) => {
        if (e.target.dataset?.hideafterinteraction) {
            return true;
        }

        const groupId = e.target.dataset?.tooltipgroupid;
        if (Tooltip.groupSettings?.[groupId]?.hideAfterInteraction) {
            return true;
        }

        return false;
    },

    _hide: (e) => {
        const tooltipId = e.target?.dataset?.tooltipid;
        if (! tooltipId) {
            console.warn(
                "Cannot hide tooltip: No tooltip ID exists on the target",
                { target: e.target }
            );
            return;
        }

        const groupId = e.target.dataset?.tooltipgroupid;
        if (groupId) {
            Tooltip._lastGroupHideMs[groupId] = performance.now();
        }

        const $tooltip = document.getElementById(tooltipId);
        if (! $tooltip) {
            return;
        }

        // If the tooltip is still opening, skip the fadeout and just kill it
        if (groupId && Tooltip._groupedTooltipStillOpening(groupId)) {
            $tooltip.remove();
            return;
        }

        const animation = $tooltip.animate([
            { opacity: 1, },
            { opacity: 0, }
        ], {
            duration: 200,
            fill: "forwards"
        });

        animation.onfinish = function() {
            $tooltip.remove();
        };

        $tooltip.classList.remove("active");
    },

    _getPosition: ($target, $tooltip) => {
        const tooltipRect = $tooltip.getBoundingClientRect();
        const targetRect = $target.getBoundingClientRect();
        const marginPx = parseInt($target.dataset?.tooltipmarginpx || 10, 10);
        const groupId = $target.dataset?.tooltipgroupid;
        const position = $target.dataset?.tooltipposition ||
            Tooltip.groupSettings?.[groupId]?.position ||
            "right";

        switch (position) {
            // Orthogonals
            case "right start":
                return {
                    top:
                        window.scrollY + targetRect.top,
                    left:
                        window.scrollX + targetRect.width + targetRect.left +
                        marginPx,
                };
            case "right":
                return {
                    top:
                        window.scrollY + targetRect.top +
                        ((targetRect.height - tooltipRect.height) / 2),
                    left:
                        window.scrollX + targetRect.width + targetRect.left +
                        marginPx,
                };
            case "right end":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height -
                        tooltipRect.height,
                    left:
                        window.scrollX + targetRect.width + targetRect.left +
                        marginPx,
                };

            case "left start":
                return {
                    top:
                        window.scrollY + targetRect.top,
                    left:
                        window.scrollX + targetRect.left - tooltipRect.width -
                        marginPx,
                };
            case "left":
                return {
                    top:
                        window.scrollY + targetRect.top +
                        ((targetRect.height - tooltipRect.height) / 2),
                    left:
                        window.scrollX + targetRect.left - tooltipRect.width -
                        marginPx,
                };
            case "left end":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height -
                        tooltipRect.height,
                    left:
                        window.scrollX + targetRect.left - tooltipRect.width -
                        marginPx,
                };

            case "top start":
                return {
                    top:
                        window.scrollY + targetRect.top - tooltipRect.height -
                        marginPx,
                    left:
                        window.scrollX + targetRect.left,
                };
            case "top":
                return {
                    top:
                        window.scrollY + targetRect.top - tooltipRect.height -
                        marginPx,
                    left:
                        window.scrollX + targetRect.left +
                        ((targetRect.width - tooltipRect.width) / 2),
                };
            case "top end":
                return {
                    top:
                        window.scrollY + targetRect.top - tooltipRect.height -
                        marginPx,
                    left:
                        window.scrollX + targetRect.left + targetRect.width -
                        tooltipRect.width,
                };

            case "bottom start":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height +
                        marginPx,
                    left:
                        window.scrollX + targetRect.left,
                };
            case "bottom":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height +
                        marginPx,
                    left:
                        window.scrollX + targetRect.left +
                        ((targetRect.width - tooltipRect.width) / 2),
                };
            case "bottom end":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height +
                        marginPx,
                    left:
                        window.scrollX + targetRect.left + targetRect.width -
                        tooltipRect.width,
                };

            // Diagonals
            case "top left":
                return {
                    top:
                        window.scrollY + targetRect.top - tooltipRect.height -
                        marginPx,
                    left:
                        window.scrollX + targetRect.left - tooltipRect.width -
                        marginPx,
                };
            case "top right":
                return {
                    top:
                        window.scrollY + targetRect.top - tooltipRect.height -
                        marginPx,
                    left:
                        window.scrollX + targetRect.width + targetRect.left +
                        marginPx,
                };
            case "bottom left":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height +
                        marginPx,
                    left:
                        window.scrollX + targetRect.left - tooltipRect.width -
                        marginPx,
                };
            case "bottom right":
                return {
                    top:
                        window.scrollY + targetRect.top + targetRect.height +
                        marginPx,
                    left:
                        window.scrollX + targetRect.width + targetRect.left +
                        marginPx,
                };

            default:
                throw new Error(`Unrecognized position: ${position}`);
        }
    }
};
