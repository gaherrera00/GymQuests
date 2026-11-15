// Rodar: npm install && npm test
const {test}=require("node:test");const assert=require("node:assert/strict");
const {JSDOM}=require("jsdom");const fs=require("fs"),path=require("path");
const HTML=fs.readFileSync(path.join(__dirname,"../www/index.html"),"utf8").replace(/<link[^>]*>/g,"");
const DATES={seg:"2026-11-09T12:00:00",ter:"2026-11-10T12:00:00",qui:"2026-11-12T12:00:00",sab:"2026-11-14T12:00:00"};
const base=()=>({sets:[],xp:[],ch:{},found:{},pain:{},demo:false,fin:{},disc:{}});
const sets=(ex,days)=>days.map(d=>({id:ex+d,ex,w:20,r:8,rpe:null,warm:false,day:d,ts:Date.parse(d)}));
const D3=["2026-10-20","2026-10-22","2026-10-27"];
function W(dia,state,ls){const fixed=Date.parse(DATES[dia]);
 return new JSDOM(HTML,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",beforeParse(w){
  class FD extends w.Date{constructor(...a){a.length?super(...a):super(fixed)}static now(){return fixed}}w.Date=FD;
  w.localStorage.setItem("gymquest.v1",ls||JSON.stringify(Object.assign(base(),state||{})));}}).window}
const ev=(w,c)=>w.eval(c);
const find=w=>ev(w,"findDiscovery()");
const click=(w,sel)=>w.document.querySelector(sel).click();

test("A dia de peito: sugere supino com halteres, nunca agachamento búlgaro",()=>{
 const w=W("seg",{sets:sets("supino",D3)});const c=find(w);assert.equal(c.t,"sup_halt");assert.notEqual(c.t,"bulgaro");w.close()});
test("B dia de costas: barra fixa com justificativa",()=>{
 const w=W("ter",{sets:sets("puxada",D3)});const c=find(w);assert.equal(c.t,"barra");assert.match(c.why,/puxada vertical/);assert.equal(c.tipo,"similar");w.close()});
test("C dia de pernas: hack, nunca supino",()=>{
 const w=W("qui",{sets:sets("legpress",D3)});assert.equal(find(w).t,"hack");
 const w2=W("qui",{sets:sets("supino",D3)});assert.equal(find(w2),null);w.close();w2.close()});
test("D descanso: sem missão de treino, sem descoberta, XP intacto",()=>{
 const w=W("sab",{sets:sets("puxada",D3),xp:[{id:"x",amt:50,why:"t",at:1}]});
 assert.equal(ev(w,"mission().type"),"rest");assert.equal(find(w),null);assert.equal(ev(w,"xpTotal()"),50);
 assert.doesNotMatch(w.document.getElementById("app").textContent,/Aceitar desafio/);w.close()});
test("E já experimentado: barra com série real não é oferecida",()=>{
 const w=W("ter",{sets:sets("puxada",D3).concat(sets("barra",["2026-11-02"]))});assert.notEqual(find(w).t,"barra");w.close()});
test("F apenas visualizado: sem série, continua não experimentado",()=>{
 const w=W("ter",{sets:sets("puxada",D3)});assert.equal(ev(w,"tried('barra')"),false);
 ev(w,"tab='best';render()");assert.match(w.document.getElementById("app").textContent,/Barra fixa[\s\S]*?Desconhecido/);w.close()});
test("G dor: região afetada bloqueia descobertas do mesmo grupo",()=>{
 const w=W("ter",{sets:sets("puxada",D3),pain:{remada_c:true}});assert.equal(find(w),null);w.close()});
test("H recusa: XP igual e não reaparece de imediato",()=>{
 const w=W("ter",{sets:sets("puxada",D3),xp:[{id:"x",amt:50,why:"t",at:1}]});
 click(w,'[data-d="decline"]');assert.equal(ev(w,"xpTotal()"),50);assert.equal(ev(w,"D().barra.state"),"declined");
 assert.notEqual(find(w)&&find(w).t,"barra");w.close()});
test("I persistência: aceitar, fechar, reabrir",()=>{
 const w=W("ter",{sets:sets("puxada",D3)});click(w,'[data-d="accept"]');
 const ls=w.localStorage.getItem("gymquest.v1");w.close();
 const w2=W("ter",null,ls);assert.equal(ev(w2,"D().barra.state"),"accepted");assert.ok(ev(w2,"curPlan().some(x=>x[0]==='barra')"));
 assert.equal(ev(w2,"Object.keys(D()).length"),1);w2.close()});
test("J conclusão: série real desbloqueia, XP uma única vez, bestiário atualiza",()=>{
 const w=W("ter",{sets:sets("puxada",D3)});click(w,'[data-d="accept"]');
 w.document.getElementById("w-barra").value="0";w.document.getElementById("r-barra").value="3";click(w,'[data-save="barra"]');
 assert.equal(ev(w,"D().barra.state"),"unlocked");assert.equal(ev(w,"S.xp.filter(x=>x.id==='disc:barra').length"),1);
 w.document.getElementById("w-barra").value="0";w.document.getElementById("r-barra").value="3";click(w,'[data-save="barra"]');
 assert.equal(ev(w,"S.xp.filter(x=>x.id==='disc:barra').length"),1);
 ev(w,"award('disc:barra',30,'x');award('disc:barra',30,'x')");assert.equal(ev(w,"S.xp.filter(x=>x.id==='disc:barra').length"),1);
 ev(w,"tab='best';render()");assert.match(w.document.getElementById("app").textContent,/Barra fixa[\s\S]*?Desbloqueado/);w.close()});
test("K sem candidatos: não inventa, missão principal segue",()=>{
 const w=W("seg",{});assert.equal(find(w),null);assert.ok(["record","progression","consolidate","return"].includes(ev(w,"mission().type")));
 assert.doesNotMatch(w.document.getElementById("app").textContent,/Descoberta opcional/);w.close()});
test("L calendário alterado: descobertas seguem o plano, não o dia fixo",()=>{
 const w=W("seg",{sets:sets("supino",D3).concat(sets("legpress",D3))});assert.equal(find(w).t,"sup_halt");
 ev(w,"PLANS.seg.l=[['legpress',3,8,12],['agach',3,6,10]]");assert.equal(find(w).t,"hack");w.close()});
test("catálogo: relações válidas e classificadas",()=>{
 const w=W("seg",{});const r=ev(w,"REL.map(x=>[x[0],x[1],x[2],!!EX[x[0]],!!EX[x[1]],!!M[x[1]]])");
 assert.ok(r.length>=25);r.forEach(x=>{assert.ok(["variação","similar","complementar"].includes(x[2]));assert.ok(x[3]&&x[4]&&x[5])});w.close()});
test("séries: fecha o registro ao atingir o planejado; aquecimento não conta",()=>{
 const w=W("seg",{});const add=(r,warm)=>{w.document.getElementById("w-supino").value="20";w.document.getElementById("r-supino").value=String(r);w.document.getElementById("a-supino").checked=!!warm;click(w,'[data-save="supino"]')};
 ev(w,"tab='train';render()");const closed=()=>!!w.document.getElementById("w-supino").closest("[hidden]");
 add(8,true);add(8);add(7);assert.equal(closed(),false);assert.equal(ev(w,"S.sets.filter(s=>s.ex==='supino').length"),3);
 add(6);assert.equal(closed(),true);const n=ev(w,"S.sets.length");
 add(6);assert.equal(ev(w,"S.sets.length"),n);
 add(10,true);assert.equal(ev(w,"S.sets.length"),n+1);
 click(w,'[data-del="'+ev(w,"S.sets.filter(s=>!s.warm&&s.ex==='supino')[0].id")+'"]');assert.equal(closed(),false);w.close()});
test("sem botões de dor/RPE na interface de treino",()=>{
 const w=W("seg",{});ev(w,"tab='train';render()");const t=w.document.getElementById("app").textContent;
 assert.doesNotMatch(t,/RPE/);assert.doesNotMatch(t,/Dor/);w.close()});
test("missão conta automaticamente sem tocar em aceitar",()=>{
 const w=W("seg",{});ev(w,"tab='train';render()");
 w.document.getElementById("w-supino").value="20";w.document.getElementById("r-supino").value="8";click(w,'[data-save="supino"]');
 assert.equal(ev(w,"S.ch[TODAY]"),"done");assert.equal(ev(w,"S.xp.filter(x=>x.id.startsWith('ch:')).length"),1);w.close()});
test("descoberta conta ao registrar direto, sem aceitar",()=>{
 const w=W("ter",{sets:sets("puxada",D3)});ev(w,"tab='train';render()");
 w.document.getElementById("w-barra").value="0";w.document.getElementById("r-barra").value="2";click(w,'[data-save="barra"]');
 assert.equal(ev(w,"D().barra.state"),"unlocked");assert.equal(ev(w,"S.xp.filter(x=>x.id==='disc:barra').length"),1);w.close()});
