/**
 * Modal system for TardQuest
 *
 * Open a modal easily:
 * Modal.open("My Title", "<p>Hello world!</p>");
 *
 * Modals do not stack, so any modal that is opened will close any other modal
 */
const Modal = {
    // True if a modal is currently open
    isOpen: false,

    // The different types of button styles available in the modal
    // Names are inspired by IBM's Carbon Design system
    // - Primary
    //     The principal call to action. Should only appear once per modal
    // - Secondary
    //     A generic button. This is the default button type
    // - Danger
    //     For actions that may be dangerous or unwanted
    // - Ghost
    //     Intended for de-emphasized interactions. This is a borderless button
    _buttonTypes:
        ["primary", "secondary", "danger", "ghost"],

    // Default values if none are provided when opening
    _defaultTitle: "",
    _defaultMessageHtml: "",
    _defaultButtons: [
        {
            text: "Ok",
            type: "primary",
        },
    ],

    // Open a new modal
    // This will close any currently-opened modals
    // Any buttons that are clicked will automatically close the modal
    //
    // title - The title of the modal
    // messageHtml - The HTML contents of the modal
    // buttons - An array of objects that contain the following:
    //  - text - The display text of the button, eg: "Ok"
    //  - onclick (optional) - A function to fire when the button is clicked
    //  - type (optional) - The type of button. @see _buttonTypes
    open: (title, messageHtml, buttons) => {
        Modal.close(); // Close any open modals

        const modalTitle = typeof title === "string"
            ? title
            : Modal._defaultTitle;

        const modalMessageHtml = typeof messageHtml === "string"
            ? messageHtml
            : Modal._defaultMessageHtml;

        const modalButtons = Array.isArray(buttons)
            ? buttons
            : Modal._defaultButtons;

        const $modal = Modal._create(
            modalTitle,
            modalMessageHtml,
            modalButtons
        );

        $modal.showModal();
        Modal.isOpen = true;
    },

    // Helper function to create the modal element and attach it to the DOM
    // This should not be called directly
    _create: (title, messageHtml, buttons) => {
        const $modal = document.createElement("dialog");
        $modal.className = "modal";

        const $header = document.createElement("div");
        $header.className = "header";

        const $title = document.createElement("div");
        $title.className = "title";
        $title.innerText = title;
        $header.appendChild($title);

        $closeButton = document.createElement("button");
        $closeButton.className = "close";
        $closeButton.title = "Close";
        $closeButton.onclick = () => {
            playSFX("uiCancel");
            Modal.close();
        };
        $header.appendChild($closeButton);

        $modal.appendChild($header);

        const $bodyContainer = document.createElement("div");
        $bodyContainer.className = "bodyContainer";

        const $body = document.createElement("div");
        $body.className = "body";
        $body.innerHTML = messageHtml;
        $bodyContainer.appendChild($body);

        const $footer = document.createElement("div");
        $footer.className = "footer";

        Object.keys(buttons).forEach((key) => {
            const button = buttons[key];
            const $button = document.createElement("button");
            $button.innerText =
                (typeof button?.text === "string" ? button.text : "");
            $button.className = Modal._buttonTypes.includes(button.type)
                ? button.type
                : "secondary";

            $button.onclick = () => {
                playSFX("uiSelect");
                Modal.close();
                if (typeof button?.onclick === "function") {
                    button?.onclick();
                }
            };

            $footer.appendChild($button);
        });

        $bodyContainer.appendChild($footer);
        $modal.appendChild($bodyContainer);
        document.body.appendChild($modal);

        return $modal;
    },

    // Closes any opened modal
    close: () => {
        document.body.querySelector(":scope > dialog")?.remove();
        Modal.isOpen = false;
    },
};
