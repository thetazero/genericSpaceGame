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
let fpsCounter;
function setScene() {
    let loc = State.location
    setRenderer()
    if (debth == 'System' || debth == 'Planet' || debth == 'Satellite' || debth == 'Satellite2') {
        fpsCounter = new PIXI.Text('0', {
            fontFamily: '-apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif', fontSize: 18 / zoom, fill: 0xeeeeee, align: 'center'
        });
        fpsCounter.position.set(-mx * zoom, -my * zoom)
        app.stage.addChild(fpsCounter)
        fpsCounter.parentGroup = layers.hoverUI


        zoom = Config.scales[debth]
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
            let planetElem = makePlanet(type, size, planet, newloc)
            app.stage.addChild(makeOrbit(0, 0, orbitalRadius * mx, 1.5))
            app.stage.addChild(planetElem)
            planets.push({
                elem: planetElem,
                orbitalRadius: orbitalRadius * mx,
                year,
                size,
                name: planet
            })
            if (moons) {
                let parentSize = size
                for (let [moon, { type, size, orbitalRadius, year, children }] of Object.entries(moons)) {
                    newloc = newloc.slice(0, 2)
                    newloc.push(moon)
                    let m = makePlanet(type, size, moon, newloc)
                    planetElem.addChild(makeOrbit(0, 0, orbitalRadius * parentSize * Config.moonOrbitMul, 0.75))
                    planetElem.addChild(m)
                    planets.push({
                        elem: m,
                        orbitalRadius: orbitalRadius * parentSize * Config.moonOrbitMul,
                        year,
                        size,
                        name: moon
                    })

                    if (children) {
                        let = moonSize = size
                        for (let [name, { type, size, orbitalRadius, year }] of Object.entries(children)) {
                            newloc = newloc.slice(0, 3)
                            newloc.push(name)
                            let elem = makePlanet(type, size, name, newloc)
                            m.addChild(makeOrbit(0, 0, orbitalRadius * moonSize * Config.moonOrbitMul, 0.375))
                            m.addChild(elem)
                            console.log(name)
                            planets.push({
                                elem,
                                orbitalRadius: orbitalRadius * moonSize * Config.moonOrbitMul,
                                year,
                                size,
                                name,
                            })
                        }
                    }
                }
            }
            if (debth == 'Planet' && planet == loc[1]) {
                makeFocus(planetElem, size)
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

    console.log(type, size, name, loc)
    hoverSelect(planet, size, name)
    planet.mouseup = function (e) {
        e.stopPropagation()
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
    selector.lineStyle(1.5 / zoom, 0xcccccc, 0);
    selector.drawCircle(0, 0, radius);
    selector.endFill()
    obj.addChild(selector)

    let fontSize = 18 / zoom
    let text = new PIXI.Text(str, { fontFamily: '-apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif', fontSize, fill: 0xeeeeee, align: 'center' });
    text.resolution = zoom * 4
    text.parentGroup = layers.hoverUI
    text.x += radius / (2 ** .5) + 3 / zoom
    text.y -= fontSize + radius / (2 ** .5) + 3 / zoom
    text.visible = false
    obj.addChild(text)

    obj.mouseover = function (e) {
        e.stopPropagation()
        selector.clear()
        selector.lineStyle(1.5 / zoom, 0xcccccc, 1);
        selector.drawCircle(0, 0, radius);
        selector.endFill()
        text.visible = true
        obj.cursor = "pointer"
    }

    obj.mouseout = function (e) {
        // e.stopPropagation()
        selector.clear()
        selector.lineStyle(1.5 / zoom, 0xcccccc, 0);
        selector.drawCircle(0, 0, radius);
        selector.endFill()
        text.visible = false
    }
}

function makeOrbit(x, y, radius, stroke) {
    let orbit = new PIXI.Graphics();
    orbit.parentGroup = PIXI.mapObj
    orbit.lineStyle(stroke, 0xcccccc, 1);
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

    star.mouseup = function (e) {
        e.stopPropagation()
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

function drawLoop(delta) {
    fpsCounter.text = Math.floor(delta * 60) + "fps"
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
            } else if (debth == 'Satellite' && planets[i].name == State.location[2]) {
                let elem = planets[i].elem
                app.stage.position.set(-(x + elem.parent.x) * app.stage.scale.x + mx, -(y + elem.parent.y) * app.stage.scale.y + my)
            }
        }
    }
}

function calcPlanetPos(year, orbitalRadius) {
    let theta = Date.now() / year / Config.orbitTime / 1000
    let x = Math.cos(theta) * orbitalRadius
    let y = Math.sin(theta) * orbitalRadius
    return [x, y]
}

function calcSatilitePos(year, orbitalRadius, parentYear, parentOrbitalRadius, parentSize) {
    let [x, y] = calcPlanetPos(parentYear, parentOrbitalRadius)

    let theta = Date.now() / year / Config.orbitTime / 1000
    let r = orbitalRadius * parentSize * Config.moonOrbitMul
    x += Math.cos(theta) * r
    y += Math.sin(theta) * r

    return [x, y]
}

setupMap()
app.ticker.add(delta => drawLoop(delta));
