/**
 * ASCII art that the sceneRenderer uses to draw scenes
 *
 * Each entry here has a name (eg: "wall", "healingTile", etc) which is
 * used to identify the map object that is being rendered
 *
 * Each sceneArt entry is an object that points to art for that thing.
 * The object is broken into positions relative to the viewport of the
 * rendered scene. Positions are denoted as "p#_#" where "p" means
 * "position". The first # is the distance (or depth, or Z-coordinate,
 * however you want to think of it). The second "#" is the X-coordinate
 * of what the player is currently seeing, going from left to right.
 *
 * For example, the player is seeing everything in the triangle in this
 * map, including the spaces to the immediate left and right (p0_0 and
 * p0_2 respectively):
 *
 * Distance 5   \........./
 * Distance 4   .\......./.
 * Distance 3   ..\...../..
 * Distance 2   ...\.../...
 * Distance 1   ....\./....
 * Distance 0   .....↑.....
 *            Player ⤴
 *
 * Each cell is numbered this way (with "X" meaning 10):

 * Distance 5   0123456789X
 * Distance 4   .012345678.
 * Distance 3   ..0123456..
 * Distance 2   ...01234...
 * Distance 1   ....012....
 * Distance 0   ....012....
 *            Player ⤴
 *
 * So if the player's vision spots a wall at distance 3, position 4,
 * we would want to render the wall with the art referenced by entry
 * "p3_4"
 *
 * The whitespace for each piece of art is automatically trimmed from
 * the left side. This is to preserve formatting in the code (JavaScript
 * does not support heredocs unfortunately). But sometimes spaces are
 * desired as part of the art. So, a spaceBoundaryCharacter might be set
 * which will stop the whitespace from trimming into the art. This
 * character will be replaced with a space during rendering
 *
 * Each object also has an x and y value. This is the character offset
 * of where the art will start to be drawn
 *
 * Art may also have a transparentCharacter defined which will simply
 * not draw anything for that character when rendered
 */
const sceneArt = {
    tardspireBanner: {
        positions: {
            p1_1: {
                artIndex: 0,
                drawAt: { x: 6, y: 4 },
            },
        },
        art: [
            {
                data: `
                    ▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▜
                    ▌       W E L C O M E    T O . . .   ▐
                    ▌T ▀█▀▄▀▄ █▀▙ █▀▄ ▄▀▀ █▀▄▀█▀ █▀▙ █▀▀ ▐
                    ▌H  █ █▄█ █▄▛ █ █  ▀▄ █▄▀ █  █▄▛ █▄▄ ▐
                    ▌E  █ █ █ █ █ █▄▀ ▄▄▀ █  ▄█▄ █ █ █▄▄ ▐
                    ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟
                `,
            },
        ],
    },
    wall: {
        relativeColor: { r: 255, g: 255, b: 255 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 1 },
            },
            p0_2: {
                artIndex: 0,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 1 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 4 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 4 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 4 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 9 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 8 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 8 },
            },
            p2_3: {
                artIndex: 4,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 8 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 9 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 12 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 11 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 11 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    ▄
                    ██▄
                    ████▄
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ████▀
                    ██▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████▄
                    ██████▒█▄
                    ██████▒███▄
                    ██████▒█████▄
                    ██████▒███████▄
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒████████
                    ██████▒███████▀
                    ██████▒█████▀
                    ██████▒███▀
                    ██████▒█▀
                    ██████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    █████▄▄▄
                    █████████
                    █████████
                    █████████
                    █████████
                    █████████
                    █████████
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ███████████████▒▄
                    ███████████████▒██▄
                    ███████████████▒████
                    ███████████████▒████
                    ███████████████▒████
                    ███████████████▒████
                    ███████████████▒████
                    ███████████████▒████
                    ███████████████▒██▀
                    ███████████████▒▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██▄▄
                    ████
                    ████
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████████▓▄
                    ███████████▓██▄
                    ███████████▓███
                    ███████████▓███
                    ███████████▓██▀
                    ███████████▓▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ██████▓▄
                    ██████▓▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ███████▄
                    ███████▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ███████
                    ███████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ██████
                    ██████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    ▀▀
                `,
            },
        ],
    },

    darkness: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 1 },
            },
            p0_2: {
                artIndex: 0,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 1 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 4 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 4 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 4 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 9 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 8 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 8 },
            },
            p2_3: {
                artIndex: 4,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 8 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 9 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 12 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 11 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 11 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    ▄
                    ██▄
                    ████▄
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ████▀
                    ██▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████▄
                    ████████▄
                    ██████████▄
                    ████████████▄
                    ██████████████▄
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ███████████████
                    ██████████████▀
                    ████████████▀
                    ██████████▀
                    ████████▀
                    ██████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    █████▄▄▄
                    █████████
                    █████████
                    █████████
                    █████████
                    █████████
                    █████████
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ████████████████▄
                    ██████████████████▄
                    ████████████████████
                    ████████████████████
                    ████████████████████
                    ████████████████████
                    ████████████████████
                    ████████████████████
                    ██████████████████▀
                    ████████████████▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██▄▄
                    ████
                    ████
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████▄
                    ██████████████▄
                    ███████████████
                    ███████████████
                    ██████████████▀
                    ████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                    ████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ███████▄
                    ███████▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ███████▄
                    ███████▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ███████
                    ███████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    ██████
                    ██████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    ▀▀
                `,
            },
        ],
    },

    void: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 14 },
            },
            p0_2: {
                artIndex: 0,
                drawOptions: { flippedX: true },
                drawAt: { x: 45, y: 14 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 14 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 14 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 14 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 14 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 14 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 14 },
            },
            p2_3: {
                artIndex: 4,
                drawOptions: { flippedX: true },
                drawAt: { x: 31, y: 14 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 14 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 14 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 14 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 14 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 14 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 28, y: 14 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 14 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 47, y: 14 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 14 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 14 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 14 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 14 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 14 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 14 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 31, y: 14 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 14 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 14 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    █████
                    █████
                    █████
                    █████
                    █████
                    █████
                    █████
                    █████
                    █████
                    █████
                    ████▀
                    ██▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████████████
                    ██████████████
                    ██████████████
                    ██████████████
                    ██████████████
                    ██████████████
                    ████████████▀
                    ██████████▀
                    ████████▀
                    ██████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████
                    ████████
                    ████████
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████████████████
                    ███████████████████
                    ███████████████████
                    ██████████████████▀
                    ████████████████▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███
                    ██▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████████████
                    ██████████████
                    ████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████
                    ████████████
                    ████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████
                    ▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀
                `,
            },
        ],
    },

    iceWall: {
        relativeColor: { r: 255, g: 255, b: 255 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 1 },
            },
            p0_2: {
                artIndex: 0,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 1 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 4 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 4 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 4 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 9 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 8 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 8 },
            },
            p2_3: {
                artIndex: 4,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 8 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 9 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 12 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 11 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 11 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    ▄
                     ▀▄
                       ▀▄
                    ▝▘▝▘ █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                         █
                    ▗▖▗▖ █
                       ▄▀
                     ▄▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀▀▀▀▀▄
                          ▒▀▄
                          ▒  ▀▄
                          ▒    ▀▄
                    ▖  ▗▖ ▒▗▖  ▗▖▀▄
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                          ▒       █
                    ▘  ▝▘ ▒▝▘  ▝▘▄▀
                          ▒    ▄▀
                          ▒  ▄▀
                          ▒▄▀
                    ▄▄▄▄▄▄▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
                    █▝▘                                  ▝▘█
                    █  ▝▘                              ▝▘  █
                    █    ▝▘                          ▝▘    █
                    █      ▝▘                      ▝▘      █
                    █        ▝▘  ▝▘  ▝▘  ▝▘  ▝▘  ▝▘        █
                    █        ▗▖                  ▗▖        █
                    █                                      █
                    █        ▗▖                  ▗▖        █
                    █                                      █
                    █        ▗▖                  ▗▖        █
                    █                                      █
                    █        ▗▖                  ▗▖        █
                    █                                      █
                    █        ▗▖  ▗▖  ▗▖  ▗▖  ▗▖  ▗▖        █
                    █      ▗▖                      ▗▖      █
                    █    ▗▖                          ▗▖    █
                    █  ▗▖                              ▗▖  █
                    █▗▖                                  ▗▖█
                    █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                      ▀▀▀▄▄▄
                            █
                            █
                            █
                            █
                            █
                            █
                      ▄▄▄▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                                   ▒▄
                     .             ▒ ▀▄
                      .  .  .  .  .▒ . █
                     .             ▒   █
                                   ▒   █
                                   ▒   █
                     .             ▒   █
                      .  .  .  .  .▒ . █
                     .             ▒ ▄▀
                                   ▒▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    █ .                . █
                    █   .   .    .   .   █
                    █                    █
                    █   .            .   █
                    █                    █
                    █                    █
                    █   .            .   █
                    █                    █
                    █   .   .    .   .   █
                    █ .                . █
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀▄▄
                       █
                       █
                    ▄▄▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █▀▀▀▀▀▀▀▀▀▀▓▄
                    █          ▓ ▀▄
                    █          ▓  █
                    █          ▓  █
                    █          ▓ ▄▀
                    █▄▄▄▄▄▄▄▄▄▄▓▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █▀▀▀▀▀▀▀▀▀▀█
                    █          █
                    █          █
                    █          █
                    █          █
                    █▄▄▄▄▄▄▄▄▄▄█
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █     ▓▄
                    █     ▓▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █     █▄
                    █     █▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █     █
                    █     █
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █    █
                    █    █
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    ▀▀
                `,
            },
        ],
    },

    rubble1: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_1: {
                artIndex: 11,
                drawAt: { x: 5, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    '  .'   .  '    ..   '   .
                    %%%%% .;' .   '   . ' .
                    %%%%'   .    ;'  ' '  , '
                    %%%%%%. '. .'   ,'  ;.
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%    . '     ;'  '   . ,
                    %%%%%'  ..    ',.    .  '   ';,
                    %%%%'   ;' ,' . .  .  , ,       .
                    %%% , .   .    '   ;  ' .'   '
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %.  .; '
                    .'
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%%%. ,  . ,
                    . ;'  ,. .  :,
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %%% ;'.   .  ,
                    %% , . '    '  .
                `,
            },
            {
                data: `
                    .  ,.  .  ,
                     '    ',  . , .
                `,
            },
            {
                data: `
                    '. ;. :  .'  '
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%.'  ';
                `,
            },
            {
                data: `
                    ' "' '
                `,
            },
            {
                data: `
                    --
                `,
            },
            {
                data: `
                    . ,' '"  '
                `,
            },
            {
                data: `
                     ' .  ' .   '   ' ,.     ;   .  , ' .  '
                    '    ,'  ;          .;                .
                      ,'  ,'.  ' .,   '    ; '.    '     ' .
                    .  '      ' . '      '    . ',  ; .
                `,
            },
        ],
    },

    rubble2: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_1: {
                artIndex: 11,
                drawAt: { x: 5, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                data: `
                     '   , ' .   .  ' ,  , ' .
                    .  ;  '        '    ' .
                         .   ;   '     .    ,
                           '       : '   . '
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%'      .   ;   '      '
                    %%%%%,  ; , ' .   .  ' ,  ,   .
                    %%%%    .   ;   '       : '.   ,
                    %%% '  .  '   ,    ;  .         '
                `,
            },
            {
                data: `
                     '  ; '
                    ,
                `,
            },
            {
                data: `
                    '    .      ,
                     .  ';  '  .  '
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%.  '   .  ,
                    % '    ,   .    ;
                `,
            },
            {
                data: `
                    '  . '  ;  .
                     ,    '   '   .
                `,
            },
            {
                data: `
                    . '    . ;  '
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%'.  ;.
                `,
            },
            {
                data: `
                    .'  ',
                `,
            },
            {
                data: `
                    --
                `,
            },
            {
                data: `
                    '  ; ..  ,
                `,
            },
            {
                data: `
                    .  '      ' . '      '    . ',  ; .
                      ,'  ,'.  ' .,   '    ; '.    '     ' .
                    '    ,'  ;          .;                .
                     ' .  ' .   '   ' ,.     ;   .  , ' .  '
                `,
            },
        ],
    },

    gloryWall: {
        relativeColor: { r: 255, g: 255, b: 255 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 1 },
            },
            p0_2: {
                artIndex: 0,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 1 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 4 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 4 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 4 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 9 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 8 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 8 },
            },
            p2_3: {
                artIndex: 4,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 8 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 9 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 12 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 11 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 11 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    ▄
                    ██▄
                    ████▄
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ████▀
                    ██▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████▄
                    ██████▒█▄
                    ██████▒███▄
                    ██████▒█████▄
                    ██████▒███████▄
                    ██████▒█▒▒█████
                    ██████▒█▒█▒▒███
                    ██████▒███▒█▒██
                    ██████▒████▒███
                    ██████▒██▒█████
                    ██████▒█████▒██
                    ██████▒███░▒███
                    ██████▒██▒▒████
                    ██████▒████████
                    ██████▒███▒████
                    ██████▒███████▀
                    ██████▒█████▀
                    ██████▒███▀
                    ██████▒█▀
                    ██████▀
                `,
            },
            {
                automaskBlockCharacters: false,
                data: `
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    ██████████▀█████████▀███████████████████
                    █████▀▄▄█▀▄▀▄▄▀█▀▄▄█▄▀ █████████████████
                    ████ █▄ █ █▄▀▀▄█ ██▀▀▀▄█████████████████
                    █████▄▄█████████████████████████████████
                    ██████████▀██▀██████ ███████████████████
                    █████████ ▀▀ █▀▄▄▀█ ██▀▄▄▀██████████████
                    ████████ ███ █▄▀▀▄█ █ █▄▄███████████████
                    ██████████████████████▄▄███▀▀▀██████████
                    ██████████████████████████████▄▄▀███████
                    ████████████████████████████████ ███████
                    ████████████████▀▀██▓██▀ ████▀▀▄████████
                    ███████████████    ███▄  ▄▄▄▄███████████
                    █████████████▓██▄▄████▓█▄███████████████
                    ████████████████▒░█▓████████████████████
                    ██████████████▒██▒██████████████████████
                    ████████████████▓███████████████████████
                    █████████████████▓██████████████████████
                    ████████████████████████████████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    █████▄▄▄
                    █████████
                    ██▓▓▓▓███
                    █▓█▓█▓███
                    ████▓████
                    ██▒▒█████
                    █████████
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ███████████████▒▄
                    ██▓█▓██████████▒██▄
                    █▓█▓█▓█▓█▓█████▒████
                    ██▓█▓█████▓████▒████
                    █████████▓█████▒████
                    ████████▓██████▒████
                    ████▒▒█████████▒████
                    ███████████████▒████
                    ████▓██████████▒██▀
                    ███████████████▒▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ██████████████████████
                    ██████████████████████
                    ████▓▓██▓██▓██████████
                    ███▓██▓▓█▓██▓█▓███████
                    ██████████▓████▓▓█████
                    ██████████████▓███████
                    ████████▒▒▓█▓█████████
                    ██████████████████████
                    ██████████████████████
                    ██████████████████████
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██▄▄
                    █▓██
                    ██▓█
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████████▓▄
                    ██▓█▓█▓████▓██▄
                    ███▓███▓███▓███
                    ███▓▒▓█████▓███
                    ███████████▓██▀
                    ███████████▓▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████
                    ██▓█▓█▓█████
                    ████████▓███
                    ███▓▒▓▓█████
                    ████████████
                    ████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓█▓█▓▄
                    ██▓▓███▓▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓█▓██▄
                    ██▓▓███▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓█▓██
                    ██▓▓███
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓█▓█
                    ██▓▓██
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    ▀▀
                `,
            },
        ],
    },

    noboWall: {
        relativeColor: { r: 255, g: 255, b: 255 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: 0, y: 1 },
            },
            p0_2: {
                artIndex: 15,
                drawAt: { x: 44, y: 1 },
            },
            p1_0: {
                artIndex: 1,
                drawAt: { x: 0, y: 4 },
            },
            p1_1: {
                artIndex: 2,
                drawAt: { x: 5, y: 4 },
            },
            p1_2: {
                artIndex: 1,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 4 },
            },
            p2_0: {
                artIndex: 3,
                drawAt: { x: 0, y: 9 },
            },
            p2_1: {
                artIndex: 4,
                drawAt: { x: 0, y: 8 },
            },
            p2_2: {
                artIndex: 5,
                drawAt: { x: 14, y: 8 },
            },
            p2_3: {
                artIndex: 14,
                drawAt: { x: 30, y: 8 },
            },
            p2_4: {
                artIndex: 3,
                drawOptions: { flippedX: true },
                drawAt: { x: 41, y: 9 },
            },
            p3_0: {
                artIndex: 6,
                drawAt: { x: 0, y: 12 },
            },
            p3_1: {
                artIndex: 7,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 7,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 8,
                drawAt: { x: 19, y: 11 },
            },
            p3_4: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 11 },
            },
            p3_5: {
                artIndex: 7,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 9,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 9,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 10,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 11,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 12,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 11,
                drawOptions: { flippedX: true },
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 9,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 13,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 13,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 13,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 13,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 13,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 13,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 13,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 13,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 13,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 13,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 13,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                data: `
                    ▄
                    ██▄
                    ████▄
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    ▒▒████
                    ▒▒▒███
                    █▒▒███
                    ███░██
                    ████░█
                    █████░
                    ██████
                    ██████
                    ██████
                    ████░█
                    ██░░░█
                    ░░░░░█
                    ░░░░░█
                    ░░░█▀
                    ░█▀
                    ▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██████▄
                    ██████▒█▄
                    ██████▒███▄
                    ██████▒█████▄
                    ██████▒███████▄
                    ▓▓▓▓██▒█▒▒█████
                    ▓▓████▒█▒▒▒▒███
                    █▓▓▓██▒██▒▒█▒▒█
                    ▓▓████▒█▒▒▓▓▒▒█
                    ██████▒█▒▒▒█▒▒█
                    ██████▒███▓▓▒▒█
                    ██████▒████▓▓▒█
                    ██████▒█████▒▒█
                    ██████▒████▓▓██
                    ██████▒████████
                    ██████▒███████▀
                    ██████▒█████▀
                    ██████▒███▀
                    ██████▒█▀
                    ██████▀
                `,
            },
            {
                automaskBlockCharacters: false,
                data: `
                    ████████████████████████████████████████
                    ████████████████████████████████████████
                    █▀███▀██▀▀██▀▀▀███▀▀████████████████████
                    █ ▄▀█ █ ██ █ ▀▀▄█ ██ ████████▀▀▀▀▀▀▀████
                    █ ██▄ █ ██ █ ██ █ ██ ████ ▄▄▄██████ ████
                    █▄███▄██▄▄██▄▄▄███▄▄█████ ▀▀▀▀▄▀▀▀▀ ████
                    ███ ███ █▀▄▄▀█▀▄▄▄███████   ▀███▀   ████
                    ███ █ █ █ ▄▄ ██▄▄▄▀███▀▀▀   ▀▀ ▀▀   ▀▀██
                    ████▄█▄██▄██▄█▄▄▄▄███ ▀▀▀▀▀██████████▀ █
                    █ ███ █ ▄▄▄█ ▄▄▀█ ▄▄▄█▒▒▒▄    ▄     ▒▒▒█
                    █ ▄▄▄ █ ▄▄▄█ ▄▄▀█ ▄▄▄██▒▒▒███ █████ ▒▒██
                    █▄███▄█▄▄▄▄█▄██▄█▄▄▄▄█▀▀▒▒███▄▀▄██▀ ▒▀██
                    ██████████████████▀▀▄▄████ ██▀▀▀█  ███ ▀
                    █████████████████ █████████▄ ▀▀▀   █████
                    █████████████████ █████████▀▀██   ██████
                    █████████████████ ████████ ██ █  ███████
                    ████████████████ ███████  █▄▄█▄▀█▀████▀█
                    ████████████████ ██████   ██▄▄▄ █      █
                    █████████████████ ███▀    ██▄▄ ▄▀      █
                    █████████████████ ██        ▄▄█ 6/22/25 
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    █████▄▄▄
                    █▓▓██████
                    ██▓▓▓▓▓▓█
                    ██████▓▓█
                    █████▓▓▓▓
                    █████▓▓▓▓
                    █████▓▓██
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ███████████████▒▄
                    ███████████████▒██▄
                    █▒▒▒▒▒▒███▓▓███▒████
                    ███▓▓▓██▒▒▒▒▒▒█▒█▓▓█
                    █▒▒▒▒▒▒██▓▓▓███▒██▓█
                    ████████▒▓▓▓▓▓█▒█▓▓█
                    ██████▒▓▓▓▓▓▓▓█▒█▓▓█
                    ██████▒▓▓▓▓▓▓▓█▒██▓█
                    ███████▓▒▒▒▒▒▒█▒██▀
                    ███████████████▒▀
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ██████████████████████
                    ██████████████████████
                    ██▒▒▒▒▒▒▒▒████▓▓██████
                    ███▓▓▓▓▓▓███▒▒▒▒▒▒████
                    ██▒▒▒▒▒▒▒▒███▒▒▒▒█████
                    ██████████▒▒▒▒▒▒▒▒████
                    ██████████▒▒▒▒▒▒▒▒▒███
                    ███████████▒▒▒▒▒▒▒▒███
                    ████████████▓▓▓▓▓▓▓███
                    ██████████████████████
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ██▄▄
                    █▓▓█
                    ██▓█
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ███████████▓▄
                    ██▓▓▓██▓▓██▓██▄
                    ██▓▓▓█▓▓▓▓█▓█▓█
                    ███▓█▓█▓▓██▓█▓█
                    ███████████▓██▀
                    ███████████▓▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ████████████
                    ██▓▓▓█▓▓▓███
                    ██▓▓▓█▓▓▓▓██
                    ███▓█▓▓▓▓▓██
                    ██████▓▓▓▓██
                    ████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓▓▓█▓▄
                    ██▓▓▓██▓▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓▓▓██▄
                    ██▓▓▓██▀
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓▓▓██
                    ██▓▓▓██
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄▄▄▄▄
                    █▓▓▓▓█
                    ██▓▓▓█
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    %%%▄▒███████████████
                    %▄██▒███████████████
                    ████▒█▒▒▒▒▒▒███▓▓███
                    █▓▓█▒███▓▓▓██▒▒▒▒▒▒█
                    ▓▓▓█▒█▒▒▒▒▒▒██▓▓▓███
                    █▓▓█▒████████▒▓▓▓▓▓█
                    █▓▓█▒██████▒▓▓▓▓▓▓▓█
                    ██▓█▒██████▒▓▓▓▓▓▓▓█
                    %▀██▒███████▓▒▒▒▒▒▒█
                    %%%▀▒███████████████
                    %%%%%▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▄
                    %%%▄██
                    %▄████
                    ██████
                    █████░
                    ██░░█░
                    ██░█░░
                    ██░██░
                    █████░
                    ██████
                    ███░█░
                    ████░█
                    ██████
                    █████░
                    ██░██░
                    ██░░░░
                    ██░██░
                    █████░
                    ██████
                    ██████
                    ██████
                    ██████
                    ██████
                    %▀████
                    %%%▀██
                    %%%%%▀
                `,
            },
        ],
    },

    healingTile: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀██████████████████████▀
                    %%▀██████████████████▀
                    %%%%▀██████████████▀
                    %%%%%%▀▀▀▀▀▀▀▀▀▀▀▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▄██████████████████████▄
                    %%%▄██████████████████████████▄
                    %▄██████████████████████████████▄
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █████▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄███████████▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄
                    %▀███████████▄▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╼╾
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄██████▀▀
                `,
            },
        ],
    },

    pit: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█▀
                    %%▀▄                ▄▀
                    %%%%▀▄ ░░░ ░░ ░ ░░▄▀
                    %%%%%%▀▀▀▀▀▀▀▀▀▀▀▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▄█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█▄
                    %%%▄▀ ▓                    ▓ ▀▄
                    %▄▀ ░ ▓░ ░░░  ░░░ ░░░  ░ ░░▓░ ░▀▄
                    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀███▀▀▀
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄██▄▄▄▄▄▄▄▄▄▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄█▄▄▄▄▄▄▄▄▄▄▄▄▄▄█▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▄▄▄▄▄▄▄▄▄▄▄
                    %▀▄▄▄▄▄▄▄▄▄██▄▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╼╾
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄██████▀▀
                `,
            },
        ],
    },

    sigil: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 19 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 19 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 15 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 14 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 15 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%        %
                    %%%%%%%           %
                    %%%%%%            %
                    %%%%%              %
                    %%%%▄▄█▀▀▀█▀▀█▀▀▀█▄▄
                    %%▄█▀ ▀█▀█▀▀▀▀█▀█▀ ▀█▄
                    %%%▀█▄█▀▀▀█▀▀█▀▀▀█▄█▀
                    %%%%%%%▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%% %% %
                    %%%%%%%%%%%%%       %
                    %%%%%%%%% %           %
                    %%%%%%%%%%             %
                    %%%%%%%%%%              %
                    %%%%%%%%%                %
                    %%%%%%%%▄▄▄█▀▀▀█▀▀█▀▀▀█▄▄▄
                    %%%%%%▄█▀  ▀█▀█▀▀▀▀█▀█▀  ▀█▄
                    %%%%%%%▀█▄▄█▀▀▀█▀▀█▀▀▀█▄▄█▀
                    %%%%%%%%%%%▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▀█▄
                    ▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%▄▄▄▄▄▄▄
                    %%%%▄█▄▄▄▄▄▄█▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄▄▄▄▄▄▄▄▄
                    %%%█▄▄▄▄▄▄▄▄▄▄█
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▄▄▄▄▄▄▄
                    ▀█▄▄▄▄▄▄█▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╼╾
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄██▀▀
                `,
            },
        ],
    },

    crackedFloorSlight: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀█▀▀▄%%▄▄
                    ▀▀▀▀%%%%%%%%%%%%▀▄
                    %%%%%%%%%%%%%%%%%%▀▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄
                    %%%%%%%%%▀▀█▀▀▄
                    %%%%%%%▀▀▀▀%%%%%%%%%%%%%%▀▀▄
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▘%▗▄▖
                    %▀▘%%▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%▄%%%%%▖
                    %%%▀▀▀%%%%%%▝▄
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄%%%%▗▄▖
                    %▀▀▀%%%%%%%%▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▄%%%▗▄▖
                    %%%▀▀▀%%%%%▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %░░%░%%%░░%%░
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %░░%░░%%░
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▔%%▔
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╶╴
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▒░▒▒░▒
                `,
            },
        ],
    },

    crackedFloor: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀█▀▀▄▄▄▄▄%%▄▀
                    ▀▀▀▀%%%%%%▄▄▄▀▀▀▀▄
                    %%%%%%%%%%%%%%%%%%▀▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄
                    %%%%%%%%%▀▀█▀▀▄▄▄▄▄%%%%%▄▀
                    %%%%%%%▀▀▀▀%%%%%%%%%▄▄▄▀▀▀▀▄
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▘%▗▟▖
                    %▀▘%▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▀▀▄▄▘%▗▟▖
                    %%%▀▀▀%%%▀▘%▝▄
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀▄▄▘%%%▗▟▖
                    %▀▀▀%%%%%▀▘%▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%▀▀▄▄▘%▗▟▖
                    %%%▀▀▀%%%▀▘▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▒▒%▒░░%▒▒░░▒%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▒▒░▒▒░░▒%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▔▔%%▔
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╶╴
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▒░▒▒░▒
                `,
            },
        ],
    },

    crackedFloorSevere: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀█▀▀▄▄▄▄▄%%▄▀▀▀▄▀
                    ▀█▀▀%▀▄%▄%▄▄▄▀▀▀▀▄
                    %%▀▀%▀%▀▀%%▀%▀▀%%%█▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄
                    %%%%%%%%%▀▀█▀▀▄▄▄▄▄%%%%%▄▀▀▀▄▀
                    %%%%%%%▀█▀▀%▀▄%▄%▄%%▄▄▄▀▀▀▀▄
                    %%%%%%%%%▀▀%▀%▀▀%%▀%%▀%▀▀%%%█▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀%▗▟▞▞
                    %▜▚▚▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▀▀▄▄▀%▗▟▞▞
                    %%%▜▜▀▞%%▜▚▚▝▄
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▀▀▄▄▀%%%▗▟▞▞
                    %▜▜▀▞%▚%%▜▚▚▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%▀▀▄▄▀%▗▟▞▞
                    %▜▜▀▞%▚%▜▚▚▝▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ░▓▓░▓▒▒░▓▓▒▒▓░
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ░▓▓▒▓▓▒▒▓░
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▀▔▀▔▘
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╺╸
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ░░▓▒▓▓▒▓
                `,
            },
        ],
    },

    lavaFloor: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -21, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 43, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -18, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: -2, y: 17 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 1, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 14, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 30, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 17 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -11, y: 16 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -5, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 6, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 18, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 16 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 0, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 5, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 10, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 15, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 20, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 25, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 30, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 35, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 40, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 12, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀████████████████████████████▀
                    %%▀████████████████████████▀
                    %%%%▀████████████████████▀
                    %%%%%%▀████████████████▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%▄██████████████████████████▄
                    %%%%%▄██████████████████████████████▄
                    %%%▄██████████████████████████████████▄
                    %▄██████████████████████████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █████████████▀▀▀
                    ███████▀▀▀
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄█████████████▀
                    ▄▄███████████████▀
                    ███████████████▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄████████████▄
                    %%▄████████████████▄
                    ▄████████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    █████████████▄▄
                    %▀███████████████▄▄
                    %%%▀███████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                  ▀██████████████████▀
                  %%▀██████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                  %%▄████████▄
                  ▄████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄██████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄██████████▀▀
                `,
            },
        ],
    },

    waterFloor: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -21, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 43, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -18, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: -2, y: 17 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 1, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 14, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 30, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 40, y: 17 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -11, y: 16 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -5, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 6, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 18, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 27, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 34, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 44, y: 16 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 0, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 5, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 10, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 15, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 20, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 25, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 30, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 35, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 40, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 12, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
        },
        art: [
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    ▀████████████████████████████▀
                    %%▀████████████████████████▀
                    %%%%▀████████████████████▀
                    %%%%%%▀████████████████▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%▄██████████████████████████▄
                    %%%%%▄██████████████████████████████▄
                    %%%▄██████████████████████████████████▄
                    %▄██████████████████████████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    █████████████▀▀▀
                    ███████▀▀▀
                    ██▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄▄█████████████▀
                    ▄▄███████████████▀
                    ███████████████▀
                `
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▄████████████▄
                    %%▄████████████████▄
                    ▄████████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    █████████████▄▄
                    %▀███████████████▄▄
                    %%%▀███████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                  ▀██████████████████▀
                  %%▀██████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                  %%▄████████▄
                  ▄████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄██████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▄▄██████████▀▀
                `,
            },
        ],
    },

    bouldingBall: {
        relativeColor: { r: 199, g: 111, b: 40 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%▄▄▄▄▄▄▄▄▄▄▄▄▄%%%%%%%%%%
                    %%%%%%%%%%▄▀             ▀▄%%%%%%%%
                    %%%%%%%%▄▀    ███    ███   ▀▄%%%%%%
                    %%%%%%▄▀      ▀▀▀    ▀▀▀     ▀▄%%%%
                    %%%%▄▀                         ▀▄%%
                    %%%%█                           █%%
                    %%%%█                           █%%
                    %%%%█                           █%%
                    %%%%█                           █%%
                    %%%%█            ███            █%%
                    %%%%▀▄           ▀▀▀           ▄▀%%
                    %%%%%%▀▄                     ▄▀%%%%
                    %%%%%%%%▀▄                 ▄▀%%%%%%
                    %%%%%%%%%%▀▄             ▄▀%%%%%%%%
                    %%%%%%%%%%%%▀▀▀▀▀▀▀▀▀▀▀▀▀%%%%%%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%▄▀▀▀▀▀▀▀▄%%%
                    %%▄▀         ▀▄%
                    %█             █
                    %█   ▄▄   ▄▄   █
                    %█   ▀▀   ▀▀   █
                    %%▀▄         ▄▀%
                    %%%%▀▄▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%▄▀▀▀▀▀▀▀▄%%%
                    %%▄▀         ▀▄%
                    %█             █
                    %█   ▄▄   ▄▄   █
                    %█   ▀▀   ▀▀   █
                    %%▀▄         ▄▀%
                    %%%%▀▄▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%
                    %%%%▄▀▀▀▀▀▀▀▄%%%
                    %%▄▀         ▀▄%
                    %█             █
                    %█   ▄▄   ▄▄   █
                    %█   ▀▀   ▀▀   █
                    %%▀▄         ▄▀%
                    %%%%▀▄▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%%%%%%
                    %%%▄▄▄%%%%%%%
                    %▄▀ ▄ ▀▄%%%%%
                    %█     █%%%%%
                    %%▀▄▄▄▀%%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%%%%%%
                    %%%▄▄▄%%%%%%%
                    %▄▀ ▄ ▀▄%%%%%
                    %█     █%%%%%
                    %%▀▄▄▄▀%%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%%%%%%
                    %%%▄▄▄%%%%%%%
                    %▄▀ ▄ ▀▄%%%%%
                    %█     █%%%%%
                    %%▀▄▄▄▀%%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %%▄▄%%
                    %█ ∞█%
                    %▀▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    roamingEnemyFront: {
        relativeColor: { r: 255, g: 0, b: 0 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%▄▄▄%%%%%%%%▄%%%%%%%%%%%%%%%%%
                    %%%%%%%█▀▀▄%%%%▄█%%%%%%%▄▄▄▄▄%%%%%%
                    %%%%%%%█   █%▄█ ▀▀▄%%%▄▀ ▄▄▀%%%%%%%
                    %%%%%%█     █     █%%▄▀ ▄▀%%%%%%%%%
                    %%%%%%%█   █      ▀▄▀  ▄▀%%%%%%%%%%
                    %%%%%%%%█              █%%%%%%%%%%%
                    %%%%▄▄%█                █%%%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%%%█                  █%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%█                  █%%%%%%%%%%
                    %%%%█                    █%%%%%%%%%
                    %%%%%█  ▄▄▄           ▄▄▄ ▀▄%%%%%%%
                    %%%%█    █             █    █%%%%%%
                    %%%█          ▄▄▄▄▄▄▄▄▄      █%%%%%
                    %%%█             ▀  ▀         █%%%%
                    %%%█                ▀          █%%%
                    %%%▀▄               ▀         ▄▀%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄     ▄▄▄▀▄%
                    █  ▀  ▄▄▄▄ ▀  ▀▄
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄     ▄▄▄▀▄%
                    █  ▀  ▄▄▄▄ ▀  ▀▄
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄     ▄▄▄▀▄%
                    █  ▀  ▄▄▄▄ ▀  ▀▄
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ T  T █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ T  T █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ T  T █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %█▄▄%%
                    %█TT█%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    roamingEnemyLeft: {
        relativeColor: { r: 255, g: 0, b: 0 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%▄▄▄▄%%▄▄▄▄▄▄▄▄▄▄▄▄▄%%%%%%%%
                    %%%%%%%%%█  ▄▀          ▄▀%▄▄▀▀▀▄▄%
                    %%%%%%%%%%█          ▄▀█▄▀▀   ▄▀%%%
                    %%%%%%%%%%█        ▄█▄▀      ▄▀%%%%
                    %%%%%%%%%█         ▄▀       █%%%%%%
                    %%%%%%%%█         █        █%%%%%%%
                    %%%%%%%█         █        █%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%%█                   █%%%%%%%%
                    %%%%%▄▀                  █%%%%%%%%%
                    %%%%%█                  ▀▄%%%%%%%%%
                    %%%%█                     █%%%%%%%%
                    %%%%█     ▄▄▄              ▀▄%%%%%%
                    %%%█       █                 █%%%%%
                    %%%█▄▄▄▄▄                     █%%%%
                    %%%█   ▀                       █%%%
                    %%%█   ▀                       █%%%
                    %%%▀▄  ▀                       █%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄        ▀▄%
                    █  ▀          ▀▄
                    █━┯            █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄        ▀▄%
                    █  ▀          ▀▄
                    █━┯            █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄▄▄        ▀▄%
                    █  ▀          ▀▄
                    █━┯            █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█━     █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█━     █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█━     █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %%▄▄█%
                    %█╴ █%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    roamingEnemyBack: {
        relativeColor: { r: 255, g: 0, b: 0 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%▄%%%%%%%%▄▄▄%%%%%%
                    %%%%%%▄▄▄▄▄%%%%%%%█▄%%%%▄▀▀█%%%%%%%
                    %%%%%%%▀▄▄ ▀▄%%%▄▀▀ █▄%█   █%%%%%%%
                    %%%%%%%%%▀▄ ▀▄%%█     █     █%%%%%%
                    %%%%%%%%%%▀▄  ▀▄▀      █   █%%%%%%%
                    %%%%%%%%%%%█              █%%%%%%%%
                    %%%%%%%%%%█                █%▄▄%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%█                  █%%%%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%%%█                  █%%%%%
                    %%%%%%%%%█                    █%%%%
                    %%%%%%%▄▀                    █%%%%%
                    %%%%%%█                       █%%%%
                    %%%%%█                         █%%%
                    %%%%█                          █%%%
                    %%%█                           █%%%
                    %%%▀▄                         ▄▀%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %%▄▄█%
                    %█  █%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    roamingEnemyRight: {
        relativeColor: { r: 255, g: 0, b: 0 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%▄▄▄▄▄▄▄▄▄▄▄▄▄%%▄▄▄▄%%%%%%%%
                    %▄▄▀▀▀▄▄%▀▄          ▀▄  █%%%%%%%%%
                    %%%▀▄   ▀▀▄█▀▄          █%%%%%%%%%%
                    %%%%▀▄      ▀▄█▄        █%%%%%%%%%%
                    %%%%%%█       ▀▄         █%%%%%%%%%
                    %%%%%%%█        █         █%%%%%%%%
                    %%%%%%%%█        █         █%%%%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%█                   █%%%%%%
                    %%%%%%%%%█                  ▀▄%%%%%
                    %%%%%%%%%▄▀                  █%%%%%
                    %%%%%%%%█                     █%%%%
                    %%%%%%▄▀              ▄▄▄     █%%%%
                    %%%%%█                 █       █%%%
                    %%%%█                     ▄▄▄▄▄█%%%
                    %%%█                           █%%%
                    %%%█                           █%%%
                    %%%█                          ▄▀%%%
                    %%%%▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀        ▄▄▄▀▄
                    ▄▀          ▀  █
                    █            ━━█
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀        ▄▄▄▀▄
                    ▄▀          ▀  █
                    █            ━━█
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀        ▄▄▄▀▄
                    ▄▀          ▀  █
                    █            ━━█
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█     ━█%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█     ━█%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█     ━█%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %█▄▄%%
                    %█ ╶█%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    stunnedEnemyFront: {
        relativeColor: { r: 255, g: 96, b: 96 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%▄▄▄%%%%%%%%▄%%%%%%%%%%%%%%%%%
                    %%%%%%%█▀▀▄%%%%▄█%%%%%%%▄▄▄▄▄%%%%%%
                    %%%%%%%█   █%▄█ ▀▀▄%%%▄▀ ▄▄▀%%%%%%%
                    %%%%%%█     █     █%%▄▀ ▄▀%%%%%%%%%
                    %%%%%%%█   █      ▀▄▀  ▄▀%%%%%%%%%%
                    %%%%%%%%█              █%%%%%%%%%%%
                    %%%%▄▄%█                █%%%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%%%█                  █%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%█                  █%%%%%%%%%%
                    %%%%█                    █%%%%%%%%%
                    %%%%%█  ▄ ▄           ▄ ▄ ▀▄%%%%%%%
                    %%%%█   ▄▀▄           ▄▀▄   █%%%%%%
                    %%%█    ▀ ▀   ▄▄▄▄▄▄  ▀ ▀    █%%%%%
                    %%%█         ████████         █%%%%
                    %%%█         ████████ ▀        █%%%
                    %%%▀▄               █  ▀      ▄▀%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄ ▄     ▄ ▄▀▄%
                    █ ▄▀▄  ▄  ▄▀▄ ▀▄
                    █     ███      █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄ ▄     ▄ ▄▀▄%
                    █ ▄▀▄  ▄  ▄▀▄ ▀▄
                    █     ███      █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%█%%%%%%%%%%%%
                    %%█ █%%█%%%▄▀%%%
                    %%█ █%█ █%%█%%%%
                    %▄▀  ▀   ▀▄█%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀▄ ▄     ▄ ▄▀▄%
                    █ ▄▀▄  ▄  ▄▀▄ ▀▄
                    █     ███      █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ ×▗▖× █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ ×▗▖× █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%▄%%%%%%%%
                    %%%█ ▀▀▄%▄%%%
                    %%%█    ▀ █%%
                    %%%█ ×▗▖× █%%
                    %%%▀▄▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %█▄▄%%
                    %█XX█%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    stunnedEnemyLeft: {
        relativeColor: { r: 255, g: 96, b: 96 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%▄▄▄▄%%▄▄▄▄▄▄▄▄▄▄▄▄▄%%%%%%%%
                    %%%%%%%%%█  ▄▀          ▄▀%▄▄▀▀▀▄▄%
                    %%%%%%%%%%█          ▄▀█▄▀▀   ▄▀%%%
                    %%%%%%%%%%█        ▄█▄▀      ▄▀%%%%
                    %%%%%%%%%█         ▄▀       █%%%%%%
                    %%%%%%%%█         █        █%%%%%%%
                    %%%%%%%█         █        █%%%%%%%%
                    %%%%%%█                  █%%%%%%%%%
                    %%%%%%█                   █%%%%%%%%
                    %%%%%▄▀                  █%%%%%%%%%
                    %%%%%█                  ▀▄%%%%%%%%%
                    %%%%█                     █%%%%%%%%
                    %%%%█     ▄ ▄              ▀▄%%%%%%
                    %%%█      ▄▀▄                █%%%%%
                    %%%█▄▄▄   ▀ ▀                 █%%%%
                    %%%█████                       █%%%
                    %%%█████ ▄                     █%%%
                    %%%▀▄  █   ▄                   █%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀ ▄ ▄       ▀▄%
                    █  ▄▀▄        ▀▄
                    ██▄▄           █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀ ▄ ▄       ▀▄%
                    █  ▄▀▄        ▀▄
                    ██▄▄           █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%█%▄▀▀█▄▄▄▄%%
                    %%%▄██ ▄▀  ▄▀%%%
                    %%█ █%█    █%%%%
                    %▄▀  ▀     █%%%%
                    %█         ▀▄%%%
                    %█          ▀▄%%
                    ▄▀ ▄ ▄       ▀▄%
                    █  ▄▀▄        ▀▄
                    ██▄▄           █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█ X    █%%
                    %%%▀█▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█ X    █%%
                    %%%▀█▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%▄%▄▄▄▄%%
                    %%%▄▀ ▀  ▄▀%%
                    %%%█      █%%
                    %%%█ X    █%%
                    %%%▀█▄▄▄▄▄▀%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %%▄▄█%
                    %█X █%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    stunnedEnemyBack: {
        relativeColor: { r: 255, g: 96, b: 96 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%%%%%%%%%%▄%%%%%%%%▄▄▄%%%%%%
                    %%%%%%▄▄▄▄▄%%%%%%%█▄%%%%▄▀▀█%%%%%%%
                    %%%%%%%▀▄▄ ▀▄%%%▄▀▀ █▄%█   █%%%%%%%
                    %%%%%%%%%▀▄ ▀▄%%█     █     █%%%%%%
                    %%%%%%%%%%▀▄  ▀▄▀      █   █%%%%%%%
                    %%%%%%%%%%%█              █%%%%%%%%
                    %%%%%%%%%%█                █%▄▄%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%█                  █%%%%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%%%█                  █%%%%%
                    %%%%%%%%%█                    █%%%%
                    %%%%%%%▄▀                    █%%%%%
                    %%%%%%█                       █%%%%
                    %%%%%█                         █%%%
                    %%%%█                          █%%%
                    %%%█                           █%%%
                    %%%▀▄                         ▄▀%%%
                    %%%%%▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%█%%%
                    %%%▀▄%%%█%%█ █%%
                    %%%%█%%█ █%█ █%%
                    %%%%█▄▀   ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀           ▀▄
                    ▄▀             █
                    █              █
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%%%%%%%▄%%%%
                    %%%▄%▄▀▀ █%%%
                    %%█ ▀    █%%%
                    %%█      █%%%
                    %%▀▄▄▄▄▄▄▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %%▄▄█%
                    %█  █%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    stunnedEnemyRight: {
        relativeColor: { r: 255, g: 96, b: 96 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 9 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 9 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                    %%%%%%%%▄▄▄▄▄▄▄▄▄▄▄▄▄%%▄▄▄▄%%%%%%%%
                    %▄▄▀▀▀▄▄%▀▄          ▀▄  █%%%%%%%%%
                    %%%▀▄   ▀▀▄█▀▄          █%%%%%%%%%%
                    %%%%▀▄      ▀▄█▄        █%%%%%%%%%%
                    %%%%%%█       ▀▄         █%%%%%%%%%
                    %%%%%%%█        █         █%%%%%%%%
                    %%%%%%%%█        █         █%%%%%%%
                    %%%%%%%%%█                  █%%%%%%
                    %%%%%%%%█                   █%%%%%%
                    %%%%%%%%%█                  ▀▄%%%%%
                    %%%%%%%%%▄▀                  █%%%%%
                    %%%%%%%%█                     █%%%%
                    %%%%%%▄▀              ▄ ▄     █%%%%
                    %%%%%█                ▄▀▄      █%%%
                    %%%%█                 ▀ ▀   ▄▄▄█%%%
                    %%%█                       █████%%%
                    %%%█                       █████%%%
                    %%%█                          ▄▀%%%
                    %%%%▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀%%%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀       ▄ ▄ ▀▄
                    ▄▀        ▄▀▄  █
                    █           ▄▄██
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀       ▄ ▄ ▀▄
                    ▄▀        ▄▀▄  █
                    █           ▄▄██
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▄▄▄▄█▀▀▄%█%%%%
                    %%%▀▄  ▀▄ ██▄%%%
                    %%%%█    █%█ █%%
                    %%%%█     ▀  ▀▄%
                    %%%▄▀         █%
                    %%▄▀          █%
                    %▄▀       ▄ ▄ ▀▄
                    ▄▀        ▄▀▄  █
                    █           ▄▄██
                    %▀▄▄▄▄▄▄▄▄▄▄▄▄▀%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█    X █%%%
                    %%▀▄▄▄▄▄█▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█    X █%%%
                    %%▀▄▄▄▄▄█▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%
                    %%▄▄▄▄%▄%%%%%
                    %%▀▄  ▀ ▀▄%%%
                    %%█      █%%%
                    %%█    X █%%%
                    %%▀▄▄▄▄▄█▀%%%
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%%
                    %█▄▄%%
                    %█ X█%
                    %█▄▄█%
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    %
                    @%
                `,
            },
        ],
    },

    exit: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 7 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 7 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 4 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 4 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 4 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 14 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 9 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 16, y: 9 },
            },
            p2_3: {
                artIndex: 3,
                drawAt: { x: 30, y: 9 },
            },
            p2_4: {
                artIndex: 3,
                drawAt: { x: 42, y: 10 },
            },
            p3_0: {
                artIndex: 4,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 4,
                drawAt: { x: -3, y: 11 },
            },
            p3_2: {
                artIndex: 4,
                drawAt: { x: 8, y: 11 },
            },
            p3_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 11 },
            },
            p3_4: {
                artIndex: 6,
                drawAt: { x: 29, y: 11 },
            },
            p3_5: {
                artIndex: 6,
                drawAt: { x: 36, y: 11 },
            },
            p3_6: {
                artIndex: 6,
                drawAt: { x: 46, y: 12 },
            },
            p4_0: {
                artIndex: 7,
                drawAt: { x: 2, y: 12 },
            },
            p4_1: {
                artIndex: 7,
                drawAt: { x: 7, y: 12 },
            },
            p4_2: {
                artIndex: 7,
                drawAt: { x: 12, y: 12 },
            },
            p4_3: {
                artIndex: 7,
                drawAt: { x: 17, y: 12 },
            },
            p4_4: {
                artIndex: 7,
                drawAt: { x: 22, y: 12 },
            },
            p4_5: {
                artIndex: 7,
                drawAt: { x: 26, y: 12 },
            },
            p4_6: {
                artIndex: 7,
                drawAt: { x: 30, y: 12 },
            },
            p4_7: {
                artIndex: 7,
                drawAt: { x: 35, y: 12 },
            },
            p4_8: {
                artIndex: 7,
                drawAt: { x: 40, y: 12 },
            },
            p5_0: {
                artIndex: 8,
                drawAt: { x: 14, y: 13 },
            },
            p5_1: {
                artIndex: 8,
                drawAt: { x: 16, y: 13 },
            },
            p5_2: {
                artIndex: 8,
                drawAt: { x: 18, y: 13 },
            },
            p5_3: {
                artIndex: 8,
                drawAt: { x: 20, y: 13 },
            },
            p5_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 13 },
            },
            p5_5: {
                artIndex: 8,
                drawAt: { x: 24, y: 13 },
            },
            p5_6: {
                artIndex: 8,
                drawAt: { x: 26, y: 13 },
            },
            p5_7: {
                artIndex: 8,
                drawAt: { x: 28, y: 13 },
            },
            p5_8: {
                artIndex: 8,
                drawAt: { x: 30, y: 13 },
            },
            p5_9: {
                artIndex: 8,
                drawAt: { x: 32, y: 13 },
            },
            p5_10: {
                artIndex: 8,
                drawAt: { x: 34, y: 13 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%▄▄▄▄
                    %%%%%%%%%%██
                    ▀██▄%%%%%%██
                    %%%▀██▄%%%██
                    %%%%%%▀██▄▄▀
                    %%%%%%%%%▀██▄
                    %%%%%%%%%% ▀██▄
                    %%%%%%%%%%▄ %▀██▄
                    %%%%%%%%%%██%%%▀██▄%▄█
                    %%%%%%%%%%██%%%%▄████▀
                    %%%%%%%%%%██%%%▀▀█████
                    %%%%%%%%%%██%%%%%%%%▀▀
                    %%%%%%%%%%██
                    %%%%%%%%%%██
                    %%%%%%%%%%██
                    %%%%%%%%%%▀▀
                    %%%%%%▄▀▀▀▀▀▀▀▀██████████████▄
                    %%%%▄█████████ ▀▀▀▀▀▀▀▀▀▀██████▄
                    %%▄█████████▀▄ ███████▀▄ ████████▄
                    %▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%%▗▄▖
                    %%%▝▚▖█
                    %%%%%▝█
                    %%%%%%█▚
                    %%%%%%█%▚▐▖
                    %%%%%%█▝▀█▌
                    %%%%%%█
                    %%%%%%█
                    %%%%▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄███████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▗▄▖
                    %%▝▚▖█
                    %%%%▝█
                    %%%%%█▚
                    %%%%%█%▚▐▖
                    %%%%%█▝▀█▌
                    %%%%%█
                    %%%%%█
                    %%▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄████████████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%▗▄▖
                    ▝▚▖█
                    %%▝█
                    %%%█▚
                    %%%█%▚▐▖
                    %%%█▝▀█▌
                    %%%█
                    %%%█
                    %%▄▄▄▄▄▄▄▄▄▄▄
                    %%%▀███████████▄▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%╲▂▖
                    %%%▐╲
                    %%%▐%╲▖
                    %%%▐%▀▘
                    %%%▝
                    ████████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %╲▂▖
                    %%▐╲
                    %%▐%╲▖
                    %%▐%▀▘
                    %%▝
                    ▄████████▄
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                  ╲▂▖
                  %▐╲
                  %▐%╲▖
                  %▐%▀▘
                  %▝
                  ▀████████████
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %┬
                    %│╲▎
                    %│▔
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ↘
                    ╼╾
                `,
            },
        ],
    },

    treasureChest: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 22 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 48, y: 22 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: 0, y: -14 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 14, y: 16 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 16 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -8, y: 15 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 16 },
            },
            p2_2: {
                artIndex: 2,
                drawAt: { x: 20, y: 16 },
            },
            p2_3: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 16 },
            },
            p3_0: {
                artIndex: 3,
                drawAt: { x: -3, y: 15 },
            },
            p3_1: {
                artIndex: 3,
                drawAt: { x: 2, y: 15 },
            },
            p3_2: {
                artIndex: 3,
                drawAt: { x: 13, y: 15 },
            },
            p3_3: {
                artIndex: 3,
                drawAt: { x: 23, y: 15 },
            },
            p3_4: {
                artIndex: 3,
                drawAt: { x: 33, y: 15 },
            },
            p3_5: {
                artIndex: 3,
                drawAt: { x: 39, y: 15 },
            },
            p3_6: {
                artIndex: 3,
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 4,
                drawAt: { x: 6, y: 14 },
            },
            p4_1: {
                artIndex: 4,
                drawAt: { x: 11, y: 14 },
            },
            p4_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p4_3: {
                artIndex: 4,
                drawAt: { x: 21, y: 14 },
            },
            p4_4: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p4_5: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p4_6: {
                artIndex: 4,
                drawAt: { x: 33, y: 14 },
            },
            p4_7: {
                artIndex: 4,
                drawAt: { x: 38, y: 14 },
            },
            p4_8: {
                artIndex: 4,
                drawAt: { x: 43, y: 14 },
            },
            p5_0: {
                artIndex: 5,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 5,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 5,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 5,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 5,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 5,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 5,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 5,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 5,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 5,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 5,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %▄██████████████████▄
                    █▀   █          █   ▀█
                    █    █          █    █
                    █▀▀▀▀█▀▀▀▀██▀▀▀▀█▀▀▀▀█
                    █    █    ▀▀    █    █
                    █    █          █    █
                    █▄▄▄▄█▄▄▄▄▄▄▄▄▄▄█▄▄▄▄█
                `,
            },
            {
                data: `
                    ▄▀▀▀▀▀▀█▀▄
                    █▀▀██▀▀█▄█
                    █      █ █
                    ▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                data: `
                    ▄▀▀▀▀▀▀▀▀▄
                    █▀▀▀██▀▀▀█
                    █        █
                    ▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                data: `
                    ▞▜▛▚
                    ▙▄▄▟
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▆▆
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ▗▖
                `,
            },
        ],
    },

    destroyedTreasureChest: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -19, y: 24 },
            },
            p0_1: {
                artIndex: 11,
                drawAt: { x: 5, y: 24 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 24 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -12, y: 20 },
            },
            p1_1: {
                artIndex: 1,
                drawAt: { x: 8, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 38, y: 20 },
            },
            p2_0: {
                artIndex: 2,
                drawAt: { x: 0, y: 18 },
            },
            p2_1: {
                artIndex: 3,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 4,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 5,
                drawAt: { x: 32, y: 17 },
            },
            p2_4: {
                artIndex: 2,
                drawOptions: { flippedX: true },
                drawAt: { x: 42, y: 18 },
            },
            p3_0: {
                artIndex: 10,
                drawAt: { x: -9, y: 15 },
            },
            p3_1: {
                artIndex: 10,
                drawAt: { x: -3, y: 16 },
            },
            p3_2: {
                artIndex: 10,
                drawAt: { x: 8, y: 16 },
            },
            p3_3: {
                artIndex: 7,
                drawAt: { x: 20, y: 16 },
            },
            p3_4: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 29, y: 16 },
            },
            p3_5: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 36, y: 16 },
            },
            p3_6: {
                artIndex: 10,
                drawOptions: { flippedX: true },
                drawAt: { x: 46, y: 15 },
            },
            p4_0: {
                artIndex: 8,
                drawAt: { x: 2, y: 15 },
            },
            p4_1: {
                artIndex: 8,
                drawAt: { x: 7, y: 15 },
            },
            p4_2: {
                artIndex: 8,
                drawAt: { x: 12, y: 15 },
            },
            p4_3: {
                artIndex: 8,
                drawAt: { x: 17, y: 15 },
            },
            p4_4: {
                artIndex: 8,
                drawAt: { x: 22, y: 15 },
            },
            p4_5: {
                artIndex: 8,
                drawAt: { x: 27, y: 15 },
            },
            p4_6: {
                artIndex: 8,
                drawAt: { x: 32, y: 15 },
            },
            p4_7: {
                artIndex: 8,
                drawAt: { x: 37, y: 15 },
            },
            p4_8: {
                artIndex: 8,
                drawAt: { x: 42, y: 15 },
            },
            p5_0: {
                artIndex: 9,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 9,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 9,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 9,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 9,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 9,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 9,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 9,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 9,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 9,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 9,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %
                    %
                    %%%%'   . ▗# ;'  ' ▗ #, '
                    %%%%%%.#▘. ▗' ▘#▗▘   ▗
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %
                    %
                    %%%%' ▗ ;' ▘, . ▘ .#  ,▘,  #  ▘ .
                    %%%  ▗. ▘.▗  ▘ # ▗ ▘  #▗.▘  ▘'
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %.▗▗.▘ '
                    .▘# ▘
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%%%. ▘. ▗ ▗
                    '▗.'▘,▘. # ▘:,
                `
            },
            {
                transparentCharacter: "%",
                data: `
                    %
                    %% ,  .'.'  .' ,
                `,
            },
            {
                data: `
                    .  ▗▗  .  ,
                     ▘    ▗ ▘ # ▘ ;
                `,
            },
            {
                data: `
                    '▗ ▘▗ :  ▗' #.
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%. . ..
                `,
            },
            {
                data: `
                      . .
                `,
            },
            {
                data: `
                    .
                `,
            },
            {
                data: `
                    . .' " . '
                `,
            },
            {
                data: `
                     ' ▗  ▘ .   '   ' ,.     ;  ▗  ., ▗ .  '
                    ▘    ▗'  ;     ▗  # .;  ▗             .
                      ▘'  ,'▗  ' .,   ▗    ▘ '.  ▘ ' ▘   ' .
                    ▘  '      ' ▗ '      ▘    . ',  ; .
                `,
            },
        ],
    },

    merchant: {
        relativeColor: { r: 247, g: 119, b: 247 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 14 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 14 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 12 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 16, y: 10 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 33, y: 10 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 11 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 10 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 20, y: 10 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 32, y: 10 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 43, y: 11 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -5, y: 13 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: 0, y: 12 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 11, y: 12 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 22, y: 12 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 27, y: 12 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 34, y: 12 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 14 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 4, y: 13 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 9, y: 13 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 14, y: 13 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 19, y: 13 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 24, y: 13 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 28, y: 13 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 32, y: 13 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 37, y: 13 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 42, y: 13 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%█▀▄▄
                    %%%%%%%%▌  ▀▀▄▀
                    %%%%%%%▄▄▄▀▀▀
                    %%%%%%▀▄    ▀▀▀
                    %%%%%▄▀    █▄
                    %%%%%█      █
                    %%%%%█      ▀█%%%▄▀
                    %%%%█       ▀▄▄▄▀
                    %%%%█        ▄▀
                    %%%▀▄▄▄▀▀▀▄▄▀
                    %%%%%%█  ▄▀█
                    %%%%%%█ █▀  ▀▄
                    ▀%▀▀%▀▀▀▀▀▀▀▀▀▀▀%%▀
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%█▄
                    %%%█▄██▀
                    %%▀▀   ▀
                    %%█   █
                    %█     █%▄▀
                    █      ▄▀
                    %▀▄▀▀▄█
                    %%█ █  █
                    %▀▀▀▀▀▀▀▀▀▀
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%▟▄▂
                    %▝▛▀▂
                    %▞ ▚%%╱
                    ▝▚▁▁▀╱
                    %%▌▙╱
                `,
            },
            {
                data: `
                    ☻
                    ╦╱
                    ╫
                `,
            },
            {
                data: `
                    ♣
                `,
            },
        ],
    },

    gambler: {
        relativeColor: { r: 255, g: 215, b: 0 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -14, y: 15 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 13 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 12 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 17, y: 12 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 36, y: 12 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 14 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 13 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 19, y: 13 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 33, y: 13 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 44, y: 14 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -3, y: 14 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: 1, y: 13 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 11, y: 13 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 22, y: 13 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 28, y: 13 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 35, y: 13 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 14 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 3, y: 14 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 8, y: 14 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 13, y: 14 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 18, y: 14 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 23, y: 14 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 27, y: 14 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 31, y: 14 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 36, y: 14 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 41, y: 14 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄%▄
                    ▌%%%%%%%█▀▄▀▄
                    █%%%%%%▄▀  ▀▀▀▀▄
                    █%%%%%█      ╼╸ ▀▀▄
                    █%%%%▄▀       ▄▄▄▄▄▀
                    █%%%█      ▀█▀
                    █%%█     ▀▀▄▄▀▄
                    █%%█         ▀██▄
                    %█▄█          █
                    %%▀▄▄▄▄▄▄▄▄▄▄▀
                    %%%%%▀▀▀%%%▀▀▀▀
                    %
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    ▌%%%█▄█▄
                    █%%%█  ╼▀▀▄
                    █%%█   ▄▀▀▀
                    ▀▄█   ▀▀█▀
                    %%▀▄▄▄▄▄▀
                    %%%▀▀%%▀▀
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    ▌%▙▙▂
                    ▌▟█▞▀▀
                    ▚▜██▞
                    %▀%▀
                `,
            },
            {
                data: `
                    ▌▙▖
                    ▝▀
                `,
            },
            {
                data: `
                    ♠
                `,
            },
        ],
    },

    erok: {
        relativeColor: { r: 255, g: 214, b: 138 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -16, y: 15 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 13 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -15, y: 12 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 17, y: 12 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 36, y: 12 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -9, y: 14 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 13 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 19, y: 13 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 33, y: 13 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 44, y: 14 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -5, y: 14 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: 1, y: 13 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 11, y: 13 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 22, y: 13 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 28, y: 13 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 35, y: 13 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 14 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 3, y: 14 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 8, y: 14 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 13, y: 14 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 18, y: 14 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 23, y: 14 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 27, y: 14 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 31, y: 14 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 36, y: 14 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 41, y: 14 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%%%%%%%▄▀█
                    %%%%%%%%%%%%%%%%▄▀ ▀▀▄
                    %%%%%%%%%%%%%%%█    ▀ ▀▀▄
                    %▄▀▀▀▄%%%%%%%▄▀      ▄▀▀
                    █  ▀▀ ▀▀▀▀▀▀▀       █
                    ▀▄▄▄▀               █
                    %%█  ▄▄▄▄     ▀▄   █
                    %█  █%%%%▀▀▀▀▀▀█  █
                    %█ █%%%%%%%%%%%█ █
                    %█▄█▄%%%%%%%%%%█▄█▄
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%%%%▄
                    %%%%%%%%%%%█▀▄▄▄
                    %▄▄%%%%%%▄▀     ▀▄
                    █ ▄▀▀▀▀▀▀    ▄▀▀▀
                    ▀▄         ▄▀
                    %%█▄▀▀▀▀▀▄▄█
                    %%█▄%%%%%%%█▄
                    %
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %
                    %%%%%%%%▄
                    %▄%%%%%▄▀▀▀▄
                    ▀▄▀▀▀▀▀  ▄▀
                    %%█▄▀▀▀▀█▄
                    %
                    %
                `,
            },
            {
                data: `
                    ▌▙▖
                    ▝▀
                `,
            },
            {
                data: `
                    ♠
                `,
            },
        ],
    },

    pigeon: {
        relativeColor: { r: 79, g: 194, b: 146 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 14 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 14 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 12 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 16, y: 10 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 33, y: 10 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 11 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 10 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 20, y: 10 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 32, y: 10 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 43, y: 11 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -5, y: 13 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: 0, y: 12 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 11, y: 12 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 22, y: 12 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 27, y: 12 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 34, y: 12 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 14 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 4, y: 13 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 9, y: 13 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 14, y: 13 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 19, y: 13 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 24, y: 13 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 28, y: 13 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 32, y: 13 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 37, y: 13 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 42, y: 13 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                       ▄▄▄▄▄%%%%%%%%%%
                       %█   █%%%%▄▄%%%
                       %%▀▄  █%▄▀▄ ▀▄▄
                       %%%█   █    ▄▀%
                       %%%%█   ▀  █%%%
                       ▄▀▄▀      █%%%%
                       ▄▀▄     ▄▀%%%%%
                       ▀▀%▀█▀▀▀▄%%%%%%
                       %%%▄▀▄%▀%▀%%%%%
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                      %%█▄%%%%%%
                      %%█ ▀▄▀▀▄▄
                      %%▀▄  ▄▀%%
                      %%%▄▀▀▄%%%
                      %%%%%%%%%%
                      %%%%%%%%%%
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                      %▄%%%
                      %%▀▄▀
                      %%%▀%
                      %%%%%
                `,
            },
            {
                data: `
                    >▄  
                `,
            },
            {
                data: `
                    ƒ  
                `,
            },
        ],
    },

    vampire: {
        relativeColor: { r: 247, g: 119, b: 247 },
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 14 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 14 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -13, y: 12 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 16, y: 10 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 33, y: 10 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 11 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 4, y: 10 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 20, y: 10 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 32, y: 10 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 43, y: 11 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -5, y: 13 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: 0, y: 12 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 11, y: 12 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 22, y: 12 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 27, y: 12 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 34, y: 12 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 14 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 4, y: 13 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 9, y: 13 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 14, y: 13 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 19, y: 13 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 24, y: 13 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 28, y: 13 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 32, y: 13 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 37, y: 13 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 42, y: 13 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄%▄
                    %%%%%%%%███
                    %%%▄███▄▀█▀▄███▄
                    %%███████████████
                    %%█████▀███▀█████
                    %%██▀%% ▀█▀ %%▀██
                    %%█%%%%▀▀%▀▀%%%%█
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %
                    %
                    %▄██▄█▄██▄
                    ███████████
                    █▀%%▀█▀%%▀█
                `,
            },
            {
                transparentCharacter: "%",
                data: `
                    %
                    %
                    ▄▀▄▀▄
                    ▀%%%▀
                `,
            },
            {
                data: `
                    π
                `,
            },
            {
                data: `
                    π
                `,
            },
        ],
    },

    crater: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 23 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 23 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 20 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 20 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 22 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 30, y: 17 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 42, y: 22 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -9, y: 19 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: -3, y: 15 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 8, y: 15 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 20, y: 15 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 29, y: 15 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 36, y: 15 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 19 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 2, y: 14 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 7, y: 14 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 12, y: 14 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 17, y: 14 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 22, y: 14 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 26, y: 14 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 30, y: 14 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 35, y: 14 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 40, y: 14 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%%%▄▄▄▄████████████▄▄▄▄
                    %%%%%▄████▛██▞█▞██▟▛▟██▚█▜████▄
                    %%%%▀██▟███▛███▀▀▀▀▀▀██▜███▟███▀
                    %%%%%%▀▀▀▀████████████████▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▃▄▄▄▄▄▄▄▄▃
                    %▀▀████▄▄▄▄████▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▁▂▂▂▂▂▂▁
                    ▀████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▂▂▂▂
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╼╾
                `,
            },
        ],
    },

    bloodyCrater: {
        positions: {
            p0_0: {
                artIndex: 0,
                drawAt: { x: -28, y: 23 },
            },
            p0_2: {
                artIndex: 0,
                drawAt: { x: 45, y: 23 },
            },
            p1_0: {
                artIndex: 0,
                drawAt: { x: -25, y: 20 },
            },
            p1_1: {
                artIndex: 0,
                drawAt: { x: 7, y: 20 },
            },
            p1_2: {
                artIndex: 0,
                drawAt: { x: 39, y: 20 },
            },
            p2_0: {
                artIndex: 1,
                drawAt: { x: -7, y: 22 },
            },
            p2_1: {
                artIndex: 1,
                drawAt: { x: 3, y: 17 },
            },
            p2_2: {
                artIndex: 1,
                drawAt: { x: 16, y: 17 },
            },
            p2_3: {
                artIndex: 1,
                drawAt: { x: 30, y: 17 },
            },
            p2_4: {
                artIndex: 1,
                drawAt: { x: 42, y: 22 },
            },
            p3_0: {
                artIndex: 2,
                drawAt: { x: -9, y: 19 },
            },
            p3_1: {
                artIndex: 2,
                drawAt: { x: -3, y: 15 },
            },
            p3_2: {
                artIndex: 2,
                drawAt: { x: 8, y: 15 },
            },
            p3_3: {
                artIndex: 2,
                drawAt: { x: 20, y: 15 },
            },
            p3_4: {
                artIndex: 2,
                drawAt: { x: 29, y: 15 },
            },
            p3_5: {
                artIndex: 2,
                drawAt: { x: 36, y: 15 },
            },
            p3_6: {
                artIndex: 2,
                drawAt: { x: 46, y: 19 },
            },
            p4_0: {
                artIndex: 3,
                drawAt: { x: 2, y: 14 },
            },
            p4_1: {
                artIndex: 3,
                drawAt: { x: 7, y: 14 },
            },
            p4_2: {
                artIndex: 3,
                drawAt: { x: 12, y: 14 },
            },
            p4_3: {
                artIndex: 3,
                drawAt: { x: 17, y: 14 },
            },
            p4_4: {
                artIndex: 3,
                drawAt: { x: 22, y: 14 },
            },
            p4_5: {
                artIndex: 3,
                drawAt: { x: 26, y: 14 },
            },
            p4_6: {
                artIndex: 3,
                drawAt: { x: 30, y: 14 },
            },
            p4_7: {
                artIndex: 3,
                drawAt: { x: 35, y: 14 },
            },
            p4_8: {
                artIndex: 3,
                drawAt: { x: 40, y: 14 },
            },
            p5_0: {
                artIndex: 4,
                drawAt: { x: 14, y: 14 },
            },
            p5_1: {
                artIndex: 4,
                drawAt: { x: 16, y: 14 },
            },
            p5_2: {
                artIndex: 4,
                drawAt: { x: 18, y: 14 },
            },
            p5_3: {
                artIndex: 4,
                drawAt: { x: 20, y: 14 },
            },
            p5_4: {
                artIndex: 4,
                drawAt: { x: 22, y: 14 },
            },
            p5_5: {
                artIndex: 4,
                drawAt: { x: 24, y: 14 },
            },
            p5_6: {
                artIndex: 4,
                drawAt: { x: 26, y: 14 },
            },
            p5_7: {
                artIndex: 4,
                drawAt: { x: 28, y: 14 },
            },
            p5_8: {
                artIndex: 4,
                drawAt: { x: 30, y: 14 },
            },
            p5_9: {
                artIndex: 4,
                drawAt: { x: 32, y: 14 },
            },
            p5_10: {
                artIndex: 4,
                drawAt: { x: 34, y: 14 },
            },
        },
        art: [
            {
                transparentCharacter: "%",
                data: `
                    %%%%%%▘%▄▄▄▄████████████▄▄▄▄%▘
                    %%%%%▄██▘ ▀▝▞██▟▛██▛██▀████▀██▄▗
                    %%%%▀███▖ ▄▗▚██▀▀▀▀▀▀█▀▄▄▄▄▀███▀
                    %%%▝%%▀▀▀▀████▟████▟██████▀▀▀▀%%▗
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %%%%▃▄▄▄▄▄▄▄▄▃
                    %▀▀████▄▄▄▄████▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▁▂▂▂▂▂▂▁
                    ▀████████▀
                `,
            },
            {
                automaskBlockCharacters: true,
                transparentCharacter: "%",
                data: `
                    %▂▂▂▂
                    ▀▀▀▀▀▀
                `,
            },
            {
                automaskBlockCharacters: true,
                data: `
                    ╼╾
                `,
            },
        ],
    },
};