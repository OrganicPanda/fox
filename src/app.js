import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Slider, Provider, defaultTheme } from '@adobe/react-spectrum'
import Box from './Box'
import Thing from './Thing'

export default function App() {
  let [wallThickness, setWallThickness] = React.useState(2)

  return (
    <Provider theme={defaultTheme}>
      <div className="wrapper">
        <Canvas className="canvas" mode="concurrent">
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Box position={[-1.2, 1, 1]} />
          <Box position={[1.2, 1, 1]} />
          <Thing wallThickness={wallThickness} scale={0.2} position={[-2, -1, 0]} />
          <Thing scale={0.2} position={[2, -1, 0]} />
          <OrbitControls />
        </Canvas>

        <div className="slider">
          <Slider label="Wall Thickness" minValue={1} maxValue={30} value={wallThickness} onChange={setWallThickness} />
        </div>
      </div>
    </Provider>
  )
}

