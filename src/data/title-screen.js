/**
 * Title screen assets and element creator
 *
 * USAGE
 *
 * Display the title screen
 *  TITLE_SCREEN.initialize($e)
 *  where $e is the title screen's container element
 *
 * Hide the title screen
 *  TITLE_SCREEN.startGame($e, callback)
 *  where $e is the title screen's container and callback is fired after closing
 */
const TITLE_SCREEN = {
    isActive: false,
};

TITLE_SCREEN.logo = Object.freeze({
    asciiArt: `
                                                         ▄▄
▄                                                ▄         ▀█
 ▀▀██████████████▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀██████           ▀█         █░                        ▀▀▀▀▀▀▀▀▄
     ████░            ██████    █▀░░░█            █         █░▄███████▄     ▄█▄ ▄▄█████████▀▀▀
     ██░░     ██████  █░░░██    █░  ██      ▄    ▄█        ██░██░░░░░▀█   ███░ █    █████░
     ██░     ██░   █░ █████░    █░  █░ ▄█████░   █  █     ██░██████▄  ▀  ██░░       ███░░
    ███░     ███████░ █░░███░ █░█░ ██░ █░░░██░   █  █░   ██░ █░     ▄▄    ███▄      ██░░
    ██░      █░░░░░█░██░   ████░████░░ ▀█████░   █  ██░███░  █▄   ███░   ████▀      ██░
     █░       ░     ░  ░       ░░░░░░       █░  ██   ███░░   ██████░░ ████░░░      ██░
     █░                             ░     ▄██░███░    ░░░     ░░░░░████▄▄▄▄▄▄▄▄▄▄▄▄██░
     █░                             ░     █░░██░░                 ██░░░░░░░░░░░░░░░░░
     █░                                   ▀███░░                  █░
     ░░                                     ░░░                   █░
     ░                                                           ██░
     ░                                                           █░
     ░                                                           ░░
     ░                                                           ░
     ░
     ░
     ░
     ░
     ░
     ░
     ░
     ░
        `.trimEnd(),

    build: () => {
        const $logo = document.createElement("pre");
        $logo.className = "logo";
        $logo.textContent = TITLE_SCREEN.logo.asciiArt;

        return $logo;
    },
});

TITLE_SCREEN.spire = Object.freeze({
    asciiArt: Object.freeze({
        mazeTop: `
█▀▀▀▀▀█▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀█
█ ▀▀▀ █ █ ▀▀▀ █▀▀▀█▀▀▀▀▀█ █ ▀▀█▀█▀▀ █▀▀ █ ▀▀█▀▀▀█▀▀ █
█ ▀▀█ █ ▀▀▀▀█▀▀ █▀▀ █▀█ █ ▀▀█ █ █ █▀█ █▀▀▀▀ ▀ █ █ ▀ █
█▀▀ █▀▀▀▀▀▀ █ █▀▀ █▀▀ █ ▀ █▀▀ █ █ █ ▀ ▀▀▀▀▀▀█▀▀ █ █ █
█ ▀▀█ █▀▀▀▀▀▀ █ ▀▀█ █ █ █▀▀ █▀▀ █ █ ▀▀█▀▀▀█ ▀▀▀▀█ █ █
█▀▀ █ ▀▀█▀▀▀█ ▀▀█ ▀▀█ ▀ █ █▀▀▀▀ █ █ █▀▀ █ █▀▀▀▀ ▀ █ █
█ █▀▀▀▀ █ █ █ █ █▀█ ▀▀▀▀▀ █ ▀▀█ █ ▀▀▀ █▀█ ▀▀▀▀▀▀▀▀▀▀█
█ █ ▀▀▀▀▀ █ ▀ █ ▀ ▀▀█▀▀▀▀▀▀▀█ █ ▀▀█▀▀▀▀ ▀▀▀▀█▀▀▀█▀▀ █
█ ▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀█ ███▄███▄█▄███ ▀▀▀▀▀ █▀▀ █ █ ▀ █▀█
█ █ █ ▀ █ ▀▀█ █ █▀▀▀█           █▀▀▀▀▀▀▀█ █▀█ █▀▀▀▀ █
█ █ ▀▀█▀▀▀█ █ ▀▀█ █▀█           █▀▀▀▀▀▀▀█ ▀ █ █▀▀▀█ █
█ ▀▀█ ▀ █ ▀ ▀▀█ ▀ █ █           █ █▀▀▀█ ▀ █▀▀ █ █ ▀ █
█▀▀ █▀▀▀▀▀█▀▀▀▀▀▀▀▀▀█           █ ▀ █ ▀▀▀▀█ █▀█ ▀▀▀▀█
█ █▀▀ █▀▀ █ ▀▀▀▀█▀▀▀█▀▀▀█▀▀▀▀▀▀▀█ █▀▀▀▀▀█▀▀ █ █ ▀▀█ █
█ █ █▀█ █▀▀▀█▀█ ▀ █ ▀▀█▀▀ ▀▀█ ▀ █▀▀ █▀▀ █ █▀▀ █ █▀▀ █
█ ▀ █ █ █ █ ▀ █▀▀▀▀▀▀ █▀▀▀█ █ █ ▀ █▀█ ▀▀█ █ ▀▀▀ █ █ █
█▀▀▀▀ ▀ █ █▀▀ █ █▀▀▀▀▀▀ █ ▀▀▀ █▀▀▀▀ ▀▀█ ▀ █▀▀▀▀▀█ ▀▀█
█ █▀▀▀▀▀▀ ▀▀▀▀█ █ ▀▀▀▀█▀▀▀▀▀█▀▀ ▀▀█▀▀ ▀▀█▀▀ █▀▀ █▀▀ █
█ █▀▀▀▀▀▀▀▀▀▀ █ ▀▀▀▀▀ █ ▀▀█ █ ▀▀█▀▀ █▀█ ▀▀█ ▀▀█ █ ▀▀█
█ █ █▀▀▀▀▀▀▀█ ▀▀█▀▀▀▀▀▀▀▀ █ ▀▀▀▀▀ █▀▀ ▀▀▀ ▀▀▀ █ ▀▀▀ █
█ █▄█▀█▀█ █ ▀ █ █ ▀▀ ▀█▀ ▀█▀█ █ ▀▀█▀▀▀█ ▀▀█▀▀▀█▀█▀▀ █
█▄▄▄▄▄█▄▄▄▄▄▄▄█▄█▄▄▄█▄▄▄█▄█▄▄▄█▄█▄▄▄█▄█▄█▄▄▄█▄▄▄█▄█▄█
        `.trim(),

        maze: `
█▀▀▀▀▀█▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀█
█ ▀▀▀ █ █ ▀▀▀ █▀▀▀█▀▀▀▀▀█ █ ▀▀█▀█▀▀ █▀▀ █ ▀▀█▀▀▀█▀▀ █
█ ▀▀█ █ ▀▀▀▀█▀▀ █▀▀ █▀█ █ ▀▀█ █ █ █▀█ █▀▀▀▀ ▀ █ █ ▀ █
█▀▀ █▀▀▀▀▀▀ █ █▀▀ █▀▀ █ ▀ █▀▀ █ █ █ ▀ ▀▀▀▀▀▀█▀▀ █ █ █
█ ▀▀█ █▀▀▀▀▀▀ █ ▀▀█ █ █ █▀▀ █▀▀ █ █ ▀▀█▀▀▀█ ▀▀▀▀█ █ █
█▀▀ █ ▀▀█▀▀▀█ ▀▀█ ▀▀█ ▀ █ █▀▀▀▀ █ █ █▀▀ █ █▀▀▀▀ ▀ █ █
█ █▀▀▀▀ █ █ █ █ █▀█ ▀▀▀▀▀ █ ▀▀█ █ ▀▀▀ █▀█ ▀▀▀▀▀▀▀▀▀▀█
█ █ ▀▀▀▀▀ █ ▀ █ ▀ ▀▀█▀▀▀▀▀▀▀█ █ ▀▀█▀▀▀▀ ▀▀▀▀█▀▀▀█▀▀ █
█ ▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀█ ▀▀▀ █▀█ █ █▀█ ▀▀▀▀▀ █▀▀ █ █ ▀ █▀█
█ █ █ ▀ █ ▀▀█ █ █▀▀▀▀           ▀▀▀▀▀▀▀▀█ █▀█ █▀▀▀▀ █
█ █ ▀▀█▀▀▀█ █ ▀▀█ █▀▀           █▀▀▀▀▀▀▀█ ▀ █ █▀▀▀█ █
█ ▀▀█ ▀ █ ▀ ▀▀█ ▀ █ ▀           █ █▀▀▀█ ▀ █▀▀ █ █ ▀ █
█▀▀ █▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀           ▀ ▀ █ ▀▀▀▀█ █▀█ ▀▀▀▀█
█ █▀▀ █▀▀ █ ▀▀▀▀█▀▀▀█ ▀ █▀▀▀▀▀▀▀█ █▀▀▀▀▀█▀▀ █ █ ▀▀█ █
█ █ █▀█ █▀▀▀█▀█ ▀ █ ▀▀█▀▀ ▀▀█ ▀ █▀▀ █▀▀ █ █▀▀ █ █▀▀ █
█ ▀ █ █ █ █ ▀ █▀▀▀▀▀▀ █▀▀▀█ █ █ ▀ █▀█ ▀▀█ █ ▀▀▀ █ █ █
█▀▀▀▀ ▀ █ █▀▀ █ █▀▀▀▀▀▀ █ ▀▀▀ █▀▀▀▀ ▀▀█ ▀ █▀▀▀▀▀█ ▀▀█
█ █▀▀▀▀▀▀ ▀▀▀▀█ █ ▀▀▀▀█▀▀▀▀▀█▀▀ ▀▀█▀▀ ▀▀█▀▀ █▀▀ █▀▀ █
█ █▀▀▀▀▀▀▀▀▀▀ █ ▀▀▀▀▀ █ ▀▀█ █ ▀▀█▀▀ █▀█ ▀▀█ ▀▀█ █ ▀▀█
█ █ █▀▀▀▀▀▀▀█ ▀▀█▀▀▀▀▀▀▀▀ █ ▀▀▀▀▀ █▀▀ ▀▀▀ ▀▀▀ █ ▀▀▀ █
█ █▄█▀█▀█ █ ▀ █ █ ▀▀ ▀█▀ ▀█▀█ █ ▀▀█▀▀▀█ ▀▀█▀▀▀█▀█▀▀ █
█▄▄▄▄▄█▄▄▄▄▄▄▄█▄█▄▄▄█▄▄▄█▄█▄▄▄█▄█▄▄▄█▄█▄█▄▄▄█▄▄▄█▄█▄█
        `.trim(),

        skyline: `
                ║═════════║  ╪    ║            ╪
   ╪ ║══║       ║         ║  ║    ║║═════║     ║
   ║ ║  ║║══║   ║         ║ ║║    ║║     ║    ║║
  ║║ ║  ║║  ║   ║         ║ ║║║══║║║     ║   ║║║║
 ░░▒▒▓▓███████████████████████████████████████████▓▓▒▒░░
        `.trimEnd(),

        island: {
            mask: `
 ██████████████████  ████████████████████████████████
█████████████████████████████████████████████████████
████████████████████████████████████████████████████
 ██████████████████████████████████████████████████
 █████████████████████████████████████████████████
  ██████████████████████████████████████████████
  ███████████████████████████████████████████
  █████████████████████████████████████████
  ██████████████████████████████████████
   ████████████████████████████████████
    ███████████████████████████████
     █████████████████████████████
      ███████████████████████████
      ██████████████████████████
       ███████████████████████
        █████████████████████
         ███████████████████
         ██████████████████
          █████████████████
           ███████████████
           ███████████████
            █████████████
            █████████████
             ███████████
              ██████████
               ████████
                ██████
                 ████
                  ███
                   ██
            `.trimEnd(),

            baseRock: `
 ██████████████████■■████████████████████████████████
█ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓■■■  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓ ▓▓ ▓  ▓██
██ ▓▓ ▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓ ■■  ▓▓▓  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓ ██
 █ ▓▓▓■■▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓■■■▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓██
 ██▓▓   ■■■■■▓▓▓▓▓▓▓▓ ▓▓▓■■ ▓▓▓  ■■■■■ ▓▓▓▓▓▓▓ ███
  █▓▓    ▓▓▓▓▓  ▓▓▓ ▓▓▓ ▓▓■ ■■■■■■ ▓▓▓▓▓ ▓▓ ████
  █▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓   ■■■■▓▓▓▓▓▓▓▓▓▓▓▓▓▓███
  █▓  ▓    ▓▓▓   ▓▓ ■■■■▓▓▓▓▓ ▓  ▓ ▓▓▓  ███
  ██  ▓▓      ■■■■■■■   ▓▓▓▓▓   ▓▓▓ ▓ ██
   ██  ▓■■■■■■■ ▓▓▓▓▓■■■■■■■■■■■▓ ▓▓███
    ██ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓  ▓▓▓▓   █
     ██  ▓▓■■■■ ▓▓▓▓▓▓▓ ▓▓▓▓    ██
      █ ▓▓▓▓▓▓■■■■ ▓▓▓▓▓▓▓▓▓   ██
      ██  ▓▓ ▓▓  ■■■■■■■■■■   ██
       ██  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ██
        ██  ▓▓  ▓▓     ▓▓  ██
         █     ▓  ■■■■▓ ▓▓██
         ██■■■■■■■   ▓▓ ▓ █
          █▓▓▓▓▓▓■■■■ ▓ ▓██
           █ ▓▓▓ ▓▓▓■▓▓  █
           ██ ▓▓ ▓■■■■■ ██
            █ ▓▓■■■▓▓▓▓ █
            ██▓■■▓▓▓▓▓ ██
             ██▓▓■■■▓  █
              ██ ▓▓■■ ██
               ██▓▓▓ ██
                ██ ▓██
                 ██ █
                  ███
                   ██
            `.trimEnd(),

            rock: `

  ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓     ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓ ▓▓ ▓  ▓██
██ ▓▓ ▓▓  ▓ ▓  ▓ ▓▓▓▓     ▓▓▓  ▓▓▓▓▓   ▓▓ ▓▓▓ ▓▓▓
 █ ▓▓▓  ▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓ ▓ ▓▓  ▓ ▓▓   ▓ ▓
 ██▓▓        ▓▓ ▓▓▓▓▓ ▓▓▓   ▓▓▓        ▓▓▓
  █ ▓    ▓▓▓▓▓  ▓   ▓▓▓ ▓▓         ▓▓    ▓▓ █
  █▓▓ ▓ ▓▓  ▓▓ ▓▓ ▓▓▓       ▓▓▓▓▓▓▓  ▓▓▓   ██
  █▓  ▓    ▓ ▓   ▓▓     ▓▓▓▓▓ ▓  ▓ ▓▓▓  ███
  ██  ▓▓                ▓▓▓▓▓   ▓▓▓ ▓
       ▓                        ▓
       ▓▓        ▓▓▓▓ ▓▓▓  ▓▓▓▓
                ▓
      █ ▓▓▓▓▓▓
      ██  ▓▓ ▓▓
           ▓▓▓▓▓▓▓  ▓▓ ▓▓   █
            ▓▓  ▓▓     ▓▓  █
         █     ▓      ▓ ▓
         ██          ▓
          █▓▓▓  ▓
             ▓ ▓
              ▓▓ ▓
               ▓
            `.trimEnd(),

            baseGrass: `
 ██████████████████■■████████████████████████████████
     ▓▓▓▓   ▓▓      ■■■      ▓▓▓▓  ▓▓▓  ▓▓        ▓
      ▓▓     ▓▓▓ ▓▓▓▓ ■■  ▓▓▓  ▓                ▓
      ■■           ▓▓▓▓■■■               ▓    ▓ ▓
 █      ■■■■■         ▓▓▓■■      ■■■■■     ▓▓▓
  █                       ■ ■■■■■■ ▓▓  ▓
  █▓         ▓▓▓▓▓▓▓▓   ■■■■
   ▓  ▓     ▓▓   ▓▓ ■■■■         ▓ ▓▓▓    █
      ▓▓      ■■■■■■■   ▓▓▓▓▓   ▓   ▓  █■
       ▓■■■■■■■ ▓▓▓▓▓■■■■■■■■■■■▓ ▓▓   ■■
  ■■█     ▓▓▓▓    ▓▓              █■■  ■
  ■■ █   ▓▓■■■■    ▓▓▓▓ ▓▓▓▓     █■■   ■
   ■■ █ ▓▓    ■■■■ ▓▓    ▓▓▓   ██ ■    ■
    ■■██     ▓▓  ■■■■■■■■■■   ██  ■   ■■
     ■ ██  ▓▓▓        ▓▓▓▓▓ ██    ■
     ■■ ██  ▓▓  ▓▓     ▓▓  ██■   ■■
     ■■  █     ▓  ■■■■▓ ▓▓██ ■   ■
     ■   ██■■■■      ▓▓ ▓ █ ■■  ■■
          █▓▓    ■■■■ ▓ ▓██ ■   ■
          ■█ ▓      ■▓   █  ■■■
         ■■██  ▓ ▓■■■■■ ██    ■
        ■■  █ ▓ ■■■▓    █     ■■
        ■   ██▓■■      ██■
        ■       ▓■■■   █ ■
              █  ▓▓■■ ██ ■
               █  ▓▓ ██  ■
                ██ ▓██   ■
                 ██ █
                  ███
                   ██
            `.trimEnd(),

            grass: `
  ███████████████   ■████████████████████  ███  █████
     ▓ ▓▓   ▓       ■■             ▓▓▓
      ▓      ▓   ▓    ■   ▓▓▓  ▓
      ■                ■                 ▓    ▓ ▓
 █      ■                ■       ■■■■■     ▓▓▓
  █                       ■ ■■■■■■ ▓▓  ▓
  █▓         ▓▓     ▓   ■■■■
   ▓  ▓    ▓▓▓   ▓▓ ■■■■         ▓ ▓▓▓    █
      ▓▓                ▓▓▓▓▓   ▓   ▓  █■
   █   ▓■■  ■   ▓▓▓▓ ■■■■■■       ▓▓    ■
  ■ █  ▓▓    ▓    ▓▓              █■■
  ■  ██  ▓▓■■                    █■■   ■
   ■  █       ■■                █      ■
       █  ▓▓ ▓▓  ■■■■    ■■    █  ■   ■■
        █  ▓                ██    ■
            ▓▓  ▓      ▓▓  ██■    ■
     ■         ▓  ■■■■▓      ■   ■
     ■     ■■■               ■   ■
          █ ▓    ■■■■ ▓     ■   ■
           █ ▓     ▓■       ■
         ■ █   ▓ ▓■■■■■       ■
        ■   █   ■■■           ■
        ■   █  ■■        ■
        ■       ▓   ▓  █
              █  ▓▓■■
               █ ▓   █   ■
                █        ■
                 █
                  █
            `.trimEnd(),
        },
    }),

    // How many maze layers, including the top, there should be
    mazeDepth: 4,

    build: () => {
        const art = TITLE_SCREEN.spire.asciiArt;

        const $spire = document.createElement("div");
        $spire.id = "spire";

        const $mazeTop = document.createElement("pre");
        $mazeTop.className = "top";
        $mazeTop.textContent = art.mazeTop;
        $spire.appendChild($mazeTop);

        for (let i=1; i<TITLE_SCREEN.spire.mazeDepth; i++) {
            const $mazeLayer = document.createElement("pre");
            $mazeLayer.className = "top";
            $mazeLayer.textContent = art.maze;
            $spire.appendChild($mazeLayer);
        }

        const $skyline = document.createElement("pre");
        $skyline.className = "skyline";
        $skyline.textContent = art.skyline;
        $spire.appendChild($skyline);

        const $island = document.createElement("pre");
        $island.className = "island";

        const $islandMask = document.createElement("div");
        $islandMask.className = "mask";
        $islandMask.textContent = art.island.mask;
        $island.appendChild($islandMask);

        const $islandBaseRock = document.createElement("div");
        $islandBaseRock.className = "baseRock";
        $islandBaseRock.textContent = art.island.baseRock;
        $island.appendChild($islandBaseRock);

        const $islandRock = document.createElement("div");
        $islandRock.className = "rock";
        $islandRock.textContent = art.island.rock;
        $island.appendChild($islandRock);

        const $islandBaseGrass = document.createElement("div");
        $islandBaseGrass.className = "baseGrass";
        $islandBaseGrass.textContent = art.island.baseGrass;
        $island.appendChild($islandBaseGrass);

        const $islandGrass = document.createElement("div");
        $islandGrass.className = "grass";
        $islandGrass.textContent = art.island.grass;
        $island.appendChild($islandGrass);

        $spire.appendChild($island);

        return $spire;
    },
});

TITLE_SCREEN.starfield = {
    options: {
        cylinderRadius: 600,
        spawnRadiusSide: 600, // Same as cylinderRadius
        spawnRadiusTop: 0,
        spawnHeightZ: {
            min: -10,
            max: 20,
        },
        upwardVelocity: {
            min: 80,
            max: 180,
        },
        jitter: 40,
        particleSize: {
            min: 1,
            max: 2,
        },
        particleCount: 900,
        particleLifeMs: 6000,
        particleFadeInMs: 1600,
        camera: {
            focal: 500,
            distance: 700,
            sidePitchDegrees: 90,
            topPitchDegrees: 0,
        },
        transition: {
            tiltDurationMs: 1100,
            emitRadiusDurationMs: 1100,
        },
    },

    state: {
        isActive: false,
        particles: [],
        lastTimeMs: -1,
        pitchFromDeg: 90,
        pitchToDeg: 90,
        pitchStartTimeMs: -1,
        emitRadiusFrom: -1,
        emitRadiusTo: -1,
        emitRadiusStartTimeMs: -1,
    },

    $canvas: null,

    initialize: () => {
        const starfield = TITLE_SCREEN.starfield;
        const options = starfield.options;
        const state = starfield.state;
        starfield.$canvas = document.getElementById("backgroundStarfield");
        const context = starfield.$canvas.getContext("2d", { alpha: true });

        starfield.resizeCanvas();
        window.addEventListener("resize", starfield.resizeCanvas);
        window.addEventListener(
            "visibilitychange",
            starfield.visibilityChange
        );

        state.particles = new Array(starfield.options.particleCount);
        state.lastTimeMs = performance.now();

        state.pitchFromDeg = starfield.options.camera.sidePitchDegrees;
        state.pitchToDeg = starfield.options.camera.sidePitchDegrees;
        state.pitchStartTimeMs = -1;

        state.emitRadiusFrom = options.spawnRadiusSide;
        state.emitRadiusTo = options.spawnRadiusSide;
        state.emitRadiusStartTimeMs = -1;

        state.isActive = true;

        function initParticles() {
            const options = TITLE_SCREEN.starfield.options;
            const nowMs = performance.now();
            const initialRadius = TITLE_SCREEN.starfield.isTopMode()
                ? options.spawnRadiusTop
                : options.spawnRadiusSide;

            for (let i = 0; i < options.particleCount; i++) {
                state.particles[i] = {};
                TITLE_SCREEN.starfield.spawnParticle(
                    state.particles[i],
                    nowMs,
                    initialRadius
                );

                state.particles[i].spawnTimeMs -=
                    Math.random() * options.particleLifeMs;
            }
        }

        initParticles();
        requestAnimationFrame(starfield.updateAndRender);
    },

    updateAndRender: () => {
        const starfield = TITLE_SCREEN.starfield;
        const options = starfield.options;
        const state = starfield.state;
        const nowMs = performance.now();
        let deltaTimeMs = nowMs - state.lastTimeMs;

        if (deltaTimeMs > 80) {
            deltaTimeMs = 80;
        }

        const deltaTimeSec = deltaTimeMs / 1000;
        state.lastTimeMs = nowMs;

        const pitchDeg = starfield.currentPitchDeg(nowMs);
        const emitRadius = starfield.currentEmitRadius(nowMs);

        /* Physics step */
        for (let i = 0; i < options.particleCount; i++) {
            const p = state.particles[i];
            if (! p) {
                break;
            }

            p.velocityX += p.accelX * deltaTimeSec;
            p.velocityY += p.accelY * deltaTimeSec;
            p.velocityZ += p.accelZ * deltaTimeSec;

            p.positionX += p.velocityX * deltaTimeSec;
            p.positionY += p.velocityY * deltaTimeSec;
            p.positionZ += p.velocityZ * deltaTimeSec;

            /* Keep the cloud roughly bounded sideways */
            const radialSq = p.positionX * p.positionX +
                p.positionY * p.positionY;

            const maxR = options.cylinderRadius * 1.25;
            const maxRSq = maxR * maxR;

            const shouldNudgeInward = radialSq > maxRSq;

            if (shouldNudgeInward) {
                const len = Math.sqrt(radialSq) || 1;

                p.positionX *= maxR / len;
                p.positionY *= maxR / len;

                p.velocityX *= 0.5;
                p.velocityY *= 0.5;
            }

            /* Recycle when very far above camera */
            const isAboveCamera = p.positionZ >
                options.camera.distance - 20;

            if (isAboveCamera) {
                p.spawnTimeMs = 0; /* mark as expired */
            }

            starfield.respawnIfDead(p, nowMs, emitRadius);
        }

        /* Clear + paint */
        const context = starfield.$canvas.getContext("2d", { alpha: true });
        context.globalAlpha = 1;
        context.clearRect(
            0,
            0,
            starfield.$canvas.clientWidth,
            starfield.$canvas.clientHeight
        );

        context.fillStyle = "#e8ecf4";

        const screen = { x: 0, y: 0, alpha: 1 };

        for (let i = 0; i < options.particleCount; i++) {
            const p = state.particles[i];
            if (! p) {
                break;
            }

            const centerY =
                (starfield.$canvas.clientHeight / 2) *
                (
                    1 +
                    starfield.currentEmitRadius(nowMs) /
                    options.cylinderRadius
                );

            starfield.projectToScreen(
                p.positionX, p.positionY, p.positionZ,
                pitchDeg, screen, centerY
            );

            const ageMs = nowMs - p.spawnTimeMs;

            starfield.drawParticle(p, ageMs, screen);
        }

        if (state.isActive) {
            requestAnimationFrame(starfield.updateAndRender);
        }
    },

    projectToScreen: (px, py, pz, pitchDeg, out, centerY) => {
        const starfield = TITLE_SCREEN.starfield;
        const options = starfield.options;
        const pitchRad = pitchDeg * Math.PI / 180;

        const cosA = Math.cos(pitchRad);
        const sinA = Math.sin(pitchRad);

        const rx = px;
        const ry = py * cosA - pz * sinA;
        const rz = py * sinA + pz * cosA;

        const denom = options.camera.distance - rz;
        const safeDenom = Math.max(denom, 1);

        const scale = options.camera.focal / safeDenom;
        const centerX = starfield.$canvas.clientWidth * 0.5;

        out.x = centerX + rx * scale;
        out.y = centerY + ry * scale;
        out.alpha = starfield.clamp01(1 - (rz / options.camera.distance));
    },

    drawParticle: (p, ageMs, screen) => {
        const fadeInProgress = Math.min(
            ageMs / TITLE_SCREEN.starfield.options.particleFadeInMs, 1
        );

        /* Depth fades plus a soft fade-in */
        const baseAlpha = 0.15 + 0.85 * fadeInProgress;
        const alpha = baseAlpha * screen.alpha;

        const context = TITLE_SCREEN.starfield.$canvas
            .getContext("2d", { alpha: true });
        context.globalAlpha = alpha;
        context.fillStyle = p.color || "#ADA1A6";
        context.beginPath();
        context.rect(
            screen.x - p.size,
            screen.y - p.size,
            p.size * 2,
            p.size * 2
        );

        context.fill();
    },

    respawnIfDead: (p, nowMs, emitRadius) => {
        const ageMs = nowMs - p.spawnTimeMs;
        if (ageMs < p.lifeTimeMs) {
            return;
        }

        TITLE_SCREEN.starfield.spawnParticle(p, nowMs, emitRadius);
    },

    beginTransition: () => {
        const starfield = TITLE_SCREEN.starfield;
        const options = starfield.options;
        const state = starfield.state;
        const nowMs = performance.now();

        state.pitchFromDeg = starfield.currentPitchDeg(nowMs);
        state.emitRadiusFrom = starfield.currentEmitRadius(nowMs);

        if (starfield.isTopMode()) {
            state.pitchToDeg = options.camera.topPitchDegrees;
            state.emitRadiusTo = options.spawnRadiusTop;
        } else {
            state.pitchToDeg = options.camera.sidePitchDegrees;
            state.emitRadiusTo = options.spawnRadiusSide;
        }

        state.pitchStartTimeMs = nowMs;
        state.emitRadiusStartTimeMs = nowMs;
    },

    currentPitchDeg: (nowMs) => {
        const starfield = TITLE_SCREEN.starfield;
        const state = starfield.state;

        if (state.pitchStartTimeMs < 0) {
            return state.pitchToDeg;
        }

        const t = starfield.clamp01(
            (nowMs - state.pitchStartTimeMs) /
            starfield.options.transition.tiltDurationMs
        );

        const k = starfield.easeInOutCubic(t);
        const value = state.pitchFromDeg +
            (state.pitchToDeg - state.pitchFromDeg) * k;

        if (t >= 1) {
            state.pitchStartTimeMs = -1;
        }

        return value;
    },

    currentEmitRadius: (nowMs) => {
        const starfield = TITLE_SCREEN.starfield;
        const state = starfield.state;

        if (state.emitRadiusStartTimeMs < 0) {
            return state.emitRadiusTo;
        }

        const t = starfield.clamp01(
            (nowMs - state.emitRadiusStartTimeMs) /
            starfield.options.transition.emitRadiusDurationMs
        );

        const k = starfield.easeInOutCubic(t);
        const radius = state.emitRadiusFrom +
            (state.emitRadiusTo - state.emitRadiusFrom) * k;

        if (t >= 1) {
            state.emitRadiusStartTimeMs = -1;
        }

        return radius;
    },

    clamp01: (v) => v < 0 ? 0 : (v > 1 ? 1 : v),
    easeInOutCubic: (t) => {
        if (t < 0.5) {
            const a = t * 2;
            return 0.5 * a * a * a;
        }

        const a = (1 - t) * 2;
        return 1 - 0.5 * a * a * a;
    },

    resizeCanvas: () => {
        const context =
            TITLE_SCREEN.starfield.$canvas.getContext("2d", { alpha: true });
        const pixelRatio = window.devicePixelRatio || 1;
        const widthCss = window.innerWidth;
        const heightCss = window.innerHeight;

        const widthPx = Math.floor(widthCss * pixelRatio);
        const heightPx = Math.floor(heightCss * pixelRatio);

        const shouldResize =
            TITLE_SCREEN.starfield.$canvas.width !== widthPx ||
            TITLE_SCREEN.starfield.$canvas.height !== heightPx;

        if (! shouldResize) {
            return;
        }

        TITLE_SCREEN.starfield.$canvas.width = widthPx;
        TITLE_SCREEN.starfield.$canvas.height = heightPx;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(pixelRatio, pixelRatio);
    },

    visibilityChange: () => {
        const starfield = TITLE_SCREEN.starfield;
        starfield.state.isActive = ! document.hidden;
        if (starfield.state.isActive) {
            requestAnimationFrame(starfield.updateAndRender);
        }
    },

    isTopMode: () =>
        document.getElementById("titleScreen").classList.contains("go"),

    spawnParticle: (p, nowMs, emitRadius) => {
        function numberBetween(min, max) {
            if (min > max) {
                [min, max] = [max, min];
            }

            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const options = TITLE_SCREEN.starfield.options;
        const theta = Math.random() * Math.PI * 2;
        const r = emitRadius * Math.sqrt(Math.random());
        const startX = Math.cos(theta) * r;
        const startY = Math.sin(theta) * r;
        const startZ = numberBetween(
            options.spawnHeightZ.min,
            options.spawnHeightZ.max
        );
        const upward = numberBetween(
            options.upwardVelocity.min,
            options.upwardVelocity.max
        );

        p.color = Math.random() < 0.5 ? "#cbb3bb" : "#6b4b69";
        p.positionX = startX;
        p.positionY = startY;
        p.positionZ = startZ;

        p.velocityX = numberBetween(-options.jitter, options.jitter);
        p.velocityY = numberBetween(-options.jitter, options.jitter);
        p.velocityZ = upward;

        p.accelX = 0;
        p.accelY = 0;
        p.accelZ = 0;

        p.size = numberBetween(
            options.particleSize.min,
            options.particleSize.max
        );
        p.spawnTimeMs = nowMs;
        p.lifeTimeMs = options.particleLifeMs;
    },
};

TITLE_SCREEN.lightning = {
    characters: [
        `
         🭄🭌🬿
      🭇🭃🮋🮋🭛             🭈🬼
      🭃🮋🮋🮋🮋🮋🭍🭂🮋🮋🮋🮋🮋🮋🭀
   🭇🭃🮋🮋🮋🮋🮋🭝🭒🮋🮋🮋🮋🮋🮋🮋🭛
   🭃🮋🮋🭡             🭋🮋🮋🮋🭛
🭇🭃🮋█🭝🭙             🭅🮋🮋🭟
            🭇🭃🭌🬿  🭋🮋🮋🭟🭗
             🭣🭧🭓🮋🮋🮋🮋🭟
                  🭣🮋🮋🮋🮋🭍🭑🬼
                   🭅🮋🭟🭥🭓🮋🮋🭛
                  🭅🮋🭟
              🭈🭄🭝🭜🭗
          🭈🭄🭝🭜🭗
     🭈🭄🮋🭝🭜🭗
 🭈🭄🮋🭝🭜🭗
 🭣🬂🬂🭘
        `.trimEnd(),

        `
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🮋    🮋🮋
        🮋🭡    🮋🮋       🭉🭁🭌🬾
       🭅🮋     🮋🮋     🭉🭁🮋🭟🭗
       🮋🮋     🮋🮋   🭉🭁🮋🭝🭙
       🮋🭡     🮋🮋🬽🭉🭁🮋🭝🭙
      🭅🮋      🮋🮋🮋🮋🮋🭝🭙
      🮋🮋      🭖🮋🮋🮋🭝🭙
      🮋🮋      🭦🮋🮋🭝🭙
        `.trimEnd(),

        `
        🮋🮋
        🮋🮋         🭔🭌🬾 🭔🭌🬾
        🮋🮋         🭢🭔🭌🬾 🭔🭌🬾
        🮋🮋           🭢🭔🭌🬾 🭔🭌🬾
        🮋🮋🬿
        🮋🮋🮋🭌🬿
        🮋🮋🭥🭒🮋🭌🬿
        🮋🮋   🭥🭒🮋🭌🬿
        🮋🮋      🭥🭒🮋🭌🬿
        🮋🮋         🭥🭒🮋🭌🬿
        🮋🮋            🭥🭒🮋🭌
        🮋🮋
        🮋🮋
        🮋🮋
        🮋🮋
        🮋🮋
        `.trimEnd(),
    ],

    build: () => {
        const characters = TITLE_SCREEN.lightning.characters;
        $lightning = document.createElement("div");
        $lightning.className = "lightning";

        for (let i=0; i<characters.length; i++) {
            const $character = document.createElement("span");
            $character.textContent = characters[i];
            $lightning.appendChild($character);
        }

        return $lightning;
    },
};

TITLE_SCREEN.distantLightning = {
    bolts: [
        `
  ╲
  ╱╲
 ╱╲
╱ ╱
 ╱╲
╱
        `.trimEnd(),
        `
   ╱
  ╱
 ╱╲
╱ ╱╲
 ╱  ╲
╱╲   ╲
     ╱╲
    ╱  ╲
   ╱
        `.trimEnd(),
    ],

    build: () => {
        const $distantLightning = document.createElement("div");
        $distantLightning.className = "distantLightning";

        const bolts = TITLE_SCREEN.distantLightning.bolts;

        for (let i=0; i<bolts.length; i++) {
            $bolt = document.createElement("span");
            $bolt.textContent = bolts[i];
            $distantLightning.appendChild($bolt);
        }

        return $distantLightning;
    },
};

TITLE_SCREEN.content = {
    build: () => {
        const $content = document.createElement("div");
        $content.append(TITLE_SCREEN.logo.build());

        const $startGameButton = document.createElement("div");
        $startGameButton.id = "startGameBtn";
        $startGameButton.innerHTML = `
            <div>Press [ENTER]</div>
            <div>to begin your descent into</div>
            <div>the TardSpire...</div>
        `;
        $content.append($startGameButton);

        const $preloaderStatus = document.createElement("div");
        $preloaderStatus.id = "preloaderStatus";
        $preloaderStatus.innerHTML = `
            <div id="loadingBarContainer" class="loadingBarContainer">
                <div id="loadingBar"></div>
                <span id="loadingBarText">Checking files...</span>
                <button class="skipPreloaderBtn" onclick="trySkipPreload()">
                    Skip Preloading
                </button>
            </div>
        `;
        $content.append($preloaderStatus);

        const $spireScene = document.createElement("div");
        $spireScene.id = "spireScene";

        const $spireContainer = document.createElement("div");
        $spireContainer.id = "spireContainer";
        $spireContainer.append(TITLE_SCREEN.spire.build());
        $spireScene.append($spireContainer);

        $content.append($spireScene);

        return $content;
    },
};

TITLE_SCREEN.credits = {
    build: () => {
        const previewBuildUrl =
            "https://milklounge.wang/tardquest/gamedata/game_preview.html";

        const $credits = document.createElement("div");
        $credits.id = "credits";
        $credits.innerHTML = `
            <div>
                A Javascript game by
                <a
                    href="https://milklounge.wang/tardquest/"
                    target="_blank"
                >Xx_TheMilkMan69_xX</a>
                and
                <a
                    href="https://packardbell95.com/"
                    target="_blank"
                >MySpace Tom</a>
            </div>
            <div>
                TardQuest™ (${ new Date().getFullYear() }) ||
                <a
                    href="https://github.com/packardbell95/tardquest"
                    target="_blank"
                >GitHub</a> ||
                <a
                    href="${previewBuildUrl}"
                >Preview Build</a>
            </div>
        `;

        return $credits;
    },
};

TITLE_SCREEN.initialize = ($e) => {
    if (! $e instanceof Element) {
        console.error("The title screen target is not an element", { $e });
        return;
    }

    $e.classList.remove("hidden");

    const $canvas = document.createElement("canvas");
    $canvas.id = "backgroundStarfield";
    $e.append($canvas);

    $e.append(TITLE_SCREEN.distantLightning.build());
    $e.append(TITLE_SCREEN.lightning.build());
    $e.append(TITLE_SCREEN.content.build());
    $e.append(TITLE_SCREEN.credits.build());

    TITLE_SCREEN.starfield.initialize();
    TITLE_SCREEN.isActive = true;
};

TITLE_SCREEN.startGame = ($e, callback) => {
    if (! TITLE_SCREEN.isActive) {
        // The title screen isn't active, so there's nothing to do
        return;
    }

    if (! $e instanceof Element) {
        console.warn("The title screen target is not an element", { $e });
    }

    const starfield = TITLE_SCREEN.starfield;

    window.removeEventListener("resize", starfield.resizeCanvas);
    window.removeEventListener("visibilitychange", starfield.visibilityChange);

    document.getElementById("titleScreen").classList.add("go");
    document.body.classList.add("go");
    starfield.beginTransition();

    setTimeout(() => {
        starfield.state.isActive = false;
        starfield.state.particles = new Array();
        if (typeof $e?.replaceChildren === "function") {
            $e.classList.add("hidden");
            $e.replaceChildren();
            TITLE_SCREEN.isActive = false;
            if (typeof callback === "function") {
                callback();
            }
        }
    }, 2000);
};
