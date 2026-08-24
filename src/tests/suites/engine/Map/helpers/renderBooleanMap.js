// Renders a boolean map which is a 2D array where true = wall and false = floor
const renderBooleanMap = (gameMap) => {
    if (! Array.isArray(gameMap)) {
        const $errorMessage = document.createElement("em");
        $errorMessage.innerText = "The game map is not an array!";
        return $errorMessage;
    }

    const $container = document.createElement("div");
    const $map = document.createElement("div");
    $map.className = "game-map blocky cellular";
    $map.style.backgroundColor = "#000";
    $container.appendChild($map);

    for (let y = 0; y < gameMap.length; y++) {
        for (let x = 0; x < gameMap[y].length; x++) {
            const $character = document.createElement("span");

            if (gameMap[y][x]) {
                $character.innerText = "#";
                $character.style.color = "lightseagreen";
                $character.title = `(${x}, ${y}) Wall`;
            } else {
                $character.innerText = " ";
                $character.title = `(${x}, ${y}) Floor`;
            }

            $map.appendChild($character);
        }

        if (y < gameMap[y].length - 1) {
            $map.appendChild(document.createElement("br"));
        }
    }

    return $container;
};
