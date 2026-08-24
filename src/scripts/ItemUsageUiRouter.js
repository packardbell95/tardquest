"use strict";

/**
 * Handles the UI routing for item usage
 */
const ItemUsageUiRouter = {
    route: function(itemId, actor, onItemUsed) {
        const item = ITEMS[itemId];
        if (! item) {
            console.error("Failed to find item", { itemId });
            return;
        }

        const usageFunction = async (itemId, actor, target, context) => {
            let itemUsedSuccessfully = true;

            if (BattleSystem.isActive) {
                // We can't check if the item was used successfully since this
                // just queues the item's use for the battle's action phase
                BattleSystem.useItem(actor, itemId, target, context);
            } else {
                itemUsedSuccessfully =
                    await actor.useItem(itemId, target, context);
                InventorySidebar.refreshItem(itemId);
            }

            console.log({ itemId, itemUsedSuccessfully });
            onItemUsed?.(itemUsedSuccessfully);
            GameControl.showPlayerPartySection(); // Reset click handlers
            GameControl.CursorUi.close();
            menu.focus();
        };

        console.log(
            "🎒 Using item",
            { itemId, actor, path: item.usage.uiRoute?.path || null }
        );

        switch (item.usage.uiRoute?.path) {
            case "inputBox":
                GameControl.openPlayerTextInputBox(
                    playerMessage => usageFunction(
                        itemId,
                        actor,
                        null,
                        { message: playerMessage.trim() }
                    ),
                    null, // @TODO Do we need to close the UI here?
                    item.usage.uiRoute?.options,
                );
                break;

            case "playerPartyPicker":
                const canOpenPartyPicker = Boolean(document.querySelector(
                    "#playerParty .party-members [data-party-member-id]" +
                    ":not(.dead):not(.placeholder)"
                ));

                if (! canOpenPartyPicker) {
                    break;
                }

                menu.blur();
                GameControl.CursorUi.initialize("player party", true);
                GameControl.showPlayerPartySection(selectedTarget =>
                    usageFunction(itemId, actor, selectedTarget, {}),
                    true
                );
                break;

            default:
                usageFunction(itemId, actor, null, {});
                break;
        }
    },
};
