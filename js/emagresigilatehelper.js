refreshPage();
let btn = document.createElement("button");
btn.classList.add("button_emagHelper");
btn.innerHTML = "Salveză în EmagResigilateAlert";
document.body.appendChild(btn);

btn.addEventListener("click", function () {
    console.log("-- Salvare -- ");
    const cautarea = document.querySelector("input#searchboxTrigger");

    const url = window.location.href;
    const smallUrl = url.match(/(.*)resigilate/g);
    let affLink = buildLink(window.location.href);
    
    chrome.storage.local.set(
      {
        searchUrl: smallUrl[0],
        searchProduct: cautarea.value,
        manualUrl: affLink,
      },
      function () {}
    );
});

btn.addEventListener("mouseup", function () {
    btn.blur();
});

function refreshPage() {
    chrome.storage.local.get(null, (dbItems) => {
        if (dbItems.itemsArray) {
            dbItems.itemsArray.forEach((item) => {
                if (
                    document.querySelector(`[data-offer-id="${item.offer.id}"]`)
                ) {
                    let product = document.querySelector(
                        `[data-offer-id="${item.offer.id}"]`
                    );
                    product.classList.add("allreadyhere");
                }
            });
        }
        if (dbItems.newProducts) {
            dbItems.newProducts.forEach((item) => {
                if (
                    document.querySelector(`[data-offer-id="${item.offer.id}"]`)
                ) {
                    let product = document.querySelector(
                        `[data-offer-id="${item.offer.id}"]`
                    );
                    product.classList.remove("allreadyhere");
                    product.classList.add("produsnou");
                }
            });
            //console.log(dbItems.newProducts);
        }
    });
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
