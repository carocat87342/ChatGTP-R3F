import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Icosahedron,
  Point,
  Points,
  ScreenQuad,
  shaderMaterial,
  Stars,
} from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useState } from "react";
import { useGLTF } from "@react-three/drei";

// import useRef from "react";

const hundredColors = require("./hundredColors.json");
let firstPalette = hundredColors[21];
firstPalette = firstPalette.map((color) => new THREE.Color(color));
const newPalette = [
  new THREE.Color("#FFFFFF"),
  new THREE.Color("#000000"),
  new THREE.Color("#FFFFFF"),
  new THREE.Color("#000000"),
  new THREE.Color("#FFFFFF"),
];

const GradientMaterial = shaderMaterial(
  {
    time: 0,
    // uColor: firstPalette,
    uColor: newPalette,

    resolution: new THREE.Vector4(),
    opacity: 1,
    modifier: 1,
    // u: 1,
    // amplitude: 0.5,
  },
  /* glsl */ `
    uniform float modifier;
    uniform float time;
    // varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColor[5];
    varying vec3 vColor;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    uniform float opacity;
    //	Simplex 3D Noise 
    //	by Ian McEwan, Ashima Arts
    //
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
    
    // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
    
      //  x0 = x0 - 0. + 0.0 * C 
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    
    // Permutations
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
      float n_ = 1.0/7.0; // N=7
      vec3  ns = n_ * D.wyz - D.xzx;
    
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
    
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
      vec4 x = x_ *ns.x + ns.yyyy ;
      vec4 y = y_ *ns.x + ns.yyyy ;
      vec4 h = 1.0 - abs(x) - abs(y);
    
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
    
      vec4 s0 = floor(b0)*2.0 + 1.0 ;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
    
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
    
    //Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x ;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
    
    // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m ;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    
    void main() {
    
    
      
    
      vec3 noiseCoord = normal;
    
      float tilt = -0.8*normal.y ;
    
      float incline  = normal.x*0.1;
      // float incline  = uv.x*10.;
  
    
      float offset = incline*mix(-.25,0.25,normal.x);
      // float offset = incline*mix(-2.,2.,normal.y);
  
    
    
    
      float noise = snoise(vec3(noiseCoord.x + time*3.,noiseCoord.y, time * 10.));
    
      noise = max(0.,noise);
    
      // vec3 pos = vec3(position.x,position.y,position.z + noise * 0.3 +tilt + incline + offset);
      vec3 pos = vec3(position.x,position.y,position.z );

      // vec3 pos = vec3(position.x,position.y,position.z + noise * 200. +tilt + incline + offset);
  
    
      // uColor[0] = uColor[0] *0.5;
      // uColor[1] = uColor[0] *0.5;
      // uColor[2] = uColor[0] *0.5;

    
    
      vColor = uColor[4] * modifier;
    
      for(int i = 0; i < 4; i++) {
    
        float noiseFlow  = 5. + float(i)*0.3 ;
        float noiseSpeed  = 10. + float(i)*0.3;
    
        float noiseSeed = 1. + float(i)*10.;
        vec2 noiseFreq = vec2(1.,1.4)*.4 ;
    
        float noiseFloor = 0.1;
        float noiseCeil = 0.6 + float(i)*0.07;
    
    
    
        float noise = smoothstep(noiseFloor,noiseCeil,
          snoise(
            vec3(
              noiseCoord.x*noiseFreq.x + time*noiseFlow,
              noiseCoord.y*noiseFreq.y, 
              time / 2.0 * noiseSpeed + noiseSeed
            )
          )
        );
    
        vColor = mix(vColor,uColor[i],noise);
    
        
      }
    
      // vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
    
      `,
  /* glsl */ `
    
  uniform float opacity;
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform vec4 resolution;
    // varying vec2  vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vColor;
    float PI = 3.141592653589793238;
    void main()	{
        // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
        // gl_FragColor = vec4(vNormal,1.);
        gl_FragColor = vec4(vColor,opacity);
    }
      `
);

extend({ GradientMaterial });
// -1.0 + 2.0 *vUv

export default function GradientTwo(props) {
  const [colors, setColors] = useState([
    new THREE.Color("#FFFFFF"),
    new THREE.Color("#000000"),
    new THREE.Color("#FFFFFF"),
    new THREE.Color("#000000"),
    new THREE.Color("#FFFFFF"),
  ]);

  useEffect(() => {
    // console.log(props.colorOne);
    // console.log(props.colorTwo);
    let threeColorOne = new THREE.Color(props.colorOne);
    let threeColorTwo = new THREE.Color(props.colorTwo);
    let threeColorThree = new THREE.Color(props.colorThree);
    let threeColorFour = new THREE.Color(props.colorFour);
    let threeColorFive = new THREE.Color(props.colorFive);
    setColors([
      threeColorOne,
      threeColorTwo,
      threeColorThree,
      threeColorFour,
      threeColorFive,
    ]);
    gsap.to(colors[0], {
      r: threeColorOne.r,
      g: threeColorOne.g,
      b: threeColorOne.b,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: function () {
        // Update the uniforms with the new color values
        gradientRef.current.material.uniforms.uColor.value[0].setRGB(
          colors[0].r,
          colors[0].g,
          colors[0].b
        );
      },
    });
    gsap.to(colors[1], {
      r: threeColorTwo.r,
      g: threeColorTwo.g,
      b: threeColorTwo.b,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: function () {
        // Update the uniforms with the new color values
        gradientRef.current.material.uniforms.uColor.value[1].setRGB(
          colors[1].r,
          colors[1].g,
          colors[1].b
        );
      },
    });
    gsap.to(colors[2], {
      r: threeColorThree.r,
      g: threeColorThree.g,
      b: threeColorThree.b,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: function () {
        // Update the uniforms with the new color values
        gradientRef.current.material.uniforms.uColor.value[2].setRGB(
          colors[2].r,
          colors[2].g,
          colors[2].b
        );
      },
    });
    gsap.to(colors[3], {
      r: threeColorFour.r,
      g: threeColorFour.g,
      b: threeColorFour.b,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: function () {
        // Update the uniforms with the new color values
        gradientRef.current.material.uniforms.uColor.value[3].setRGB(
          colors[3].r,
          colors[3].g,
          colors[3].b
        );
      },
    });
    gsap.to(colors[4], {
      r: threeColorFive.r,
      g: threeColorFive.g,
      b: threeColorFive.b,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: function () {
        // Update the uniforms with the new color values
        gradientRef.current.material.uniforms.uColor.value[4].setRGB(
          colors[4].r,
          colors[4].g,
          colors[4].b
        );
      },
    });
    // gsap.to(gradientRef.current.material.uniforms.time, {
    //   value: 5,
    //   duration: 2,
    //   ease: "power1.inOut",
    // });
  }, [props]);

  // const animateColors = (newColors) => {
  //   TweenMax.to(colors[0], 2, {
  //     r: newColors[0].r,
  //     g: newColors[0].g,
  //     b: newColors[0].b,
  //     onUpdate: function() {
  //       // Update the uniforms with the new color values
  //       gradientMaterial.uniforms.uColor[0].setRGB(colors[0].r, colors[0].g, colors[0].b);
  //     }
  //   });
  //   TweenMax.to(colors[1], 2, {
  //     r: newColors[1].r,
  //     g: newColors[1].g,
  //     b: newColors[1].b,
  //     onUpdate: function() {
  //       // Update the uniforms with the new color values
  //       gradientMaterial.uniforms.uColor[1].setRGB(colors[1].r, colors[1].g, colors[1].b);
  //     }
  //   });

  const gradientRef = useRef();
  useFrame((state, delta) => {
    gradientRef.current.material.uniforms.time.value += delta / 40;
    gradientRef.current.material.uniforms.opacity.value = props.opacity;

    // if (props.colorOne) {
    //   // let whatever = new THREE.Color(props.colorOne);
    //   console.log(whatever);
    //   gradientRef.current.material.uniforms.uColor.value[0] = new THREE.Color(
    //     props.colorOne
    //   );
    //   gradientRef.current.material.uniforms.uColor.value[1] = new THREE.Color(
    //     props.colorTwo
    //   );
    //   gradientRef.current.material.uniforms.uColor.value[2] = new THREE.Color(
    //     props.colorThree
    //   );
    //   gradientRef.current.material.uniforms.uColor.value[3] = new THREE.Color(
    //     props.colorFour
    //   );
    //   gradientRef.current.material.uniforms.uColor.value[4] = new THREE.Color(
    //     props.colorFive
    //   );
    // }
    // }
  });
  const { nodes, materials } = useGLTF("/statue.glb");

  return (
    <>
      {props.shape === "sphere" ? (
        <mesh
          // visible={false}
          receiveShadow
          rotation-y={-Math.PI / 2}
          ref={gradientRef}
        >
          <sphereGeometry args={[0.75, 2048, 2048]} />
          <gradientMaterial
            side={THREE.BackSide}
            transparent={true}
            extensions={{
              derivatives: "#extension GL_OES_standard_derivatives : enable",
            }}
          />
        </mesh>
      ) : (
        <group {...props} dispose={null}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Buddha_statue.geometry}
            // material={materials["Default OBJ"]}
            // position={[38.04, 19.26, -28.28]}
            position={[3.5, 2.1, -3]}
            rotation={[Math.PI / 2, 0, 0]}
            ref={gradientRef}
            scale={0.1}
          >
            <gradientMaterial
              // side={THREE.BackSide}
              transparent={true}
              extensions={{
                derivatives: "#extension GL_OES_standard_derivatives : enable",
              }}
            />
          </mesh>
        </group>
      )}
    </>
  );
}

useGLTF.preload("/statue.glb");
