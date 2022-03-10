chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );

        cancelAlarm();
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

function check() {
    chrome.storage.local.get(null, (items) => {
        var activated = Boolean(items.isActive);
        if (items.timeLoop >= 1 && activated) {
            chrome.alarms.create("loopSearch", {
                periodInMinutes: Number(items.timeLoop),
                //periodInMinutes: 0.1,
            });
            console.log("Start");
        } else {
            cancelAlarm();
            console.log("Loop to short / Not Started");
        }
    });
}

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == "loopSearch") {
        chrome.storage.local.get(null, (dbItems) => {
            console.log("Search...");
            const url =
                "https://www.emag.ro/search/telefoane-mobile/brand/apple/resigilate/" +
                dbItems.searchFor +
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

                if (dbItems.itemsArray) {
                    //console.log(dbItems.itemsArray);
                    var newLenght = getDifference(items, dbItems.itemsArray);
                    if (newLenght.length >= 1) {
                        var newProductsCount = newLenght.length;
                        console.log("- new products:" + newProductsCount);

                        var newProduct = {
                            type: "basic",
                            title: newProductsCount + "PRODUSE NOI",
                            message:
                                "Au aparut " +
                                newProductsCount +
                                " produse noi pentru căutarea ta!",
                            iconUrl: "/img/icon48.png",
                        };
                        chrome.notifications.create("", newProduct);

                    } else {
                        console.log("- no new products");
                    }
                }

                var countItems = Object.keys(items).length;
                console.log("- found items: " + countItems);

                chrome.storage.local.set(
                    { items: countItems, itemsArray: items },
                    function () {}
                );
            }
        });
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

function getDifference(array1, array2) {
    return array1.filter((object1) => {
        return !array2.some((object2) => {
            return object1.id === object2.id;
        });
    });
}

function cancelAlarm() {
    console.log("Cancel Looper");
    chrome.alarms.clear("loopSearch");
}
