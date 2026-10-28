const meditions = [{value: "oxygen", string: "Oxígeno"}]
const outcomes = [
    {value: "reconfigured", string: "Reconfigurado"},
    {value: "replaced", string: "Reemplazado"},
    {value: "back_online", string: "Operativo"},
    {value: "no_fault_found", string: "Sin fallas"}
]
const positions = [{value: "jaula", string: "Jaula"}, {value: "ponton", string: "Pontón"}]

function map(array, value) {
    const element = array.find(e => e.value === value)
    return element ? element.string : value
}

export function mapMedition(value) {
    return map(meditions, value)
}

export function mapOutcome(value) {
    return map(outcomes, value)
}

export function mapPosition(value) {
    return map(positions, value)
}