const meditions = [{value: "oxygen", string: "Oxígeno"}]
const positions = [{value: "jaula", string: "Jaula"}, {value: "ponton", string: "Pontón"}]

function map(array, value) {
    const element = array.find(e => e.value === value)
    return element ? element.string : value
}

export function mapMedition(value) {
    return map(meditions, value)
}

export function mapPosition(value) {
    return map(positions, value)
}