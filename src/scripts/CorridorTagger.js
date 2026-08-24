"use strict";

/**
 * Notes on behavior
 *  - Uses 4-direction adjacency (N/E/S/W). If you want diagonals to count as exits, we can swap the neighbor list.
 *  - Junction/room cells (degree > 2) are never tagged as corridor cells.
 *  - Corridors are discovered as connected components among cells with degree ≤ 2.
 *  - Any component of size 1 is ignored (so a single tile between two junctions is not tagged, and neither is an isolated single walkable tile).
 */

/**
 * @TODO Change this to an object instead of a class?
 */
class CorridorTagger {
    /**
     * Tags corridor cells with an ID and returns the tagged map.
     *
     * A corridor is a connected component of walkable cells where every cell
     * in the component has at most two walkable neighbors (4-dir). Single-cell
     * components are never tagged as corridors.
     *
     * @param Array of game map's cells, in 2D layout
     * @returns Object of corridor coordinates, keyed by corridor ID
     */
    tagCorridors(cells) {
        if (! Array.isArray(cells) || cells.length === 0) {
            return {};
        }

        const corridorList = {};
        const height = cells.length;
        const width = cells[0].length;
        const degrees = this.#computeDegrees(cells);
        const visited = Array.from(
            { length: height },
            () => Array(width).fill(false)
        );

        let corridorIndex = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];

                if (cell.isWall) {
                    continue;
                }

                if (visited[y][x]) {
                    continue;
                }

                if (degrees[y][x] > 2) {
                    continue;
                }

                const component = this.#collectComponent({
                    startX: x,
                    startY: y,
                    cells,
                    degrees,
                    visited
                });

                // A single tile by itself is never a corridor.
                if (component.length < 2) {
                    continue;
                }

                const corridorId = this.#indexToId(corridorIndex);
                corridorIndex++;

                corridorList[corridorId] = [];

                for (const { x: cx, y: cy } of component) {
                    corridorList[corridorId].push({ x: cx, y: cy });
                }
            }
        }

        return corridorList;
    }

    #computeDegrees(cells) {
        const height = cells.length;
        const width = cells[0].length;

        const degrees = Array.from(
            { length: height },
            () => Array(width).fill(0)
        );

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (cells[y][x].isWall) {
                    continue;
                }

                degrees[y][x] = this.#walkableNeighborsCount(cells, x, y);
            }
        }

        return degrees;
    }

    #walkableNeighborsCount(cells, x, y) {
        let count = 0;

        const candidates = [
            { x: x, y: y - 1 },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x - 1, y: y }
        ];

        for (const pos of candidates) {
            if (! this.#inBounds(cells, pos.x, pos.y)) {
                continue;
            }

            if (cells[pos.y][pos.x].isWall) {
                continue;
            }

            count++;
        }

        return count;
    }

    #collectComponent({ startX, startY, cells, degrees, visited }) {
        const stack = [{ x: startX, y: startY }];
        const component = [];

        visited[startY][startX] = true;

        while (stack.length > 0) {
            const current = stack.pop();
            component.push(current);

            const neighbors = this.#walkableNeighbors(cells, current.x,
                current.y);

            for (const neighbor of neighbors) {
                if (visited[neighbor.y][neighbor.x]) {
                    continue;
                }

                if (degrees[neighbor.y][neighbor.x] > 2) {
                    continue;
                }

                visited[neighbor.y][neighbor.x] = true;
                stack.push(neighbor);
            }
        }

        return component;
    }

    #walkableNeighbors(cells, x, y) {
        const results = [];

        const candidates = [
            { x: x, y: y - 1 },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x - 1, y: y }
        ];

        for (const pos of candidates) {
            if (! this.#inBounds(cells, pos.x, pos.y)) {
                continue;
            }

            if (cells[pos.y][pos.x].isWall) {
                continue;
            }

            results.push(pos);
        }

        return results;
    }

    #inBounds(cells, x, y) {
        return y >= 0 && y < cells.length && x >= 0 && x < cells[0].length;
    }

    // 0 -> "a", 1 -> "b", ... 25 -> "z", 26 -> "aa", etc.
    #indexToId(index) {
        let value = index;
        let id = "";

        while (value >= 0) {
            const remainder = value % 26;
            id = String.fromCharCode(97 + remainder) + id;
            value = Math.floor(value / 26) - 1;
        }

        return id;
    }
}
