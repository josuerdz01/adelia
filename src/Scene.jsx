import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Hand } from 'lucide-react';

function Bulb({on, reduced}) {
  const glass=useRef(), light=useRef(), coil=useRef();
  const glow=useRef();
  const glowMap=useMemo(()=>{const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,210,105,.5)");g.addColorStop(.35,"rgba(255,194,66,.15)");g.addColorStop(1,"rgba(255,194,66,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)},[]);
  const geometry=useMemo(()=>{
    const points=[[.13,0],[.18,.12],[.24,.25],[.38,.42],[.50,.64],[.52,.85],[.46,1.05],[.32,1.21],[.13,1.29],[0,1.31]].map(([x,y])=>new THREE.Vector2(x,y));
    return new THREE.LatheGeometry(new THREE.SplineCurve(points).getPoints(70),64);
  },[]);
  useFrame((_,dt)=>{
    if(!glass.current) return;
    const target=on?1:0;
    glass.current.emissiveIntensity=THREE.MathUtils.damp(glass.current.emissiveIntensity,target*2.8, reduced?100:9,dt);
    glass.current.color.lerp(new THREE.Color(on?"#ffe3a2":"#b2c0af"),1-Math.exp(-dt*9));
    glow.current.opacity=THREE.MathUtils.damp(glow.current.opacity,on?.65:0,8,dt);
    light.current.intensity=THREE.MathUtils.damp(light.current.intensity,target*18, reduced?100:7,dt);
    coil.current.emissiveIntensity=THREE.MathUtils.damp(coil.current.emissiveIntensity,on?5:0,10,dt);
  });
  return <group position={[-.65,0,0]}>
    <mesh position={[0,.07,0]} receiveShadow><cylinderGeometry args={[.73,.8,.14,64]}/><meshStandardMaterial color="#253c33" roughness={.4} metalness={.25}/></mesh>
    <mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.62,.72,.4,64]}/><meshStandardMaterial color="#395446" roughness={.38} metalness={.3}/></mesh>
    <mesh position={[0,.53,0]} castShadow><cylinderGeometry args={[.30,.43,.24,64]}/><meshStandardMaterial color="#ddd9c7" roughness={.35}/></mesh>
    <mesh position={[0,.72,0]} castShadow><cylinderGeometry args={[.22,.29,.23,48]}/><meshStandardMaterial color="#8e9386" metalness={.85} roughness={.3}/></mesh>
    {[.64,.70,.76,.82].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.245,.018,8,48]}/><meshStandardMaterial color="#b3b5a3" metalness={.8} roughness={.3}/></mesh>)}
    <mesh position={[0,.83,0]} geometry={geometry} castShadow><meshPhysicalMaterial ref={glass} color="#f1e7b4" emissive="#ffbd44" emissiveIntensity={0} roughness={.23} metalness={.02} transmission={.18} thickness={.3} transparent opacity={.88} clearcoat={1}/></mesh>
    <mesh visible={false} position={[0,1.42,0]}><torusGeometry args={[.14,.012,8,30,Math.PI*1.8]}/><meshStandardMaterial ref={coil}/></mesh><sprite position={[0,1.55,-.05]} scale={[3.3,3.3,1]}><spriteMaterial ref={glow} map={glowMap} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending}/></sprite>
    <pointLight ref={light} position={[0,1.5,.15]} color="#ffc65c" intensity={0} distance={8} decay={2}/>
  </group>;
}
function Switch({on,onToggle,locked,reduced,targetRef}) {
  const rocker=useRef(),root=useRef();
  const projected=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(({camera,size})=>{if(root.current&&targetRef.current){projected.set(0,0,.28).applyMatrix4(root.current.matrixWorld).project(camera);targetRef.current.style.transform=`translate(${(projected.x+1)*size.width/2-40}px,${(1-projected.y)*size.height/2-33}px)`}});
  useFrame((_,dt)=>{if(rocker.current)rocker.current.rotation.x=THREE.MathUtils.damp(rocker.current.rotation.x,on?-.17:.17,reduced?100:15,dt)});
  return <group ref={root} position={[1.05,.14,.40]} rotation={[-Math.PI/2,0,-.12]} onClick={e=>{e.stopPropagation();if(!locked)onToggle()}} onPointerOver={()=>{if(!locked)document.body.style.cursor='pointer'}} onPointerOut={()=>document.body.style.cursor='auto'}>
    <RoundedBox args={[.93,1.26,.16]} radius={.14} smoothness={5} castShadow receiveShadow><meshStandardMaterial color="#e8e5d6" roughness={.4} metalness={.04}/></RoundedBox>
    <RoundedBox args={[.54,.90,.08]} position={[0,0,.10]} radius={.075} smoothness={4}><meshStandardMaterial color="#1f2a23" roughness={.6}/></RoundedBox>
    <group ref={rocker} position={[0,0,.17]}>
      <RoundedBox args={[.48,.83,.13]} radius={.065} smoothness={4} castShadow><meshStandardMaterial color="#f4f0e1" roughness={.25}/></RoundedBox>
      <mesh position={[0,.23,.075]}><boxGeometry args={[.025,.10,.008]}/><meshStandardMaterial color="#53624c"/></mesh>
      <mesh position={[0,-.22,.075]}><ringGeometry args={[.035,.047,24]}/><meshBasicMaterial color="#53624c" side={THREE.DoubleSide}/></mesh>
    </group>

    {[.5,-.5].map(y=><group key={y} position={[0,y,.09]}><mesh><cylinderGeometry args={[.038,.038,.012,20]}/><meshStandardMaterial color="#b6b6a6" metalness={.6}/></mesh></group>)}
  </group>;
}
function World({on,onToggle,locked,reduced,targetRef}) {
 const cable=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(-.2,.11,.35),new THREE.Vector3(.05,.09,.85),new THREE.Vector3(.35,.09,1.1),new THREE.Vector3(.95,.09,1.1),new THREE.Vector3(1.1,.12,.85)]),[]);
 const cableGeometry=useMemo(()=>new THREE.TubeGeometry(cable,50,.045,10,false),[cable]);
 return <>
   <color attach="background" args={['#19251f']}/><fog attach="fog" args={['#19251f',10,24]}/>
   <ambientLight intensity={.9}/><hemisphereLight args={['#f4f2da','#24392d',1.6]}/>
   <directionalLight position={[-3,7,5]} intensity={2.6} color="#eee8d4" castShadow shadow-mapSize={[1024,1024]} shadow-normalBias={.03}/>
   <directionalLight position={[4,2,-3]} intensity={2} color="#9caf88"/>
   <group position={[0,-.28,0]}>
    <mesh position={[0,-.1,0]} receiveShadow><cylinderGeometry args={[2.6,2.6,.16,96]}/><meshStandardMaterial color="#263b30" roughness={.8}/></mesh>
    <mesh position={[0,-.19,0]}><cylinderGeometry args={[2.64,2.64,.07,96]}/><meshStandardMaterial color="#425444" roughness={.5} metalness={.4}/></mesh>
    <Bulb on={on} reduced={reduced}/>
    <mesh geometry={cableGeometry} castShadow><meshStandardMaterial color="#5f7254" roughness={.5}/></mesh>
    <Switch on={on} onToggle={onToggle} locked={locked} reduced={reduced} targetRef={targetRef}/>

   </group>

   <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={.55} maxPolarAngle={1.35} minAzimuthAngle={-.8} maxAzimuthAngle={.8} target={[0,.65,0]}/>
 </>;
}
class SceneBoundary extends React.Component {state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
export default function Scene(props) {
 const targetRef=useRef();
 const fallback=<div className={`fallback-bulb ${props.on?'lit':''}`} aria-hidden="true"><span>💡</span>{!props.locked&&<button className="primary-button" onClick={props.onToggle}>Cambiar estado del foco</button>}</div>;
 return <div className="scene-container"><SceneBoundary fallback={fallback}><Canvas shadows dpr={[1,1.75]} camera={{position:[3.3,3.5,6.7],fov:36}} gl={{antialias:true,alpha:false}} aria-label={`Escena 3D: foco ${props.on?'encendido':'apagado'} conectado a un apagador`}><Suspense fallback={null}><World {...props} targetRef={targetRef}/></Suspense></Canvas></SceneBoundary>{!props.locked&&<div ref={targetRef} className="switch-target"><button className="switch-hit-area" role="switch" aria-label="Apagador 3D del foco" aria-checked={props.on} onClick={props.onToggle}/><div className={`touch-cue ${props.showHint?'visible':''}`} aria-hidden="true"><span className="tap-ring"/><Hand size={25}/><span className="tap-label">Toca aquí</span></div></div>}</div>;
}
