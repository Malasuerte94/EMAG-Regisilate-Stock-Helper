chrome.storage.local.get(null, (dbItems) => {
    if (dbItems.itemsArray) {
        dbItems.itemsArray.forEach((item) => {
            if (document.querySelector(`[data-offer-id="${item.offer.id}"]`)) {
                let product = document.querySelector(
                    `[data-offer-id="${item.offer.id}"]`
                );
                product.classList.add("allreadyhere");
            }
        });
    }
    if (dbItems.newProducts) {
        console.log(dbItems.newProducts);
    }
});

let btn = document.createElement("button");
btn.classList.add("button_emagHelper");
btn.innerHTML = "Salveză în EmagResigilateAlert";
document.body.appendChild(btn);

btn.addEventListener("click", function () {
    console.log("Ai dat click:");
    const cautarea = document.querySelector("input#searchboxTrigger");

    const url = window.location.href;
    const smallUrl = url.match(/(.*)resigilate/g);

    console.log(cautarea.value);
    console.log(smallUrl[0]);

    //setare produs si url
    chrome.storage.local.set(
        {
            searchUrl: smallUrl[0],
            searchProduct: cautarea.value,
        },
        function () {}
    );
});

btn.addEventListener("mouseup", function () {
    btn.blur();
});
