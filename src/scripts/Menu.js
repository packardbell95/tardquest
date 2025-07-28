class Menu {
    #elements = {
        $menu: null,
        $landing: null,
        $list: null,
        $selectionDescription: null,
        $escapeMessage: null,
    };

    #menus = {};
    #breadcrumbs = [];
    #selectionIndex = 0;
    #currentPage = 0; // Track the current page for paginated menus
    #defaultItemsPerPage = 10;

    #onOpen = null;
    #onHighlight = null;
    #onSelect = null;
    #onCancel = null;
    #onClose = null;

    constructor($menu, menus) {
        if ($menu) {
            this.setMenuElement($menu);
        }

        if (menus) {
            this.setMenus(menus);
        }
    }

    setMenuElement($menu) {
        if (! $menu instanceof Element) {
            console.error("$menu must be an element", { $menu });
            return;
        }

        this.initializeMenu($menu);
    }

    setMenus(menus) {
        if (typeof menus !== "object") {
            console.error("menus must be an object", { menus });
            return;
        }

        this.#menus = menus;
    }

    setDefaultItemsPerPage(defaultItemsPerPage) {
        const itemsPerPage = parseInt(defaultItemsPerPage, 10);

        if (itemsPerPage < 1) {
            console.error(
                "defaultItemsPerPage must be a positive value",
                { defaultItemsPerPage }
            );
            return;
        }

        this.#defaultItemsPerPage = itemsPerPage;
    }

    setOnOpen(onOpen) {
        if (typeof onOpen !== "function") {
            console.error("onOpen must be a function", { onOpen });
            return;
        }

        this.#onOpen = onOpen;
    }

    setOnHighlight(onHighlight) {
        if (typeof onHighlight !== "function") {
            console.error("onHighlight must be a function", { onHighlight });
            return;
        }

        this.#onHighlight = onHighlight;
    }

    setOnSelect(onSelect) {
        if (typeof onSelect !== "function") {
            console.error("onSelect must be a function", { onSelect });
            return;
        }

        this.#onSelect = onSelect;
    }

    setOnCancel(onCancel) {
        if (typeof onCancel !== "function") {
            console.error("onCancel must be a function", { onCancel });
            return;
        }

        this.#onCancel = onCancel;
    }

    setOnClose(onClose) {
        if (typeof onClose !== "function") {
            console.error("onClose must be a function", { onClose });
            return;
        }

        this.#onClose = onClose;
    }

    initializeMenu($menu) {
        this.#elements.$menu = $menu;
        this.#elements.$landing = document.createElement('div');
        this.#elements.$landing.classList.add("landing");

        this.#elements.$list = document.createElement('div');
        this.#elements.$list.classList.add("list");

        this.#elements.$selectionDescription = document.createElement('div');
        this.#elements.$selectionDescription.classList.add("selectionDescription");

        this.#elements.$escapeMessage = document.createElement('div');
        this.#elements.$escapeMessage.classList.add("escapeMessage");
        this.#elements.$escapeMessage.innerText = "Press Escape to go back";

        this.#elements.$menu.classList.add("hidden");

        this.#elements.$menu.replaceChildren(
            this.#elements.$landing,
            this.#elements.$list,
            this.#elements.$selectionDescription,
            this.#elements.$escapeMessage,
        );
    }

    getActiveMenu() {
        return this.#menus[this.#breadcrumbs.at(-1)?.menuName] || undefined;
    }

    isOpen() {
        return this.#breadcrumbs.length > 0;
    }

    open(menuName) {
        if (typeof this.#menus[menuName] === 'undefined') {
            console.error('The requested menu does not exist', { menuName });
            return;
        }

        const activeMenu = this.#menus[menuName];

        if (this.#breadcrumbs.length === 0) {
            this.#onOpen?.();
        }

        this.#breadcrumbs.push({
            menuName,
            selectionIndex: this.#selectionIndex,
            currentPage: this.#currentPage,
        });

        this.#selectionIndex = 0; // Reset selection index
        this.#currentPage = 0; // Reset to the first page

        document.getElementById('game').classList.add('hidden');
        this.#elements.$menu.classList.remove('hidden');
        this.#elements.$selectionDescription.textContent = '';

        activeMenu.onOpen?.();
        this.render();
    }

    close() {
        const previousMenu = this.#breadcrumbs.pop();
        if (previousMenu) {
            this.#menus[previousMenu.menuName].onClose?.();
            this.#selectionIndex = previousMenu.selectionIndex;
            this.#currentPage = previousMenu.currentPage;
        }

        if (this.#breadcrumbs.length === 0) {
            this.#elements.$menu.classList.add('hidden');
            document.getElementById('game').classList.remove('hidden');

            this.#onClose?.();
        }

        this.#onCancel?.();
    }

    closeAll() {
        while (this.#breadcrumbs.length > 0) {
            const previousMenu = this.#breadcrumbs.pop();
            this.#menus[previousMenu.menuName].onClose?.();
        }
        this.#elements.$menu.classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');

        this.#onClose?.();
        this.#onCancel?.();
    }

    highlightOption(index) {
        this.#selectionIndex = index;
    }

    getItemsPerPage() {
        const itemsPerPageOverride =
            parseInt(this.getActiveMenu()?.itemsPerPage || 0, 10);

        return itemsPerPageOverride > 0
            ? itemsPerPageOverride
            : this.#defaultItemsPerPage;
    }

    render() {
        const activeMenu = this.getActiveMenu();
        if (typeof activeMenu === 'undefined') {
            return;
        }

        const options = activeMenu.getOptions();

        const itemsPerPage = this.getItemsPerPage();
        const totalPages = Math.ceil(options.length / itemsPerPage); // Calculate total pages
        const startIndex = this.#currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOptions = options.slice(startIndex, endIndex);

        // Render the title and page indicator
        const titleText = typeof activeMenu.title === 'function' ? activeMenu.title() : activeMenu.title;
        const titleHtml = activeMenu.title ? `<span class="title">「${titleText}」</span>` : '';

        const landingHtml = `<div>${activeMenu?.landingHtml?.() || ''}</div>`;
        this.#elements.$landing.innerHTML = titleHtml + landingHtml;

        const paginationText = totalPages > 1 ? (
            (this.#currentPage > 0 ? '◀ ' : '  ') +
            `Page ${this.#currentPage + 1} of ${totalPages}` +
            (this.#currentPage + 1 < totalPages ? ' ▶' : '  ')
        ) : '';

        const $list = document.createElement('div');
        $list.className = "list";

        const $pageNumber = document.createElement("div");
        $pageNumber.className = "pageNumber";
        $pageNumber.innerText = paginationText;
        $list.appendChild($pageNumber);

        // Render the options for the current page
        paginatedOptions.forEach((option, index) => {
            const isSelectedLine = index === this.#selectionIndex;
            const classes = [
                "option",
                ...(option.className ? [option.className] : []),
                ...(isSelectedLine ? ["selected"] : []),
            ];

            const $option = document.createElement("span");
            $option.classList.add(...classes);
            $option.dataset.index = index;

            $option.onmouseover = () => this.setSelection(index);
            $option.onclick = () => this.select(index);

            const trailText = option.trailText ? `${option.trailText}` : '';

            const maxLineLength = 56; // Max "." trail width
            const dots = trailText
                ? '.'.repeat(Math.max(0, maxLineLength - option.displayText.length - trailText.length - 4))
                : '';

            $option.appendChild(document.createTextNode(
                `${option.displayText}${dots}${trailText}`
            ));

            $list.appendChild($option);

            if (isSelectedLine) {
                this.#elements.$selectionDescription.textContent = option.description;
            }
        });

        this.#elements.$list.replaceWith($list);
        this.#elements.$list = $list; // Make sure the reference is updated too

        if (activeMenu.escapeDisabled) {
            this.#elements.$escapeMessage.classList.add("hidden");
        } else {
            this.#elements.$escapeMessage.classList.remove("hidden");
        }
    }

    getItemIndex() {
        const offset = this.getItemsPerPage() * this.#currentPage;
        return offset + this.#selectionIndex;
    }

    refreshList() {
        for (const $el of this.#elements.$list.children) {
            if (! $el.classList.contains("option")) {
                continue;
            }

            if (parseInt($el.dataset.index, 10) === this.#selectionIndex) {
                $el.classList.add("selected");
                const options = this.getActiveMenu().getOptions();
                this.#elements.$selectionDescription.textContent =
                    options[this.getItemIndex()].description;
            } else if ($el.classList.contains("selected")) {
                $el.classList.remove("selected");
            }
        };
    }

    handleInput(key) {
        // @TODO Handle elsewhere
        // if (animationActive) return;

        const activeMenu = this.getActiveMenu();
        const options = activeMenu.getOptions();
        const itemsPerPage = this.getItemsPerPage();
        const totalPages = Math.ceil(options.length / itemsPerPage);
        const itemsOnCurrentPage = (this.#currentPage + 1) >= totalPages
            ? ((options.length % itemsPerPage) || itemsPerPage)
            : itemsPerPage;

        switch (key) {
            case 'escape':
                this.goToPreviousMenu();
                break;
            case 'w':
            case 'arrowup':
                this.setSelection(
                    this.#selectionIndex <= 0
                        ? itemsOnCurrentPage - 1
                        : this.#selectionIndex - 1
                );
                break;
            case 's':
            case 'arrowdown':
                this.setSelection(
                    this.#selectionIndex >= itemsOnCurrentPage - 1
                        ? 0
                        : this.#selectionIndex + 1
                );
                break;
            case 'a':
            case 'arrowleft':
                if (this.#currentPage > 0) {
                    this.#currentPage--;
                    this.#selectionIndex = 0; // Reset selection index on page change
                    this.render();
                    this.#onHighlight?.();
                }
                break;
            case 'd':
            case 'arrowright':
                if (this.#currentPage < totalPages - 1) {
                    this.#currentPage++;
                    this.#selectionIndex = 0; // Reset selection index on page change
                    this.render();
                    this.#onHighlight?.();
                }
                break;
            case ' ':
            case 'e':
            case 'enter': {
                this.select(this.#selectionIndex);
                this.render();
                break;
            }
        }
    }

    goToPreviousMenu() {
        if (this.getActiveMenu()?.escapeDisabled) {
            return;
        }

        this.close();
        this.render();
    }

    setSelection(index) {
        this.#selectionIndex = parseInt(index, 10);
        this.refreshList();
        this.#onHighlight?.();
    }

    select(index) {
        const activeMenu = this.getActiveMenu();
        const key = this.#currentPage * this.getItemsPerPage() + index;
        const selectedOptionId = activeMenu.getOptions()?.[key]?.id;
        if (selectedOptionId === '_back') {
            this.close();
        } else if (selectedOptionId === '_exitAll') {
            this.closeAll();
        } else {
            activeMenu?.select(selectedOptionId, this);
            this.#onSelect?.();
        }

        this.render();
    }
};