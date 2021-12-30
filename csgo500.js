var filtered = {}
var buyQueue = []
var sideMenu = []
var sideMenuData = {}
var currentlyBuying = undefined
var autoBuyList = {}
var buffautoBuyList = {}
var buffBlackList = {}
var maxbuy = {}
var buff = {}
var meta
var balance
//var token2 = token1
var itemData
var discordHook = "https://discord.com/api/webhooks/768784584119681075/Aa6w4pP3I4jMPMkwqrIaXNUnj6eVnxaVbj6UOVBKmVtYQe2PzRRK8QUNbXGkvFTs5x-W"
var currentTrade
var currIcon
//current buy stuff
var itemName
var price
var wear
var actTrade
var shadow = {}

var numRetries = 0
var numFails = 0
//

var maxRetries = 12
var retryAfter = 2
var retryAfterTimer = 2

//CSGO500 page
var page = 1

var apiRefresh = 0.9
var countDown = 1
var countDownUnreliable = 1

var stickers = false
var pins = false

const dopplerPhases = {
    418: 'Phase 1', //doppler phase 1
    419: 'Phase 2', //doppler phase 2
    420: 'Phase 3', //doppler phase 3
    421: 'Phase 4', //doppler phase 4

    569: 'Phase 1', //gamma doppler phase 1
    570: 'Phase 2', //gamma doppler phase 2
    571: 'Phase 3', //gamma doppler phase 3
    572: 'Phase 4', //gamma doppler phase 4
}

var BUX = 1666;

function nameCreatorShort(market_name) {
    var e = market_name,
        t = /(.+) \| (.+) \((.+)\)/.exec(e);
    if (t) {
        var a = e.split(" - ");
        a.length > 1 && (t[2] += " - ".concat(a[1]));
        var n = t[3];
        return {
            full: e,
            base: e.replace(" (".concat(t[3], ")"), ""),
            type: t[1],
            name: t[2],
            quality_short: n.replace(/[a-z\-\s]/g, "")
        }
    }
    return t = /(.+) \| (.+)/.exec(e), t ? {
        full: e,
        base: e,
        type: t[1],
        name: t[2]
    } : {
        full: e,
        base: e,
        name: e
    }
}

function nameCreator(marketname) {
    var e = marketname,
        t = /(.+) \| (.+) \((.+)\) \| (.+)/.exec(e);
    if (t) {
        var a = e.split(" - ");
        a.length > 1 && (t[2] += " - ".concat(a[1]));
        var n = t[3];
        return {
            full: e,
            base: e.replace(" (".concat(t[3], ")"), ""),
            type: t[1],
            name: "".concat(t[2], " - ").concat(t[4]),
            quality: n
        }
    }
    if (t = /(.+) \| (.+) \((.+)\)/.exec(e), t) {
        var i = e.split(" - ");
        i.length > 1 && (t[2] += " - ".concat(i[1]));
        var l = t[3];
        return {
            full: e,
            base: e.replace(" (".concat(t[3], ")"), ""),
            type: t[1],
            name: t[2],
            quality: l
        }
    }
    if (t = /(.+) \| (.+) \| (.+)/.exec(e), t) {
        var o = e.split(" - ");
        return o.length > 1 && (t[2] += " - ".concat(o[1])), {
            full: e,
            base: e,
            type: t[1],
            name: "".concat(t[2], " - ").concat(t[3])
        }
    }
    return t = /(.+) \| (.+)/.exec(e), t ? {
        full: e,
        base: e,
        type: t[1],
        name: t[2]
    } : {
        full: e,
        base: e,
        name: e
    }
}
async function getBalance() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `http://localhost:3000/api/csgo500/balance`,
            contentType: "application/json; charset=utf-8",
            error: function (er) {
                console.log("Something went wrong getting meta data (check if logged in)")
                console.error(er)
                reject()
            },
            success: function (dat) {
                if (dat != "Cookies expired" && !dat.statusCode) {
                    //console.log(dat.balance);
                    //console.log(JSON.parse(dat));
                    dat = JSON.parse(dat);
                    //console.log(dat.userData.balances);

                    //this was old code befoer API Update
                    /* var scriptNodes = dat.substring(dat.lastIndexOf(`balances = {"bux":`)+1,dat.lastIndexOf(`balances = {"bux":`)+40);
                    scriptNodes= scriptNodes.substring(scriptNodes.indexOf(`":`)+2,scriptNodes.indexOf(`};`));
                    console.log(scriptNodes)*/
                    console.log()
                    // console.log(dat.userData.balances.substring(dat.userData.balances.lastIndexOf(`{"bux":`)+1,dat.userData.balances.lastIndexOf(`":`)));
                    //meta = JSON.parse(dat)
                    //console.log(dat);
                    balance = JSON.parse(dat.userData.balances).bux / BUX;
                    updateBalance()

                } else {
                    console.log("Something went wrong getting balance data (check if logged in)")
                    balance = undefined
                    //meta = undefined
                }
                resolve()
            }
        });
    })
}
async function getMeta() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `http://localhost:3000/api/csgo500/meta`,
            contentType: "application/json; charset=utf-8",
            error: function (er) {
                console.log("Something went wrong getting meta data (check if logged in)")
                console.error(er)
                reject()
            },
            success: function (dat) {
                if (dat != "Cookies expired" && !dat.statusCode) {
                    //console.log(dat.balance);
                    //console.log(dat)
                    //this works
                    meta = JSON.parse(dat)
                    var avatar = meta["public"]["avatar"]
                    var uname = meta["private"]["name"]
                    document.querySelectorAll(".uavatar").forEach((img) => {
                        img.src = avatar
                    })
                    document.querySelectorAll(".uname").forEach((name) => {
                        name.textContent = uname
                    })
                    document.getElementById("uinfo").style.display = "flex"
                    document.getElementById("uinfo2").style.display = "flex"
                } else {
                    console.log("Something went wrong getting meta data (check if logged in)")
                    balance = undefined
                    meta = undefined
                }
                resolve()
            }
        });
    })
}

function filterItem(item) {
    return (!item["custom_price"] || item["custom_price"] <= 0) && item["appid"] === 730
}

function updateBalance() {
    if (balance == undefined) {
        Array.from(document.querySelectorAll('.balance')).forEach((i) => {
            i.style.display = "none"
        })
    } else {
        Array.from(document.querySelectorAll('.balance')).forEach((i) => {
            i.style.display = "inline-flex"
        })
        Array.from(document.querySelectorAll('#balance')).forEach((i) => {
            i.textContent = balance.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        })
    }
}

function checkItem(listing) {

    if (!listing.items ||
        listing.items.length > 1 ||
        isBlackListed(listing.items[0].name))
        return
    var item = listing.items[0];
    // console.log(listing);
    if (!filtered[listing["id"]]) {
        filtered[listing["id"]] = item
        filtered[listing["id"]]['discount'] = listing.discount;
        if (!(!stickers && item["name"].startsWith("Sticker")) && !(!pins && item["name"].endsWith("Pin"))) {
            listing.items[0]['discount'] = listing.discount;
            createItemCard2(listing)
        }
    }

}
function startSocket() {
    //FIX SOCKET PLS
    socket1 = io(
        `wss://socket.500play.com`, {
        path: "/socket.io",
        //query: {'EIO':'3','transport':'websocket'},
        transports: ['websocket'],
        secure: true,
        rejectUnauthorized: false,
        //Host:"socket.csgo500.com",
        origin: "https://csgo500.com",
        reconnect: true,
        forceNew: true,
        reconnectionDelay: 2e3,
        timeout: 180000,
        reconnectionAttempts: 10,
        extraHeaders: {
            'Cookie': 's:3STrkvB_BdupjlEVlVU9LoP1UlwUpfKt.tIjCHL8+1V+A1XJAY0eeGoEEF7xFSxFOJnD+5uFPHrA',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
            'Upgrade': 'websocket',
            'Origin': "https://csgo500.com",
        },
        upgrade: true
    }
    );
    /*      extraHeaders: {
        'Sec-WebSocket-Key': 'j0Rjtriw2TiOvJjbjwaEEQ==',
        'User-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    }, */
    /////////////
    var ts = timesync.create({
        server: socket1,
        interval: 60000
    });

    ts.send = function (socket, data, timeout) {
        return new Promise(function (resolve, reject) {
            var timeoutFn = setTimeout(reject, timeout);
            clearTimeout(timeoutFn);
            resolve();
        });
    };

    socket1.on('timesync', function (data) {
        ts.receive(null, data);
    });
    ///////////

    socket1.on('error', (err) => {
        console.log(`error: ${err}`);
        socket1.close()
        startSocket()
    })

    socket1.on('connect_error', (error) => {
        console.log(error);
        socket1.close()
        startSocket()
    });

    socket1.on('connect_timeout', (timeout) => {
        console.log(`connect_timeout: ${timeout}`);
        socket1.close()
        startSocket()
    });

    socket1.on('disconnect', (reason) => {
        console.log(`disconnect: ${reason} at ${Date()}`);
        meta = undefined
        socket1.close()
        startSocket()
    });

    socket1.on("connect", () => {
        console.log(`WS : Connected`);
    });
    socket1.on("reconnecting", () => {
        console.log(`WS : reconnecting`);
    });

    socket1.on("init", async (data) => {
        if (data["authenticated"] == false) {
            if (meta == undefined) {
                //   await getMeta()
            }
            console.log(`WS : authenticating...`);
            if (!meta) {
                $('#available').append("<h1>Check Cookies</h1>")
                return
            }
            socket1.emit('identify', {
                authorizationToken: meta["socket_token"],
                model: meta.user,
                signature: meta["socket_signature"],
                uid: meta["user"]["id"]
            });
            socket1.emit('timesync');
            init = true
        } else if (data["authenticated"] == true) {
            console.log(`WS : authenticating successfull`);
            socket1.emit('p2p/new-items/subscribe', "app")
        }
    })
}

function remove_item(id) {

    //Delete From Main items screen
    while (document.getElementById(id)) {
        document.getElementById(id).remove()
    }
    //Delete from items list
    delete filtered[id]
    //Delete from buy queue
    removeFromQueue(id)
    //Delete from sidemenu
    removeFromSideMenu(id)
    //Delete from sidenav if it dosent have any status on it
    var sidecard = document.querySelector('.sidemenu').querySelector(`div[card_id="${CSS.escape(id)}"]`)
    if (sidecard && sidecard.children[0].children[0].children[0].style.display == "none" && sidecard.children[0].children[0].children[1].style.opacity != "0.5") {
        sidecard.remove()
    }
}

function removeSideCard(sidecard) {
    var id = sidecard.getAttribute("card_id")
    if (sidecard.children[0].children[0].children[0].children[0].textContent.trim() != "Waiting For Trade") {
        delete sideMenuData[id]
        if (currentlyBuying == id)
            currentlyBuying = undefined

        if (buyQueue.includes(id)) {
            buyQueue.splice(buyQueue.indexOf(id), 1);
        }

        sidecard.remove();
        removeFromSideMenu(id)
    }
}

function removeFromQueue(id) {
    buyQueue.splice(buyQueue.indexOf(id), 1)
}

function removeFromSideMenu(id) {
    var index = sideMenu.indexOf(id)
    if (index != -1) {
        sideMenu.splice(index, 1)
    }
}

function forceBuyNow(id) {

    // addToSideMenu(item)

    // buyQueue.unshift(id)
    buyItem(id)
}
/*
42["app.balanceStream",{"currency":"gg","balance":1903982}]
42["app.balanceStream",{"currency":"gg","balance":1903982}]
42["app.onPeerTradeJoined",{"tradeID":4456684}]
436[{"status":true}]
427["app.getUserPeerTrades"]
437[{"status":true,"data":{"depositing":{},"withdrawing":{"4456684":{"depositor":"8f92138346265847f4fc4eb92d4125f8e2ecd1780df963400bbc16e55baa0e9d",
"items":[{"price":5350,"name":"Number K | The Professionals",
"icon":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXA6Q1NL4kmrAlOA0_FVPCi2t_fUkRxNztDu4W1OQhm1uDbeDJM7dCJgoGZnrmjauOHlTIGvpwojuqZ9tuniQfn_xVlZWiiIIaSc1Q6Y1HSr1Loxebtm9bi60SKLiwN/150fx150f",
"average":5460}],"depositorSite":"gamdom","withdrawerSite":"csgofly","withdrawerName":false,
"withdrawerLevel":false,"withdrawerCreatedAt":1342460191000,
"isPrivateListing":false,"createdAt":1613040348000,"expireAt":1613044006000,"tradeID":4456684,"state":"IN_PROGRESS","total":5350,"game":"csgo"}}}}]
*/
async function buyItem(item) {
    addToSideMenu(item)
    // currentlyBuying = tid
    var tid = item
    var item = filtered[tid]

    console.log("Item data supposed to be:")
    console.log(filtered[tid])

    var inner = document.getElementById("sidenav").querySelector(".sidemenu_items").querySelector(`[card_id=${CSS.escape(tid)}]`).children[0].children[0]
    inner.children[1].style.opacity = "0.5"

    //ADD BUYING here
    const response = await fetch(`${BASE_URL}:${PORT}/api/csgo500/withdraw/${item.id}`);

    if (!response.ok) {
        console.error(await response.text())
        return;
    }
    const result = await response.json();
    console.log(JSON.parse(result).balanceUpdate);

    if (JSON.parse(result).balanceUpdate) {
        await getActiveTrade();
        balance += parseFloat(JSON.parse(result).balanceUpdate / BUX);
        updateBalance();
        if (isNaN(balance)) { getBalance() };
        console.log(actTrade);
        actTrade.drawer_withdraws.forEach(element =>{
            if (element.id == item.id) {
                inner.children[0].style.display = "block"
                inner.children[0].classList.add("orange")
                inner.children[0].children[0].textContent = "Waiting For Trade"
                console.log("withdraw success for item ", element);
            }
        })
        
        //inner.parentElement.parentElement.setAttribute("assetid", res.data.items[0]["assetid"])
        // console.log("withdraw success for item ", res.data.items[0]);
    } else if (JSON.parse(result).error) {
        // console.log(JSON.parse(result).error);
        if (JSON.parse(result).error == "market_withdraw_error") {
            inner.children[0].style.display = "block"
            inner.children[0].classList.add("red")
            inner.children[0].children[0].textContent = "Unavail/Private";
            remove_item(item.id)
        }
        if (JSON.parse(result).error == "market_deposit_insufficient_funds") {
            inner.children[0].style.display = "block"
            inner.children[0].classList.add("red")
            inner.children[0].children[0].textContent = "Insufficient Funds!";
        }
    }
}

function checkItemData(tid) {
    socket1.emit("app.getUserPeerTrades", function (res) {
        setTimeout(() => {
            if (numRetries == 9) {
                console.log("Timed out on checking deposits.")
                numRetries = 0
                return
            }
            if (Object.keys(res.data.depositing).length == 0 && Object.keys(res.data.withdrawing).length == 0) {
                checkItemData(tid)
                numRetries++;
            }
            else {
                console.log(res.data)
                Object.keys(res.data.withdrawing).forEach((key) => {
                    currentlyBuying = res.data.withdrawing[key].tradeID;
                    itemData["Name"] = res.data.withdrawing[key].items["name"];
                    itemData["Price"] = res.data.withdrawing[key].items["price"] / 1000;
                })
                //itemData["Name"] = res.data.withdrawing[tid].items["name"];
                //itemData["Price"] = res.data.withdrawing[tid].items["price"] / 1000;
                currIcon = itemData["icon"]
            }
        }, 10000);

    });
}

function retryTimer(id, inner, current) {
    if (current != 0) {
        setTimeout(() => {
            if (document.getElementById("sidenav").querySelector(".sidemenu_items").querySelector(`[card_id=${CSS.escape(id)}]`)) {
                buyItem(id, current - 1)
            }
        }, 1000 * retryAfterTimer);
    } else {
        inner.children[0].children[0].textContent = "Timer Timedout"
        removeFromQueue(id)
        currentlyBuying = undefined
    }
}

function retryReserved(id, inner, current) {
    if (current != 0) {
        setTimeout(() => {
            if (document.getElementById("sidenav").querySelector(".sidemenu_items").querySelector(`[card_id=${CSS.escape(id)}]`)) {
                buyItem(id, current - 1)
            }
        }, 1000 * retryAfter)
    } else {
        inner.children[0].children[0].textContent = "Reserved Timedout"
        removeFromQueue(id)
        currentlyBuying = undefined
    }
}

//load autobuy preset 
function loadAutoBuy() {
    var id = Cookies.get("preset_id")
    if (id) {
        $.ajax({
            type: "GET",
            url: `${BASE_URL}:${PORT}/api/preset/${id}`,
            contentType: "application/json; charset=utf-8",
            error: function (er) {
                console.log("error getting preset " + id);
                console.error(er)
            },
            success: function (res) {
                console.log("autobuy list loaded preset active " + id);
                res.forEach((item) => {
                    autoBuyList[item["item_id"]] = item
                })
            }
        });
    } else {
        console.log("no autobuy preset selected")
    }
}

function loadBuffAutoBuy() {
    $.ajax({
        type: "GET",
        url: `${BASE_URL}:${PORT}/api/buff`,
        contentType: "application/json; charset=utf-8",
        error: function (er) {
            console.log("error getting buff " + id);
            console.error(er)
        },
        success: function (res) {
            console.log("loaded buff autobuy");
            res.forEach((item) => {
                buffautoBuyList[item["item_id"]] = item
            })
        }
    });
}

function loadBuffAutoBuyBlackList() {
    $.ajax({
        type: "GET",
        url: `${BASE_URL}:${PORT}/api/buff/blacklist`,
        contentType: "application/json; charset=utf-8",
        error: function (er) {
            console.log("error getting buff blakclist" + id);
            console.error(er)
        },
        success: function (res) {
            console.log("loaded buff autobuy blacklist");
            res.forEach((item) => {
                buffBlackList[item["item_id"]] = item
            })
        }
    });
}
function createItemCardFilter(listing) {
    //console.log(listing);
    console.log(filtered[listing['id']]);
    if (listing.id == undefined)
        return;
    var element = listing;
    var card = document.createElement("div");
    var nameF = nameCreator(element.name.full)
    var name = nameF.type
    var skin = nameF.name
    var condition = nameF.quality ? nameF.quality : 'No Condition';
    var tradeID = listing.id;
    if (element.paintWear) {
        condition = condition + " " + listing.paintWear.toFixed(4);
    }
    if (!name) {
        name = skin
        skin = ""
    }
    var percentage = parseInt(listing.discount * (-100))
    market = element.value
    profit = 0
    if (buff[element.name]) {
        //console.log(element)
        sell = (buff[element.name][0] * RMB)
        buy = (buff[element.name][1] * RMB)
        profit = (sell / market * 100) - 100
        if (profit == undefined) { element['profit'] = 0 } else { element['profit'] = profit }
        element['sell'] = sell
        element['buy'] = buy
        element['id'] = tradeID
        element['market'] = market

    } else {
        element['id'] = tradeID
        sell = market
        buy = market
    }
    color = '#24252f'
    if (profit > 10) {
        color = "#161617"
    }
    if (profit > 15) {
        color = "#6bb357"
    }
    if (profit > 20) {
        color = "#521e1e"
    }
    if (profit < -25) {
        color = "#600563"
    }


    card.classList.add("item", "item--instant-withdraw", "item--alt", "item--730")
    card.id = tradeID
    card.setAttribute("item_id", tradeID)
    var innerHTML = `
    <div class="item__inner" style="background-color:${color}  !important">
    <div>
        <div class="mb-2 overflow-hidden">
            <div class="item__head flex items-end justify-between">
                <div class="flex items-center">
                    <div class="item__quality text-xxxs font-bold uppercase rounded-t px-2">
                        ${condition ? condition : ""} <span class="wear-value"> ${element["wear"] == null || element["wear"] == 0 || element["wear"] == undefined ? "" : (condition ? " | " + element["wear"] : element["wear"])}
                        </span>
                    </div>
                </div>
                <div class="flex item-condition items-center px-1">
                    ${(percentage) + "%"}
                </div>
            </div>
            <div class="item__image relative z-10">
                <div class="item__image-inner pointer" style="border-bottom-color: rgb(210, 210, 210);">
                <img
                        onclick="addToSideMenu('${tradeID}')"
                        src="${element.url}" alt="${skin}"
                        class="block relative z-10 mx-auto"
                        style="filter: drop-shadow(rgba(210, 210, 210, 0.2) 0px 0px 20px);">
                `

    innerHTML += `<div class="absolute pin-l pin-b pl-1 pb-1 z-20 flex items-center justify-center">`

    innerHTML += `</div>`

    innerHTML += `</div>
            </div>
            <div class="item__bottom flex items-end border-b-1 border-b-solid">
                <div class="flex items-center">
                    <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                        <div class="timer w-12 h-12 -mt-01 mr-1"></div><span
                            class="text-xxs font-bold text-light-grey-1" id="timer"> 03:00
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="px-2">
            <div class="text-xxxs mb-02">${name.toString()}</div>
            <div class="item__name text-xs font-bold">${skin}</div>
        </div>
    </div>
    <div class="px-1">
        <div class="flex flex-wrap items-center justify-between -ml-1 -mb-1" style="min-height: 20px;">
            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <div class="buff w-12 h-12 -mt-01 mr-1"></div><span
                    class="text-xxs font-bold text-light-grey-1 red-t">
                    ${sell.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
            </div>
            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <span class="text-xxs font-bold text-light-grey-1 green-t">
                    ${buy.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

                </span>
            </div>
        

            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <div class="coinstack w-12 h-12 -mt-01 mr-1"></div>
                <span class="text-xxs font-bold text-light-grey-1 price">
                    ${market.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
            </div>
        </div>


    </div>
    <div class="px-1 pb-1">
        <div class="flex-wrap items-center justify-between -ml-1 -mb-1" style="min-height: 30px;">
            <div class="item__instant flex items-center font-bold text-sm ml-1 mb-1">
                <button class="buybutton" style="color:white;width:100%"
                    onclick="forceBuyNow('${tradeID}')">
                    Buy Now
                </button>
            </div>
        </div>
    </div>
</div>`
    card.innerHTML = innerHTML


    var fil = document.getElementById("filter").value.trim().toLowerCase();
    if ((fil != '' && !card.textContent.toLowerCase().includes(fil)))
        card.setAttribute("hidden", "true")

    document.querySelector("#available").appendChild(card)
    $('#available').find('.item').sort(function (a, b) {
        return parseFloat($(b).find('.price').text().replace(",", "").trim()) - parseFloat($(a).find('.price').text().replace(",", "").trim())
    }).appendTo('#available');

}
function createItemCard2(listing) {
    //console.log(listing)
    //console.log(listing.items[0]);
    var element = listing.items[0];
    var card = document.createElement("div");
    var nameF = nameCreator(element.name)
    var name = nameF.type
    var skin = nameF.name
    var condition = nameF.quality ? nameF.quality : 'No Condition';
    var tradeID = listing.id;
    if (listing.items[0].paintWear) {
        condition = condition + " " + listing.items[0].paintWear.toFixed(4);
    }
    if (!name) {
        name = skin
        skin = ""
    }
    var percentage = parseInt(listing.discount * (-100))
    market = element.value
    profit = 0
    if (buff[listing.items[0].name]) {
        //console.log(element)
        sell = (buff[listing.name][0] * RMB)
        buy = (buff[listing.name][1] * RMB)
        profit = (sell / market * 100) - 100
        if (profit == undefined) { element['profit'] = 0 } else { element['profit'] = profit }
        element['sell'] = sell
        element['buy'] = buy
        element['id'] = tradeID
        element['market'] = market

    } else {
        element['id'] = tradeID
        sell = market
        buy = market
    }

    buffautoBuy(element)
    autoBuy(element)

    color = '#24252f'
    if (profit > 10) {
        color = "#161617"
    }
    if (profit > 15) {
        color = "#6bb357"
    }
    if (profit > 20) {
        color = "#521e1e"
    }
    if (profit < -25) {
        color = "#600563"
    }


    card.classList.add("item", "item--instant-withdraw", "item--alt", "item--730")
    card.id = tradeID
    card.setAttribute("item_id", tradeID)
    var innerHTML = `
    <div class="item__inner" style="background-color:${color}  !important">
    <div>
        <div class="mb-2 overflow-hidden">
            <div class="item__head flex items-end justify-between">
                <div class="flex items-center">
                    <div class="item__quality text-xxxs font-bold uppercase rounded-t px-2">
                        ${condition ? condition : ""} <span class="wear-value"> ${element["wear"] == null || element["wear"] == 0 || element["wear"] == undefined ? "" : (condition ? " | " + element["wear"] : element["wear"])}
                        </span>
                    </div>
                </div>
                <div class="flex item-condition items-center px-1">
                    ${(percentage) + "%"}
                </div>
            </div>
            <div class="item__image relative z-10">
                <div class="item__image-inner pointer" style="border-bottom-color: rgb(210, 210, 210);">
                <img
                        onclick="addToSideMenu('${tradeID}')"
                        src="${element.url}" alt="${skin}"
                        class="block relative z-10 mx-auto"
                        style="filter: drop-shadow(rgba(210, 210, 210, 0.2) 0px 0px 20px);">
                `

    innerHTML += `<div class="absolute pin-l pin-b pl-1 pb-1 z-20 flex items-center justify-center">`

    innerHTML += `</div>`

    innerHTML += `</div>
            </div>
            <div class="item__bottom flex items-end border-b-1 border-b-solid">
                <div class="flex items-center">
                    <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                        <div class="timer w-12 h-12 -mt-01 mr-1"></div><span
                            class="text-xxs font-bold text-light-grey-1" id="timer"> 03:00
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="px-2">
            <div class="text-xxxs mb-02">${name}</div>
            <div class="item__name text-xs font-bold">${skin}</div>
        </div>
    </div>
    <div class="px-1">
        <div class="flex flex-wrap items-center justify-between -ml-1 -mb-1" style="min-height: 20px;">
            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <div class="buff w-12 h-12 -mt-01 mr-1"></div><span
                    class="text-xxs font-bold text-light-grey-1 red-t">
                    ${sell.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
            </div>
            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <span class="text-xxs font-bold text-light-grey-1 green-t">
                    ${buy.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

                </span>
            </div>
        

            <div class="item__price inline-flex items-center flex-no-shrink ml-1">
                <div class="coinstack w-12 h-12 -mt-01 mr-1"></div>
                <span class="text-xxs font-bold text-light-grey-1 price">
                    ${market.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
            </div>
        </div>


    </div>
    <div class="px-1 pb-1">
        <div class="flex-wrap items-center justify-between -ml-1 -mb-1" style="min-height: 30px;">
            <div class="item__instant flex items-center font-bold text-sm ml-1 mb-1">
                <button class="buybutton" style="color:white;width:100%"
                    onclick="forceBuyNow('${tradeID}')">
                    Buy Now
                </button>
            </div>
        </div>
    </div>
</div>`
    card.innerHTML = innerHTML


    var fil = document.getElementById("filter").value.trim().toLowerCase();
    if ((fil != '' && !card.textContent.toLowerCase().includes(fil)))
        card.setAttribute("hidden", "true")

    document.querySelector("#available").appendChild(card)
    $('#available').find('.item').sort(function (a, b) {
        return parseFloat($(b).find('.price').text().replace(",", "").trim()) - parseFloat($(a).find('.price').text().replace(",", "").trim())
    }).appendTo('#available');

}

function autoBuy(item) {
    if (Cookies.get("autoBuyEnabled") == "false")
        return
    if (numFails >= 3) {
        $.ajax({
            type: "POST",
            url: discordHook,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                content: `<@237302465416921098> currently soft-locked, please review. `
            }),
            error: function (er) {
                console.log("error sending to discord");
            },
            success: function (res) {
                console.log("sent to discord");
            }
        });
        return
    }
    Object.keys(autoBuyList).forEach((key) => {
        var auto = autoBuyList[key]
        if (item == undefined || auto == undefined || !auto["enabled"])
            return

        if (auto["buylimit"] && auto["buylimitrange"] == 0)
            return

        var {
            base,
            full,
            name,
            quality,
            type
        } = nameCreator(item["name"])
        var price = item["price"] / 100

        if (balance == undefined || price > balance)
            return

        name = name.toLowerCase()

        if (type == undefined) {
            if (auto["skin"].toLowerCase() != "vanilla")
                return
            name = name.toLowerCase().replace("\u2605 ", "")

            if (auto["stattrak"].toLowerCase() == "yes" && !name.includes("stattrak"))
                return
            if (auto["stattrak"].toLowerCase() == "no" && name.includes("stattrak"))
                return

            name = name.replace("stattrak\u2122 ", "")

            if (auto["weapon"].toLowerCase() != name)
                return

        } else if (type == "Sticker") {
            if (auto['type'] != 'stickers')
                return
            if (auto['condition'] == 'None' && !quality)
                return
            if (auto['condition'] != 'Any' && quality != auto['condition'])
                return
            if (auto['skin'] != '') {
                if (name != (auto['weapon'] + " - " + auto['skin']).toLowerCase())
                    return
            } else {
                if (name != auto['weapon'].toLowerCase())
                    return
            }
        } else {
            type = type.toLowerCase().replace("\u2605 ", "")

            if (type.startsWith("souvenir"))
                return

            if (auto["stattrak"].toLowerCase() == "yes" && !type.includes("stattrak"))
                return
            if (auto["stattrak"].toLowerCase() == "no" && type.includes("stattrak"))
                return

            type = type.replace("stattrak\u2122 ", "")

            if (auto["weapon"].toLowerCase() != type)
                return

            if (auto["skin"].toLowerCase() != name)
                return

        }

        if (auto["condition"].toLowerCase() != "any" && auto["condition"] != quality)
            return

        if (auto["price_range"] && (auto["price_from"] > price || price > auto["price_to"]))
            return

        if (auto["wear_range"] && item["wear"] == null)
            return

        if (auto["wear_range"] && (auto["wear_from"] > item["wear"] || item["wear"] > auto["wear_to"]))
            return

        if (auto["buylimit"])
            maxbuy[item["assetid"]] = auto
        console.log("autoBuying ", item, " using listing ", auto);

        socket1.emit("app.getUserPeerTrades", function (res) {
            //console.log(res)
            //console.log(Object.keys(res.data.depositing).length)
            if (res) {
                if (Object.keys(res.data.depositing).length != 0 && Object.keys(res.data.withdrawing).length != 0) {
                    return
                }
            }
        })

        addToSideMenu(item.tradeID)

    })
}

function isBlackListed(item) {
    var result = false;

    Object.keys(buffBlackList).forEach((key) => {

        var blocked = buffBlackList[key]
        var {
            base,
            full,
            name,
            quality,
            type
        } = nameCreator(item)

        name = name.toLowerCase()
        name = name.replace("stattrak\u2122 ", "")

        /*  if(name.includes('pass') || name.includes('graffiti') || name.includes('patch') ||name.includes('pin'))
         {
           console.log("This caught it (1)")     
            result = true
            } */
        if (name.includes('the professionals') || name.includes('swat') || name.includes('fbi') || name.includes('sabre') || name.includes('elite crew') || name.includes('tacp') || name.includes('seal') || name.includes('ksk') || name.includes('phoenix')) {
            //console.log("This caught it (2)")
            result = true
        }
        if (type != undefined && type.toLowerCase().replace("\u2605 ", "").startsWith("souvenir"))
            result = true
        if (type == undefined) {
            if (blocked["weapon"].toLowerCase() == name)
                result = true
        }
        if (type == 'Sticker' && blocked['type'] == stickers) {
            if (blocked['weapon'] == 'all')
                result = true
            if (blocked['weapon'] + " - " + blocked['skin'].toLowerCase() == name)
                result = true;
        }
        if (name.includes(blocked['type'])) {
            // console.log("This caught it (4)")
            result = true
        } else {
            if (blocked['type'] == 'graffiti' && full.includes('Graffiti')) {
                result = true
            }
            if (blocked['type'] == 'patch' && full.includes('Patch')) {
                result = true
            }
            if (blocked['type'] == 'pass' && full.includes('Pass')) {
                {
                    //console.log("This caught it (3)")
                    result = true
                }
            }
            if (blocked['type'] == 'pin' && full.includes('Pin')) {
                result = true
            }
        }

    })
    return result
}

async function buffautoBuy(item) {
    if (Cookies.get("buffautoBuyEnabled") == "false")
        return

    Object.keys(buffautoBuyList).forEach((key) => {
        // console.log(item);
        //console.log("BUY ORDER IS: " + item["buy"] + item["value"]);
        var auto = buffautoBuyList[key]
        if (item == undefined || auto == undefined)
            return
        //console.log(item["value"]);
        var price = item["value"];

        if (balance == undefined || price > balance)
            return

        if (isBlackListed(item.name))
            return
        //console.log("auto stuff going in:"+ auto["coinmin"] + " " + auto["coinmax"] + " PRICE "+ price);
        if (auto["coinmin"] > price || price > auto["coinmax"])
            return
        //console.log(buffautoBuyList[key]);
        var buyorder = ((item["buy"] / price - 1) * 100)
        var sellorder = ((item["sell"] / price - 1) * 100)
        //console.log("PERCENTAGES: BUY ORDER IS " + buyorder + " SELL ORDER IS " + sellorder);
        if (isNaN(buyorder) || isNaN(sellorder))
            return;

        //console.log(auto["buyorder"] + "   " + auto["sellorder"] + " " + sellorder + " " + buyorder + " uhhh " + item["sell"] + " BUY "+ item["buy"]);
        if (auto["buyorder"] > buyorder || auto["sellorder"] > sellorder)
            return

        console.log("buff autoBuying ", item, " using listing ", auto);
        buyItem(item.id)
        //buyItem(item.tradeID)
    })

}

//generate sidecard
function createSideCard(id) {
    //console.log(id)
    var e = filtered[id]
    console.log(e)
    var card = document.createElement("div");
    var nameS = nameCreatorShort(e.name.full)
    card.classList.add("card_item", "pointer")
    card.setAttribute("card_id", id)
    card.setAttribute("onclick", `removeSideCard(this);`)
    card.innerHTML = `
                <div class="card_out">
                    <div class="card_in">
                        <div id="status" style="display: none;">
                            <span id="status_text"></span>
                        </div>
                        <div class="card_in2">
                            <div class="card_img">
                                <img src="${e.url}"
                                    class="img_2" />
                            </div>
                            <div class="card_details" id="${id}">
                                <div class="card_name">
                                    ${nameS["base"] != undefined ? "[" + nameS.quality_short + "] " + nameS.type : nameS.name != undefined ? nameS.name : ""}
                                </div>
                                <div class="card_skin">
                                    ${e.name.name}
                                </div>
                                <div class="card_price">
                                    <div class="card_icon">
                                    </div> ${(e.value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    `
    return card;
}

function addToSideMenu(id) {

    //Object.keys(item).forEach(e => console.log(e))
    //Add item to sidemenu if it dosent exist
    if (!document.getElementById("sidenav").querySelector(".sidemenu_items").querySelector(`[card_id=${CSS.escape(id)}]`)) {
        document.getElementById("sidenav").children[1].appendChild(createSideCard(id))
    }
    //push to buyQueue if it isnt there
    if (sideMenu.indexOf(id) == -1) {
        sideMenu.push(id)
        sideMenuData[id] = filtered[id]
    }
}

//show buyqueue sidemenu
function showItems() {
    document.getElementById("sidenav").style.width = "280px";
    document.getElementById("trades").style.display = "none";
    document.getElementById("closemenu").style.display = "block";
    document.querySelector(".main").style.paddingRight = "280px"
}

//hide buyqueue sidemenu
function hideItems() {
    document.getElementById("sidenav").style.width = "0px";
    document.getElementById("trades").style.display = "block";
    document.getElementById("closemenu").style.display = "none";
    document.querySelector(".main").style.paddingRight = "0px"
}

async function getBuff() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `https://buff-prices-eb699.firebaseio.com/buff-prices-2/.json`,
            contentType: "application/json; charset=utf-8",
            error: function (er) {
                console.log("error getting Buff Prices");
                console.error(er)
                reject()
            },
            success: function (res) {
                console.log("loaded buff price list");
                buff = res
                resolve()
            }
        });
    });
}
/*

https://api.shadowpay.com/api/market/get_items?price_from=0&price_to=25000&game=csgo&currency=USD&sort_column=price_rate&sort_dir=desc&search=&stack=false&limit=50&offset=0&sort=desc


 */

//load buff data
getBuff().finally(() => {
    //load user meta data from api to use for socket authentication
    getBalance()
    getMeta()
    //start socket connection and listen to messeges
    //startSocket()

    if (Cookies.get("autoBuyEnabled") == "true")
        //load auotbuy preset
        loadAutoBuy()
    else
        console.log("autobuy disabled");


    if (Cookies.get("buffautoBuyEnabled") == "true") {
        loadBuffAutoBuy()
        loadBuffAutoBuyBlackList()
    } else {
        console.log("buff autobuy disabled");
    }

    //get sec token
    /* getToken()
     setInterval(() => {
         getToken()
     }, 59000 * 1000);
 */
    //Card Timer
    setInterval(() => {
        Object.keys(filtered).forEach(function (key) {
            var e = filtered[key]
            //console.log(e["id"])
            if (!document.getElementById(e["id"]))
                return
            //check search and hide card or unhide
            var fil = document.getElementById("filter").value.trim().toLowerCase();
            if (document.getElementById(e["id"]) && (!document.getElementById(e["id"]).textContent.toLowerCase().includes(fil)))
                document.getElementById(e["id"]).setAttribute("hidden", "true")
            else
                document.getElementById(e["id"]).removeAttribute("hidden")

        });

        if (currentlyBuying == undefined && buyQueue.length) {
            buyItem(buyQueue[0])
        }

    }, 900);
    //console.log(shadowData.body.items)

    var intvl = 2300
    setInterval(function () {
         /*  if (page < 2) {
            page++;
        } else {
            page = 1;
        }  */
        get500(page)
        //getActiveTrade()
        //console.log("Checing 500 every " + intvl / 1000 + " secs")
    }, intvl);
})
async function get500(page) {
    "use strict";

    const response = await fetch(`${BASE_URL}:${PORT}/api/csgo500/${page}`);

    if (!response.ok) {
        console.error(await response.text())
        return;
    }
    const items = await response.json();
    //console.log(items);
    if (items && items != "") {
        for (const item of JSON.parse(items).shop) {

            item.items[0].value = item.items[0].value / BUX;
            // if(!filtered[item.items[0].id])
            checkItem(item)
            //console.log(item.items[0]);
            item.items[0].name = nameCreator(item.items[0].name.replace(/Phase [1-4]/g, "").trim());
            if (buff[item.items[0].name.full] !== undefined) {
                const t_rmb = buff[item.items[0].name.full][0] * RMB;
                //console.log(t_rmb);
                const s_rmb = buff[item.items[0].name.full][1] * RMB;
                // t_rmb/item.price_market_usd >0.9 ? console.log((t_rmb) / item.price_market_usd) : console.log();
                /* if (t_rmb / item.items[0].value >= 1.03 && s_rmb / item.items[0].value >= 0.95) {
                    console.log(`Detected CSGO500 ${item.items[0].name.full}\n Buff Sell = $${t_rmb.toFixed(2)} | %` + (((t_rmb / item.items[0].value) - 1) * 100).toFixed(2) + `\n Buff Buy = $${s_rmb.toFixed(2)} | %` + (((s_rmb / item.items[0].value) - 1) * 100).toFixed(2) + ` \n Listed for $${item.items[0].value.toFixed(2)} \n`);
                } */
                if (t_rmb / item.items[0].value >= 1.1 && s_rmb / item.items[0].value >= 0.97 && filtered[item.items[0].id]) {
                    $.ajax({
                        type: "POST",
                        url: discordHook,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({
                            content: `Detected CSGO500 ${item.items[0].name.full}\n Buff Sell = $${t_rmb.toFixed(2)} | %` + (((t_rmb / item.items[0].value) - 1) * 100).toFixed(2) + `\n Buff Buy = $${s_rmb.toFixed(2)} | %` + (((s_rmb / item.items[0].value) - 1) * 100).toFixed(2) + ` \n Listed for $${item.items[0].value.toFixed(2)} \n `,
                        }),
                        error: function (er) {
                            console.log("error sending to discord");
                        },
                        success: function (res) {
                            console.log("sent to discord");
                        }
                    });
                }
            }
        }
    } else {
        return;
    }

}

async function getActiveTrade() {
    //use the 730?allmarket
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `http://localhost:3000/api/csgo500/trades`,
            contentType: "application/json; charset=utf-8",
            error: function (er) {
                console.log("Something went wrong getting meta data (check if logged in)")
                console.error(er)
                reject()
            },
            success: function (res) {
                {
                    actTrade = JSON.parse(res)
                    //return meta;
                    resolve()
                }
            }
        })
    })
}


async function logToFile(datas) {
    await $.ajax({
        type: "POST",
        url: "http://localhost:3000/log",
        data: JSON.stringify(datas),
        contentType: "application/json; charset=utf-8",
        error: function (er) {
            console.log("error logging data");
            console.error(er)
        },
        success: function (res) {
            console.log("data logged");
        }
    });
}

function getToken() {
    tokenData = {}
    if (secret) {
        tokenData['2fa'] = totpObj.getOTP()
    }
    $.ajax({
        type: "GET",
        url: `http://localhost:3000/api/sec`,
        contentType: "application/json; charset=utf-8",
        data: tokenData,
        error: function (er) {
            console.log("Something went wrong getting security token")
            console.error(er)
            return
        },
        success: function (data) {
            if (data == "Cookies expired")
                token = "login"
            else
                token = data["token"]
        }
    });
}

function sendMessage(msg, discord = false) {
    if (discord) {
        request({
            url: config.discordHook,
            method: 'POST',
            json: true,
            body: {
                content: msg,
            },
        }, (error, response, b) => {
            //
        });
    }

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


$(document).on("mouseenter", ".has-tooltip", function (e) {
    $('.tooltip-inner').text($(this).attr('alt'))
    var svgPos = $(this).offset(),
        x = svgPos.left - 30,
        y = svgPos.top - 38
    $('.tooltip').css('transform', `translate3d(${x}px, ${y}px, 0px)`)
    $('.tooltip').attr('aria-hidden', `false`)
    $('.tooltip').show()
});

$(document).on("mouseleave", ".has-tooltip", function (e) {
    $('.tooltip').attr('aria-hidden', `true`)
    $('.tooltip').hide()
});

$(document).on("click", "#stickers", function (e) {
    if ($(this).is(':checked')) {
        stickers = false
        Object.keys(filtered).forEach((key) => {
            //console.log(filtered[key]);
            if (filtered[key]["name"]["full"].startsWith("Sticker")) {

                document.querySelectorAll(`[item_id="${key.toString()}"]`).forEach(element => element.remove());
                //document.getElementById(key).remove();
            }

        })
    } else {
        stickers = true
        Object.keys(filtered).forEach((key) => {
            if (filtered[key]["name"]["full"].startsWith("Sticker"))
                createItemCardFilter(filtered[key]);
        })
    }
});

$(document).on("click", "#pins", function (e) {
    if ($(this).is(':checked')) {
        pins = false
        Object.keys(filtered).forEach((key) => {

            if (filtered[key]["name"]["full"].endsWith(" Pin")) {
                console.log(filtered[key]);
                document.querySelectorAll(`[item_id="${key.toString()}"]`).forEach(element => element.remove());
                //document.getElementById(key).remove();
            }

        })
    } else {
        pins = true
        Object.keys(filtered).forEach((key) => {
            if (filtered[key]["name"]["full"].endsWith(" Pin"))
                createItemCardFilter(filtered[key])
        })
    }
});