/*
==========================================================
desktop.js
Desktop interaction manager
==========================================================
*/

(() => {

    const desktop =
        document.getElementById("desktop");

    const icons =
        Array.from(
            document.querySelectorAll(".desktop-icon")
        );

    const startButton =
        document.getElementById("start-button");

    const startMenu =
        document.getElementById("start-menu");

    const windows =
        Array.from(
            document.querySelectorAll(".window")
        );

    let selectedIcon = null;

    let lastClickTime = 0;

    let lastClickedIcon = null;

    /*
    ------------------------------------------------------
    Icon Selection
    ------------------------------------------------------
    */

    function clearSelection() {

        icons.forEach(icon =>
            icon.classList.remove("selected")
        );

        selectedIcon = null;

    }

    function selectIcon(icon) {

        clearSelection();

        icon.classList.add("selected");

        icon.focus();

        selectedIcon = icon;

    }

    /*
    ------------------------------------------------------
    Desktop Click
    ------------------------------------------------------
    */

    desktop.addEventListener("click", event => {

        if (
            event.target.closest(".desktop-icon")
        ) return;

        if (
            event.target.closest(".window")
        ) return;

        clearSelection();

        closeStartMenu();

    });

    /*
    ------------------------------------------------------
    Desktop Icons
    ------------------------------------------------------
    */

    icons.forEach(icon => {

        icon.addEventListener("click", e => {

            e.preventDefault();

            const now = Date.now();

            /*
                Double click
            */

            if (

                lastClickedIcon === icon &&

                now - lastClickTime < 350

            ) {

                window.location.href = icon.href;

                return;

            }

            lastClickedIcon = icon;

            lastClickTime = now;

            selectIcon(icon);

        });

    });

    /*
    ------------------------------------------------------
    Keyboard Navigation
    ------------------------------------------------------
    */

    document.addEventListener("keydown", e => {

        if (
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA"
        ) return;

        let index =
            icons.indexOf(selectedIcon);

        switch (e.key) {

            case "ArrowDown":

                e.preventDefault();

                index =
                    Math.min(
                        icons.length - 1,
                        index + 1
                    );

                selectIcon(
                    icons[index]
                );

                break;

            case "ArrowUp":

                e.preventDefault();

                index =
                    Math.max(
                        0,
                        index - 1
                    );

                selectIcon(
                    icons[index]
                );

                break;

            case "Tab":

                e.preventDefault();

                index++;

                if (
                    index >= icons.length
                ) {

                    index = 0;

                }

                selectIcon(
                    icons[index]
                );

                break;

            case "Enter":

                if (selectedIcon) {

                    window.location.href =
                        selectedIcon.href;

                }

                break;

            case "Escape":

                clearSelection();

                closeStartMenu();

                break;

        }

    });

    /*
    ------------------------------------------------------
    Window Focus
    ------------------------------------------------------
    */

    function focusWindow(windowElement) {

        windows.forEach(win => {

            win.classList.remove("active-window");

            win.classList.add("inactive");

        });

        windowElement.classList.remove("inactive");

        windowElement.classList.add("active-window");

    }

    windows.forEach(win => {

        win.addEventListener("mousedown", () => {

            focusWindow(win);

        });

    });

    /*
    ------------------------------------------------------
    Start Menu
    ------------------------------------------------------
    */

    function openStartMenu() {

        startMenu.hidden = false;

    }

    function closeStartMenu() {

        startMenu.hidden = true;

    }

    function toggleStartMenu() {

        startMenu.hidden
            ? openStartMenu()
            : closeStartMenu();

    }

    if (startButton) {

        startButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleStartMenu();

            }
        );

    }

    document.addEventListener(
        "click",
        event => {

            if (
                startMenu.hidden
            ) return;

            if (
                event.target.closest("#start-menu")
            ) return;

            if (
                event.target.closest("#start-button")
            ) return;

            closeStartMenu();

        }
    );

    /*
    ------------------------------------------------------
    Prevent dragging images
    ------------------------------------------------------
    */

    document.querySelectorAll("img")
        .forEach(img => {

            img.draggable = false;

        });

    /*
    ------------------------------------------------------
    Video Fullscreen
    ------------------------------------------------------
    */

    document
        .querySelectorAll("video")
        .forEach(video => {

            video.addEventListener(
                "click",
                () => {

                    if (
                        video.requestFullscreen
                    ) {

                        video.requestFullscreen();

                    }

                }
            );

        });

})();