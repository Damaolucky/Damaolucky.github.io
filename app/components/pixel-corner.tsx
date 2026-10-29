"use client";

import { useEffect, useId, useState } from "react";
import { useMotionEnabled } from "./motion-preference";
import styles from "./pixel-corner.module.css";

type CatPhase = "sleeping" | "waking" | "awake" | "drowsy";

function Snow({near=false}: {near?:boolean}) {
  return <g className={near?styles.nearSnow:styles.farSnow} fill={near?'var(--snow)':'var(--moonlight)'} opacity={near?.85:.5}>
    {[0,-58].map(offset=><g key={offset}>{Array.from({length:near?17:26},(_,i)=><rect key={i} x={(i*19+(near?7:0))%66} y={(i*13)%58+offset} width={near&&i%4===0?2:1} height={near&&i%4===0?2:1}/>)}</g>)}
  </g>;
}
function Heart({x,y,small=false,className}: {x:number;y:number;small?:boolean;className:string}) {
  return <g transform={`translate(${x} ${y}) scale(${small?.65:1})`}><path className={className} d="M0 1H2V0H4V2H5V0H7V1H9V5H7V7H5V9H4V7H2V5H0Z" fill="#d89db5"/><path className={className} d="M1 2H3V3H1Z" fill="#f7d5e3"/></g>;
}
function SleepyCat({phase}: {phase:CatPhase}) {
  const asleep=phase==='sleeping'||phase==='drowsy';
  return <g transform="translate(31 65)" data-cat-phase={phase}>
    {asleep?<g className={styles.breathing}>
      <path d="M11 10H24V12H28V16H30V22H27V25H7V23H3V16H6V13H11Z" fill="#ece0d8"/>
      <path d="M8 14V9H11V12H18V9H21V15H22V21H18V24H7V21H5V16H8Z" fill="#fff2e5"/>
      <path className={styles.earTwitch} d="M8 14V9H11V12ZM18 12V9H21V14Z" fill="#ece0d8"/>
      <path d="M9 13H11V15H9ZM18 13H20V15H18Z" fill="#c49ba9"/>
      <path d={phase==='drowsy'?'M9 18H12V19H9ZM17 18H20V19H17Z':'M9 19H12V20H9ZM17 19H20V20H17Z'} fill="#56536d"/>
      <path d="M14 21H16V22H14Z" fill="#b88498"/><path d="M26 17H30V23H27V26H15V24H25V22H26Z" fill="#c5b2cb"/><path d="M12 13H14V15H12ZM15 12H17V14H15Z" fill="#cebcd2"/>
    </g>:<g className={phase==='waking'?styles.stretch:styles.awakeBounce}>
      <path d="M9 12H24V15H27V23H24V26H7V23H5V17H9Z" fill="#ece0d8"/>
      <path className={styles.tail} d="M24 22H29V19H31V14H33V20H31V24H26V26H20V24H24Z" fill="#c5b2cb"/>
      <path d="M7 5V0H10V3H19V0H22V5H24V14H21V17H7V14H5V7H7Z" fill="#fff2e5"/>
      <path d="M8 3H10V6H8ZM19 3H21V6H19Z" fill="#c49ba9"/>
      {phase==='waking'?<path d="M9 10H12V11H9ZM17 10H20V11H17Z" fill="#56536d"/>:<g className={styles.blink}><path d="M10 9H12V12H10ZM18 9H20V12H18Z" fill="var(--wood)"/><path d="M10 9H11V10H10ZM18 9H19V10H18Z" fill="#f1e3db"/></g>}
      <path d="M14 13H16V14H14ZM8 13H10V14H8ZM20 13H22V14H20Z" fill="#be8a9e"/>
      <path d={phase==='waking'?'M3 22H10V26H0V24H3ZM19 22H26V26H17V24H19Z':'M7 23H12V26H7ZM18 23H23V26H18Z'} fill="#fff2e5"/>
      <path d="M12 4H14V6H12ZM15 3H17V5H15Z" fill="#cebcd2"/>
    </g>}
  </g>;
}
function WinterRoom({phase,sequence}: {phase:CatPhase;sequence:number}) {
  const windowClip=useId().replace(/:/g,'');
  return <svg className={styles.pixelArt} viewBox="0 0 112 104" shapeRendering="crispEdges" aria-hidden="true">
    <defs><clipPath id={windowClip}><rect x="8" y="8" width="67" height="56"/></clipPath></defs>
    <rect width="112" height="104" fill="var(--room)"/>
    <path d="M0 75H112V104H0Z" fill="var(--floor)"/><path d="M0 87H112M0 99H112M13 75V87M66 75V87M37 87V99M95 87V99" stroke="var(--floor-line)" strokeWidth="1"/>
    {/* A large, cool window balances the small warm hearth. */}
    <rect x="5" y="5" width="73" height="62" fill="var(--frame)"/><rect x="7" y="7" width="69" height="58" fill="var(--inset)"/>
    <g clipPath={`url(#${windowClip})`}>
      <rect x="8" y="8" width="67" height="56" fill="var(--sky)"/>
      <path d="M58 14H63V16H65V21H63V23H58V21H56V16H58Z" fill="var(--snow)"/><path d="M61 13H66V21H62V19H60V15H61Z" fill="var(--sky)"/>
      <path d="M8 53H18V50H31V53H44V48H58V51H76V65H8Z" fill="var(--frame)"/>
      <path d="M18 31H20V36H24V42H27V48H23V52H14V48H10V44H13V39H16V35H18ZM45 25H47V30H51V36H54V42H58V48H51V54H41V49H35V44H38V38H41V32H45Z" fill="var(--wood)"/>
      <path d="M15 39H23V41H15ZM12 45H26V47H12ZM42 34H50V36H42ZM39 41H54V43H39Z" fill="var(--tree-snow)"/>
      <path d="M8 58H20V55H33V58H47V55H64V57H76V66H8Z" fill="var(--snowbank)"/>
      <g transform="translate(8 8)"><Snow/><Snow near/></g>
    </g>
    <path d="M39 7H42V65H39ZM7 35H76V38H7Z" fill="var(--frame)"/><path d="M40 8H41V35H40ZM8 36H39V37H8ZM43 36H75V37H43Z" fill="var(--moonlight)" opacity=".4"/>
    <path d="M4 65H79V68H4ZM9 63H23V64H9ZM45 63H70V64H45Z" fill="var(--sill)"/><path d="M2 3H5V70H2ZM78 3H82V70H78Z" fill="var(--wood)"/>
    <path d="M8 68H74L86 91H18Z" fill="var(--moonlight)" opacity=".035"/>
    {/* A tiny shelf and a restrained violet accent keep the wall quiet. */}
    <path d="M89 21H107V23H89ZM92 14H95V21H92ZM97 12H101V21H97ZM103 16H106V21H103Z" fill="var(--frame)"/><path d="M92 14H95V16H92ZM97 12H101V14H97Z" fill="#c7b0de" opacity=".65"/>
    <path className={styles.fireGlow} d="M85 60H104L112 95H63L72 77Z" fill="#eab89d" opacity=".075"/>
    <path d="M86 34H101V53H105V57H81V53H86Z" fill="var(--brick)"/><path d="M86 41H101M86 48H101M94 34V41M90 41V48M98 41V48" stroke="var(--mortar)" strokeWidth="1"/>
    <path d="M82 58H104V79H82Z" fill="var(--hearth)"/><path d="M86 61H100V77H86Z" fill="var(--inset)"/><path d="M79 79H107V82H79Z" fill="var(--sill)"/>
    <g className={styles.fireOuter}><path d="M87 75V70H89V67H91V64H92V69H95V66H97V71H99V76H87Z" fill="#d89db5"/><path d="M89 75V70H91V68H93V72H96V76H89Z" fill="#eab89d"/></g>
    <path className={styles.fireInner} d="M91 76V73H93V70H94V73H96V76Z" fill="#f2d5ac"/><path d="M86 77H101V79H86Z" fill="#a3879e"/>
    <g className={styles.embers} fill="#f2d5ac"><rect x="90" y="60" width="1" height="1"/><rect x="97" y="63" width="1" height="1"/></g>
    <path d="M88 87H99V89H88ZM94 90H105V92H94Z" fill="#b09ab7"/>
    {/* Padded, rounded pixel bed: the sleeping cat sits inside the rim. */}
    <path d="M24 92H70V96H24Z" fill="var(--inset)" opacity=".5"/>
    <path d="M24 77H29V74H65V77H70V81H73V90H69V95H26V92H22V82H24Z" fill="var(--bed)"/>
    <path d="M29 78H65V80H69V88H26V81H29Z" fill="var(--wood)"/>
    <path d="M28 84H66V91H28Z" fill="#b6a0c9"/><path d="M32 83H61V86H64V90H28V86H32Z" fill="#c6b0d6"/>
    <SleepyCat phase={phase}/>
    <path d="M22 85H26V89H31V91H63V89H69V85H73V92H69V96H26V93H22Z" fill="#c3a9d6"/><path d="M27 91H31V93H63V91H68V94H64V97H30V95H27Z" fill="var(--bed-shadow)"/>
    <path d="M45 92H47V91H49V93H51V91H53V92H54V94H52V96H48V95H46Z" fill="#e3cce9"/>
    <path d="M25 81H27V86H25ZM68 79H70V85H68Z" fill="#e9d7f1"/>
    {phase==='sleeping'&&<g className={styles.sleepMarks} fill="var(--snowbank)" opacity=".7"><path d="M61 66H66V67H64V68H63V69H66V70H61V69H63V68H64V67H61Z"/><rect x="69" y="62" width="2" height="1"/></g>}
    {phase!=='sleeping'&&<g key={sequence}><Heart x={35} y={57} className={styles.heartOne}/><Heart x={59} y={56} small className={styles.heartTwo}/><Heart x={49} y={48} small className={styles.heartThree}/></g>}
  </svg>;
}
export function PixelCorner() {
  const [phase,setPhase]=useState<CatPhase>('sleeping');
  const [sequence,setSequence]=useState(0);
  const motion=useMotionEnabled();
  useEffect(()=>{
    if(sequence===0)return;
    const timers=[
      window.setTimeout(()=>setPhase('awake'),400),
      window.setTimeout(()=>setPhase('drowsy'),2300),
      window.setTimeout(()=>setPhase('sleeping'),3400),
    ];
    return ()=>timers.forEach(timer=>window.clearTimeout(timer));
  },[sequence]);
  const wake=()=>{setPhase('waking');setSequence(n=>n+1);};
  return <section className={styles.corner} data-motion={motion} aria-label="雪夜壁炉与小猫" data-academy-no-effect>
    <div className={styles.crt}>
      <button className={styles.screen} aria-label={phase==='sleeping'?'轻轻摸摸熟睡的小猫':'再摸摸小猫'} onClick={wake}>
        <WinterRoom phase={phase} sequence={sequence}/><span className={styles.scanlines}/>
      </button>
      <div className={styles.hardware} aria-hidden="true"><span className={styles.vents}/><i/></div>
    </div>
  </section>;
}
