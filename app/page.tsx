'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Task, TodoList } from '@/types';

const PRI_BAR: Record<string,string> = { high:'#E8706A', medium:'#F5C842', low:'#72C48A', none:'transparent' };
const PRI_LABEL: Record<string,string> = { high:'高優先', medium:'中優先', low:'低優先', none:'未設定' };
const PRI_DOT: Record<string,string> = { high:'#E8706A', medium:'#F5C842', low:'#72C48A', none:'#DDDFE8' };
const ICONS = ['briefcase','home','folder','heart','star','book','dumbbell','shopping-cart','plane','banknote'];
const COLORS = ['#F0A8A0','#F5D080','#80D5B8','#B8AEFF','#7B6BE0','#7BB8E8','#E8706A','#C8CCD8'];
const P = '#7B6BE0';
const todayStr = () => new Date().toISOString().slice(0,10);

function Ico({ n, size=20, color='currentColor' }: { n:string; size?:number; color?:string }) {
  const paths: Record<string,string> = {
    sun:'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
    list:'M4 6h16M4 10h16M4 14h16M4 18h16',
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    calendar:'M3 9h18M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM8 3v2M16 3v2',
    plus:'M12 5v14M5 12h14', check:'M5 13l4 4L19 7',
    'arrow-left':'M19 12H5m7-7l-7 7 7 7',
    'chevron-right':'M9 18l6-6-6-6', 'chevron-left':'M15 18l-6-6 6-6',
    pin:'M12 17v5M8.5 4.5l7 7M5 15l7-7 3 3-7 7-3-3z',
    'pin-off':'M15 4l5 5-3 3-5-5 3-3zM9 9l-6 6 3 3 4-4M3 21l4-4',
    trash:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    flag:'M4 21V4M4 4L18 4 14 9 18 14 4 14Z',
    clock:'M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
    star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    checklist:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    briefcase:'M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM8 5V3h8v2',
    home:'M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-4h-6v4H4a1 1 0 01-1-1V10z',
    folder:'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    heart:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
    book:'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z',
    dumbbell:'M6.5 6.5h11M6.5 17.5h11M3 9h3v6H3zM18 9h3v6h-3zM6.5 9.5v5M17.5 9.5v5',
    'shopping-cart':'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
    plane:'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
    banknote:'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM12 12a3 3 0 100-6 3 3 0 000 6zM6 12h.01M18 12h.01',
    pencil:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    'rotate-ccw':'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15',
    'check-circle':'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:'block'}}>
      <path d={paths[n]||paths.star}/>
    </svg>
  );
}

function fmtDue(d: string|null): string {
  if (!d) return '';
  const ts = todayStr();
  if (d === 'today' || d.startsWith(ts)) return '今天';
  if (d === 'tomorrow') return '明天';
  const parts = d.split(' ');
  const datePart = parts[0].slice(5,10).replace('-','/');
  const timePart = parts[1] ? ' '+parts[1].slice(0,5) : '';
  return datePart + timePart;
}

// ── Sheet wrapper with drag-to-expand ──
function Sheet({ children, onClose, minH=0.4 }: { children: React.ReactNode; onClose: ()=>void; minH?: number }) {
  const [h, setH] = useState(minH);
  const startY = useRef(0);
  const startH = useRef(minH);

  const onTS = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startH.current = h;
  };
  const onTM = (e: React.TouchEvent) => {
    const dy = startY.current - e.touches[0].clientY;
    const vh = window.innerHeight;
    const newH = Math.min(0.95, Math.max(0.3, startH.current + dy/vh));
    setH(newH);
  };
  const onTE = () => {
    if (h < 0.35) onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,29,46,.3)',zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end',maxWidth:480,margin:'0 auto'}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'#fff',borderRadius:'18px 18px 0 0',height:`${h*100}vh`,display:'flex',flexDirection:'column',overflow:'hidden',transition:'none'}} onClick={e=>e.stopPropagation()}>
        {/* drag handle */}
        <div style={{padding:'10px 0 4px',display:'flex',justifyContent:'center',flexShrink:0,cursor:'grab'}}
          onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
          <div style={{width:36,height:4,borderRadius:2,background:'#D8DAE8'}}/>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {children}
        </div>
        <div style={{height:'env(safe-area-inset-bottom,8px)'}}/>
      </div>
    </div>
  );
}

// ── Task Card ──
function TaskCard({ task, lists, onToggle, onOpen, onDelete, onPin, onToggleSub, onEditName, onPriority, onPickList, onPickDate }:{
  task:Task; lists:TodoList[];
  onToggle:(id:string,subs:string[])=>void;
  onOpen:(id:string)=>void;
  onDelete:(id:string)=>void;
  onPin:(id:string)=>void;
  onToggleSub:(tid:string,sid:string)=>void;
  onEditName:(id:string,name:string)=>void;
  onPriority:(id:string,pri:Task['priority'])=>void;
  onPickList:(id:string)=>void;
  onPickDate:(id:string)=>void;
}) {
  const [swX, setSwX] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [ctxMenu, setCtxMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHoriz = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout|null>(null);
  const isDone = task.status === 'done';
  const list = lists.find(l=>l.id===task.listId);
  const subDone = task.subTasks.filter(s=>s.done).length;
  const chipBg = ['rgba(123,107,224,.10)','rgba(245,166,35,.10)','rgba(114,196,138,.12)','rgba(184,174,255,.18)'];
  const chipTx = ['#6B5EE0','#92600A','#2E7D32','#4527A0'];
  const ci = Math.max(0, lists.findIndex(l=>l.id===task.listId)) % 4;

  const SNAP = 72;

  const onTS = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHoriz.current = false;
    longPressTimer.current = setTimeout(()=>{
      if(!isHoriz.current){ setCtxMenu(true); }
    }, 500);
  };
  const onTM = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (!isHoriz.current) {
      if (Math.abs(dx) > dy && Math.abs(dx) > 5) isHoriz.current = true;
      else if (dy > Math.abs(dx) + 3) return;
    }
    if (!isHoriz.current) return;
    e.preventDefault();
    const newX = Math.max(-SNAP, Math.min(0, swX + dx));
    startX.current = e.touches[0].clientX;
    setSwX(newX);
  };
  const onTE = () => {
    if(longPressTimer.current){ clearTimeout(longPressTimer.current); longPressTimer.current=null; }
    if (!isHoriz.current) return;
    if (swX < -SNAP/2) setSwX(-SNAP);
    else setSwX(0);
  };

  if (isDone) return (
    <div style={{margin:'0 14px 7px'}}>
      <div style={{display:'flex',borderRadius:10,background:'#EAEBF0',cursor:'pointer'}} onClick={()=>onOpen(task.id)}>
        <div style={{width:3,borderRadius:'3px 0 0 3px',background:'#D4D6E0',flexShrink:0}}/>
        <div style={{flex:1,padding:'10px 12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button style={{width:18,height:18,borderRadius:'50%',background:'#C0BCCF',border:'1.5px solid #C0BCCF',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} onClick={e=>{e.stopPropagation();onToggle(task.id,[]);}}>
              <Ico n="check" size={8} color="#E8EAF0"/>
            </button>
            <span style={{fontSize:14,color:'#A8AEBB',textDecoration:'line-through',fontWeight:400,flex:1}}>{task.name}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{margin:'0 14px 8px',position:'relative',height:'auto'}}>
      {/* action bg — only delete */}
      <div style={{position:'absolute',inset:0,borderRadius:10,display:'flex',justifyContent:'flex-end',overflow:'hidden'}}>
        <div style={{width:SNAP,background:'#E87070',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:10,flexShrink:0}}
          onClick={()=>{onDelete(task.id);}}>
          <Ico n="trash" size={22} color="white"/>
        </div>
      </div>
      {/* card */}
      <div
        ref={ref}
        style={{position:'relative',display:'flex',borderRadius:10,background:'#fff',boxShadow:'0 1px 6px rgba(26,29,46,.07)',transform:`translateX(${swX}px)`,willChange:'transform',touchAction:'pan-y',userSelect:'none' as const,WebkitUserSelect:'none' as const}}
        onTouchStart={onTS}
        onTouchMove={onTM}
        onTouchEnd={onTE}
        onClick={()=>{ if(Math.abs(swX)>5){setSwX(0);return;} onOpen(task.id); }}
      >
        <div style={{width:4,flexShrink:0,borderRadius:'10px 0 0 10px',background:PRI_BAR[task.priority]||'transparent',alignSelf:'stretch'}}/>
        <div style={{flex:1,padding:'11px 13px',minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button style={{width:18,height:18,borderRadius:'50%',border:'1.5px solid #D0C8FF',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} onClick={e=>{e.stopPropagation();onToggle(task.id,task.subTasks.map(s=>s.id));}}/>
            {editing ? (
              <input autoFocus style={{flex:1,border:'none',outline:'none',fontSize:14,fontWeight:500,color:'#1A1D2E',background:'transparent',caretColor:'#7B6BE0',padding:0}} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>{if(editVal.trim()&&editVal!==task.name)onEditName(task.id,editVal.trim());setEditing(false);}} onKeyDown={e=>{if(e.key==='Enter'){if(editVal.trim())onEditName(task.id,editVal.trim());setEditing(false);}if(e.key==='Escape')setEditing(false);}} onClick={e=>e.stopPropagation()}/>
            ) : (
              <span style={{fontSize:14,color:'#1A1D2E',flex:1,fontWeight:500,lineHeight:1.3,wordBreak:'break-word' as const}} onDoubleClick={e=>{e.stopPropagation();setEditing(true);setEditVal(task.name);}}>{task.name}</span>
            )}
            <button style={{width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'none',marginRight:-4,background:task.pinned?'rgba(123,107,224,.12)':'none'}} onClick={e=>{e.stopPropagation();onPin(task.id);}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={task.pinned?'#7B6BE0':'#C8CCE0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5" stroke={task.pinned?'#7B6BE0':'#C8CCE0'}/>
                <path d="M9 9l-4 6h14l-4-6" fill={task.pinned?'#7B6BE0':'none'} stroke={task.pinned?'#7B6BE0':'#C8CCE0'}/>
                <path d="M9 9V5h6v4" fill={task.pinned?'rgba(123,107,224,.3)':'none'} stroke={task.pinned?'#7B6BE0':'#C8CCE0'}/>
                <line x1="7" y1="5" x2="17" y2="5" stroke={task.pinned?'#7B6BE0':'#C8CCE0'} strokeWidth="2"/>
              </svg>
            </button>
          </div>
          {(list||task.dueDate) && (
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,paddingLeft:26}}>
              {list && <span style={{fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:600,background:chipBg[ci],color:chipTx[ci],whiteSpace:'nowrap' as const,cursor:'pointer'}} onClick={e=>{e.stopPropagation();onPickList(task.id);}}>{list.name}</span>}
              {task.dueDate && <span style={{fontSize:10,color:'#B0B8CC',display:'flex',alignItems:'center',gap:2,whiteSpace:'nowrap' as const}}><Ico n="clock" size={10} color="#B0B8CC"/>{fmtDue(task.dueDate)}</span>}
            </div>
          )}
          {task.subTasks.length>0 && (
            <div style={{marginTop:5,borderTop:'.5px solid #F0F2F8',paddingTop:4}}>
              <div style={{fontSize:10,color:'#B0B8CC',textAlign:'right',marginBottom:2}}>{subDone}/{task.subTasks.length}</div>
              {task.subTasks.map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'center',gap:5,marginBottom:3,paddingLeft:26}}>
                  <button style={{width:12,height:12,borderRadius:'50%',border:'1.5px solid #D0C8FF',background:s.done?'#C0BCCF':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} onClick={e=>{e.stopPropagation();onToggleSub(task.id,s.id);}}>
                    {s.done&&<Ico n="check" size={6} color="#E8EAF0"/>}
                  </button>
                  <span style={{fontSize:12,color:s.done?'#B0B8CC':'#3A3D52',textDecoration:s.done?'line-through':'none'}}>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Floating context menu */}
      {ctxMenu&&(
        <div style={{position:'fixed',inset:0,zIndex:300}} onClick={()=>setCtxMenu(false)}>
          <div style={{
            position:'absolute',
            top: (ref.current?.getBoundingClientRect().top||0) > window.innerHeight/2
              ? (ref.current?.getBoundingClientRect().top||0) - 10
              : (ref.current?.getBoundingClientRect().bottom||0) + 10,
            left: 16,
            right: 16,
            maxWidth: 280,
            transform: (ref.current?.getBoundingClientRect().top||0) > window.innerHeight/2 ? 'translateY(-100%)' : 'none',
            background:'#fff',
            borderRadius:16,
            boxShadow:'0 8px 40px rgba(26,29,46,.18),0 2px 8px rgba(26,29,46,.10)',
            overflow:'hidden',
            zIndex:301,
          }} onClick={e=>e.stopPropagation()}>
            {/* Task name label */}
            <div style={{padding:'10px 14px 6px',fontSize:12,fontWeight:600,color:'#8890A8',borderBottom:'.5px solid #F2F3F9',overflow:'hidden',textOverflow:'ellipsis' as const,whiteSpace:'nowrap' as const}}>
              {task.name.length>28?task.name.slice(0,28)+'…':task.name}
            </div>
            {/* Pin */}
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:'none',background:'none',textAlign:'left' as const,cursor:'pointer',borderBottom:'.5px solid #F2F3F9'}} onClick={()=>{onPin(task.id);setCtxMenu(false);}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(123,107,224,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B6BE0" strokeWidth="2" strokeLinecap="round"><path d="M12 17v5M9 9l-4 6h14l-4-6M9 9V5h6v4"/><line x1="7" y1="5" x2="17" y2="5"/></svg>
              </div>
              <span style={{fontSize:14,color:'#1A1D2E',fontWeight:500,flex:1}}>{task.pinned?'取消置頂':'置頂'}</span>
              {task.pinned&&<div style={{width:7,height:7,borderRadius:'50%',background:'#7B6BE0',flexShrink:0}}/>}
            </button>
            {/* Priority dots */}
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:'.5px solid #F2F3F9'}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(245,196,66,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={task.priority!=='none'?PRI_BAR[task.priority]:'none'} stroke={task.priority!=='none'?PRI_BAR[task.priority]:'#C8C0A0'} strokeWidth="1.5" strokeLinecap="round"><path d="M4 21V4M4 4L18 4 14 9 18 14 4 14Z"/></svg>
              </div>
              <span style={{fontSize:14,color:'#1A1D2E',fontWeight:500,flex:1}}>優先級</span>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                {([['high','#E8706A'],['medium','#F5C842'],['low','#72C48A'],['none','#E2E4EE']] as [Task['priority'],string][]).map(([v,c])=>(
                  <button key={v} style={{width:24,height:24,borderRadius:'50%',background:c,border:task.priority===v?'2.5px solid #1A1D2E':'2.5px solid transparent',cursor:'pointer',flexShrink:0}} onClick={e=>{e.stopPropagation();onPriority(task.id,v as Task['priority']);setCtxMenu(false);}}/>
                ))}
              </div>
            </div>
            {/* Date */}
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:'none',background:'none',textAlign:'left' as const,cursor:'pointer',borderBottom:'.5px solid #F2F3F9'}} onClick={()=>{setCtxMenu(false);onPickDate(task.id);}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(107,158,224,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B9EE0" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span style={{fontSize:14,color:'#1A1D2E',fontWeight:500,flex:1}}>{task.dueDate?fmtDue(task.dueDate):'設定時間'}</span>
            </button>
            {/* Move to list */}
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:'none',background:'none',textAlign:'left' as const,cursor:'pointer',borderBottom:'.5px solid #F2F3F9'}} onClick={()=>{setCtxMenu(false);onPickList(task.id);}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(123,107,224,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B6BE0" strokeWidth="2" strokeLinecap="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
              </div>
              <span style={{fontSize:14,color:'#1A1D2E',fontWeight:500,flex:1}}>移動至清單</span>
              <span style={{fontSize:12,color:'#B0B8CC',flexShrink:0}}>{lists.find(l=>l.id===task.listId)?.name||''}</span>
            </button>
            {/* Delete */}
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:'none',background:'none',textAlign:'left' as const,cursor:'pointer'}} onClick={()=>{onDelete(task.id);setCtxMenu(false);}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(232,112,106,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E8706A" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              </div>
              <span style={{fontSize:14,color:'#E8706A',fontWeight:500}}>刪除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subtasks section ──
function SubTasksSection({ taskId, subTasks, onToggle, onAdd, onEditSub }:{
  taskId:string;
  subTasks:{id:string;name:string;done:boolean}[];
  onToggle:(tid:string,sid:string)=>void;
  onAdd:(name:string)=>Promise<void>;
  onEditSub:(sid:string,name:string)=>Promise<void>;
}) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editVal, setEditVal] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div style={{margin:'8px 14px 0',background:'#fff',borderRadius:12,boxShadow:'0 1px 6px rgba(26,29,46,.07)',overflow:'hidden'}}>
      <div style={{padding:'8px 13px 4px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'.5px solid #F2F3F9'}}>
        <span style={{fontSize:9,fontWeight:700,color:'#B0B8CC',letterSpacing:'.07em',textTransform:'uppercase' as const}}>子任務</span>
        <span style={{fontSize:10,fontWeight:600,color:P}}>{subTasks.filter(s=>s.done).length}/{subTasks.length}</span>
      </div>
      {subTasks.map(s=>(
        <div key={s.id} style={{display:'flex',alignItems:'center',gap:9,padding:'10px 13px',borderBottom:'.5px solid #F2F3F9'}}>
          <button style={{width:16,height:16,borderRadius:'50%',border:`1.5px solid ${s.done?'#C0BCCF':'#D0C8FF'}`,background:s.done?'#C0BCCF':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} onClick={()=>onToggle(taskId,s.id)}>
            {s.done&&<Ico n="check" size={8} color="#E8EAF0"/>}
          </button>
          {editingId===s.id ? (
            <input
              autoFocus
              style={{flex:1,border:'none',outline:'none',fontSize:13,color:'#1A1D2E',background:'transparent',caretColor:P,fontFamily:'inherit',padding:0}}
              value={editVal}
              onChange={e=>setEditVal(e.target.value)}
              onBlur={async()=>{if(editVal.trim()&&editVal!==s.name)await onEditSub(s.id,editVal.trim());setEditingId(null);}}
              onKeyDown={async e=>{if(e.key==='Enter'){if(editVal.trim()&&editVal!==s.name)await onEditSub(s.id,editVal.trim());setEditingId(null);}if(e.key==='Escape')setEditingId(null);}}
            />
          ) : (
            <span style={{fontSize:13,flex:1,color:s.done?'#A8AEBB':'#1A1D2E',textDecoration:s.done?'line-through':'none',cursor:'text'}}
              onClick={()=>{setEditingId(s.id);setEditVal(s.name);}}>
              {s.name}
            </span>
          )}
        </div>
      ))}
      <div style={{display:'flex',alignItems:'center',gap:9,padding:'9px 13px'}}>
        <button style={{width:16,height:16,borderRadius:'50%',border:'1.5px solid #C8CCE0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'transparent'}} onClick={handleAdd}>
          <Ico n="plus" size={9} color="#B0B8CC"/>
        </button>
        <input
          ref={newInputRef}
          style={{flex:1,border:'none',outline:'none',fontSize:13,color:'#1A1D2E',background:'transparent',caretColor:P,fontFamily:'inherit',padding:0}}
          placeholder="新增子任務…"
          value={newName}
          onChange={e=>setNewName(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'){handleAdd();}}}
        />
        {newName&&<button style={{fontSize:12,fontWeight:600,color:P,padding:'2px 8px',borderRadius:6,background:'rgba(123,107,224,.1)',border:'none',flexShrink:0}} onClick={handleAdd}>新增</button>}
      </div>
    </div>
  );
}


// ── Detail title (editable) ──
function DetailTitle({ name, done, onSave }:{ name:string; done:boolean; onSave:(n:string)=>void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);
  useEffect(()=>setVal(name),[name]);
  if (editing) return (
    <input autoFocus style={{flex:1,border:'none',outline:'none',fontSize:20,fontWeight:700,color:'#1A1D2E',background:'transparent',caretColor:'#7B6BE0',padding:0,lineHeight:1.3,margin:0}} value={val} onChange={e=>setVal(e.target.value)} onBlur={()=>{if(val.trim()&&val!==name)onSave(val.trim());setEditing(false);}} onKeyDown={e=>{if(e.key==='Enter'){if(val.trim())onSave(val.trim());setEditing(false);}if(e.key==='Escape')setEditing(false);}}/>
  );
  return <h1 style={{fontSize:20,fontWeight:700,color:done?'#A8AEBB':'#1A1D2E',textDecoration:done?'line-through':'none',flex:1,lineHeight:1.3,margin:0,cursor:'text'}} onClick={()=>{setEditing(true);setVal(name);}}>{name}</h1>;
}

type Tab = 'today'|'all'|'lists'|'cal';
type PF = 'date'|'list'|'pri'|null;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('today');
  const [detailId, setDetailId] = useState<string|null>(null);
  const [prevTab, setPrevTab] = useState<Tab>('today');
  const [ldId, setLdId] = useState<string|null>(null);
  const [ldFilter, setLdFilter] = useState<'all'|'today'|'hi'|'done'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDue, setAddDue] = useState('');
  const [addLid, setAddLid] = useState('');
  const [addPri, setAddPri] = useState<Task['priority']>('none');
  const [pickerField, setPickerField] = useState<PF>(null);
  const [pickerTid, setPickerTid] = useState<string|null>(null);
  const [calSel, setCalSel] = useState(new Date().getDate());
  const [calMo, setCalMo] = useState(new Date().getMonth());
  const [calYr, setCalYr] = useState(new Date().getFullYear());
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [editListId, setEditListId] = useState<string|null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('folder');
  const [newListColor, setNewListColor] = useState('#80D5B8');
  const [detNotes, setDetNotes] = useState('');
  const [toast, setToast] = useState('');
  const [lastUndo, setLastUndo] = useState<any>(null);
  const toastRef = useRef<NodeJS.Timeout|null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async()=>{
    try {
      const [t,l] = await Promise.all([fetch('/api/tasks').then(r=>r.json()),fetch('/api/lists').then(r=>r.json())]);
      setTasks(Array.isArray(t)?t:[]); setLists(Array.isArray(l)?l:[]);
    } catch { setTasks([]); setLists([]); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{load();},[load]);

  const showToast=(msg:string)=>{setToast(msg);if(toastRef.current)clearTimeout(toastRef.current);toastRef.current=setTimeout(()=>setToast(''),2800);};
  const ts = todayStr();

  const toggleDone=async(id:string,subIds:string[])=>{
    const t=tasks.find(x=>x.id===id);if(!t)return;
    const ns=t.status==='done'?'todo':'done';
    setTasks(p=>p.map(x=>x.id===id?{...x,status:ns,subTasks:ns==='done'?x.subTasks.map(s=>({...s,done:true})):x.subTasks}:x));
    setLastUndo({type:'toggle',id,prev:t.status,psubs:t.subTasks});
    showToast(ns==='done'?'任務已完成 ✓':'任務已復原');
    await fetch(`/api/tasks/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:ns,subTaskIds:ns==='done'?subIds:[]})});
  };
  const toggleSub=async(tid:string,sid:string)=>{
    const t=tasks.find(x=>x.id===tid);const s=t?.subTasks.find(x=>x.id===sid);if(!s)return;
    setTasks(p=>p.map(x=>x.id===tid?{...x,subTasks:x.subTasks.map(ss=>ss.id===sid?{...ss,done:!ss.done}:ss)}:x));
    await fetch(`/api/tasks/${sid}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:s.done?'todo':'done'})});
  };
  const editSub=async(sid:string,name:string)=>{
    setTasks(p=>p.map(t=>({...t,subTasks:t.subTasks.map(s=>s.id===sid?{...s,name}:s)})));
    await fetch(`/api/tasks/${sid}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
  };
  const editTaskName=async(id:string,name:string)=>{
    setTasks(p=>p.map(x=>x.id===id?{...x,name}:x));
    if(id.startsWith('temp-'))return;
    await fetch(`/api/tasks/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
  };
  const deleteTask=async(id:string)=>{
    const t=tasks.find(x=>x.id===id);if(!t)return;
    setLastUndo({type:'delete',task:t});setTasks(p=>p.filter(x=>x.id!==id));
    if(detailId===id)setDetailId(null);
    showToast(`「${t.name}」已刪除`);
    await fetch(`/api/tasks/${id}`,{method:'DELETE'});
  };
  const togglePin=async(id:string)=>{
    const t=tasks.find(x=>x.id===id);if(!t)return;
    setTasks(p=>p.map(x=>x.id===id?{...x,pinned:!x.pinned}:x));
    await fetch(`/api/tasks/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({pinned:!t.pinned})});
    showToast(t.pinned?'已取消置頂':'已置頂');
  };
  const undoLast=()=>{
    if(!lastUndo)return;
    if(lastUndo.type==='toggle'){setTasks(p=>p.map(x=>x.id===lastUndo.id?{...x,status:lastUndo.prev,subTasks:lastUndo.psubs}:x));}
    else if(lastUndo.type==='delete'){setTasks(p=>[...p,lastUndo.task]);}
    setLastUndo(null);setToast('');
  };
  const updateField=async(id:string,data:Record<string,unknown>)=>{
    setTasks(p=>p.map(x=>x.id===id?{...x,...data}:x));
    if(id.startsWith('temp-'))return;
    await fetch(`/api/tasks/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  };
  const submitTask=async()=>{
    if(!addName.trim())return;
    const due = addDue || null;
    const body={name:addName.trim(),listId:addLid||lists[0]?.id,priority:addPri,dueDate:due};
    const nameSnap = addName.trim();
    setAddOpen(false);setAddName('');setAddDue('');setAddLid('');setAddPri('none');
    // optimistic add
    const tempId = 'temp-'+Date.now();
    const l=lists.find(x=>x.id===body.listId);
    const optimistic: Task = {id:tempId,name:nameSnap,status:'todo',priority:addPri,listId:body.listId||'',listName:l?.name||'',listColor:l?.color||'',listIcon:l?.icon||'',dueDate:due,pinned:false,notes:'',subTasks:[],parentTaskId:null};
    setTasks(p=>[optimistic,...p]);
    const res=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const c=await res.json();
    setTasks(p=>p.map(x=>x.id===tempId?{...c,listName:l?.name||'',listColor:l?.color||'',listIcon:l?.icon||'',subTasks:[]}:x));
    showToast(`「${nameSnap}」已新增`);
  };
  const addSub=async(name:string)=>{
    if(!name.trim()||!detailId)return;
    const t=tasks.find(x=>x.id===detailId);
    const res=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name.trim(),parentTaskId:detailId,listId:t?.listId})});
    const sub=await res.json();
    setTasks(p=>p.map(x=>x.id===detailId?{...x,subTasks:[...x.subTasks,{id:sub.id,name:sub.name,done:false}]}:x));
  };
  const saveList=async()=>{
    if(!newListName.trim())return;
    const body={name:newListName.trim(),icon:newListIcon,color:newListColor};
    setListSheetOpen(false);
    if(editListId){
      setLists(p=>p.map(l=>l.id===editListId?{...l,...body}:l));
      await fetch(`/api/lists/${editListId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      showToast('清單已更新');
    } else {
      const res=await fetch('/api/lists',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const c=await res.json();
      setLists(p=>[...p,{...c,...body}]);
      showToast('清單已建立');
    }
    setNewListName('');setNewListIcon('folder');setNewListColor('#80D5B8');setEditListId(null);
  };

  const openDetail=(id:string)=>{setDetailId(id);const t=tasks.find(x=>x.id===id);setDetNotes(t?.notes||'');};
  const detTask=tasks.find(t=>t.id===detailId);
  const today=new Date();
  const pinnedTasks=tasks.filter(t=>t.pinned&&t.status!=='done');
  const getTodayTasks=()=>tasks.filter(t=>{const d=t.dueDate==='today'?ts:(t.dueDate?.split(' ')[0]||'');return d===ts;});
  const calDm=new Date(calYr,calMo+1,0).getDate();
  const calFd=new Date(calYr,calMo,1).getDay();
  const getTasksForDay=(yr:number,mo:number,day:number)=>{
    const ds=`${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return tasks.filter(t=>{const d=t.dueDate==='today'?ts:(t.dueDate?.split(' ')[0]||'');return d===ds;});
  };

  const openPicker=(field:PF,tid:string|null=null)=>{setPickerField(field);setPickerTid(tid);};
  const closePicker=()=>{setPickerField(null);setPickerTid(null);};
  const setPDate=(v:string)=>{if(pickerTid)updateField(pickerTid,{dueDate:v||null});else setAddDue(v);closePicker();};
  const setPList=(lid:string)=>{if(pickerTid)updateField(pickerTid,{listId:lid});else setAddLid(lid);closePicker();};
  const setPPri=(p:Task['priority'])=>{if(pickerTid)updateField(pickerTid,{priority:p});else setAddPri(p);closePicker();};

  const openAddForToday=()=>{setAddDue('today');setAddLid('');setAddPri('none');setAddOpen(true);setTimeout(()=>addInputRef.current?.focus(),100);};
  const openAddGeneric=()=>{setAddDue('');setAddLid('');setAddPri('none');setAddOpen(true);setTimeout(()=>addInputRef.current?.focus(),100);};

  const hdrStyle: React.CSSProperties = {background:P,padding:'env(safe-area-inset-top,44px) 20px 16px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0};
  const scrollStyle: React.CSSProperties = {flex:1,overflowY:'auto',paddingBottom:140,paddingTop:10};
  const secLbl: React.CSSProperties = {padding:'8px 16px 3px',fontSize:9.5,fontWeight:700,color:'#B0B8CC',letterSpacing:'.08em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:5};

  const Hdr=({title,sub,extra}:{title:string;sub?:string;extra?:React.ReactNode})=>(
    <div style={hdrStyle}>
      <div>{sub&&<div style={{fontSize:12,color:'rgba(255,255,255,.65)',marginBottom:2}}>{sub}</div>}<div style={{fontSize:28,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{title}</div></div>
      {extra}
    </div>
  );
  const Nav=()=>(
    <div style={{position:'fixed',bottom:'calc(env(safe-area-inset-bottom,0px) + 16px)',left:'50%',transform:'translateX(-50%)',width:'calc(100% - 40px)',maxWidth:400,display:'flex',background:'rgba(255,255,255,.96)',backdropFilter:'blur(20px)',borderRadius:50,boxShadow:'0 8px 32px rgba(26,29,46,.14)',zIndex:50,padding:'6px 8px'}}>
      {(['today','all','lists','cal'] as Tab[]).map((t,i)=>(
        <button key={t} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,border:'none',cursor:'pointer',borderRadius:40,padding:'8px 4px',background:tab===t&&!ldId?'rgba(123,107,224,.12)':'transparent',color:tab===t&&!ldId?P:'#B0B8CC',fontSize:10,fontWeight:tab===t&&!ldId?700:500}} onClick={()=>{setTab(t);setLdId(null);setDetailId(null);}}>
          <Ico n={['sun','list','grid','calendar'][i]} size={tab===t?22:20} color={tab===t?P:'#B0B8CC'}/>
          <span>{['今日','所有','清單','行事曆'][i]}</span>
        </button>
      ))}
    </div>
  );
  const Fab=({onClick}:{onClick:()=>void})=>(
    <button style={{position:'fixed',right:20,bottom:'calc(env(safe-area-inset-bottom,0px) + 96px)',width:52,height:52,borderRadius:'50%',background:P,boxShadow:'0 6px 20px rgba(123,107,224,.38)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:40,border:'none'}} onClick={onClick}>
      <Ico n="plus" size={26} color="white"/>
    </button>
  );

  const mkCard=(t:Task,from:Tab|'ld')=>(
    <TaskCard key={t.id} task={t} lists={lists}
      onToggle={toggleDone}
      onOpen={id=>{setPrevTab(from==='ld'?'lists':from as Tab);openDetail(id);}}
      onDelete={deleteTask} onPin={togglePin} onToggleSub={toggleSub} onEditName={editTaskName}
      onPriority={(id,pri)=>updateField(id,{priority:pri})}
      onPickList={(id)=>{setPickerTid(id);setPickerField('list');}}
      onPickDate={(id)=>{setPickerTid(id);setPickerField('date');}}
    />
  );

  if(loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F2F3F9'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,borderRadius:'50%',background:P,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><Ico n="check" size={24} color="white"/></div>
        <p style={{fontSize:14,color:'#B0B8CC'}}>載入中…</p>
      </div>
    </div>
  );

  const pageStyle: React.CSSProperties = {minHeight:'100vh',background:'#F2F3F9',maxWidth:480,margin:'0 auto',position:'relative'};

  return (
    <div style={pageStyle}>

      {/* ── DETAIL ── */}
      {detailId&&detTask&&(
        <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#F2F3F9'}}>
          <div style={{background:'#fff',paddingTop:'env(safe-area-inset-top,44px)',flexShrink:0,borderBottom:'.5px solid #ECEEF5'}}>
            <div style={{padding:'0 18px 14px'}}>
              <button style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,border:'none',background:'none',padding:'8px 12px 8px 0',margin:'0 0 6px -4px'}} onClick={()=>setDetailId(null)}>
                <Ico n="arrow-left" size={22} color={P}/><span style={{fontSize:15,color:P,fontWeight:600}}>{prevTab==='today'?'今日':prevTab==='all'?'所有':'清單'}</span>
              </button>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <button style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${detTask.status==='done'?'#C0BCCF':'#D0C8FF'}`,background:detTask.status==='done'?'#C0BCCF':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} onClick={()=>toggleDone(detTask.id,detTask.subTasks.map(s=>s.id))}>
                  {detTask.status==='done'&&<Ico n="check" size={11} color="#E8EAF0"/>}
                </button>
                <DetailTitle name={detTask.name} done={detTask.status==='done'} onSave={name=>editTaskName(detTask.id,name)}/>
              </div>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',paddingBottom:110,paddingTop:10}}>
            <div style={{margin:'0 14px',background:'#fff',borderRadius:12,boxShadow:'0 1px 6px rgba(26,29,46,.07)',overflow:'hidden'}}>
              {[
                {f:'pri' as PF,icon:'flag',bg:'#FFF3DC',ic:'#F5C842',label:'優先',val:<><span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:PRI_DOT[detTask.priority],marginRight:5}}/>{PRI_LABEL[detTask.priority]}</>},
                {f:'date' as PF,icon:'clock',bg:'#EBF3FF',ic:'#6B9EE0',label:'時間',val:detTask.dueDate?fmtDue(detTask.dueDate):<span style={{color:'#C8CCE0'}}>未設定</span>},
                {f:'list' as PF,icon:'folder',bg:'rgba(123,107,224,.10)',ic:P,label:'清單',val:lists.find(l=>l.id===detTask.listId)?.name||<span style={{color:'#C8CCE0'}}>未分類</span>},
              ].map((row,i)=>(
                <button key={i} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'11px 13px',cursor:'pointer',background:'none',border:'none',borderBottom:i<2?'.5px solid #F2F3F9':'none',textAlign:'left'}} onClick={()=>openPicker(row.f,detTask.id)}>
                  <div style={{width:20,height:20,borderRadius:6,background:row.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico n={row.icon} size={12} color={row.ic}/></div>
                  <span style={{fontSize:11,color:'#B0B8CC',minWidth:28}}>{row.label}</span>
                  <span style={{fontSize:13,color:'#1A1D2E',flex:1}}>{row.val}</span>
                  <Ico n="chevron-right" size={12} color="#D0D4E0"/>
                </button>
              ))}
            </div>
            <div style={{margin:'8px 14px 0',background:'#fff',borderRadius:12,boxShadow:'0 1px 6px rgba(26,29,46,.07)',overflow:'hidden'}}>
              <div style={{padding:'7px 13px 3px',fontSize:9,fontWeight:700,color:'#B0B8CC',letterSpacing:'.07em',textTransform:'uppercase' as const,borderBottom:'.5px solid #F2F3F9'}}>備忘錄</div>
              <textarea style={{width:'100%',border:'none',outline:'none',fontSize:14,color:'#6B6F85',lineHeight:1.6,padding:'8px 13px 12px',background:'transparent',caretColor:P,minHeight:70,resize:'none',fontFamily:'inherit'}} placeholder="新增備忘錄…" value={detNotes} onChange={e=>setDetNotes(e.target.value)} onBlur={()=>updateField(detTask.id,{notes:detNotes})}/>
            </div>
            <SubTasksSection taskId={detTask.id} subTasks={detTask.subTasks} onToggle={toggleSub} onAdd={addSub} onEditSub={editSub}/>
            <button style={{margin:'8px 14px 0',width:'calc(100% - 28px)',height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',background:'rgba(232,112,106,.08)',border:'none',fontSize:13,fontWeight:600,color:'#E8706A'}} onClick={()=>{deleteTask(detTask.id);}}>
              <Ico n="trash" size={15} color="#E8706A"/>刪除任務
            </button>
          </div>
          <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:480,margin:'0 auto',padding:'12px 14px',paddingBottom:'calc(env(safe-area-inset-bottom,16px) + 12px)',background:'rgba(242,243,249,.92)',backdropFilter:'blur(12px)',display:'flex',gap:10,zIndex:10}}>
            <button style={{flex:1,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',gap:5,cursor:'pointer',background:'#F0F2F8',border:'.5px solid #E0E2EC',fontSize:13,fontWeight:500,color:P}} onClick={()=>setDetailId(null)}>
              <Ico n="arrow-left" size={15} color={P}/>返回
            </button>
            <button style={{flex:2,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',background:detTask.status==='done'?'#C0BCCF':P,boxShadow:detTask.status==='done'?'none':'0 4px 14px rgba(123,107,224,.32)',fontSize:13,fontWeight:700,color:'#fff',border:'none'}} onClick={()=>toggleDone(detTask.id,detTask.subTasks.map(s=>s.id))}>
              <Ico n={detTask.status==='done'?'rotate-ccw':'check'} size={15} color="white"/>{detTask.status==='done'?'復原':'標記完成'}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST DETAIL ── */}
      {ldId&&!detailId&&(()=>{
        const sp:{[k:string]:{name:string;icon:string}}={__all__:{name:'所有任務',icon:'checklist'},__imp__:{name:'重要',icon:'star'},__done__:{name:'已完成',icon:'check'}};
        const isSpecial=ldId.startsWith('__');
        const info=isSpecial?sp[ldId]:{name:lists.find(l=>l.id===ldId)?.name||'',icon:lists.find(l=>l.id===ldId)?.icon||'folder'};
        let lt=isSpecial?(ldId==='__all__'?tasks:ldId==='__imp__'?tasks.filter(t=>t.priority==='high'):tasks.filter(t=>t.status==='done')):tasks.filter(t=>t.listId===ldId);
        if(ldFilter==='today')lt=lt.filter(t=>{const d=t.dueDate==='today'?ts:(t.dueDate?.split(' ')[0]||'');return d===ts;});
        else if(ldFilter==='hi')lt=lt.filter(t=>t.priority==='high');
        else if(ldFilter==='done')lt=lt.filter(t=>t.status==='done');
        return(
          <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
            <div style={{background:P,paddingTop:'env(safe-area-inset-top,44px)',flexShrink:0}}>
              <div style={{padding:'0 18px 12px',display:'flex',alignItems:'center',gap:10}}>
                <button style={{border:'none',background:'none',padding:0}} onClick={()=>setLdId(null)}><Ico n="arrow-left" size={20} color="white"/></button>
                <div style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,.22)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n={info.icon} size={16} color="white"/></div>
                <div style={{flex:1}}><div style={{fontSize:11,color:'rgba(255,255,255,.65)'}}>{lt.filter(t=>t.status!=='done').length} 項任務</div><div style={{fontSize:21,fontWeight:700,color:'#fff'}}>{info.name}</div></div>
              </div>
              <div style={{display:'flex',gap:6,padding:'0 16px 10px',overflowX:'auto'}}>
                {(['all','today','hi','done'] as const).map((f,i)=>(
                  <button key={f} style={{flexShrink:0,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:600,cursor:'pointer',border:'none',background:ldFilter===f?'white':'rgba(255,255,255,.2)',color:ldFilter===f?P:'rgba(255,255,255,.88)'}} onClick={()=>setLdFilter(f)}>{['全部','今日','重要','完成'][i]}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',paddingTop:10,paddingBottom:140,background:'#F2F3F9'}}>
              {lt.filter(t=>t.status!=='done').map(t=>mkCard(t,'ld'))}
              {(ldFilter==='done'||ldId==='__done__')&&lt.filter(t=>t.status==='done').map(t=>mkCard(t,'ld'))}
              {lt.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#B0B8CC',fontSize:14}}>此清單沒有任務</div>}
            </div>
            <Fab onClick={openAddGeneric}/>
            <Nav/>
          </div>
        );
      })()}

      {/* ── MAIN TABS ── */}
      {!detailId&&!ldId&&(
        <>
          {tab==='today'&&(
            <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
              <Hdr title="今日" sub={today.toLocaleDateString('zh-TW',{weekday:'long',month:'long',day:'numeric'})}/>
              <div style={scrollStyle}>
                {pinnedTasks.length>0&&(<><div style={{...secLbl,gap:4}}><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#C0B4FF' strokeWidth='2' strokeLinecap='round'><path d='M12 17v5M9 9l-4 6h14l-4-6M9 9V5h6v4'/><line x1='7' y1='5' x2='17' y2='5'/></svg>置頂<div style={{flex:1,height:.5,background:'#DCDEE8'}}/></div>{pinnedTasks.map(t=>mkCard(t,'today'))}</>)}
                <div style={{margin:'3px 16px 6px',display:'flex',alignItems:'center',gap:6}}>
                  <div style={{flex:1,height:.5,background:'#D4D6E4'}}/><span style={{fontSize:9.5,color:'#B0B8CC',whiteSpace:'nowrap' as const,display:'flex',alignItems:'center',gap:3}}><Ico n="list" size={9} color="#B0B8CC"/>今日任務</span><div style={{flex:1,height:.5,background:'#D4D6E4'}}/>
                </div>
                {getTodayTasks().filter(t=>!t.pinned&&t.status!=='done').map(t=>mkCard(t,'today'))}
                {getTodayTasks().length===0&&pinnedTasks.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#B0B8CC',fontSize:14}}>今天沒有任務，點 + 新增</div>}
              </div>
            </div>
          )}
          {tab==='all'&&(
            <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
              <Hdr title="全部" sub="所有任務"/>
              <div style={scrollStyle}>
                {pinnedTasks.length>0&&(<><div style={{...secLbl,gap:4}}><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='#C0B4FF' strokeWidth='2' strokeLinecap='round'><path d='M12 17v5M9 9l-4 6h14l-4-6M9 9V5h6v4'/><line x1='7' y1='5' x2='17' y2='5'/></svg>置頂<div style={{flex:1,height:.5,background:'#DCDEE8'}}/></div>{pinnedTasks.map(t=>mkCard(t,'all'))}</>)}
                {lists.map(l=>{const lt=tasks.filter(t=>t.listId===l.id&&!t.pinned);if(!lt.length)return null;return(<div key={l.id}><div style={{...secLbl,gap:4}}><div style={{width:7,height:7,borderRadius:'50%',background:l.color}}/>{l.name}<div style={{flex:1,height:.5,background:'#DCDEE8'}}/></div>{lt.filter(t=>t.status!=='done').map(t=>mkCard(t,'all'))}</div>);})}
                {tasks.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#B0B8CC',fontSize:14}}>目前沒有任何任務</div>}
              </div>
            </div>
          )}
          {tab==='lists'&&(
            <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
              <Hdr title="清單" sub="管理清單" extra={<button style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:2}} onClick={()=>{setEditListId(null);setNewListName('');setNewListIcon('folder');setNewListColor('#80D5B8');setListSheetOpen(true);}}><Ico n="plus" size={17} color="white"/></button>}/>
              <div style={scrollStyle}>
                <div style={{margin:'0 14px 4px',background:'#fff',borderRadius:12,boxShadow:'0 1px 6px rgba(26,29,46,.07)',overflow:'hidden'}}>
                  {[{id:'__all__',icon:'checklist',bg:'rgba(123,107,224,.10)',ic:P,name:'所有任務',cnt:tasks.filter(t=>t.status!=='done').length},{id:'__imp__',icon:'star',bg:'#FEE2E2',ic:'#E24B4A',name:'重要',cnt:tasks.filter(t=>t.priority==='high'&&t.status!=='done').length},{id:'__done__',icon:'check',bg:'#DCFCE7',ic:'#22C55E',name:'已完成',cnt:tasks.filter(t=>t.status==='done').length}].map((item,i)=>(
                    <button key={item.id} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'12px 14px',cursor:'pointer',background:'none',border:'none',borderBottom:i<2?'.5px solid #F0F2F8':'none',textAlign:'left'}} onClick={()=>{setLdId(item.id);setLdFilter('all');}}>
                      <div style={{width:27,height:27,borderRadius:9,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n={item.icon} size={14} color={item.ic}/></div>
                      <span style={{flex:1,fontSize:13,fontWeight:500,color:'#1A1D2E'}}>{item.name}</span>
                      <span style={{fontSize:11,color:'#B0B8CC',background:'#F1F3F9',padding:'2px 8px',borderRadius:7}}>{item.cnt}</span>
                      <Ico n="chevron-right" size={13} color="#C8CAD8"/>
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px 5px'}}>
                  <span style={{fontSize:10,fontWeight:700,color:'#B0B8CC',letterSpacing:'.08em',textTransform:'uppercase' as const}}>我的清單</span>
                  <button style={{width:22,height:22,borderRadius:7,background:'rgba(123,107,224,.12)',display:'flex',alignItems:'center',justifyContent:'center',border:'none'}} onClick={()=>{setEditListId(null);setNewListName('');setNewListIcon('folder');setNewListColor('#80D5B8');setListSheetOpen(true);}}><Ico n="plus" size={13} color={P}/></button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'0 14px'}}>
                  {lists.map(l=><button key={l.id} style={{borderRadius:14,padding:'14px 12px',background:'#fff',boxShadow:'0 1px 6px rgba(26,29,46,.07)',cursor:'pointer',textAlign:'left',border:'none'}} onClick={()=>{setLdId(l.id);setLdFilter('all');}} onContextMenu={e=>{e.preventDefault();setEditListId(l.id);setNewListName(l.name);setNewListIcon(l.icon||'folder');setNewListColor(l.color);setListSheetOpen(true);}}>
                    <div style={{width:30,height:30,borderRadius:9,background:l.color,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}><Ico n={l.icon||'folder'} size={15} color="white"/></div>
                    <div style={{fontSize:13,fontWeight:700,color:'#1A1D2E'}}>{l.name}</div>
                    <div style={{fontSize:10,color:'#B0B8CC',marginTop:2}}>{tasks.filter(t=>t.listId===l.id&&t.status!=='done').length} 項任務</div>
                  </button>)}
                  <button style={{gridColumn:'1/-1',borderRadius:14,display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'#EAEBF0',cursor:'pointer',border:'none',textAlign:'left'}} onClick={()=>{setLdId('__done__');setLdFilter('all');}}>
                    <div style={{width:30,height:30,borderRadius:9,background:'#C8CCD8',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n="check" size={15} color="white"/></div>
                    <div><div style={{fontSize:13,fontWeight:700,color:'#8890A0'}}>已完成</div><div style={{fontSize:10,color:'#B0B8CC'}}>{tasks.filter(t=>t.status==='done').length} 項</div></div>
                    <div style={{marginLeft:'auto'}}><Ico n="chevron-right" size={13} color="#C8CAD8"/></div>
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab==='cal'&&(
            <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
              <Hdr title="行事曆" sub="行事曆視圖"/>
              <div style={scrollStyle}>
                <div style={{margin:'0 14px 10px',background:'#fff',borderRadius:14,boxShadow:'0 1px 6px rgba(26,29,46,.07)',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px 8px'}}>
                    <span style={{fontSize:14,fontWeight:700,color:'#1A1D2E'}}>{calYr}年 {calMo+1}月</span>
                    <div style={{display:'flex',gap:3}}>
                      <button style={{width:26,height:26,borderRadius:8,background:'#F1F3F9',border:'none',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{let m=calMo-1,y=calYr;if(m<0){m=11;y--;}setCalMo(m);setCalYr(y);}}><Ico n="chevron-left" size={13} color="#9CA4BC"/></button>
                      <button style={{width:26,height:26,borderRadius:8,background:'#F1F3F9',border:'none',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{let m=calMo+1,y=calYr;if(m>11){m=0;y++;}setCalMo(m);setCalYr(y);}}><Ico n="chevron-right" size={13} color="#9CA4BC"/></button>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 8px'}}>
                    {['日','一','二','三','四','五','六'].map(d=><div key={d} style={{textAlign:'center',fontSize:9,fontWeight:700,color:'#B0B8CC',padding:'2px 0'}}>{d}</div>)}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,padding:'2px 8px 10px'}}>
                    {Array.from({length:calFd}).map((_,i)=>{const d=new Date(calYr,calMo,0).getDate()-calFd+i+1;return<div key={`p${i}`} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'2px 1px'}}><span style={{fontSize:11,color:'#C4C8DC'}}>{d}</span></div>;})}
                    {Array.from({length:calDm}).map((_,i)=>{
                      const d=i+1,isT=(d===today.getDate()&&calMo===today.getMonth()&&calYr===today.getFullYear()),isSel=d===calSel&&!isT;
                      const dt=getTasksForDay(calYr,calMo+1,d);
                      const dots=[...new Set(dt.slice(0,3).map(t=>lists.find(l=>l.id===t.listId)?.color||'#C8CCD8'))];
                      return<button key={d} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'2px 1px',borderRadius:7,minHeight:28,border:'none',background:isT?P:isSel?'rgba(123,107,224,.12)':'transparent'}} onClick={()=>setCalSel(d)}>
                        <span style={{fontSize:11,color:isT?'white':isSel?'#6B5EE0':'#1A1D2E',fontWeight:isT||isSel?700:400}}>{d}</span>
                        {dots.length>0&&<div style={{display:'flex',gap:2,marginTop:2}}>{dots.map((c,ci)=><div key={ci} style={{width:3,height:3,borderRadius:'50%',background:isT?'rgba(255,255,255,.8)':c}}/>)}</div>}
                      </button>;
                    })}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px 8px'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'#6B5EE0',background:'rgba(123,107,224,.10)',padding:'3px 10px',borderRadius:8}}>{calMo+1}月 {calSel}日</span>
                  <button style={{width:26,height:26,borderRadius:8,background:'rgba(123,107,224,.10)',border:'none',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{const ds=`${calYr}-${String(calMo+1).padStart(2,'0')}-${String(calSel).padStart(2,'0')}`;setAddDue(ds===ts?'today':ds);setAddOpen(true);}}>
                    <Ico n="plus" size={14} color={P}/>
                  </button>
                </div>
                {getTasksForDay(calYr,calMo+1,calSel).filter(t=>t.status!=='done').map(t=>mkCard(t,'cal'))}
                {getTasksForDay(calYr,calMo+1,calSel).length===0&&<div style={{textAlign:'center',padding:'20px',color:'#B0B8CC',fontSize:13}}>這天沒有任務</div>}
              </div>
            </div>
          )}
          <Fab onClick={tab==='today'?openAddForToday:openAddGeneric}/>
          <Nav/>
        </>
      )}

      {/* ── ADD TASK ── */}
      {addOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end',maxWidth:480,margin:'0 auto'}} onClick={e=>{if(e.target===e.currentTarget){setAddOpen(false);setAddName('');}}}>
          <div style={{background:'#fff',borderRadius:'18px 18px 0 0',paddingBottom:'env(safe-area-inset-bottom,12px)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'16px 16px 6px'}}>
              <input
                ref={addInputRef}
                autoFocus
                style={{width:'100%',border:'none',outline:'none',fontSize:16,fontWeight:500,color:'#1A1D2E',caretColor:P,background:'transparent',display:'block'}}
                placeholder="新增任務…"
                value={addName}
                onChange={e=>setAddName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&submitTask()}
              />
            </div>
            <div style={{display:'flex',alignItems:'center',padding:'6px 12px 14px',gap:6,flexWrap:'wrap' as const}}>
              <button style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',height:32,borderRadius:20,border:`1px solid ${addDue?P:'#E8EAF0'}`,background:addDue?'rgba(123,107,224,.08)':'#F8F9FF',flexShrink:0}} onClick={()=>openPicker('date',null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={addDue?P:'#9CA4BC'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:addDue?P:'#9CA4BC'}}>{addDue?fmtDue(addDue):'時間'}</span>
              </button>
              <button style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',height:32,borderRadius:20,border:`1px solid ${addLid?P:'#E8EAF0'}`,background:addLid?'rgba(123,107,224,.08)':'#F8F9FF',flexShrink:0}} onClick={()=>openPicker('list',null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={addLid?P:'#9CA4BC'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:addLid?P:'#9CA4BC'}}>{addLid?lists.find(l=>l.id===addLid)?.name:'清單'}</span>
              </button>
              <button style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',height:32,borderRadius:20,border:`1px solid ${addPri!=='none'?P:'#E8EAF0'}`,background:addPri!=='none'?'rgba(123,107,224,.08)':'#F8F9FF',flexShrink:0}} onClick={()=>openPicker('pri',null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={addPri!=='none'?PRI_BAR[addPri]:'none'} stroke={addPri!=='none'?PRI_BAR[addPri]:'#9CA4BC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V4"/><path d="M4 4 L18 4 L14 9 L18 14 L4 14 Z" strokeWidth="1.5"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:addPri!=='none'?P:'#9CA4BC'}}>{addPri!=='none'?PRI_LABEL[addPri]:'優先'}</span>
              </button>
              <div style={{flex:1}}/>
              <button style={{height:32,padding:'0 16px',background:P,borderRadius:20,fontSize:13,fontWeight:700,color:'#fff',border:'none',flexShrink:0}} onClick={submitTask}>新增</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PICKER SHEET ── */}
      {pickerField&&(
        <Sheet onClose={closePicker} minH={0.5}>
          {pickerField==='date'&&(()=>{
            const curDue=pickerTid?tasks.find(t=>t.id===pickerTid)?.dueDate||'':addDue;
            const now=new Date();
            return(<>
              <div style={{fontSize:14,fontWeight:700,color:'#1A1D2E',padding:'4px 16px 10px',borderBottom:'.5px solid #ECEEF5'}}>選取時間</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap' as const,padding:'12px 16px',borderBottom:'.5px solid #F2F3F9'}}>
                {[['today','今天'],['tomorrow','明天'],['','清除']].map(([v,l])=>(
                  <button key={v} style={{padding:'7px 16px',borderRadius:20,fontSize:13,fontWeight:600,border:`1.5px solid ${curDue===v||(!curDue&&!v)?P:'#E8EAF0'}`,background:curDue===v||(!curDue&&!v)?P:'white',color:curDue===v||(!curDue&&!v)?'white':'#6B6F85'}} onClick={()=>{
                      if(!v){if(pickerTid)updateField(pickerTid,{dueDate:null});else setAddDue('');closePicker();return;}
                      // set value without closing
                      if(pickerTid){setTasks(prev=>prev.map(x=>x.id===pickerTid?{...x,dueDate:v}:x));}else setAddDue(v);
                      // sync dropdowns to correct date
                      const tgt=v==='today'?now:new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
                      setTimeout(()=>{
                        const mo=document.getElementById('pk-mo') as HTMLSelectElement;
                        const day=document.getElementById('pk-day') as HTMLSelectElement;
                        if(mo)mo.value=String(tgt.getMonth()+1);
                        if(day)day.value=String(tgt.getDate());
                      },10);
                    }}>{l}</button>
                ))}
              </div>
              <div style={{padding:'12px 16px 6px',display:'flex',gap:8}}>
                {[{id:'mo',label:'月',opts:Array.from({length:12},(_,i)=>({v:i+1,l:`${i+1}月`})),def:(()=>{const d=curDue;if(!d||d==='')return now.getMonth()+1;if(d==='today')return now.getMonth()+1;if(d==='tomorrow'){const t=new Date(now);t.setDate(t.getDate()+1);return t.getMonth()+1;}return parseInt(d.slice(5,7))||now.getMonth()+1;})()},
                  {id:'day',label:'日',opts:Array.from({length:31},(_,i)=>({v:i+1,l:`${i+1}`})),def:(()=>{const d=curDue;if(!d||d==='')return now.getDate();if(d==='today')return now.getDate();if(d==='tomorrow'){const t=new Date(now);t.setDate(t.getDate()+1);return t.getDate();}return parseInt(d.slice(8,10))||now.getDate();})()}
                ].map(col=>(
                  <div key={col.id} style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:600,color:'#B0B8CC',textAlign:'center',marginBottom:4}}>{col.label}</div>
                    <select id={`pk-${col.id}`} defaultValue={col.def} style={{width:'100%',border:'.5px solid #D0C8FF',borderRadius:10,padding:'10px 6px',fontSize:16,color:'#1A1D2E',textAlign:'center',outline:'none',background:'#fff'}}>
                      {col.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{padding:'6px 16px 6px',display:'flex',gap:8}}>
                {[{id:'hr',label:'時',opts:Array.from({length:24},(_,i)=>({v:i,l:String(i).padStart(2,'0')})),def:(()=>{if(curDue&&curDue.includes(' '))return parseInt(curDue.split(' ')[1].slice(0,2))||0;return 0;})()},
                  {id:'min',label:'分',opts:[0,5,10,15,20,25,30,35,40,45,50,55].map(v=>({v,l:String(v).padStart(2,'0')})),def:(()=>{if(curDue&&curDue.includes(' '))return parseInt(curDue.split(' ')[1].slice(3,5))||0;return 0;})()}
                ].map(col=>(
                  <div key={col.id} style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:600,color:'#B0B8CC',textAlign:'center',marginBottom:4}}>{col.label}</div>
                    <select id={`pk-${col.id}`} defaultValue={col.def} style={{width:'100%',border:'.5px solid #D0C8FF',borderRadius:10,padding:'10px 6px',fontSize:16,color:'#1A1D2E',textAlign:'center',outline:'none',background:'#fff'}}>
                      {col.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{padding:'10px 16px 16px'}}>
                <button style={{width:'100%',height:44,background:P,borderRadius:12,fontSize:14,fontWeight:700,color:'white',border:'none'}} onClick={()=>{
                  const mo=String((document.getElementById('pk-mo') as HTMLSelectElement).value).padStart(2,'0');
                  const day=String((document.getElementById('pk-day') as HTMLSelectElement).value).padStart(2,'0');
                  const hr=String((document.getElementById('pk-hr') as HTMLSelectElement).value).padStart(2,'0');
                  const min=String((document.getElementById('pk-min') as HTMLSelectElement).value).padStart(2,'0');
                  const ds=`${now.getFullYear()}-${mo}-${day}`;
                  const hasTime=hr!=='00'||min!=='00';
                  setPDate(ds===ts?'today':(hasTime?`${ds} ${hr}:${min}`:ds));
                }}>確定</button>
              </div>
            </>);
          })()}
          {pickerField==='list'&&(<>
            <div style={{fontSize:14,fontWeight:700,color:'#1A1D2E',padding:'4px 16px 10px',borderBottom:'.5px solid #ECEEF5'}}>選取清單</div>
            {lists.map(l=>{const cur=pickerTid?tasks.find(t=>t.id===pickerTid)?.listId:addLid;return(
              <button key={l.id} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'14px 16px',cursor:'pointer',background:'none',border:'none',borderBottom:'.5px solid #F2F3F9',textAlign:'left'}} onClick={()=>setPList(l.id)}>
                <div style={{width:26,height:26,borderRadius:8,background:l.color,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n={l.icon||'folder'} size={14} color="white"/></div>
                <span style={{flex:1,fontSize:14,fontWeight:500,color:'#1A1D2E'}}>{l.name}</span>
                {cur===l.id&&<div style={{width:20,height:20,borderRadius:'50%',background:P,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n="check" size={10} color="white"/></div>}
              </button>
            );})}
            <button style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'14px 16px',cursor:'pointer',background:'none',border:'none',textAlign:'left'}} onClick={()=>{closePicker();setEditListId(null);setNewListName('');setNewListIcon('folder');setNewListColor('#80D5B8');setListSheetOpen(true);}}>
              <div style={{width:26,height:26,borderRadius:8,background:'rgba(123,107,224,.10)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n="plus" size={14} color={P}/></div>
              <span style={{fontSize:14,fontWeight:600,color:P}}>新增清單</span>
            </button>
          </>)}
          {pickerField==='pri'&&(<>
            <div style={{fontSize:14,fontWeight:700,color:'#1A1D2E',padding:'4px 16px 10px',borderBottom:'.5px solid #ECEEF5'}}>選取優先級</div>
            <div style={{padding:'12px 16px 16px',display:'flex',flexDirection:'column',gap:8}}>
              {([['high','高優先',PRI_DOT.high],['medium','中優先',PRI_DOT.medium],['low','低優先',PRI_DOT.low],['none','無','#DDDFE8']] as [Task['priority'],string,string][]).map(([v,n,c])=>{
                const cur=pickerTid?tasks.find(t=>t.id===pickerTid)?.priority:addPri;
                return(<button key={v} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',borderRadius:12,cursor:'pointer',border:`${cur===v?2:1.5}px solid ${cur===v?P:'#F0F2F8'}`,background:cur===v?'rgba(123,107,224,.04)':'white',textAlign:'left'}} onClick={()=>setPPri(v)}>
                  <div style={{width:20,height:20,borderRadius:'50%',background:c,border:v==='none'?'1.5px solid #C8CCE0':'none',flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:500,color:'#1A1D2E'}}>{n}</span>
                  {cur===v&&<div style={{width:20,height:20,borderRadius:'50%',background:P,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n="check" size={10} color="white"/></div>}
                </button>);
              })}
            </div>
          </>)}
        </Sheet>
      )}

      {/* ── LIST EDITOR ── */}
      {listSheetOpen&&(
        <Sheet onClose={()=>setListSheetOpen(false)} minH={0.65}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px 12px',borderBottom:'.5px solid #F2F3F9'}}>
            <div style={{width:40,height:40,borderRadius:12,background:newListColor,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ico n={newListIcon} size={18} color="white"/></div>
            <input autoFocus style={{flex:1,border:'none',outline:'none',fontSize:16,fontWeight:700,color:'#1A1D2E',caretColor:P,background:'transparent'}} placeholder="清單名稱…" value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveList()}/>
            <Ico n="pencil" size={14} color="#B0B8CC"/>
          </div>
          <div style={{padding:'8px 16px 4px',fontSize:9,fontWeight:700,color:'#B0B8CC',letterSpacing:'.07em',textTransform:'uppercase' as const}}>圖示</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,padding:'4px 16px 10px'}}>
            {ICONS.map(ic=><button key={ic} style={{height:38,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',border:`${newListIcon===ic?'2px solid #1A1D2E':'1.5px solid transparent'}`,background:newListIcon===ic?newListColor:'#F1F3F9'}} onClick={()=>setNewListIcon(ic)}><Ico n={ic} size={16} color={newListIcon===ic?'white':'#8890A8'}/></button>)}
          </div>
          <div style={{padding:'2px 16px 4px',fontSize:9,fontWeight:700,color:'#B0B8CC',letterSpacing:'.07em',textTransform:'uppercase' as const}}>顏色</div>
          <div style={{display:'flex',gap:10,padding:'4px 16px 12px',overflowX:'auto'}}>
            {COLORS.map(c=><button key={c} style={{width:32,height:32,borderRadius:'50%',flexShrink:0,border:`${newListColor===c?'3px solid #1A1D2E':'3px solid transparent'}`,background:c,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setNewListColor(c)}>{newListColor===c&&<Ico n="check" size={13} color="white"/>}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px 4px',borderTop:'.5px solid #F0F2F8'}}>
            <button style={{fontSize:14,color:'#B0B8CC',border:'none',background:'none',padding:'8px 0'}} onClick={()=>setListSheetOpen(false)}>取消</button>
            <button style={{display:'flex',alignItems:'center',gap:5,fontSize:14,fontWeight:700,color:'white',border:'none',background:P,padding:'10px 20px',borderRadius:12}} onClick={saveList}><Ico n="check" size={15} color="white"/>儲存</button>
          </div>
        </Sheet>
      )}

      {/* ── TOAST ── */}
      {toast&&(
        <div style={{position:'fixed',bottom:104,left:20,right:20,maxWidth:440,margin:'0 auto',background:'rgba(26,29,46,.9)',color:'#fff',borderRadius:14,padding:'13px 16px',display:'flex',alignItems:'center',gap:9,fontSize:14,zIndex:500,backdropFilter:'blur(8px)'}}>
          <Ico n="check-circle" size={16} color="#C4B8FF"/>
          <span style={{flex:1}}>{toast}</span>
          <button style={{fontSize:13,fontWeight:600,color:'#C4B8FF',border:'none',background:'none'}} onClick={undoLast}>復原</button>
        </div>
      )}
    </div>
  );
}

