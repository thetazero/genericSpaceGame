let map = document.querySelector('.map')
let app;
let width = map.offsetWidth
let height = map.offsetHeight
let mx = map.offsetWidth / 2
let my = map.offsetHeight / 2
let layers;
function setupMap() {
    console.log(map)
    app = new PIXI.Application({
        width,
        height,
        antialias: true,
        resolution: 2,
        autoDensity: true,
    });
    map.appendChild(app.view)
}

function setRenderer() {
    app.stage = new PIXI.display.Stage()
    app.stage.sortableChildren = true
    app.renderer.backgroundColor = 0x030310;
    layers = {
        hoverUI: new PIXI.display.Group(10, false),
        mapBG: new PIXI.display.Group(0, false),
        mapObj: new PIXI.display.Group(1, false)
    }
}

let stars = []
let planets = []
let satellites = []
let debth = 'System'
let zoom = 1
function setScene() {
    let loc = State.location
    setRenderer()
    if (debth == 'System' || debth == 'Planet' || debth == 'Satellite') {
        let scales = {
            System: 1,
            Planet: 2,
            Satellite: 3
        }
        zoom = scales[debth]
        app.stage.scale.set(zoom)

        let system = State.systems[loc[0]]
        app.stage.addChild(new PIXI.display.Layer(layers.hoverUI))
        app.stage.addChild(new PIXI.display.Layer(layers.mapObj))
        app.stage.addChild(new PIXI.display.Layer(layers.mapBG))
        for (let [star, { type, size, color }] of Object.entries(system.stars)) {
            let t = makeStar(type, size, color, star)
            app.stage.addChild(t)
            stars.push({
                elem: t
            })
        }
        for (let [planet, { type, size, orbitalRadius, year, moons }] of Object.entries(system.planets)) {
            let newloc = State.location.slice(0, 2)
            newloc[1] = planet
            let t = makePlanet(type, size, planet, newloc)
            app.stage.addChild(makeOrbit(0, 0, orbitalRadius * mx))
            app.stage.addChild(t)
            planets.push({
                elem: t,
                orbitalRadius,
                year,
                size,
                name: planet
            })
            if (moons) {
                let parentSize = size
                let parentOrbitalRadius = orbitalRadius
                let parentYear = year
                for (let [moon, { type, size, orbitalRadius, year }] of Object.entries(moons)) {
                    newloc = newloc.slice(0, 2)
                    newloc.push(moon)
                    let m = makePlanet(type, size, moon, newloc)
                    t.addChild(makeOrbit(0, 0, orbitalRadius * parentSize * Config.moonOrbitMul))
                    app.stage.addChild(m)
                    satellites.push({
                        elem: m,
                        orbitalRadius,
                        year,
                        size,
                        parentSize,
                        parentOrbitalRadius,
                        parentYear,
                        name: moon
                    })
                }
            }
            if (debth == 'Planet' && planet == loc[1]) {
                makeFocus(t, size)
            }
        }
    }
}

function makePlanet(type, size, name, loc) {
    let planet = new PIXI.Graphics()
    planet.parentGroup = layers.mapObj
    planet.beginFill(Config.planetColors[type])
    planet.drawCircle(0, 0, size)
    planet.endFill()

    hoverSelect(planet, size, name)
    planet.mouseup = function () {
        State.location = loc
        updateLoc()
    }
    return planet
}

function makeFocus(elem, size) {
    let focus = new PIXI.Graphics()
    focus.parentGroup = layers.hoverUI
    focus.lineStyle(3, 0xff4500, 0.5);
    focus.drawCircle(0, 0, size);
    focus.endFill()
    elem.addChild(focus)
    elem.children = elem.children.reverse()
}

function hoverSelect(obj, radius, str) {
    obj.interactive = true

    let selector = new PIXI.Graphics()
    selector.parentGroup = layers.hoverUI
    selector.lineStyle(1.5, 0xcccccc, 0);
    selector.drawCircle(0, 0, radius);
    selector.endFill()
    obj.addChild(selector)

    let text = new PIXI.Text(str, { fontFamily: '-apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif', fontSize: 18, fill: 0xeeeeee, align: 'center' });
    text.parentGroup = layers.hoverUI
    text.x = +radius
    text.y = -2 * radius
    text.visible = false
    obj.addChild(text)

    obj.mouseover = function (mouseData) {
        selector.clear()
        selector.lineStyle(1.5, 0xcccccc, 1);
        selector.drawCircle(0, 0, radius);
        selector.endFill()
        text.visible = true
        obj.cursor = "pointer"
    }

    obj.mouseout = function (mouseData) {
        selector.clear()
        selector.lineStyle(1.5, 0xcccccc, 0);
        selector.drawCircle(0, 0, radius);
        selector.endFill()
        text.visible = false
    }
}

function makeOrbit(x, y, radius) {
    let orbit = new PIXI.Graphics();
    orbit.parentGroup = PIXI.mapObj
    orbit.lineStyle(1.5, 0xcccccc, 1);
    orbit.drawCircle(x, y, radius);
    orbit.endFill();
    return orbit
}

//https://www.universetoday.com/24299/types-of-stars/
function makeStar(type, size, color, name) {
    let star = new PIXI.Graphics()
    star.parentGroup = layers.mapObj
    star.beginFill(color)
    star.drawCircle(0, 0, size)
    star.endFill()

    star.mouseup = function () {
        if (State.location.length == 1) {
            return
        } else {
            State.location = [State.location[0]]
        }
        updateLoc()
    }
    hoverSelect(star, size, name)
    return star
}

function drawLoop() {
    if (debth == 'System' || debth == 'Planet' || debth == 'Satellite') {
        if (debth == 'System') {
            app.stage.position.set(mx, my)
        }
        for (let i = 0; i < planets.length; i++) {
            let [x, y] = calcPlanetPos(planets[i].year, planets[i].orbitalRadius)
            planets[i].elem.x = x
            planets[i].elem.y = y
            if (debth == 'Planet' && planets[i].name == State.location[1]) {
                app.stage.position.set(mx - x * app.stage.scale.x, my - y * app.stage.scale.y)
                // console.log(mx, mx - x + planets[i].elem.x)
                // console.log(my, my - y + planets[i].elem.y)
            }
        }
        for (let i = 0; i < satellites.length; i++) {
            let { year, orbitalRadius, parentYear, parentOrbitalRadius, parentSize } = satellites[i]
            let [x, y] = calcSatilitePos(year, orbitalRadius, parentYear, parentOrbitalRadius, parentSize)

            satellites[i].elem.x = x
            satellites[i].elem.y = y
            if (debth == 'Satellite' && satellites[i].name == State.location[2]) {
                app.stage.position.set(-x * app.stage.scale.x + mx, -y * app.stage.scale.y + my)
            }
        }
    }
}

function calcPlanetPos(year, orbitalRadius) {
    let theta = Date.now() / year / Math.PI / 1000
    let x = Math.cos(theta) * mx * orbitalRadius
    let y = Math.sin(theta) * mx * orbitalRadius
    return [x, y]
}

function calcSatilitePos(year, orbitalRadius, parentYear, parentOrbitalRadius, parentSize) {
    let [x, y] = calcPlanetPos(parentYear, parentOrbitalRadius)

    let theta = Date.now() / year / Math.PI / 1000
    let r = orbitalRadius * parentSize * Config.moonOrbitMul
    x += Math.cos(theta) * r
    y += Math.sin(theta) * r

    return [x, y]
}

setupMap()
app.ticker.add(delta => drawLoop(delta));
