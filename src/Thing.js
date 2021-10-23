import React, {
  useRef,
  useState,
  useEffect,
  useTransition,
  Suspense,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CSGToBuffers } from "./CSGToBuffers";
import buffersToObject3D from "./BuffersToObject3D";
// Import the vanilla csg format
import { main, getParameterDefinitions } from "./example";

// const worker = new Worker('../src/worker.js')
const worker = new Worker(new URL("worker.js", import.meta.url), {
  type: "module",
});

worker.onmessage = (message) => {
  console.log("worker.onmessage", message);
};
worker.onerror = (message) => {
  console.log("worker.onerror", message);
};

// Tiny sham to reformat the params
const getParams = (defs, overrides = {}) => {
  return defs.reduce((acc, def) => {
    acc[def.name] = overrides[def.name] ? overrides[def.name] : def.initial;
    return acc;
  }, {});
};

let key = 0;

const generateModel = (overrides = {}) => {
  return new Promise((resolve, reject) => {
    const requestKey = key++;
    // const start = performance.now();

    // Build using jscad
    // TODO: It's probably not ideal to make an instance
    // per component instance. Somehow share/memo/object3d.clone()
    //   const jscadObject = main(getParams(getParameterDefinitions(), overrides))
    const onMessage = ({ data }) => {
      //   console.log(`generateModel: message from worker:`, data);
      const { action, payload } = data;

      if (action === "GENERATE_MODEL_SUCCESS") {
        const { key, model } = payload;
        console.log(`generateModel: key from worker:`, key, key === requestKey);
        console.log(`generateModel: model from worker:`, model);

        if (key === requestKey) {
          const buffers = CSGToBuffers(model);
          const object3d = buffersToObject3D(buffers);

          worker.removeEventListener("message", onMessage);
          console.log(`generateModel: resolving:`, object3d);
          resolve(object3d);
        }
      }
    };

    worker.addEventListener("message", onMessage);

    worker.postMessage({
      action: "GENERATE_MODEL",
      payload: { key: requestKey, overrides },
    });

    //   const delta1 = performance.now()

    //   // Convert to something threejs can work with
    //   const buffers = CSGToBuffers(jscadObject)
    //   const delta2 = performance.now()
    //   const object3d = buffersToObject3D(buffers)
    //   const delta3 = performance.now()

    //   // console.log('csg', jscadObject)
    //   // console.log('buffers', buffers)
    //   // console.log('object3d', object3d)
    //   // console.log('object3d.geometry', object3d.geometry)
    //   // console.log('object3d.material', object3d.material)

    //   const delta = performance.now()

    //   console.log(`generateModel ran in ${delta - start}ms with overrides ${JSON.stringify(overrides)}`)
    //   console.log(`generateModel 1 ${delta1 - start}ms 2 ${delta2 - delta1}ms 3 ${delta3 - delta2}ms`)

    // console.log('buffers', buffers)

    //   return object3d
  });
};

export function generateModelTransition(overrides) {
  const modelPromise = generateModel(overrides);

  return {
    overrides,
    model: wrapPromise(modelPromise),
  };
}

function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    (r) => {
      console.log("wrapPromise success");
      status = "success";
      result = r;
    },
    (e) => {
      console.log("wrapPromise error");
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        console.log("wrapPromise read() pending");
        throw suspender;
      } else if (status === "error") {
        console.log("wrapPromise read() error");
        throw result;
      } else if (status === "success") {
        console.log("wrapPromise read() success");
        return result;
      }
    },
  };
}

const initialResource = generateModelTransition();

const ThingWrapper = ({ scale, position, wallThickness }) => {
  const [resource, setResource] = useState(initialResource);
  const [startTransition, isPending] = useTransition({
    timeoutMs: 3000,
  });

  useEffect(() => {
    startTransition(() => {
      const overrides = {
        wallThickness: wallThickness,
      };
      setResource(generateModelTransition(overrides));
    });
  }, [wallThickness]);

  return <Thing resource={resource} scale={scale} position={position} />;
};

const Thing = ({ resource, scale, position }) => {
  const meshRef = useRef();
  const rotationRef = useRef();
  const object3d = resource.model.read();
  const cloned = object3d.clone();

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (!meshRef.current) return;
    if (rotationRef.current == null) rotationRef.current = 0;
    rotationRef.current += 0.01;
    meshRef.current.rotation.x = meshRef.current.rotation.y =
      rotationRef.current;
  });

  // Express that as something rect-three-fiber can render
  return (
    <primitive
      object={cloned}
      ref={meshRef}
      scale={scale / 12}
      position={position}
    />
  );
};

export default ThingWrapper;

// TODO: how to set the material?
// material={new THREE.MeshStandardMaterial('hotpink')}
// TODO: does primative support events?
// const [hovered, setHover] = useState(false)
// const [active, setActive] = useState(false)
// onClick={(e) => setActive(!active)}
// onPointerOver={(e) => setHover(true)}
// onPointerOut={(e) => setHover(false)}
// TODO: why are the models so big?
