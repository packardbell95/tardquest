"use strict";

/**
 * Speech Synthesizer wrapper and handler for TardQuest
 *
 * This interfaces with the SAM Software Automatic Mouth library (sam.js)
 */
const SpeechSynthesizer = {
    enabled: true,
    isSpeaking: false,
    _speechModes: {
        ignore: {
            name: "Ignore",
            description: "Won't speak new sentences if currently speaking",
        },
        interrupt: {
            name: "Interrupt",
            description: "Stops any active speech to speak new sentences",
        },
        queue: {
            name: "Queue",
            description: "Speaks all sentences in order",
        },
    },
    _speechMode: "ignore",
    _speechToken: 0,
    queue: [],
    activeSource: null,
    pronunciationOverrides: {
        "gauge": "gayge",
        "ps2": "pee ess too",
        "lughead": "lug head",
        "the": "thuh",
        "goodbye": "good bye",
        "tasty": "tay stee",
        "consent": "cun sent",
        "date": "daytt",
        "id": "eye dee",
        "delivered": "deliv urd",
        "adventurer": "advent ur rehr",
        "motorcycles": "motor psy culls",
    },

    speak: function(sentence, voiceOptions, onEnded) {
        if (! this.enabled) {
            onEnded?.();
            return;
        }

        if (! sentence) {
            return;
        }

        if (this.isSpeaking) {
            switch (this._speechMode) {
                case "ignore":
                    onEnded?.();
                    return;

                case "interrupt":
                    this.stop();
                    break;

                case "queue":
                    this.queue.push([ sentence, voiceOptions, onEnded ]);
                    return;
            }
        }

        let normalizedSentence = this.normalizeNumbers(sentence);
        normalizedSentence = this.expandAcronyms(normalizedSentence);
        normalizedSentence =
            this.applyPronunciationOverrides(normalizedSentence);

        const speechToken = ++this._speechToken;
        this.isSpeaking = true;
        const options = structuredClone(voiceOptions);
        options.singmode = Math.random() < 0.5;
        options.reverb = {
            wetGain: 0.05,
            dryGain: 0.85,
            delayTimeSeconds: 0.02,
            decay: 0.3,
            totalDelays: 5,
            lowpassFilterCutoffHz: 1760,
        };
        options.onSourceCreated = (source) => {
            // An interrupted speech request can finish creating its source
            // after a replacement request has already started.
            if (speechToken !== this._speechToken) {
                try {
                    source.stop();
                } catch (error) {
                    console.error(
                        "Failed to stop stale speech source",
                        error
                    );
                }
                return;
            }

            this.activeSource = source;
        };
        options.onEnded = () => {
            // Ignore callbacks from speech that was interrupted or stopped.
            if (speechToken !== this._speechToken) {
                return;
            }

            this.activeSource = null;
            this.isSpeaking = false;
            onEnded?.();

            // Play next in queue if present.
            if (this.queue.length > 0) {
                const [nextSentence, nextVoiceOptions, nextOnEnded] =
                    this.queue.shift();
                this.speak(nextSentence, nextVoiceOptions, nextOnEnded);
            }
        };

        new SamJs(options).speak(normalizedSentence);
    },

    stop: function () {
        this.queue = [];

        // Invalidate callbacks/source creation from the speech being stopped.
        this._speechToken++;

        if (this.activeSource) {
            try {
                this.activeSource.stop();
            } catch (error) {
                console.error("Failed to stop active speech source", error);
            }

            this.activeSource = null;
        }

        this.isSpeaking = false;
    },

    setMode: function(mode) {
        if (! this._speechModes.hasOwnProperty(mode)) {
            console.error("Unknown speech mode", { mode });
            return;
        }

        this._speechMode = mode;
    },

    getModes: function() {
        return this._speechModes;
    },

    getMode: function() {
        return this._speechMode;
    },

    getModeName: function() {
        return this._speechModes[this._speechMode].name;
    },

    getModeDescription: function() {
        return this._speechModes[this._speechMode].description;
    },

    skipToLast: function () {
        if (this.queue.length <= 1) {
            return;
        }

        const [sentence, voiceOptions, onEnded] =
            this.queue[this.queue.length - 1];

        // stop() clears the queue, invalidates callbacks from the current
        // speech, and safely stops its active source if one exists.
        this.stop();
        this.speak(sentence, voiceOptions, onEnded);
    },

    applyPronunciationOverrides: function (text) {
        return text.replace(/\b([\w']+)\b/g, (m, w) => {
            const lower = w.toLowerCase();
            const hasOverride =
                Object.hasOwn(this.pronunciationOverrides, lower);

            if (hasOverride) {
                const repl = this.pronunciationOverrides[lower];
                if (w === w.toUpperCase()) {
                    return /[\s-]/.test(repl) ? repl : repl.toUpperCase();
                }

                if (w[0] === w[0].toUpperCase()) {
                    return repl.charAt(0).toUpperCase() + repl.slice(1);
                }

                return repl;
            }

            return m;
        });
    },

    // VOCAP: use known acronyms to avoid expanding common ones,
    // such as "HAHA" (whoops).
    expandAcronyms: function (text) {
        // VOCAP: not much use for this feature now but maybe in the future?
        const knownAcronyms = [ "HP", "EXP", "BTC" ];

        return text.replace(/\b([A-Z]{2,6})\b/g, (m, w) => {
            if (! knownAcronyms.includes(w)) {
                return w;
            }

            const lower = w.toLowerCase();
            const hasOverride =
                Object.hasOwn(this.pronunciationOverrides, lower);

            if (hasOverride) {
                return w;
            }

            if (w.includes("'")) {
                return w;
            }

            return w.split("").join(" ");
        });
    },

    normalizeNumbers: function (text) {
        // Pass 1: fractions
        let out = text.replace(/(^|[^A-Za-z0-9+/-])([+-]?)(\d+)\s*\/\s*(\d+)(?=$|[^A-Za-z0-9/])/g,
            (full, pre, sign, numStr, denStr) => {
                const num = Number(numStr);
                const den = Number(denStr);
                const isUnsafeFraction =
                    ! Number.isSafeInteger(num) ||
                    ! Number.isSafeInteger(den) ||
                    den === 0;

                if (isUnsafeFraction) {
                    return full;
                }

                if (numStr.length > 15 || denStr.length > 15) {
                    return full;
                }
                const words = this.fractionToWords(
                    sign === "-" ? -1 : (sign === "+" ? 1 : 0),
                    num,
                    den
                );
                return pre + words;
            });

        // Pass 2: decimals
        out = out.replace(/(^|[^A-Za-z0-9.])([+-]?)(\d{1,3}(?:,\d{3})*|\d+)\.(\d+)(?=$|[^0-9.])/g,
            (full, pre, sign, intPart, fracPart) => {
                const cleanInt = intPart.replace(/,/g, "");
                if (cleanInt.length > 15 || fracPart.length > 30) {
                    return full;
                }

                const isInvalidDecimal =
                    ! /^\d+$/.test(cleanInt) ||
                    !/^\d+$/.test(fracPart);

                if (isInvalidDecimal) {
                    return full;
                }

                const intNum = Number(cleanInt);
                const isUnsafeNumber =
                    ! Number.isSafeInteger(intNum) ||
                    intNum > 999_999_999_999;

                if (isUnsafeNumber) {
                    return full;
                }

                return pre + this.decimalToWords(sign, intNum, fracPart);
            });

        // Pass 3: signed / unsigned integers
        out = out.replace(/(^|[^A-Za-z0-9])([+-]?)(\d{1,3}(?:,\d{3})*|\d{1,15})(?=$|[^0-9])/g,
            (full, pre, sign, body) => {
                const clean = body.replace(/,/g, "");
                if (clean.length > 15) {
                    return full;
                }

                if (! /^\d+$/.test(clean)) {
                    return full;
                }

                const n = Number(clean);
                if (! Number.isSafeInteger(n) || n > 999_999_999_999) {
                    return full;
                }

                return pre + this.signedIntegerToWords(sign, n);
            });

        return out;
    },

    signedIntegerToWords: function (sign, n) {
        if (n === 0) {
            return "zero";
        }

        const core = this.numberToWordsLarge(n);

        if (sign === "-") {
            return `negative ${core}`;
        } else if (sign === "+") {
            return `positive ${core}`;
        }

        return core;
    },

    decimalToWords: function (sign, intNum, fracStr) {
        const intWords = this.numberToWordsLarge(intNum);
        const fracDigits =
            fracStr.split("").map(d => this.numberToWordsSmall(Number(d)));
        const signWord = sign === "-"
            ? "negative "
            : (sign === "+" ? "positive " : "");

        return `${signWord}${intWords} point ${fracDigits.join(" ")}`
            .replace(/\s+/g, " ").trim();
    },

    fractionToWords: function (signFlag, numerator, denominator) {
        // Reduce fraction
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const g = gcd(numerator, denominator);
        numerator = numerator / g;
        denominator = denominator / g;

        const signWord = signFlag < 0
            ? "negative "
            : (signFlag > 0 ? "positive " : "");

        const numWords = this.numberToWordsLarge(numerator);
        const denomWords =
            this.fractionDenominatorToWords(denominator, numerator !== 1);

        if (! denomWords) {
            const denomFallback = this.numberToWordsLarge(denominator);
            return `${signWord}${numWords} over ${denomFallback}`.trim();
        }

        return `${signWord}${numWords} ${denomWords}`.trim();
    },

    fractionDenominatorToWords: function (den, plural) {
        const map = {
            2: ["half", "halves"],
            3: ["third", "thirds"],
            4: ["fourth", "fourths"],
            5: ["fifth", "fifths"],
            6: ["sixth", "sixths"],
            7: ["seventh", "sevenths"],
            8: ["eighth", "eighths"],
            9: ["ninth", "ninths"],
            10: ["tenth", "tenths"],
            11: ["eleventh", "elevenths"],
            12: ["twelfth", "twelfths"],
        }[den];

        if (! map) {
            return null;
        }

        return plural ? map[1] : map[0];
    },

    numberToWordsSmall: function (n) {
        const ones = [
            "zero", "one", "two", "three", "four", "five", "six",
            "seven", "eight", "nine", "ten", "eleven", "twelve",
            "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
            "eighteen", "nineteen",
        ];

        const tens = [
            "", "", "twenty", "thirty", "forty", "fifty", "sixty",
            "seventy", "eighty", "ninety",
        ];

        if (n < 20) {
            return ones[n];
        }

        if (n < 100) {
            const t = Math.floor(n / 10);
            const o = n % 10;
            return o ? `${tens[t]}-${ones[o]}` : tens[t];
        }

        const h = Math.floor(n / 100);
        const r = n % 100;
        return r
            ? `${ones[h]} hundred ${this.numberToWordsSmall(r)}`
            : `${ones[h]} hundred`;
    },

    numberToWordsLarge: function (n) {
        if (n === 0) {
            return "zero";
        }

        const scales = ["", "thousand", "million", "billion", "trillion"];
        const parts = [];

        let scaleIndex = 0;
        while (n > 0 && scaleIndex < scales.length) {
            const chunk = n % 1000;
            if (chunk) {
                const words = this.numberToWordsSmall(chunk);
                const scaleWord = scales[scaleIndex];
                parts.unshift(scaleWord ? `${words} ${scaleWord}` : words);
            }

            n = Math.floor(n / 1000);
            scaleIndex++;
        }

        return parts.join(" ").replace(/\s+/g, " ").trim();
    },
};
