// Tests for Menu
function Menu_allTests()
{
    const menu = new Menu(document.createElement("div"));
    menu.setMenus({
        foo: {
            title: "Foo",
            getOptions: () => [{ id: "_back", displayText: "Back", }],
            select: () => {},
        },
        bar: {
            title: "Bar",
            getOptions: () => [{ id: "_back", displayText: "Back", }],
            select: () => {},
        },
        baz: {
            title: "Baz",
            getOptions: () => [{ id: "_back", displayText: "Back", }],
            select: () => {},
        },
        quux: {
            title: "Quux",
            getOptions: () => [{ id: "_back", displayText: "Back", }],
            select: () => {},
        },
    });

    test(
        "Getting a menu's full title",
        () => {
            Assert.isNull(
                menu.getFullTitle(),
                "The menu's title is null because the menu is not open"
            );

            menu.open("foo");
            Assert.equals(
                "Foo",
                menu.getFullTitle(),
                "One menu is open"
            );

            menu.open("bar");
            Assert.equals(
                "Foo > Bar",
                menu.getFullTitle(),
                "Two menus are open"
            );

            menu.open("baz");
            menu.open("quux");
            Assert.equals(
                "Foo > Bar > Baz > Quux",
                menu.getFullTitle(),
                "Four menus are open"
            );

            menu.close();
            Assert.equals(
                "Foo > Bar > Baz",
                menu.getFullTitle(),
                "Three menus are open"
            );

            menu.open("foo");
            menu.open("bar");
            menu.open("baz");
            Assert.equals(
                "Foo > Bar > Baz > Foo > Bar > Baz",
                menu.getFullTitle(),
                "Six menus are open, including duplicates"
            );

            menu.closeAll();
            Assert.isNull(
                menu.getFullTitle(),
                "The menu has been closed"
            );
        },
    );
}
