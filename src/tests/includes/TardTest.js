"use strict";

/**
 * Simple test runner for TardQuest
 *
 * USAGE:
 *  Include this script in an HTML page
 *
 *  Set the name of the test group with testGroup() to keep things organized:
 *      testGroup("My Test Group");
 *
 *  Run tests with test():
 *      test("1 + 2 equals 3", () => Assert.equals(3, 1 + 2, "1 plus 2 is 3"));
 *
 *  Include optional contextual details in a DOM element:
 *      const $myContext = document.createElement("pre");
 *      $myContext.textContent = "Hello world!";
 *      test(
 *          "Context example",
 *          () => Assert.isTrue(1 === -1 + 2),
 *          $myContext,
 *          true // Set this to auto-open the context (useful for development)
 *      );
 *
 *  Print the results of the tests. Call it after all tests have been conducted:
 *      printResults();
 *
 *
 * ASSERTION FUNCTIONS:
 *  These are the available functions that are used to perform assertions:
 *
 * Assert.equals(expected, actual, message)
 *     Passes if actual === expected (strict equality)
 *
 * Assert.notEquals(expected, actual, message)
 *     Passes if actual !== expected (strict inequality)
 *
 * Assert.deepEquals(expected, actual, message)
 *     Passes if actual and expected have the same structure and values
 *     (deep comparison)
 *
 * Assert.notDeepEquals(expected, actual, message)
 *     Passes if actual and expected differ in structure or values
 *     (deep comparison)
 *
 * Assert.approximately(expected, actual, delta = 1e-9, message)
 *     Passes if actual is within a given delta of expected (for numbers)
 *
 * Assert.isTrue(value, message)
 *     Passes if value is exactly true
 *
 * Assert.isFalse(value, message)
 *     Passes if value is exactly false
 *
 * Assert.isNull(value, message)
 *     Passes if value is exactly null
 *
 * Assert.notNull(value, message)
 *     Passes if value is not null
 *
 * Assert.isUndefined(value, message)
 *     Passes if value is exactly undefined
 *
 * Assert.isDefined(value, message)
 *     Passes if value is not undefined
 *
 * Assert.isType(type, value, message)
 *     Passes if typeof value matches the expected type string
 *
 * Assert.instanceOf(expectedConstructor, value, message)
 *     Passes if value is an instance of the given constructor/class
 *
 * Assert.contains(needle, haystack, message)
 *     Passes if a string contains a substring, an array contains a value, or a
 *     Set/Map has a key
 *
 * Assert.notContains(needle, haystack, message)
 *     Passes if the above containment check fails
 *
 * Assert.hasKey(key, obj, message)
 *     Passes if an object has a given own property key
 *
 * Assert.greaterThan(min, actual, message)
 *     Passes if actual > min
 *
 * Assert.greaterThanOrEqual(min, actual, message)
 *     Passes if actual >= min
 *
 * Assert.lessThan(max, actual, message)
 *     Passes if actual < max
 *
 * Assert.lessThanOrEqual(max, actual, message)
 *     Passes if actual <= max
 *
 * Assert.count(expectedCount, value, message)
 *     Passes if an array/string/collection has the expected length or size
 *
 * Assert.throws(fn, expectedMessageOrRegex, message)
 *     Passes if a function throws an error, optionally matching a message or
 *     regular expression
 *
 * Assert.doesNotThrow(fn, message)
 *     Passes if a function does not throw any error
 */
const __TestResults = [];

function __createTestGroup(name) {
    __TestResults.push({ name, results: [] });
}

function testGroup(name) {
    __createTestGroup(name);
    console.log(`💼 ${name}`);
}

function test(name, testFunction, $context, autoOpenContext = false) {
    if (__TestResults.length === 0) {
        __createTestGroup("Untitled Group");
    }

    const groupIndex = __TestResults.length - 1;

    try {
        testFunction();
        __TestResults[groupIndex].results.push({
            name,
            passed: true,
            error: null,
            $context,
            autoOpenContext,
        });

        console.log(`✅ ${name}`);
    } catch (error) {
        __TestResults[groupIndex].results.push({
            name,
            passed: false,
            error,
            $context,
            autoOpenContext,
        });

        console.error(`❌ ${name}`);
        console.error(error);
    }
}

function copyTextToClipboard(textToCopy) {
    if (! textToCopy) {
        return false;
    }

    const hasClipboardApi =
        typeof navigator?.clipboard?.writeText === "function";

    if (hasClipboardApi) {
        return navigator.clipboard.writeText(textToCopy).catch(function () {
            return fallbackCopyTextToClipboard(textToCopy);
        }) || false;
    }

    return fallbackCopyTextToClipboard(textToCopy);
}

function fallbackCopyTextToClipboard(textToCopy) {
    const textareaElement = document.createElement("textarea");

    textareaElement.value = textToCopy;
    textareaElement.setAttribute("readonly", "");
    textareaElement.style.position = "absolute";
    textareaElement.style.left = "-9999px";

    document.body.appendChild(textareaElement);
    textareaElement.select();

    try {
        document.execCommand("copy");
    } catch (error) {
        console.warn("Clipboard copy failed", error);
        document.body.removeChild(textareaElement);
        return false;
    }

    document.body.removeChild(textareaElement);
    return true;
}

function toast(message, classes, $parentElement = null) {
    const displayDurationMs = 3000;
    const fadeDurationMs = 500;

    function getContainer($parentElement) {
        const containerClass = "toast-container";
        const $container =
            $parentElement.querySelector(`:scope > .${containerClass}`);

        if ($container) {
            return $container;
        }

        const $newContainer = document.createElement("div");
        $newContainer.className = containerClass;
        $parentElement.appendChild($newContainer);

        return $newContainer;
    }

    const $toastContainer = getContainer($parentElement ?? document.body);
    const $message = document.createElement("div");
    $message.classList.add("toast-message", classes);
    $message.innerText = message;
    $toastContainer.prepend($message);

    setTimeout(() => $message.classList.add("open"), 10);
    setTimeout(() => $message.classList.remove("open"), displayDurationMs);
    setTimeout(
        () => $toastContainer.removeChild($message),
        displayDurationMs + fadeDurationMs
    );
}

function printResults() {
    let resultCount = 0;

    function camelToTitleCase(input) {
        const spacedInput = input.replace(/([a-z])([A-Z])/g, '$1 $2');
        return input
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .charAt(0)
            .toUpperCase() + spacedInput.slice(1);
    }

    function isPlainObject(value) {
        if (value === null || typeof value !== "object") {
            return false;
        }

        return Object.getPrototypeOf(value) === Object.prototype;
    }

    function formatValueForDisplay(value) {
        if (value === undefined) {
            return 'undefined';
        }

        if (typeof value === 'string') {
            return value;
        }

        if (
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
        ) {
            return String(value);
        }

        if (Array.isArray(value) || isPlainObject(value)) {
            try {
                return JSON.stringify(value, null, 4);
            } catch (error) {
                return '[Unserializable Object]';
            }
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (value instanceof Error) {
            return value.stack || value.message;
        }

        if (typeof value === 'function') {
            return value.toString();
        }

        // Fallback for everything else (Map, Set, class instances, etc.)
        try {
            return String(value);
        } catch (error) {
            return '[Unknown Value]';
        }
    }

    function createErrorDialog(rowData) {
        const error = rowData.error;
        const $dialog = document.createElement("dialog");
        $dialog.className = "error-details";

        createErrorDialog.dialogId = (createErrorDialog.dialogId || 0);
        $dialog.id = `errorDialog${createErrorDialog.dialogId}`;

        const $header = document.createElement("div");
        $header.className = "header";
        const $headerIcon = document.createElement("span");
        $headerIcon.innerText = "🪲 ";
        $header.appendChild($headerIcon);
        const $headerText = document.createElement("em");
        $headerText.textContent = `Error Details for ${rowData.name}`;
        $header.appendChild($headerText);
        $dialog.appendChild($header);

        const $details = document.createElement("div");
        $details.className = "details";

        const $summary = document.createElement("div");
        $summary.className = "summary";
        $summary.textContent = error.message;
        $details.appendChild($summary);

        const $dataContainer = document.createElement("div");
        $dataContainer.className = "data";

        const $expectedContainer = document.createElement("div");
        const $expectedHeader = document.createElement("div");
        $expectedHeader.className = "section-header";
        const $expectedTitle = document.createElement("span");
        $expectedTitle.textContent = "Expected";
        $expectedHeader.appendChild($expectedTitle);

        if (error?.cause?.expected) {
            const $copyToClipboardButton = document.createElement("button");
            $copyToClipboardButton.textContent = "Copy to Clipboard";
            $copyToClipboardButton.addEventListener("click", () => {
                const textToCopy = formatValueForDisplay(error.cause.expected);
                copyTextToClipboard(textToCopy)
                    ? toast(
                        "Expected result copied to the clipboard",
                        ["success"],
                        $dialog
                    )
                    : toast(
                        "Could not copy the expected result to the clipboard!",
                        ["danger"],
                        $dialog
                    );
            });
            $expectedHeader.appendChild($copyToClipboardButton);
        }

        $expectedContainer.appendChild($expectedHeader);
        const $expectedData = document.createElement("textarea");
        $expectedData.textContent =
            formatValueForDisplay(error?.cause?.expected);
        $expectedData.readOnly = true;
        $expectedContainer.appendChild($expectedData);
        $dataContainer.appendChild($expectedContainer);

        const $actualContainer = document.createElement("div");
        const $actualHeader = document.createElement("div");
        $actualHeader.className = "section-header";
        const $actualTitle = document.createElement("span");
        $actualTitle.textContent = "Actual";
        $actualHeader.appendChild($actualTitle);

        if (error?.cause?.actual) {
            const $copyToClipboardButton = document.createElement("button");
            $copyToClipboardButton.textContent = "Copy to Clipboard";
            $copyToClipboardButton.addEventListener("click", () => {
                const textToCopy = formatValueForDisplay(error.cause.actual);
                copyTextToClipboard(textToCopy)
                    ? toast(
                        "Actual result copied to the clipboard",
                        ["success"],
                        $dialog
                    )
                    : toast(
                        "Could not copy the actual result to the clipboard!",
                        ["danger"],
                        $dialog
                    );
            });
            $actualHeader.appendChild($copyToClipboardButton);
        }

        $actualContainer.appendChild($actualHeader);
        const $actualData = document.createElement("textarea");
        $actualData.textContent =
            formatValueForDisplay(error?.cause?.actual);
        $actualData.readOnly = true;
        $actualContainer.appendChild($actualData);
        $dataContainer.appendChild($actualContainer);

        let isSyncingScroll = false;

        function syncScroll(sourceTextarea, targetTextarea) {
            if (isSyncingScroll) {
                return;
            }

            isSyncingScroll = true;
            targetTextarea.scrollTop = sourceTextarea.scrollTop;
            isSyncingScroll = false;
        }

        $expectedData.addEventListener('scroll', () => {
            syncScroll($expectedData, $actualData);
        });

        $actualData.addEventListener('scroll', () => {
            syncScroll($actualData, $expectedData);
        });

        $details.appendChild($dataContainer);
        $dialog.appendChild($details);

        const $footer = document.createElement("div");
        $footer.className = "footer";

        const $closeButton = document.createElement("button");
        $closeButton.textContent = "Close";
        $closeButton.addEventListener("click", () => {
            $dialog.close();
        });
        $footer.appendChild($closeButton);
        $dialog.appendChild($footer);

        return $dialog;
    }

    function getResults(results) {
        if (results.length === 0) {
            $div = document.createElement("div");
            $div.className = "no-tests";
            $icon = document.createTextNode("⛔️ ");
            $em = document.createElement("em");
            $em.textContent = "No tests were executed!";
            $div.appendChild($icon);
            $div.appendChild($em);

            return $div;
        }

        const $table = document.createElement("table");
        const cells = ["passed", "name", "error", "showContext"];
        const sizes = {
            passed: "10%",
            name: "50%",
            error: "22%",
            showContext: "18%",
        };

        // Create table header
        const $colgroup = document.createElement("colgroup");
        const $thead = document.createElement("thead");
        const $headerRow = document.createElement("tr");
        cells.forEach(key => {
            const $col = document.createElement("col");
            $col.style.width = sizes[key] || "auto";
            $colgroup.appendChild($col);

            const $th = document.createElement("th");
            $th.textContent = camelToTitleCase(key);
            $headerRow.appendChild($th);
        });
        $thead.appendChild($headerRow);
        $table.appendChild($colgroup);
        $table.appendChild($thead);

        // Create table body
        const $tbody = document.createElement("tbody");
        results.forEach(rowData => {
            const $row = document.createElement("tr");
            const contextId = `context${resultCount}`;

            cells.forEach(rowName => {
                if (rowName === "showContext") {
                    const $cell = document.createElement("td");

                    if (rowData.$context) {
                        const switchId = `${contextId}Switch`;
                        const $toggleSwitch = document.createElement("input");
                        $toggleSwitch.id = switchId;
                        $toggleSwitch.setAttribute("type", "checkbox");
                        $toggleSwitch.className = "toggle";
                        $toggleSwitch.checked =
                            Boolean(rowData.autoOpenContext) ||
                            rowData.error;
                        $toggleSwitch.onchange = function() {
                            const $context = document.getElementById(contextId);
                            this.checked
                                ? $context.classList.remove("hidden")
                                : $context.classList.add("hidden");
                        };

                        $cell.appendChild($toggleSwitch);

                        const $label = document.createElement("label");
                        $label.setAttribute("for", switchId);
                        $label.className = "toggle";
                        $cell.appendChild($label);
                    } else {
                        const $noContext = document.createElement("em");
                        $noContext.className = "understated";
                        $noContext.textContent = "No context provided";
                        $cell.appendChild($noContext);
                    }

                    $row.appendChild($cell);

                    return;
                } else if (rowName === "error" && rowData.error) {
                    const $cell = document.createElement("td");

                    const $dialog = createErrorDialog(rowData);
                    $cell.appendChild($dialog);

                    const $errorButton =
                        document.createElement("button");
                    $errorButton.textContent = "Show Error";

                    const $details =
                        document.querySelector("#errorDetails .details");

                    $errorButton.addEventListener("click", () => {
                        $dialog.showModal();
                    });

                    $cell.appendChild($errorButton);
                    $row.appendChild($cell);
                    return;
                }

                const value = rowData[rowName];
                const $td = document.createElement("td");
                $td.textContent = typeof value === "boolean"
                    ? (value ? "✅" : "❌")
                    : (value ?? "--");
                $row.appendChild($td);
            });
            $tbody.appendChild($row);

            const $contextRow = document.createElement("tr");
            $contextRow.id = contextId;

            $contextRow.classList.add("context");
            if (! rowData.autoOpenContext && ! rowData.error) {
                $contextRow.classList.add("hidden");
            }

            const $contextCell = document.createElement("td");
            $contextCell.setAttribute("colspan", cells.length.toString());

            if (rowData.$context) {
                $contextCell.appendChild(rowData.$context);
            } else {
                const $message = document.createElement("em");
                $message.textContent = "No context provided";
                $contextCell.appendChild($message);
            }

            $contextRow.appendChild($contextCell);

            const $contextualDetails = document.createElement("div");

            $contextualDetails.appendChild($contextRow);
            $tbody.appendChild($contextRow);

            resultCount++;
        });
        $table.appendChild($tbody);

        return $table;
    }

    function summarize(summary) {
        if (summary.total === 0) {
            return ` No Tests Performed (--/--) ⛔️`;
        }

        return summary.passed === summary.total
            ? `✨ All Tests Passed ✨ (${summary.passed}/${summary.total}) ✅`
            : `Tests Failed (${summary.passed}/${summary.total}) ❌`;
    }

    let allTestsPassed = true;

    __TestResults.forEach((group) => {
        const results = {
            total: group.results.length,
            passed: group.results.reduce(
                (count, testResult) => count + (testResult.passed ? 1 : 0),
                0
            ),
        };

        const $details = document.createElement("details");
        const $summary = document.createElement("summary");
        const $container = document.createElement("div");
        $container.classList.add("header");

        const $title = document.createElement("div");
        $title.textContent = group.name;
        $container.appendChild($title);

        const $score = document.createElement("div");
        $score.textContent = summarize(results);
        $container.appendChild($score);

        $summary.appendChild($container);
        $details.appendChild($summary);
        $details.appendChild(getResults(group.results));

        const shouldOpenSection =
            results.total === 0 ||
            results.total !== results.passed ||
            group.results.some(e => e.autoOpenContext);

        if (shouldOpenSection) {
            allTestsPassed = false;
            $details.setAttribute("open", true);
        }

        document.body.appendChild($details);
    });

    document.title = `${allTestsPassed ? "✅" : "❌"} ${document.title}`;
}


// Assertion functions
const Assert = (() => {
    const _fmt = (v) => {
        try {
            return typeof v === "string" ? `"${v}"` : JSON.stringify(v);
        } catch {
            return String(v);
        }
    };

    const _isObjectLike = (v) => v !== null && typeof v === "object";

    const _isPlainObject = (v) =>
        Object.prototype.toString.call(v) === "[object Object]";

    const _sameNaN = (a, b) => Number.isNaN(a) && Number.isNaN(b);

    const _getDefinedKeys = (value) =>
        Object.keys(value).filter((key) => value[key] !== undefined);

    const _deepEqual = (a, b, seen = new WeakMap()) => {
        if (a === b || _sameNaN(a, b)) {
            return true;
        }

        // Handle Date
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }

        // Handle RegExp
        if (a instanceof RegExp && b instanceof RegExp) {
            return a.source === b.source && a.flags === b.flags;
        }

        // Handle Map
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) {
                return false;
            }

            for (const [k, v] of a) {
                if (!b.has(k)) {
                    return false;
                }

                if (!_deepEqual(v, b.get(k), seen)) {
                    return false;
                }
            }

            return true;
        }

        // Handle Set
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) {
                return false;
            }

            // Compare as arrays sorted by JSON stringification fallback
            const arrA = Array.from(a);
            const arrB = Array.from(b);
            if (arrA.length !== arrB.length) {
                return false;
            }

            // O(n^2) fallback: ensure each element in A matches something in B
            return arrA.every(x => arrB.some(y => _deepEqual(x, y, seen)));
        }

        // Typed arrays
        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            if (a.constructor !== b.constructor || a.length !== b.length) {
                return false;
            }

            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }

            return true;
        }

        // Arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }

            for (let i = 0; i < a.length; i++) {
                if (!_deepEqual(a[i], b[i], seen)) {
                    return false;
                }
            }

            return true;
        }

        // Plain objects
        if (_isPlainObject(a) && _isPlainObject(b)) {
            if (seen.get(a) === b) {
                return true; // cycle
            }

            seen.set(a, b);

            const keysA = _getDefinedKeys(a).sort();
            const keysB = _getDefinedKeys(b).sort();

            if (keysA.length !== keysB.length) {
                return false;
            }

            for (let i = 0; i < keysA.length; i++) {
                if (keysA[i] !== keysB[i]) {
                    return false;
                }
            }

            for (const key of keysA) {
                if (!_deepEqual(a[key], b[key], seen)) {
                    return false;
                }
            }

            return true;
        }

        // Fallback for object-likes of different types or primitives
        return false;
    };

    const _sizeOf = (x) => {
        if (x == null) {
            return 0;
        }

        if (typeof x === "string" || Array.isArray(x)) {
            return x.length;
        }

        if (typeof x === "object") {
            // Map/Set
            if (typeof x.size === "number") {
                return x.size;
            }

            // Array-like
            if (typeof x.length === "number") {
                return x.length;
            }
        }

        return 0;
    };

    const _matchErr = (err, expected) => {
        if (!expected) {
            return true;
        }

        const message = String(err && err.message || err);

        return expected instanceof RegExp
            ? expected.test(message)
            : message.includes(String(expected));
    };

    const _fail = (message, actual, expected) => {
        throw new Error(message, {cause: { actual, expected }});
    };

    return {
        // --- Equality ---
        equals(expected, actual, message) {
            if (! (actual === expected || _sameNaN(actual, expected))) {
                _fail("Expected the two values to be equal", actual, expected);
            }
        },

        notEquals(expected, actual, message) {
            if (actual === expected && !_sameNaN(actual, expected)) {
                _fail(
                    "Did not expect these two values to be equivalent",
                    actual,
                    expected
                );
            }
        },

        deepEquals(expected, actual, message) {
            if (!_deepEqual(actual, expected)) {
                _fail(
                    "Expected these two values to be equivalent under a " +
                        "deep comparison",
                    actual,
                    expected
                );
            }
        },

        notDeepEquals(expected, actual, message) {
            if (_deepEqual(actual, expected)) {
                _fail(
                    "Did not expect these two values to be equivalent under " +
                        "a deep comparison",
                    actual,
                    expected
                );
            }
        },

        approximately(expected, actual, delta = 1e-9, message) {
            if (!(Math.abs(actual - expected) <= delta)) {
                _fail(
                    `Expected the value to be within ±${delta} of ${expected}`,
                    actual,
                );
            }
        },

        // --- Truthiness & Types ---
        isTrue(value, message) {
            if (value !== true) {
                _fail("Expected the value to be true", value, true);
            }
        },

        isFalse(value, message) {
            if (value !== false) {
                _fail("Expected the value to be false", value, false);
            }
        },

        isNull(value, message) {
            if (value !== null) {
                _fail("Expected the value to be null", value, null);
            }
        },

        notNull(value, message) {
            if (value === null) {
                _fail("Expected the value to not be null", value);
            }
        },

        isUndefined(value, message) {
            if (value !== undefined) {
                _fail("Expected the value to be undefined", value);
            }
        },

        isDefined(value, message) {
            if (value === undefined) {
                _fail("Expected the value to be defined", value);
            }
        },

        isType(type, value, message) {
            if (typeof value !== type) {
                _fail(`Expected type of ${type}`, typeof value, type);
            }
        },

        instanceOf(expectedConstructor, value, message) {
            if (! (value instanceof expectedConstructor)) {
                const result = value?.constructor?.name || typeof value;
                const constructorName =
                    expectedConstructor?.name || "(anonymous)";

                _fail(
                    `Expected an instance of ${constructorName}`,
                    result,
                    constructorName
                );
            }
        },

        // --- Collections / Strings ---
        contains(needle, haystack, message) {
            if (typeof haystack === "string") {
                if (! haystack.includes(String(needle))) {
                    _fail(
                        `Expected "${haystack}" to contain "${needle}"`,
                        needle
                    );
                }
                return;
            }

            if (Array.isArray(haystack)) {
                if (! haystack.some(x => _deepEqual(x, needle))) {
                    _fail(
                        `Expected the array to contain "${_fmt(needle)}"`,
                        needle
                    );
                }
                return;
            }

            if (_isObjectLike(haystack) && typeof haystack.has === "function") {
                if (! haystack.has(needle)) {
                    _fail(
                        `Expected the collection to contain "${_fmt(needle)}"`,
                        needle
                    );
                }
                return;
            }

            _fail(`Unsupported haystack type for contains()`, message, needle);
        },

        notContains(needle, haystack, message) {
            try {
                this.contains(needle, haystack);
            } catch {
                // Passes because the substring was not found
                return;
            }

            _fail(
                `Did not expect to find "${_fmt(needle)}" in the haystack`,
                needle
            );
        },

        hasKey(key, obj, message) {
            const hasOwnKey =
                obj != null &&
                Object.prototype.hasOwnProperty.call(obj, key);

            if (! hasOwnKey) {
                _fail(
                    `Expected the object to have a key of "${key}"`,
                    "",
                    key
                );
            }
        },

        // --- Comparisons ---
        greaterThan(min, actual, message) {
            if (! (actual > min)) {
                _fail(
                    `Expected ${actual} to be > ${min}`,
                    actual,
                    `Greater than ${min}`
                );
            }
        },

        greaterThanOrEqual(min, actual, message) {
            if (!(actual >= min)) {
                _fail(
                    `Expected ${actual} to be ≥ ${min}`,
                    actual,
                    `Greater than or equal to ${min}`
                );
            }
        },

        lessThan(max, actual, message) {
            if (!(actual < max)) {
                _fail(
                    `Expected ${actual} to be < ${max}`,
                    actual,
                    `Less than ${max}`
                );
            }
        },

        lessThanOrEqual(max, actual, message) {
            if (!(actual <= max)) {
                _fail(
                    `Expected ${actual} to be ≤ ${max}`,
                    actual,
                    `Less than or equal to ${max}`
                );
            }
        },

        // --- Count / Length ---
        count(expectedCount, value, message) {
            const n = _sizeOf(value);
            if (n !== expectedCount) {
                _fail(
                    `Expected a count of ${expectedCount} but got ${n}`,
                    value
                );
            }
        },

        // --- Exceptions (Sync) ---
        throws(fn, expectedMessageOrRegex, message) {
            let thrown = null;

            try {
                fn();
            } catch (err) {
                thrown = err;
            }

            if (! thrown) {
                _fail(`Expected function to throw`);
            }

            if (! _matchErr(thrown, expectedMessageOrRegex)) {
                const formattedMessage = _fmt(expectedMessageOrRegex);
                _fail(
                    "Error messages don't match",
                    thrown.message,
                    formattedMessage
                );
            }
        },

        doesNotThrow(fn, message) {
            try {
                fn();
            } catch (err) {
                _fail(
                    "Did not expect the function to throw",
                    err && err.message
                );
            }
        },

        // --- Exceptions (Async) ---
        async rejects(promiseOrFn, expectedMessageOrRegex, message) {
            let p = typeof promiseOrFn === "function"
                ? promiseOrFn()
                : promiseOrFn;

            try {
                await p;
                _fail(`Expected promise to reject`);
            } catch (err) {
                if (!_matchErr(err, expectedMessageOrRegex)) {
                    const formattedMessage = _fmt(expectedMessageOrRegex);
                    _fail(
                        "Rejection messages don't match",
                        err && err.message,
                        formattedMessage
                    );
                }
            }
        },

        async resolves(promiseOrFn, message) {
            let p = typeof promiseOrFn === "function"
                ? promiseOrFn()
                : promiseOrFn;

            try {
                await p;
            } catch (err) {
                _fail(
                    "Expected promise to resolve, but it was rejected",
                    err && err.message
                );
            }
        }
    };
})();
