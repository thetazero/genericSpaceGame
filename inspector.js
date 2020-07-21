let inspectorElem = document.querySelector('.inspector')
const Inspector = {
    setUp() {
        let loc = State.location
        inspectorElem.innerHTML =
            `<h1 class='title'>${loc.map(e => {
                return `<a/>${e}</a>`
            }).join(" > ")} </h1>`
        if (debth == 'Planet' || debth == 'Satellite') {
            let body = State.systems[loc[0]].planets[loc[1]]
            if (debth == 'Satellite') {
                body = body.moons[loc[2]]
            }
            let title = inspectorElem.querySelector('.title')
            let color = Config.planetColors[body.type]
            title.innerHTML += `<small style="color:#${accent(color).toString(16)}">${body.size}</small>`
            let tiles = body.tiles
            for (let i = tiles.length; i < body.size; i++) {
                tiles.push({})
            }
            inspectorElem.innerHTML +=
                // `${JSON.stringify(planet)}
                `<div class='tiles'>
    ${tiles.map(tile => {
                    return `<div>
    
</div>`}).join("")}
</div>`
        }
    }
}

Inspector.setUp()