"use strict";

/**
 * The Scene Renderer handles drawing the pseudo-3D environment in the viewport
 */
const SceneRenderer = {
    displayWidth: 50,
    displayHeight: 28,
    maxViewDepth: 5,
    enemyLayerEnabled: false,

    render: (gameMap, mapEntity) => {
        const { x, y, direction } = mapEntity;

        const viewDepth =
            playerEntity.leader?.getEffectiveTrait("sightRange") ?? 2;

        const maxBrightness =
            playerEntity.leader?.getEffectiveTrait("sightSensitivity") ?? 192;

        const maxPlayerVisibilityDepth =
            viewDepth ||
            SceneRenderer.maxViewDepth;

        const view = SceneRenderer
            .getView(gameMap, x, y, direction, maxPlayerVisibilityDepth);

        const layerClasses = SceneRenderer.getLayerClasses();

        let scene = "";

        for (let depth = view.length - 1; depth >= 0; depth--) {
            let sceneLayer = Array.from(
                { length: SceneRenderer.displayHeight },
                () => Array.from(
                    { length: SceneRenderer.displayWidth },
                    () => " "
                )
            );

            for (let i = 0; i < view[depth].length; i++) {
                // Render the scene from the sides towards the middle
                const index = i % 2 === 0
                    ? i - (i / 2)
                    : view[depth].length - Math.floor(i / 2) - 1;
                const isCentered = i === view[depth].length - 1;

                for (let j = 0; j < view[depth][index].length; j++) {
                    sceneLayer = SceneRenderer.draw(
                        sceneLayer,
                        view[depth][index][j],
                        depth,
                        maxPlayerVisibilityDepth,
                        index,
                        isCentered,
                        maxBrightness
                    );
                }
            }

            scene +=
                `<div class="${layerClasses}">` +
                    sceneLayer.map(row => row.join("")).join("\n") +
                `</div>`;
        }

        if (SceneRenderer.enemyLayerEnabled) {
            scene += SceneRenderer.drawEnemyLayer(
                BattleSystem.enemyEntity
            );
        }

        return scene;
    },

    getLayerClasses: () => {
        const layerClasses = ["layer"];
        if (playerEntity.enteringCombat) {
            layerClasses.push("darkening");
            playerEntity.enteringCombat = false;
        } else if (playerEntity.leavingCombat) {
            layerClasses.push("lightening");
            playerEntity.leavingCombat = false;
        } else if (BattleSystem.isActive) {
            layerClasses.push("dark");
        }

        return layerClasses.join(" ");
    },

    getView: (gameMap, x, y, direction, viewDepth) => {
        const fixedViewDepth = Math.min(viewDepth, SceneRenderer.maxViewDepth);
        const grid = [];

        const directionVectors = [
            { dx:  0, dy: -1, lateral: { dx: 1, dy: 0 }, flip:  1 },
            { dx:  1, dy:  0, lateral: { dx: 0, dy: 1 }, flip:  1 },
            { dx:  0, dy:  1, lateral: { dx: 1, dy: 0 }, flip: -1 },
            { dx: -1, dy:  0, lateral: { dx: 0, dy: 1 }, flip: -1 },
        ];

        const dir = directionVectors[direction];
        if (! dir) {
            console.error("Invalid direction", { direction });
            return [];
        }

        for (let depth = 0; depth <= SceneRenderer.maxViewDepth; depth++) {
            const row = [];
            const offsetStart = depth === 0 ? -1 : -depth;
            const offsetEnd = depth === 0 ? 1 : depth;

            for (let offset = offsetStart; offset <= offsetEnd; offset++) {
                const gridCell = [];
                const lateralOffset = offset * dir.flip;
                const tx = x + dir.dx * depth + dir.lateral.dx * lateralOffset;
                const ty = y + dir.dy * depth + dir.lateral.dy * lateralOffset;

                gridCell.push(
                    depth > fixedViewDepth
                        ? new MapCell("darkness")
                        : gameMap.getCell(tx, ty)
                );

                row.push(gridCell);
            }

            grid.push(row);
        }

        return grid;
    },

    draw: (
        scene,
        subject,
        depth,
        maxPlayerVisibilityDepth,
        index,
        isCentered,
        maxBrightness
    ) => {
        const key = `p${depth}_${index}`;
        const artNames = SceneRenderer.getArtNames(subject);

        for (const entityName of artNames) {
            const sceneEntity = sceneArt[entityName];
            const entry = sceneEntity?.positions?.[key] || null;
            if (! entry) {
                continue;
            }

            const indexedArt = sceneEntity.art[entry.artIndex] || null;
            if (! indexedArt) {
                continue;
            }

            const art = SceneRenderer.formatArt(indexedArt);
            const transparentCharacter =
                indexedArt.transparentCharacter || null;
            const className = `class="scene_character_${entityName}"`;
            const longestLine =
                Math.max(...art.split("\n").map(l => l.length)) - 1;

            const drawOptions = {
                flippedX: entry?.drawOptions?.flippedX || false,
            };

            let xPosition =
                entry.drawAt.x + (drawOptions.flippedX ? longestLine : 0);
            let yPosition = entry.drawAt.y;

            for (const character of art) {
                if (character === "\n") {
                    xPosition = entry.drawAt.x +
                        (drawOptions.flippedX ? longestLine : 0);
                    yPosition++;
                    continue;
                }

                // Draw only if in bounds
                if (typeof scene[yPosition]?.[xPosition] !== "undefined") {
                    if (character !== transparentCharacter) {
                        const automask =
                            (indexedArt?.automaskBlockCharacters || false) &&
                            [
                                "▀", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█",
                                "▉", "▊", "▋", "▌", "▍", "▎", "▏", "▐", "▔",
                                "▕", "▖", "▗", "▘", "▙", "▚", "▛", "▜", "▝",
                                "▞", "▟"
                            ].includes(character);


                        let characterStyle = "";

                        if (sceneEntity.relativeColor) {
                            const entityColor = sceneEntity.relativeColor;
                            // Make the spaces directly in front of the
                            // player fully bright
                            const adjustedDepth = depth - (isCentered ? 1 : 0);

                            const characterColor = {
                                r: SceneRenderer.getCharacterColor(
                                    entityColor.r,
                                    adjustedDepth,
                                    maxPlayerVisibilityDepth,
                                    maxBrightness
                                ),
                                g: SceneRenderer.getCharacterColor(
                                    entityColor.g,
                                    adjustedDepth,
                                    maxPlayerVisibilityDepth,
                                    maxBrightness
                                ),
                                b: SceneRenderer.getCharacterColor(
                                    entityColor.b,
                                    adjustedDepth,
                                    maxPlayerVisibilityDepth,
                                    maxBrightness
                                ),
                            };
                            characterStyle += `color: rgb(` +
                                `${characterColor.r}, ` +
                                `${characterColor.g}, ` +
                                `${characterColor.b}` +
                            `); `;
                        }

                        // TODO: Fix this weird logic. This works best for
                        // walls, but isn't great for floors or much else
                        if (! automask) {
                            characterStyle += "background-color: #000; ";
                        }

                        const adjustBrightness =
                            ["treasureChest", "healingTile", "exit"]
                                .includes(entityName);

                        if (adjustBrightness) {
                            // Calculate brightness based on view distance
                            // (depth) for the chest, healingTile, and exit
                            const adjustedDepth = depth - (isCentered ? 1 : 0);
                            const ratio = Math.max(
                                0,
                                Math.min(
                                    1,
                                    adjustedDepth / maxPlayerVisibilityDepth
                                )
                            );

                            // Exponential falloff, tweak as needed
                            const brightness = 1 - ratio * 0.7;
                            characterStyle +=
                                `filter: brightness(${brightness}); `;
                        }

                        const styleHtml = characterStyle !== ""
                            ? ` style="${characterStyle.trim()}"`
                            : "";

                        scene[yPosition][xPosition] =
                            `<span ${className}${styleHtml}>${character}` +
                            `</span>`;
                    }
                }

                xPosition += drawOptions.flippedX ? -1 : 1;
            }
        }

        return scene;
    },

    getArtNames: (subject) => {
        const names = [];

        if (! BattleSystem.isActive) {
            for (let i = (subject?.entities?.length || 0) - 1; i >= 0; i--) {
                const name = subject.entities[i].getSceneArtId(
                    playerEntity.x,
                    playerEntity.y
                );

                if (name) {
                    names.push(name);
                }
            }
        }

        names.push(
            typeof subject?.isWall === "boolean"
                ? (subject.isWall ? "wall" : "floor")
                : "void"
        );

        return names;
    },

    getCharacterColor: (
        value,
        depth,
        maxPlayerVisibilityDepth,
        maxBrightness = 255
    ) => {
        if (depth <= 0) {
            return Math.min(value, maxBrightness);
        }

        if (depth >= maxPlayerVisibilityDepth) {
            return 0;
        }

        const brightnessFalloffRate = 4;
        const ratio = depth / maxPlayerVisibilityDepth;
        const brightnessFactor = Math.exp(-brightnessFalloffRate * ratio);
        const normalizedValue = (value / 255) * maxBrightness;
        const adjustedValue = Math.round(normalizedValue * brightnessFactor);

        return Math.max(0, Math.min(maxBrightness, adjustedValue));
    },

    formatArt: (art, isMask) => {
        // Trim any whitespace from the template literal
        const formattedArt = art.data.replace(/^ *\n|\n *$/g, "");
        const lines = formattedArt.split("\n");
        // Safely handle lines with no leading spaces
        const shortestLeadingWhitespace = Math.min(
            ...lines
                .filter(line => line.trim().length > 0)
                .map(line => {
                    const match = line.match(/^ +/);
                    return match ? match[0].length : 0;
                })
        );
        const trimmedArt = lines
            .map(line => line.substr(shortestLeadingWhitespace))
            .join("\n");

        if (isMask) {
            let mask = "";
            const skippedCharacters = [
                "▀", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█",
                "▉", "▊", "▋", "▌", "▍", "▎", "▏", "▐", "▔",
                "▕", "▖", "▗", "▘", "▙", "▚", "▛", "▜", "▝",
                "▞", "▟", "\n",
            ];

            if (typeof art.spaceBoundaryCharacter !== "undefined") {
                skippedCharacters.push(art.spaceBoundaryCharacter);
            }

            for (let i=0; i<trimmedArt.length; i++) {
                mask += skippedCharacters.includes(trimmedArt[i])
                    ? trimmedArt[i]
                    : "█";
            }

            return typeof art.spaceBoundaryCharacter !== "undefined"
                ? mask.replaceAll(art.spaceBoundaryCharacter, " ")
                : mask;
        }

        return (
            typeof art.spaceBoundaryCharacter !== "undefined"
                ? trimmedArt.replaceAll(art.spaceBoundaryCharacter, " ")
                : trimmedArt
        );
    },

    drawEnemyLayer: (enemyMapEntity) => {
        const enemyHasParty = enemyMapEntity?.party?.length > 0;
        if (! enemyHasParty) {
            return "";
        }

        const $layer = document.createElement("div");
        $layer.className = "layer enemy";

        const maxIndex = Math.min(enemyMapEntity.party.length, 6);
        const rowClass = { 0: "front", 2: "middle", 4: "back" };
        const showLeaderInFront = maxIndex & 1 === 1;

        for (let i = 0, idx = 0; i < maxIndex; i += 2) {
            const $row = document.createElement("div");
            $row.className = `row ${rowClass[i]}`;

            for (let j = 0; j < 2; j++) {
                if (showLeaderInFront && i === 0 && idx === 1) {
                    break;
                }

                const partyMember = enemyMapEntity.party[idx++];
                if (! partyMember) {
                    break;
                }

                const indexedArt =
                    window.ENEMY_ART[partyMember.type] || null;
                if (! indexedArt) {
                    console.error(
                        "Could not find enemy art entry",
                        { partyMember }
                    );
                    continue;
                }

                const $artContainer = document.createElement("div");
                $artContainer.className = "art-container";
                $artContainer.dataset.partyMemberId = partyMember.id;

                if (! partyMember.isDead()) {
                    SceneRenderer.drawSprite($artContainer, indexedArt);
                }

                $row.append($artContainer);
            }

            $layer.prepend($row);
        }

        return $layer.outerHTML;
    },

    drawSprite: ($container, art) => {
        if (! ($container instanceof Element)) {
            console.error("Container must be an element", { $container, art });
            return;
        }

        if (! art) {
            console.error("Art is not set", { $container, art });
            return;
        }

        const $mask = document.createElement("pre");
        $mask.className = "mask";
        $mask.textContent = SceneRenderer.formatArt(art, true);
        $container.append($mask);

        const $art = document.createElement("pre");
        $art.className = "art roamingEnemy";
        $art.textContent = SceneRenderer.formatArt(art);
        $container.append($art);

        $container.replaceChildren($mask, $art);
    },

    highlightEntities: (entityIds = []) => {
        const selector = "#game .layer.enemy .art-container";
        const $entities = document.querySelectorAll(selector);

        for (const $art of $entities) {
            const id = parseInt($art.dataset.partyMemberId, 10);
            const highlightEntity =
                entityIds.length === 0 ||
                entityIds.includes(id);

            $art.classList.toggle("obscured", ! highlightEntity);
        }
    },
};