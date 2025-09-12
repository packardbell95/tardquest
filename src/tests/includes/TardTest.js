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
 *          $myContext
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

function test(name, testFunction, $context) {
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
        });

        console.log(`✅ ${name}`);
    } catch (error) {
        __TestResults[groupIndex].results.push({
            name,
            passed: false,
            error,
            $context,
        });

        console.error(`❌ ${name}`);
        console.error(error);
    }
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
            $contextRow.className = "context hidden";
            $contextRow.id = contextId;

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

        if (results.total === 0 || results.total !== results.passed) {
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

            const ka = Object.keys(a);
            const kb = Object.keys(b);
            if (ka.length !== kb.length) {
                return false;
            }

            ka.sort();
            kb.sort();

            for (let i = 0; i < ka.length; i++) {
                if (ka[i] !== kb[i]) {
                    return false;
                }
            }

            for (const k of ka) {
                if (!_deepEqual(a[k], b[k], seen)) {
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

    const _fail = (message, userMessage) => {
        throw new Error(userMessage ? `${message} :: ${userMessage}` : message);
    };

    return {
        // --- Equality ---
        equals(expected, actual, message) {
            if (!(actual === expected || _sameNaN(actual, expected))) {
                _fail(
                    `Expected ${_fmt(expected)} but got ${_fmt(actual)}`,
                    message
                );
            }
        },

        notEquals(expected, actual, message) {
            if (actual === expected && !_sameNaN(actual, expected)) {
                _fail(`Did not expect ${_fmt(expected)}`, message);
            }
        },

        deepEquals(expected, actual, message) {
            if (!_deepEqual(actual, expected)) {
                _fail(
                    `Expected deep equality.\n` +
                    `Expected: ${_fmt(expected)}\n` +
                    `Actual:   ${_fmt(actual)}`,
                    message
                );
            }
        },

        notDeepEquals(expected, actual, message) {
            if (_deepEqual(actual, expected)) {
                _fail(
                    `Expected values to differ (deep) but both were ` +
                    `${_fmt(actual)}`,
                    message
                );
            }
        },

        approximately(expected, actual, delta = 1e-9, message) {
            if (!(Math.abs(actual - expected) <= delta)) {
                _fail(
                    `Expected ${actual} to be within ±${delta} of ${expected}`,
                    message
                );
            }
        },

        // --- Truthiness & Types ---
        isTrue(value, message) {
            if (value !== true) {
                _fail(`Expected true but got ${_fmt(value)}`, message);
            }
        },

        isFalse(value, message) {
            if (value !== false) {
                _fail(`Expected false but got ${_fmt(value)}`, message);
            }
        },

        isNull(value, message) {
            if (value !== null) {
                _fail(`Expected null but got ${_fmt(value)}`, message);
            }
        },

        notNull(value, message) {
            if (value === null) {
                _fail(`Expected non-null value`, message);
            }
        },

        isUndefined(value, message) {
            if (value !== undefined) {
                _fail(`Expected undefined but got ${_fmt(value)}`, message);
            }
        },

        isDefined(value, message) {
            if (value === undefined) {
                _fail(`Expected value to be defined`, message);
            }
        },

        isType(type, value, message) {
            if (typeof value !== type) {
                _fail(
                    `Expected typeof ${type} but got ${typeof value}`,
                    message
                );
            }
        },

        instanceOf(expectedConstructor, value, message) {
            if (!(value instanceof expectedConstructor)) {
                const result = value?.constructor?.name || typeof value;
                const constructorName =
                    expectedConstructor?.name || "(anonymous)";

                _fail(
                    `Expected instance of ${constructorName} but got ${result}`,
                    message
                );
            }
        },

        // --- Collections / Strings ---
        contains(needle, haystack, message) {
            if (typeof haystack === "string") {
                if (! haystack.includes(String(needle))) {
                    _fail(
                        `Expected "${haystack}" to contain "${needle}"`,
                        message
                    );
                }
                return;
            }

            if (Array.isArray(haystack)) {
                if (! haystack.some(x => _deepEqual(x, needle))) {
                    _fail(
                        `Expected array to contain ${_fmt(needle)}\n` +
                        `Array: ${_fmt(haystack)}`,
                        message
                    );
                }
                return;
            }

            if (_isObjectLike(haystack) && typeof haystack.has === "function") {
                if (! haystack.has(needle)) {
                    _fail(
                        `Expected collection to contain ${_fmt(needle)}`,
                        message
                    );
                }
                return;
            }

            _fail(`Unsupported haystack type for contains()`, message);
        },

        notContains(needle, haystack, message) {
            try {
                this.contains(needle, haystack);
            } catch {
                // Passes because the substring was not found
                return;
            }

            _fail(`Did not expect to find ${_fmt(needle)} in haystack`, message);
        },

        hasKey(key, obj, message) {
            const hasOwnKey =
                obj != null &&
                Object.prototype.hasOwnProperty.call(obj, key);

            if (!hasOwnKey) {
                _fail(`Expected object to have own key "${key}"`, message);
            }
        },

        // --- Comparisons ---
        greaterThan(min, actual, message) {
            if (!(actual > min)) {
                _fail(`Expected ${actual} to be > ${min}`, message);
            }
        },

        greaterThanOrEqual(min, actual, message) {
            if (!(actual >= min)) {
                _fail(`Expected ${actual} to be ≥ ${min}`, message);
            }
        },

        lessThan(max, actual, message) {
            if (!(actual < max)) {
                _fail(`Expected ${actual} to be < ${max}`, message);
            }
        },

        lessThanOrEqual(max, actual, message) {
            if (!(actual <= max)) {
                _fail(`Expected ${actual} to be ≤ ${max}`, message);
            }
        },

        // --- Count / Length ---
        count(expectedCount, value, message) {
            const n = _sizeOf(value);
            if (n !== expectedCount) {
                _fail(`Expected count ${expectedCount} but got ${n}`, message);
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

            if (!thrown) {
                _fail(`Expected function to throw`, message);
            }

            if (!_matchErr(thrown, expectedMessageOrRegex)) {
                const formattedMessage = _fmt(expectedMessageOrRegex);
                _fail(
                    `Error message didn't match ${formattedMessage}; ` +
                    `got "${thrown.message}"`,
                    message
                );
            }
        },

        doesNotThrow(fn, message) {
            try {
                fn();
            } catch (err) {
                _fail(
                    `Did not expect function to throw; ` +
                    `got "${err && err.message}"`,
                    message
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
                _fail(`Expected promise to reject`, message);
            } catch (err) {
                if (!_matchErr(err, expectedMessageOrRegex)) {
                    const formattedMessage = _fmt(expectedMessageOrRegex);
                    _fail(
                        `Rejection message didn't match ${formattedMessage}; ` +
                        `got "${err && err.message}"`,
                        message
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
                    `Expected promise to resolve but it rejected with ` +
                    `"${err && err.message}"`,
                    message
                );
            }
        }
    };
})();
