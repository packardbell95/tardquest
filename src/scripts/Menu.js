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
    #currentPage = 0;
    #defaultItemsPerPage = 10;
    #isOpen = false;

    #onOpen = null;
    #onPageChange = null;
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

    setOnPageChange(onPageChange) {
        if (typeof onPageChange !== "function") {
            console.error("onPageChange must be a function", { onPageChange });
            return;
        }

        this.#onPageChange = onPageChange;
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

    getCurrentMenuId() {
        return this.#breadcrumbs.at(-1)?.menuName || null;
    }

    getCurrentMenuData() {
        const currentMenuId = this.getCurrentMenuId();
        return currentMenuId ? this.#menus[currentMenuId] : null;
    }

    getActiveMenu() {
        return this.#menus[this.#breadcrumbs.at(-1)?.menuName] || undefined;
    }

    isOpenInBreadcrumbs(menuName) {
        return Boolean(this.#breadcrumbs.find((b) => b.menuName === menuName));
    }

    isOpen() {
        return this.#isOpen;
    }

    open(menuName, onClose) {
        if (typeof this.#menus[menuName] === 'undefined') {
            console.error('The requested menu does not exist', { menuName });
            return;
        }

        this.#isOpen = true;
        const activeMenu = this.#menus[menuName];

        const breadcrumb = {
            menuName,
            selectionIndex: this.#selectionIndex,
            currentPage: this.#currentPage,
        };

        if (typeof onClose === "function") {
            breadcrumb.onClose = onClose;
        }

        this.#breadcrumbs.push(breadcrumb);

        this.#selectionIndex = 0; // Reset selection index
        this.#currentPage = 0; // Reset to the first page

        // @TODO Adjust selectors
        document.getElementById('game').classList.add('hidden');
        this.#elements.$menu.classList.remove('hidden');
        this.#elements.$selectionDescription.textContent = '';

        this.#onOpen?.();
        activeMenu.onOpen?.();
        this.render();
    }

    close() {
        const previousMenu = this.#breadcrumbs.pop();
        if (previousMenu) {
            if (typeof previousMenu.onClose === "function") {
                previousMenu.onClose();
            }
            this.#menus[previousMenu.menuName].onClose?.();
            this.#selectionIndex = previousMenu.selectionIndex;
            this.#currentPage = previousMenu.currentPage;
        }

        if (this.#breadcrumbs.length === 0) {
            this.#elements.$menu.classList.add('hidden');
            document.getElementById('game').classList.remove('hidden');
            this.#isOpen = false;

            this.#onClose?.();
        } else {
            this.#onCancel?.();
        }
    }

    closeThrough(menuName) {
        while (this.#breadcrumbs.length > 0) {
            const lastMenu = this.getCurrentMenuId() === menuName;
            this.close();

            if (lastMenu) {
                break;
            }
        }

        this.render();
    }

    closeAll() {
        while (this.#breadcrumbs.length > 0) {
            const previousMenu = this.#breadcrumbs.pop();
            if (typeof previousMenu.onClose === "function") {
                previousMenu.onClose();
            }
            this.#menus[previousMenu.menuName].onClose?.();
        }
        this.#elements.$menu.classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');

        this.#isOpen = false;
        this.#onClose?.();
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

    getTotalPages() {
        const optionsLength = this.getActiveMenu()?.getOptions()?.length || 0;
        return Math.ceil(optionsLength / this.getItemsPerPage());
    }

    getPagination() {
        const options = this.getActiveMenu()?.getOptions();
        const itemsPerPage = this.getItemsPerPage();
        const totalPages = this.getTotalPages();
        const itemsOnCurrentPage = (this.#currentPage + 1) >= totalPages
            ? ((options?.length % itemsPerPage) || itemsPerPage)
            : itemsPerPage;

        return {
            itemsPerPage,
            itemsOnCurrentPage,
            currentPage: this.#currentPage,
            totalPages,
            index: this.#currentPage * itemsPerPage,
            hasNextPage: this.#currentPage < totalPages - 1,
            hasPreviousPage: this.#currentPage > 0,
        };
    }

    render() {
        const activeMenu = this.getActiveMenu();
        if (typeof activeMenu === 'undefined') {
            return;
        }

        const options = activeMenu.getOptions();

        const itemsPerPage = this.getItemsPerPage();
        const totalPages = this.getTotalPages();
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
                this.#elements.$selectionDescription.innerHTML = option.description;
            }
        });

        this.#elements.$list.replaceWith($list);
        this.#elements.$list = $list; // Make sure the reference is updated too
        const escapeDisabled = this.checkIfEscapeIsDisabled(activeMenu);

        if (escapeDisabled) {
            this.#elements.$escapeMessage.classList.add("hidden");
        } else {
            this.#elements.$escapeMessage.classList.remove("hidden");
        }
    }

    checkIfEscapeIsDisabled(activeMenu = null) {
        activeMenu = activeMenu || this.getActiveMenu();

        return Boolean(
            typeof activeMenu.escapeDisabled === "function"
                ? activeMenu.escapeDisabled()
                : (activeMenu?.escapeDisabled || false)
        );
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
                this.#elements.$selectionDescription.innerHTML =
                    options[this.getItemIndex()].description;
            } else if ($el.classList.contains("selected")) {
                $el.classList.remove("selected");
            }
        };
    }

    selectPreviousItem() {
        this.setSelection(
            this.#selectionIndex <= 0
                ? this.getPagination().itemsOnCurrentPage - 1
                : this.#selectionIndex - 1
        );
    }

    selectNextItem() {
        this.setSelection(
            this.#selectionIndex >= this.getPagination().itemsOnCurrentPage - 1
                ? 0
                : this.#selectionIndex + 1
        );
    }

    previousPage() {
        if (this.#currentPage > 0) {
            this.#currentPage--;
            this.#selectionIndex = 0; // Reset selection index on page change
            this.render();
            this.#onPageChange?.();
            this.#onHighlight?.();
        }
    }

    nextPage() {
        if (this.#currentPage < this.getPagination().totalPages - 1) {
            this.#currentPage++;
            this.#selectionIndex = 0; // Reset selection index on page change
            this.render();
            this.#onPageChange?.();
            this.#onHighlight?.();
        }
    }

    handleInput(key) {
        switch (key) {
            case 'escape':
                const activeMenu = this.getActiveMenu();
                const defaultCloseOption =
                    activeMenu?.defaultCloseOption || null;

                if (defaultCloseOption !== null) {
                    const closeOptionIndex = activeMenu.getOptions().findIndex(
                        (option) => option.id === defaultCloseOption
                    );

                    if (closeOptionIndex === -1) {
                        console.error(
                            "Default close option was set, but no option was " +
                            "matched",
                            { defaultCloseOption, activeMenu }
                        );
                        this.goToPreviousMenu();
                        break;
                    }

                    this.select(closeOptionIndex);
                    break;
                }

                this.goToPreviousMenu();
                break;
            case 'w':
            case 'arrowup':
                this.selectPreviousItem();
                break;
            case 's':
            case 'arrowdown':
                this.selectNextItem();
                break;
            case 'a':
            case 'arrowleft':
                this.previousPage();
                break;
            case 'd':
            case 'arrowright':
                this.nextPage();
                break;
            case ' ':
            case 'e':
            case 'enter': {
                this.select();
                break;
            }
        }
    }

    goToPreviousMenu() {
        if (this.checkIfEscapeIsDisabled()) {
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
        const selectedIndex = typeof index === "undefined"
            ? this.#selectionIndex
            : parseInt(index, 10);
        const activeMenu = this.getActiveMenu();
        const key = this.#currentPage * this.getItemsPerPage() + selectedIndex;
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