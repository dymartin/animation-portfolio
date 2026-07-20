/*
==========================================================
clock.js
Simple Windows 95 taskbar clock
==========================================================
*/

(function () {

    const clock = document.getElementById("clock");

    if (!clock) return;

    function updateClock() {

        const now = new Date();

        clock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    }

    updateClock();

    /*
        Update exactly on the next minute
        instead of every arbitrary 60 seconds.
    */

    const delay =
        (60 - new Date().getSeconds()) * 1000;

    setTimeout(() => {

        updateClock();

        setInterval(updateClock, 60000);

    }, delay);

})();