var tid;

stopLoop();
tid = null;
check();

function check() {
    chrome.storage.local.get(null, (items) => {
        var activated = Boolean(items.isActive);

        if (activated == false) {
            stopLoop();
        }

        if (items.timeLoop >= 1) {
            tid = setInterval(loopSearch, items.timeLoop * 60000);
            console.log("Start");
            if (activated == false) {
                console.log("Start.. but stoped because is not ON");
                stopLoop();
            }
        } else {
            console.log("Loop to short");
            stopLoop();
        }

        function loopSearch() {
            console.log("Search...");

            if (activated == false) {
                stopLoop();
            }

            const url =
                "https://www.emag.ro/search/telefoane-mobile/brand/apple/resigilate/" +
                items.searchFor +
                "/c";

            fetch(url)
                .then((response) => response.text())
                .then((text) => dothings(text))
                .catch((error) => console.log(error));

            function extractSummary(content) {
                var rx = /\EM\.listingGlobals\.items = \[(.*)}}]/g;
                return content.match(rx);
            }

            function dothings(values) {
                var items = extractSummary(values)[0].replace(
                    "EM.listingGlobals.items = ",
                    ""
                );

                items = JSON.parse(items);
                console.log(items);
                var countItems = Object.keys(items).length;
                chrome.storage.local.set({ items: countItems }, function () {});
            }
        }
    });
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );

        stopLoop();
        tid = null;

        check();

        if (key == "items") {
            if (newValue > oldValue) {
                var opt = {
                    type: "basic",
                    title: "STOC UPDATE",
                    message: "A aparut un produs nou pentru căutarea ta!",
                    iconUrl: "/img/icon48.png",
                };
                chrome.notifications.create("", opt);
            }
        }
    }
});

chrome.notifications.onClicked.addListener(function (notificationId, byUser) {
    chrome.storage.local.get(null, (items) => {
        chrome.tabs.create({
            url:
                "https://www.emag.ro/search/telefoane-mobile/brand/apple/resigilate/" +
                items.searchFor +
                "/c",
        });
    });
});

function stopLoop() {
    clearInterval(tid);
}
