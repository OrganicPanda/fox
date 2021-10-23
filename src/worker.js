import { main, getParameterDefinitions } from './example'

const getParams = (defs, overrides = {}) => {
  return defs.reduce((acc, def) => {
    acc[def.name] = overrides[def.name] ? overrides[def.name] : def.initial
    return acc
  }, {})
}

global.onmessage = ({ data }) => {
//   global.postMessage('boom')
//   try {
    console.log('--> Worker: Message received from main script', data)

    const { action, payload } = data;
    
    if (action !== 'GENERATE_MODEL') return;

    const { key, overrides } = payload
    const start = performance.now()
    const jscadObject = main(getParams(getParameterDefinitions(), overrides))
    const delta = performance.now()

    console.log(`--> Worker: ran in ${delta - start}ms with overrides ${JSON.stringify(payload.overrides)}`)

    global.postMessage({ action: 'GENERATE_MODEL_SUCCESS', payload: { key, overrides, model: jscadObject }})
//   } catch (e) {
//     global.postMessage(e.stack)
//   }
}
