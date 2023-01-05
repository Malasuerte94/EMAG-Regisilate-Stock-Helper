chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Installed");
  }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    cancelAlarm();
    check();
  }
});

function check() {
  chrome.storage.local.get(null, (items) => {
    var activated = Boolean(items.isActive);
    if (items.timeLoop >= 1 && activated) {
      chrome.alarms.create("loopSearch", {
        periodInMinutes: Number(items.timeLoop),
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
      if (!dbItems.searchUrl && !dbItems.searchProduct) {
        console.log("Nu ai căutari salvate!");
        return;
      }

      const url = dbItems.searchUrl + "/" + dbItems.searchProduct + "/c";

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
        var countItems = Object.keys(items).length;

        if (dbItems.itemsArray) {
          var newProducts = getDifference(items, dbItems.itemsArray);
          if (newProducts.length >= 1) {
            var newProductsCount = newProducts.length;
            console.log("- new products:" + newProductsCount);

            var newProduct = {
              type: "basic",
              title: newProductsCount + " PRODUSE NOI",
              message:
                "Au aparut " +
                newProductsCount +
                " produse noi pentru căutarea ta!",
              iconUrl: "/img/icon48.png",
            };
            chrome.notifications.create("", newProduct);
            console.log("- found items: " + countItems);
            let date = new Date().toLocaleString();

            chrome.storage.local.set({
              items: countItems,
              itemsArray: items,
              newProducts: newProducts,
              newProductsDate: date
            });
          } else {
            console.log("- no new products");
          }
        } else {
          chrome.storage.local.set({
            items: countItems,
            itemsArray: items,
            newProducts: null,
            newProductsDate: null
          });
        }
      }
    });
  }
});

chrome.notifications.onClicked.addListener(function (notificationId, byUser) {
  chrome.storage.local.get(null, (items) => {
    var url = buildLink(items.searchUrl + "/" + items.searchProduct + "/c");
    if (!url) {
      url = items.searchUrl + "/" + items.searchProduct + "/c";
    }
    chrome.tabs.create({
      url: buildLink(items.searchUrl + "/" + items.searchProduct + "/c"),
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

//affiliate build
var domains = [
  "emag.ro",
  "emag.page.link",
  "emag.page.link",
  "marketplace-leads.emag.ro",
  "stage1.emag.ro",
  "m.emag.ro",
];
var domainsHash = ["9", "9", "9", "9", "9", "9"];
var currentDomainHash = "";
var websiteId = "LYp";
var affiliateHash = "mUu";
var trackingServerDomain = "l.profitshare.ro";
var generateLinkOnLoad = true;
var sid = "searcher";
var debug = false;
var whitelistPaths = [
  /profitshare\.(ro|com|bg|hu|pl)\/l\/(.*)/,
  /profitshare\.(ro|com|bg|hu|pl)\/lps\/(.*)/,
  /w\.profitshare\.(ro|com|bg|hu|pl)/,
  /campanii\.emag\.(ro|bg|hu|pl)/,
  /campaigns\.emag\.(ro|bg|hu|pl)/,
];

function getDomainAndProtocol(url) {
  var matches = url.match(/^(https?)\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  var protocol = matches && matches[1];
  var domain = matches && matches[2];
  return { domain: domain, protocol: protocol };
}

function matchesParentDomain(domain) {
  currentDomainHash = "";
  for (var i = 0; i < domains.length; i++) {
    var suffix = "." + domains[i];
    if (domain.indexOf(suffix, domain.length - suffix.length) !== -1) {
      currentDomainHash = domainsHash[i];
      return true;
    }
  }
  return false;
}

function buildLink(url) {
  var start = new Date().getTime();
  var buildedUrl = "";
  var domainAndProtocol = getDomainAndProtocol(url);
  if (!domainAndProtocol.domain) return;

  var domainInLowerCase = domainAndProtocol.domain.toLowerCase();

  for (let index in whitelistPaths) {
    if (url.toLowerCase().match(whitelistPaths[index])) {
      return;
    }
  }

  var keyDomain = domains.indexOf(domainInLowerCase);
  if (keyDomain >= 0) {
    currentDomainHash = domainsHash[keyDomain];
  }
  if (keyDomain >= 0 || matchesParentDomain(domainInLowerCase)) {
    var extraParams = "?redirect=" + encodeURIComponent(url);
    if (sid) {
      extraParams += "&hash=" + sid;
    }
    buildedUrl =
      domainAndProtocol.protocol +
      "://" +
      trackingServerDomain +
      "/lps/" +
      currentDomainHash +
      "/" +
      affiliateHash +
      "/" +
      extraParams;
  }
  return buildedUrl;
}
