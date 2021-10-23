// This is straight from the jscad docs:
// https://www.openjscad.xyz/docs/tutorial-03_usingParameters.html
const jscad = require('@jscad/modeling')
const { cuboid, roundedCuboid } = jscad.primitives
const { subtract } = jscad.booleans

const getParameterDefinitions = () => {
  return [
    { name: 'outerWidth', caption: 'Outer width of box:', type: 'float', initial: 120 },
    { name: 'outerDepth', caption: 'Outer depth of box:', type: 'float', initial: 100 },
    { name: 'outerHeight', caption: 'Outer height of box:', type: 'float', initial: 50 },
    { name: 'wallThickness', caption: 'Wall Thickness:', type: 'float', initial: 2 },
    { name: 'cornerRadius', caption: 'Inside Corner Radius:', type: 'float', initial: 5 }
  ]
}

const main = (params) => {
  return subtract(outerBox(params), innerBox(params))
}

const outerBox = (params) => {
  return cuboid({
    size: [params.outerWidth, params.outerDepth, params.outerHeight],
    center: [0, 0, params.outerHeight / 2]
  })
}

const innerBox = (params) => {
  const size = [
    params.outerWidth - 2 * params.wallThickness,
    params.outerDepth - 2 * params.wallThickness,
    params.outerHeight + 2 * params.cornerRadius
  ]
  const center = [0, 0, size[2] / 2 + params.wallThickness]

  return roundedCuboid({ size, center, roundRadius: params.cornerRadius, segments: 32 })
}

module.exports = { main, getParameterDefinitions }
