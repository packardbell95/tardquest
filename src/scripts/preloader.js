window.addEventListener('DOMContentLoaded', function() {
    const assets = [
        // cursors
        './assets/cursors/attack.cur',
        './assets/cursors/down.cur',
        './assets/cursors/grab.cur',
        './assets/cursors/left.cur',
        './assets/cursors/right.cur',
        './assets/cursors/touch.cur',
        './assets/cursors/turn-left.cur',
        './assets/cursors/turn-right.cur',
        './assets/cursors/up.cur',
    
        // fp-anim
        './assets/fp-anim/fp-torch.gif',
        './assets/fp-anim/fp-trombone.gif',
        './assets/fp-anim/rat-chomp.webm',
    
        // gamepad/generic
        './assets/gamepad/generic/d-down.png',
        './assets/gamepad/generic/d-left.png',
        './assets/gamepad/generic/d-right.png',
        './assets/gamepad/generic/d-up.png',
        './assets/gamepad/generic/L1.png',
        './assets/gamepad/generic/R1.png',
    
        // gamepad/playstation
        './assets/gamepad/playstation/circle.png',
        './assets/gamepad/playstation/cross.png',
        './assets/gamepad/playstation/select.png',
        './assets/gamepad/playstation/square.png',
        './assets/gamepad/playstation/start.png',
        './assets/gamepad/playstation/triangle.png',
    
        // gamepad/xinput
        './assets/gamepad/xinput/a.png',
        './assets/gamepad/xinput/b.png',
        './assets/gamepad/xinput/select.png',
        './assets/gamepad/xinput/start.png',
        './assets/gamepad/xinput/x.png',
        './assets/gamepad/xinput/y.png',
    
        // interface/armor
        './assets/interface/armor/barrel.png',
        './assets/interface/armor/black-plate-armor.png',
        './assets/interface/armor/graphic-tee.png',
        './assets/interface/armor/leather-armor.png',
        './assets/interface/armor/milanese-armor.png',
        './assets/interface/armor/nokia-mail.png',
        './assets/interface/armor/pectoral-mass.png',
    
        // interface/items
        './assets/interface/items/c4.png',
        './assets/interface/items/dowsing-rod.png',
        './assets/interface/items/hamms.png',
        './assets/interface/items/lean.png',
        './assets/interface/items/raisins.png',
        './assets/interface/items/toilet-water.png',
        './assets/interface/items/torch.png',
        './assets/interface/items/trombone.png',
    
        // interface/rings
        './assets/interface/rings/amp-audio.png',
        './assets/interface/rings/bloodstream-nosering.png',
        './assets/interface/rings/cockring.png',
        './assets/interface/rings/crack.png',
        './assets/interface/rings/escobar.png',
        './assets/interface/rings/french.png',
        './assets/interface/rings/gambler.png',
        './assets/interface/rings/pectoral-piercing.png',
        './assets/interface/rings/pinkytoe.png',
        './assets/interface/rings/sightliness.png',
        './assets/interface/rings/stinky.png',
        './assets/interface/rings/underwear.png',
        './assets/interface/rings/valentine.png',
    
        // interface/ui
        './assets/interface/ui/armor.png',
        './assets/interface/ui/attack.gif',
        './assets/interface/ui/confirm.png',
        './assets/interface/ui/down.png',
        './assets/interface/ui/item-border-small-bottom-left.png',
        './assets/interface/ui/item-border-small-bottom-right.png',
        './assets/interface/ui/item-border-small-top-left.png',
        './assets/interface/ui/item-border-small-top-right.png',
        './assets/interface/ui/item-border-small.png',
        './assets/interface/ui/item-border.png',
        './assets/interface/ui/items.png',
        './assets/interface/ui/left.png',
        './assets/interface/ui/next.png',
        './assets/interface/ui/persuade.gif',
        './assets/interface/ui/previous.png',
        './assets/interface/ui/right.png',
        './assets/interface/ui/rings.png',
        './assets/interface/ui/run.gif',
        './assets/interface/ui/scroll-down.png',
        './assets/interface/ui/scroll-up.png',
        './assets/interface/ui/settings.png',
        './assets/interface/ui/settings1.png',
        './assets/interface/ui/settings2.png',
        './assets/interface/ui/tardpad.png',
        './assets/interface/ui/tile1.gif',
        './assets/interface/ui/tile1.png',
        './assets/interface/ui/turn-left.png',
        './assets/interface/ui/turn-right.png',
        './assets/interface/ui/up.png',
        './assets/interface/ui/weapons.png',
    
        // interface/weapons
        './assets/interface/weapons/atlatl-spear.png',
        './assets/interface/weapons/bludgeon-mace.png',
        './assets/interface/weapons/crt.png',
        './assets/interface/weapons/dance-club.png',
        './assets/interface/weapons/fingernail.png',
        './assets/interface/weapons/golden-wang.gif',
        './assets/interface/weapons/magic-pencil.gif',
        './assets/interface/weapons/nunchucks.png',
        './assets/interface/weapons/pointy-stick.png',
        './assets/interface/weapons/wiffle-ball-bat.png',
    
        // transitions
        './assets/transitions/battle-transition.gif',
    ];

    assets.forEach(src => {
        if (/\.(png|jpg|jpeg|gif|webp)$/i.test(src)) {
            const img = new Image();
            img.src = src;
        } else if (/\.(mp3|wav|ogg)$/i.test(src)) {
            const audio = new Audio();
            audio.src = src;
        } else if (/\.(webm|mp4)$/i.test(src)) {
            const video = document.createElement('video');
            video.src = src;
        }
    });
});