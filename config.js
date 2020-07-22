let Config = {
    planetColors: {
        continental: 0x18393e,
        barren: 0x454545,
    },
    moonOrbitMul: 2,
    orbitTime: Math.PI * 12,
    scales: {
        System: 1,
        Planet: 3,
        Satellite: 5,
    }
}

function accent(color) {
    return color + 0x300000 + 0x003000 + 0x000030
}