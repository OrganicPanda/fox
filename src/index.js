import ReactDOM from 'react-dom'
import React from 'react'
import './styles.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)


// console.log('import.meta', import.meta)
// console.log("new URL('worker.js', import.meta.url)", new URL('worker.js', import.meta.url))

// const workerInstance = new Worker(new URL('worker.js', import.meta.url), { type: 'module' })
// console.log('workerInstance', workerInstance)

// workerInstance.onmessage = function(e) {
//   console.log('Message received from worker', e);
// }

// workerInstance.postMessage('hey');