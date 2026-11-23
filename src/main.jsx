import React, {useState, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Lightbulb, Volume2, VolumeX, RotateCcw, HelpCircle, X, Check, Hand, MousePointer2, Sparkles, Play, Zap, CheckCircle2} from 'lucide-react';
import Scene from './Scene.jsx';
import {playSound} from './audio';
import {LESSONS, evaluateAnswer} from './lesson';
import './style.css';

function App(){
 const [step,setStep]=useState(0),[on,setOn]=useState(false),[seen,setSeen]=useState({off:true,on:false});
 const [muted,setMuted]=useState(()=>{try{return localStorage.getItem('kaanbal-muted')==='true'}catch{return false}});
 const [answer,setAnswer]=useState(null),[reason,setReason]=useState(null),[feedback,setFeedback]=useState(null);
 const [done,setDone]=useState([]),[busy,setBusy]=useState(false),[help,setHelp]=useState(false),[hint,setHint]=useState(false),[ended,setEnded]=useState(false);
 const [tick,setTick]=useState(0),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const timers=useRef([]),sound=useRef(!muted),lesson=LESSONS[step];
 sound.current=!muted;
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change)},[]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{try{localStorage.setItem('kaanbal-muted',String(muted))}catch{}},[muted]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape')setHelp(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const announceSound=kind=>playSound(kind,sound.current);
 const markDone=()=>setDone(prev=>prev.includes(step)?prev:[...prev,step]);
 function toggle(){if(step!==0||busy)return;const next=!on;setOn(next);setSeen(s=>({...s,[next?'on':'off']:true}));announceSound(next?'on':'off');}
 function go(next){if(busy)return;timers.current.forEach(clearTimeout);setStep(next);setOn(LESSONS[next].start??false);setAnswer(null);setReason(null);setFeedback(null);setHint(false);setTick(0);setEnded(false);}
 function reset(){if(busy)return;go(0);setSeen({off:true,on:false});setDone([]);}
 async function check(){
  if(answer===null||reason===null||busy||feedback?.correct)return;
  if(!evaluateAnswer(lesson,answer,reason)){setFeedback({correct:false,text:'Revisa tu predicción y el motivo. Puedes cambiar tu elección y volver a probar.'});setHint(true);announceSound('hint');return;}
  setBusy(true);setHint(false);setFeedback(null);
  for(let i=0;i<lesson.flips;i++){
   await new Promise(resolve=>{timers.current.push(setTimeout(resolve,reduced?180:650))});
   const next=i%2===0?!lesson.start:lesson.start;setOn(next);setTick(i+1);announceSound(next?'on':'off');
  }
  setBusy(false);setFeedback({correct:true,text:lesson.success});markDone();announceSound('correct');
 }
 const currentValue=step===3?(on?0:1):(on?1:0);
 const canContinue=step===0?seen.on&&seen.off:feedback?.correct;
 return <main className={`app ${on?'is-on':''} ${ended?'is-ended':''}`}>
  <div className="scene-stage"><Scene on={on} onToggle={toggle} locked={step!==0} reduced={reduced}/></div>
  <header className="header">
   <a className="brand" href="#" onClick={e=>{e.preventDefault();reset()}} aria-label="Kaanbal, volver al inicio"><span className="brand-symbol"><Lightbulb size={22}/></span><span>kaanbal<span className="brand-period">.</span></span></a>
   <div className="header-middle"><span className="header-divider"/>LABORATORIO DE IDEAS</div>
   <div className="header-actions"><button className="icon-button glass" aria-label={muted?'Activar sonido':'Silenciar sonido'} aria-pressed={!muted} onClick={()=>{setMuted(!muted);if(muted)playSound('on',true)}}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button><button className="icon-button glass" aria-label="Cómo funciona" onClick={()=>setHelp(true)}><HelpCircle size={19}/></button></div>
  </header>
  <section className="intro" aria-labelledby="lesson-title"><div className="eyebrow"><span className="tiny-line"/> LÓGICA COTIDIANA <span className="lesson-number">/ 01</span></div><h1 id="lesson-title">{ended?'Ya encendiste\nuna idea.':lesson.title}</h1><p>{ended?'Un estado puede cambiar. Una regla también. Ahora sabes observar, predecir y explicar la diferencia.':lesson.description}</p><div className="subject-tags"><span><Zap size={13}/> Dos estados</span><span>5 min</span></div></section>
  <aside className="readout glass" aria-label="Estado actual del foco"><span className="readout-label">{step===3?'REGLA INVERTIDA':'ESTADO DEL FOCO'}</span><div className="readout-value"><span aria-hidden="true">{step===3&&!feedback?.correct?"?":currentValue}</span><div><span className={`state-light ${on?'active':''}`}/><strong>{on?'Encendido':'Apagado'}</strong><small>{step===3?'Encendido = 0 · Apagado = 1':'Apagado = 0 · Encendido = 1'}</small></div></div></aside>
  <div className="scene-tools"><span><MousePointer2 size={14}/> Arrastra para mirar</span><button className="text-button" onClick={reset} disabled={busy}><RotateCcw size={14}/> Reiniciar</button></div>
  <div className="stage-action">
   {step===0&&!ended?<><button className={`power-switch glass ${on?'active':''}`} onClick={toggle} role="switch" aria-checked={on} aria-label="Apagador del foco"><span className="switch-rocker"><span>I</span><span>O</span></span></button><span className="touch-label"><Hand size={14}/> Toca el apagador</span></>:<div className="sequence-indicator glass"><span>{step===3?'LA LUZ NO CAMBIÓ':busy?'OBSERVA EL CAMBIO':feedback?.correct?'PREDICCIÓN COMPROBADA':'PRIMERO, TU PREDICCIÓN'}</span>{step===2&&<div>{[0,1,2,3].map((v,i)=><React.Fragment key={i}><b className={tick>=i?'reached':''}>{tick>=i?v%2:'?'}</b>{i<3&&<i>·</i>}</React.Fragment>)}</div>}</div>}
  </div>
  <section className="activity glass" aria-label="Actividad de aprendizaje">
   <div className="activity-heading"><span className="eyebrow">{ended?'LO QUE DESCUBRISTE':lesson.eyebrow}</span><span className="activity-count">{step+1}<span> / 4</span></span></div>
   {ended?<><div className="completion-mark"><CheckCircle2 size={32}/></div><h2>La lógica está en la regla.</h2><p>Cada estado tiene un símbolo. Para predecir qué ocurre, sigue los cambios y la regla del ejercicio.</p><div className="summary-list"><span><Check size={16}/> Observar antes de responder</span><span><Check size={16}/> Seguir cambios paso a paso</span><span><Check size={16}/> Explicar usando la regla</span></div><button className="primary-button" onClick={reset}>Volver a experimentar</button></>:step===0?<><h2>{lesson.question}</h2><p>{lesson.detail}</p><div className="state-pair"><div className={!on?'selected':''}><strong>0</strong><span>Apagado</span>{seen.off&&<Check size={14}/>}</div><div className={on?'selected':''}><strong>1</strong><span>Encendido</span>{seen.on&&<Check size={14}/>}</div></div><div className="discovery-message" aria-live="polite">{canContinue?<><CheckCircle2 size={16}/> Ya exploraste los dos estados.</>:<><Hand size={16}/> Enciende el foco para descubrir el otro estado.</>}</div><button className="primary-button" disabled={!canContinue} onClick={()=>{markDone();go(1);announceSound('on')}}>Ponerme a prueba</button></>:<>
    <h2>{lesson.question}</h2><p>{lesson.detail}</p>
    <div className="answer-options" role="group" aria-label="Elige el número"><span className={`selection-pill ${answer===1?'right':''} ${answer===null?'hidden':''}`}/>{[0,1].map(n=><button key={n} aria-pressed={answer===n} disabled={busy||feedback?.correct} onClick={()=>{setAnswer(n);setFeedback(null)}}>{n}<span>{answer===n?'Tu predicción':'Elegir'}</span></button>)}</div>
    <fieldset className="reason-options" disabled={busy||feedback?.correct}><legend>¿Por qué?</legend>{lesson.reasons.map((r,i)=><label key={r} className={reason===i?'selected':''}><input type="radio" name="reason" checked={reason===i} onChange={()=>{setReason(i);setFeedback(null)}}/><span>{r}</span></label>)}</fieldset>
    {hint&&!feedback?.correct&&<div className="hint"><Lightbulb size={16}/><p>{lesson.hint}</p></div>}
    <div className={`feedback ${feedback?.correct?'correct':''}`} role="status">{feedback&&<>{feedback.correct?<CheckCircle2 size={17}/>:<HelpCircle size={17}/>}<p>{feedback.text}</p></>}</div>
    {feedback?.correct?<button className="primary-button" onClick={()=>{if(step<3)go(step+1);else{setEnded(true);announceSound('correct')}}}>{step===3?'Ver lo que aprendí':'Siguiente reto'}</button>:<button className="primary-button" disabled={answer===null||reason===null||busy} onClick={check}>{busy?'Observa…':<><Play size={15}/> Comprobar mi idea</>}</button>}
    {!feedback?.correct&&<button className="hint-button" disabled={busy} onClick={()=>{setHint(!hint);if(!hint)announceSound('hint')}}>{hint?'Ocultar pista':'Necesito una pista'}</button>}
   </>}
  </section>
  <footer className="bottom-bar"><nav className="lesson-nav glass" aria-label="Momentos de la lección"><span className="nav-pill" style={{transform:`translateX(${step*100}%)`}}/>{LESSONS.map((l,i)=><button key={l.id} aria-current={step===i?'step':undefined} disabled={busy} onClick={()=>go(i)}><span className={`nav-step ${done.includes(i)?'done':''}`}>{done.includes(i)?<Check size={12}/>:i+1}</span>{l.label}</button>)}</nav><span className="footer-note">Aprender empieza con una pregunta.</span><div className="progress-label"><span>{done.length} de 4 descubrimientos</span><div><i style={{width:`${done.length*25}%`}}/></div></div></footer>
  {help&&<HelpModal close={()=>setHelp(false)}/>}
 </main>;
}
function HelpModal({close}){
 const dialog=useRef();useEffect(()=>{dialog.current.showModal();return()=>dialog.current?.close()},[]);
 return <dialog ref={dialog} className="help-modal" onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close()}} aria-labelledby="help-title"><button autoFocus className="icon-button close-button" aria-label="Cerrar ayuda" onClick={close}><X size={20}/></button><span className="eyebrow">TU PEQUEÑO LABORATORIO</span><h2 id="help-title">Aprende haciendo.</h2><p>Toca el apagador de la escena o el control inferior. También puedes usar Tab y la barra espaciadora en los botones.</p><p>Después, predice qué pasará y elige el motivo. Si te atoras, pide una pista. No hay cronómetro: tómate tu tiempo.</p><div className="help-note"><Volume2 size={18}/><span>El sonido acompaña tus acciones. Puedes silenciarlo en cualquier momento.</span></div><button className="primary-button" onClick={close}>Vamos a explorar</button></dialog>
}
createRoot(document.getElementById('root')).render(<App/>);
