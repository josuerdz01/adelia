import React, {useState, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Lightbulb, Volume2, VolumeX, RotateCcw, HelpCircle, X, Check, CheckCircle2, Sparkles} from 'lucide-react';
import Scene from './Scene.jsx';
import {playSound} from './audio';
import {LESSONS, evaluateAnswer} from './lesson';
import './style.css';

function App(){
 const [step,setStep]=useState(0),[on,setOn]=useState(false),[seen,setSeen]=useState({off:true,on:false});
 const [muted,setMuted]=useState(()=>{try{return localStorage.getItem('adelia-muted')==='true'}catch{return false}});
 const [answer,setAnswer]=useState(null),[reason,setReason]=useState(null),[feedback,setFeedback]=useState(null);
 const [done,setDone]=useState([]),[busy,setBusy]=useState(false),[help,setHelp]=useState(false),[hint,setHint]=useState(false),[ended,setEnded]=useState(false);
 const [tick,setTick]=useState(0),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const timers=useRef([]),sound=useRef(!muted),lesson=LESSONS[step];
 sound.current=!muted;
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change)},[]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{try{localStorage.setItem('adelia-muted',String(muted))}catch{}},[muted]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape')setHelp(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const announceSound=kind=>playSound(kind,sound.current);
 const markDone=()=>setDone(prev=>prev.includes(step)?prev:[...prev,step]);
 function toggle(){if(step!==0||busy)return;const next=!on;setOn(next);setSeen(s=>({...s,[next?'on':'off']:true}));announceSound(next?'on':'off');}
 function go(next){if(busy)return;timers.current.forEach(clearTimeout);setStep(next);setOn(LESSONS[next].start??false);setAnswer(null);setReason(null);setFeedback(null);setHint(false);setTick(0);setEnded(false);}
 function reset(){if(busy)return;go(0);setSeen({off:true,on:false});setDone([]);}
 async function check(){
  if(answer===null||reason===null||busy||feedback?.correct)return;
  if(!evaluateAnswer(lesson,answer,reason)){setFeedback({correct:false,text:answer===lesson.answer?'Elegiste el estado correcto. Revisa el motivo para explicar por qué.':reason===lesson.reason?'Tu motivo va bien. Revisa qué estado queda al aplicar esa idea.':'Tu predicción todavía no coincide con la regla. Vamos paso a paso.'});setHint(true);announceSound('hint');return;}
  setBusy(true);setHint(false);setFeedback(null);
  for(let i=0;i<lesson.flips;i++){
   await new Promise(resolve=>{timers.current.push(setTimeout(resolve,reduced?180:650))});
   const next=i%2===0?!lesson.start:lesson.start;setOn(next);setTick(i+1);announceSound(next?'on':'off');
  }
  setBusy(false);setFeedback({correct:true,text:lesson.success});markDone();announceSound('correct');
 }
 const currentValue=step===3?(on?0:1):(on?1:0);
 const canContinue=step===0?seen.on&&seen.off:feedback?.correct;
 return <main className={`app ${on?'is-on':''}`}>
  <header className="header"><a className="brand" href="#" onClick={e=>{e.preventDefault();reset()}} aria-label="Adelia, volver al inicio"><Lightbulb size={24}/><span>adelia.</span></a><span className="header-topic">Lógica · Dos estados</span><div className="header-actions"><button className="icon-button" aria-label={muted?'Activar sonido':'Silenciar sonido'} aria-pressed={!muted} onClick={()=>{setMuted(!muted);if(muted)playSound('on',true)}}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><button className="icon-button" aria-label="Reiniciar lección" disabled={busy} onClick={reset}><RotateCcw size={17}/></button><button className="icon-button" aria-label="Cómo funciona" onClick={()=>setHelp(true)}><HelpCircle size={18}/></button></div></header>
  <section className="intro" aria-labelledby="lesson-title"><h1 id="lesson-title">{ended?'Una idea encendida.':lesson.title}</h1><p>{ended?'Observaste, predijiste y seguiste una regla nueva.':lesson.description}</p></section>
  <section className="experiment" aria-label="Laboratorio interactivo">
   <div className="scene-stage"><Scene on={on} onToggle={toggle} locked={step!==0||ended} showHint={step===0&&!seen.on} reduced={reduced}/></div>
   <aside className="readout glass" aria-label="Estado actual del foco"><strong>{step===3&&!feedback?.correct?'?':currentValue}</strong><span>{on?'Encendido':'Apagado'}</span></aside>
   {step!==0&&<div className="stage-action"><div className="sequence-indicator glass"><span>{step===3?'Solo cambia la regla':busy?`Toque ${tick} de ${lesson.flips}`:feedback?.correct?'Observa el resultado':`La app hará ${lesson.flips} ${lesson.flips===1?'toque':'toques'} al comprobar`}</span>{step===2&&<div>{[0,1,2,3].map((v,i)=><React.Fragment key={i}><b className={tick>=i?'reached':''}>{tick>=i?v%2:'?'}</b>{i<3&&<span>·</span>}</React.Fragment>)}</div>}</div></div>}
  </section>
  <section className={`activity glass ${answer!==null?'has-answer':''} ${feedback?'result-view':''}`} aria-label="Actividad de aprendizaje">
   {ended?<><div className="result-icon"><CheckCircle2 size={26}/></div><h2>La lógica está en la regla.</h2><p>Los símbolos representan estados. Puedes seguir los cambios y aplicar una correspondencia diferente.</p><button className="primary-button" onClick={reset}>Volver a experimentar</button></>:feedback?<Outcome key={feedback.correct?'correct':'retry'} correct={feedback.correct} message={feedback.correct?lesson.success:feedback.text} hint={lesson.hint} answer={answer} onContinue={()=>{if(feedback.correct){if(step<3)go(step+1);else{setFeedback(null);setEnded(true);announceSound('correct')}}else{setFeedback(null);setHint(true)}}} label={feedback.correct?(step===3?'Ver lo que aprendí':'Siguiente reto'):'Volver a intentar'}/>:step===0?<><h2>Un foco. Dos estados.</h2><div className="state-pair"><span className={!on?'selected':''}><b>0</b> Apagado {seen.off&&<Check size={14}/>}</span><span className={on?'selected':''}><b>1</b> Encendido {seen.on&&<Check size={14}/>}</span></div><p className="explore-status" role="status">{canContinue?'Ya descubriste los dos estados. ¿Probamos una predicción?':'Toca el apagador 3D para encender el foco.'}</p><button className="primary-button" disabled={!canContinue} onClick={()=>{markDone();go(1);announceSound('on')}}>Ponerme a prueba</button></>:<>
    <div className="activity-top"><h2>{lesson.question}</h2><button className="hint-button" aria-label={hint?'Ocultar pista':'Necesito una pista'} disabled={busy||feedback?.correct} onClick={()=>{setHint(!hint);if(!hint)announceSound('hint')}}><Lightbulb size={16}/> Pista</button></div>
    <div className="answer-row"><span className="field-label">1. Elige {step===3?'el símbolo':'el estado final'}</span><div className="answer-options" role="group" aria-label="Elige el número">{[0,1].map(n=><button key={n} aria-pressed={answer===n} disabled={busy||feedback?.correct} onClick={()=>{setAnswer(n);setFeedback(null)}}>{n}<small>{step===3?(n===0?'Encendido':'Apagado'):(n===0?'Apagado':'Encendido')}</small></button>)}</div></div>
    <div className="answer-summary"><span>Elegiste <b>{answer}</b> · {step===3?(answer===0?'Encendido':'Apagado'):(answer===0?'Apagado':'Encendido')}</span><button disabled={busy||feedback?.correct} onClick={()=>{setAnswer(null);setReason(null);setFeedback(null)}}>Cambiar</button></div><fieldset className="reason-options" disabled={busy||feedback?.correct}><legend>2. Elige por qué</legend>{lesson.reasons.map((r,i)=><label key={r} className={reason===i?'selected':''}><input type="radio" name="reason" checked={reason===i} onChange={()=>{setReason(i);setFeedback(null)}}/><span>{r}</span></label>)}</fieldset>
    <div className={`feedback ${feedback?.correct?'correct':''}`} role="status">{busy?'Observa el foco: estamos comprobando tu predicción.':feedback?.correct?lesson.success:(hint||feedback)?lesson.hint:'3. Pulsa «Comprobar» para ver qué ocurre.'}</div>
    {feedback?.correct?<button className="primary-button" onClick={()=>{if(step<3)go(step+1);else{setEnded(true);announceSound('correct')}}}>{step===3?'Ver lo que aprendí':'Siguiente reto'}</button>:<button className="primary-button" disabled={answer===null||reason===null||busy} onClick={check}>{busy?'Comprobando…':'Comprobar'}</button>}
   </>}
  </section>
  <nav className="lesson-nav glass" aria-label="Momentos de la lección"><span className="nav-pill" style={{transform:`translateX(${step*100}%)`}}/>{LESSONS.map((l,i)=><button key={l.id} aria-current={step===i?'step':undefined} disabled={busy} onClick={()=>go(i)}><span className={`nav-step ${done.includes(i)?'done':''}`}>{done.includes(i)?<Check size={12}/>:i+1}</span>{l.label}</button>)}</nav>
  {help&&<HelpModal close={()=>setHelp(false)}/>}
 </main>;
}

function Outcome({correct,message,hint,answer,onContinue,label}){
 const action=useRef();
 useEffect(()=>{action.current?.focus({preventScroll:true})},[]);
 return <div className={`outcome ${correct?'success':'retry'}`}>
  <div className="outcome-art" aria-hidden="true"><div className="outcome-ring">{correct?<CheckCircle2 size={38}/>:<RotateCcw size={34}/>}</div>{correct&&Array.from({length:8},(_,i)=><i key={i} style={{'--i':i}}/>)}{correct&&<Sparkles className="outcome-spark" size={20}/>}</div>
  <div role="status" aria-live="polite" aria-atomic="true"><span className="outcome-kicker">{correct?'PREDICCIÓN COMPROBADA':'OTRA OPORTUNIDAD'}</span><h2>{correct?'¡Lo descubriste!':'Todavía no. ¡Probemos otra vez!'}</h2><p>{message}</p></div>
  {!correct&&<div className="outcome-hint"><Lightbulb size={17}/><p>{hint}</p></div>}
  <button ref={action} className="primary-button" onClick={onContinue}>{label}</button>
 </div>;
}

function HelpModal({close}){
 const dialog=useRef();useEffect(()=>{dialog.current.showModal();return()=>dialog.current?.close()},[]);
 return <dialog ref={dialog} className="help-modal" onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close()}} aria-labelledby="help-title"><button autoFocus className="icon-button close-button" aria-label="Cerrar ayuda" onClick={close}><X size={20}/></button><span className="eyebrow">TU PEQUEÑO LABORATORIO</span><h2 id="help-title">Aprende haciendo.</h2><p>Toca el apagador 3D señalado por la mano. También puedes usar Tab y la barra espaciadora en los botones.</p><p>En Predice y Conecta: elige el estado final, selecciona un motivo y pulsa «Comprobar». La app moverá el apagador por ti. Si te atoras, pide una pista. No hay cronómetro: tómate tu tiempo.</p><div className="help-note"><Volume2 size={18}/><span>El sonido acompaña tus acciones. Puedes silenciarlo en cualquier momento.</span></div><button className="primary-button" onClick={close}>Vamos a explorar</button></dialog>
}
createRoot(document.getElementById('root')).render(<App/>);
