let State = {
    systems: {
        Sol: {
            planets: {
                Mercury: {
                    tiles: [],
                    size: 6,
                    modifiers: [],
                    type: 'barren',
                    orbitalRadius: 0.1,
                    year: 0.23855
                },
                Earth: {
                    moons: {
                        Luna: {
                            tiles: [],
                            size: 4,
                            modifiers: [],
                            type: 'barren',
                            orbitalRadius: 0.7,
                            year: 1 / 12
                        }
                    },
                    tiles: [],
                    size: 13,
                    modifiers: [],
                    type: 'continental',
                    orbitalRadius: 0.2,
                    year: 1
                }
            },
            modifiers: [],
            stars: {
                Sol: {
                    size: 17,
                    type: 'main-sequence',
                    color: 0xfff3ea
                }
            }
        }
    },
    location: ["Sol"],
    resources: {
        minerals: {
            symbol: 'M',
            count: 0,
        },
        alloys: {
            symbol: 'A',
            count: 0,
        },
        food: {
            symbol: 'F',
            count: 100
        },
        energy: {
            symbol: 'E',
            count: 12
        }
    }
}

let Computed = {
    resourceIncrease: {
        minerals: 2,
        alloys: -5,
        food: 13,
        energy: 1
    }
}

let stats = document.querySelector('.stats')
function setupStats() {
    for (let [key, value] of Object.entries(State.resources)) {
        let change = Computed.resourceIncrease[key]
        stats.innerHTML +=
            `<div>
    <span class="resource">${value.symbol}</span>
    <span class="count">${value.count}</span><span class="change ${change >= 0 ? "positive" : "negative"}">${change >= 0 ? "+" : "-"}${formatNum(Math.abs(change))}</span>
</div>`
    }
}

function formatNum(num) {
    num = Math.floor(num)
    if (num < 1000) {
        return num
    } else if (num < 10 ** 5) {
        return Math.floor(num / 100) / 10 + "K"
    } else if (num < 10 ** 8) {
        return Math.floor(num / 100000) / 10 + "M"
    }
}

setupStats()

function updateLoc() {
    let debthMap = [null, 'System', 'Planet', 'Satellite']
    debth = debthMap[State.location.length]
    setScene()
    Inspector.setUp()
}