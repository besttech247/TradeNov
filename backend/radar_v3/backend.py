import asyncio,json,time,threading
from collections import defaultdict,deque
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
import requests,websockets
from fastapi import FastAPI,WebSocket
from fastapi.responses import HTMLResponse

REST="https://api.bybit.com"; WS="wss://stream.bybit.com/v5/public/linear"
S=requests.Session(); S.headers["User-Agent"]="CryptoRadarV3/1.0"
lock=threading.Lock(); next_req=0; blocked=0
SCANNER_LIMIT=200
UPDATE_INTERVAL=5
snapshots={}; trades=defaultdict(lambda:deque(maxlen=1500)); books={}; clients=set(); running=True; scanner_active=True
selected_symbols=[]

def get(path,params=None,retries=4):
 global next_req,blocked
 for a in range(retries+1):
  with lock:
   wait=max(next_req-time.time(),blocked-time.time(),0)
   if wait: time.sleep(wait)
   next_req=time.time()+.12
  try:
   r=S.get(REST+path,params=params,timeout=10)
   if r.status_code in (418,429):
    try:d=float(r.headers.get("Retry-After","0"))
    except:d=0
    d=max(d,min(60,2**a+.5)); blocked=time.time()+d
    if a<retries: time.sleep(d); continue
   r.raise_for_status(); return r.json()
  except requests.RequestException:
   if a>=retries: raise
   time.sleep(min(15,1.5**a+.5))
 raise RuntimeError("REST failed")

def bybit_result(payload):
 if payload.get("retCode")!=0:
  raise RuntimeError(payload.get("retMsg","Bybit API error"))
 return payload.get("result",{})

def ema(v,p):
 if len(v)<p:return 0
 k=2/(p+1);e=sum(v[:p])/p
 for x in v[p:]:e=x*k+e*(1-k)
 return e

def rsi(v,p=14):
 if len(v)<=p:return 0
 g=[];l=[]
 for i in range(1,len(v)):
  d=v[i]-v[i-1];g.append(max(d,0));l.append(max(-d,0))
 ag=sum(g[:p])/p;al=sum(l[:p])/p
 for i in range(p,len(g)):ag=(ag*(p-1)+g[i])/p;al=(al*(p-1)+l[i])/p
 return 100 if al==0 else 100-100/(1+ag/al)

def atr(k,p=14):
 if len(k)<=p:return 0
 t=[];prev=float(k[0][4])
 for x in k[1:]:
  h,l,c=map(float,(x[2],x[3],x[4]));t.append(max(h-l,abs(h-prev),abs(l-prev)));prev=c
 a=sum(t[:p])/p
 for z in t[p:]:a=(a*(p-1)+z)/p
 return a

def vwap(k,n=50):
 pv=vv=0
 for x in k[-n:]:
  h,l,c,v=map(float,(x[2],x[3],x[4],x[5]));pv+=(h+l+c)/3*v;vv+=v
 return pv/vv if vv else 0

def analyze(s):
 k=s["klines"];c=[float(x[4]) for x in k];h=[float(x[2]) for x in k];l=[float(x[3]) for x in k]
 p=c[-1];e20,e50=ema(c,20),ema(c,50);rr=rsi(c);aa=atr(k);vw=vwap(k)
 vv=[float(x[5]) for x in k];avg=sum(vv[-21:-1])/20;rv=vv[-1]/avg if avg else 0
 lp=sp=0;lr=[];sr=[]
 if p>e20>e50:lp+=16;lr+=["EMA trend"]
 elif p<e20<e50:sp+=16;sr+=["EMA trend"]
 elif p>e20:lp+=7
 else:sp+=7
 if p>vw:lp+=9;lr+=["Above VWAP"]
 else:sp+=9;sr+=["Below VWAP"]
 if 52<=rr<=72:lp+=10;lr+=["Momentum"]
 elif 28<=rr<=48:sp+=10;sr+=["Momentum"]
 if rv>=2:lp+=10;sp+=10;lr+=["Volume spike"];sr+=["Volume spike"]
 elif rv>=1.3:lp+=5;sp+=5
 ch=(p/c[-6]-1)*100
 if ch>.35:lp+=9;lr+=["5m impulse"]
 elif ch<-.35:sp+=9;sr+=["5m impulse"]
 if p>max(h[-21:-1]):lp+=14;lr+=["Breakout"]
 if p<min(l[-21:-1]):sp+=14;sr+=["Breakdown"]
 t=[x for x in trades[s["symbol"]] if x["ts"]>=time.time()-60]
 buy=sum(x["quote"] for x in t if x["buy"]);sell=sum(x["quote"] for x in t if not x["buy"]);tot=buy+sell
 br=buy/tot if tot else .5;cvd=buy-sell
 if tot:
  if br>=.62:lp+=12;lr+=["Aggressive buys"]
  elif br<=.38:sp+=12;sr+=["Aggressive sells"]
  if cvd>0:lp+=6
  elif cvd<0:sp+=6
 b=books.get(s["symbol"],{});bq=b.get("bid_qty",0);aq=b.get("ask_qty",0);imb=(bq-aq)/(bq+aq) if bq+aq else 0
 if imb>=.18:lp+=7;lr+=["Bid imbalance"]
 elif imb<=-.18:sp+=7;sr+=["Ask imbalance"]
 d="LONG" if lp>=sp else "SHORT";score=min(100,round(max(lp,sp)));sig=f"STRONG {d}" if score>=78 else d if score>=62 else "WATCH" if score>=48 else "WAIT"
 risk=aa or p*.01
 return {"symbol":s["symbol"],"price":p,"score":score,"signal":sig,"direction":d,"rsi":rr,"rvol":rv,"atr_pct":risk/p*100,"change_5m":ch,"vwap":vw,"buy_ratio":br,"cvd":cvd,"flow_quote":tot,"trade_velocity":len(t)/60,"book_imbalance":imb,"spread_pct":b.get("spread_pct",0),"entry":p,"stop":p-1.2*risk if d=="LONG" else p+1.2*risk,"tp1":p+1.5*risk if d=="LONG" else p-1.5*risk,"tp2":p+2.5*risk if d=="LONG" else p-2.5*risk,"reasons":(lr if d=="LONG" else sr)[:5]}

def bootstrap(limit=SCANNER_LIMIT):
 info=bybit_result(get("/v5/market/instruments-info",{"category":"linear","status":"Trading","limit":1000}))
 sy=[x["symbol"] for x in info.get("list",[]) if x.get("status")=="Trading" and x.get("quoteCoin")=="USDT" and x.get("settleCoin")=="USDT" and x.get("contractType")=="LinearPerpetual"]
 tick=bybit_result(get("/v5/market/tickers",{"category":"linear"}));q={x["symbol"]:float(x.get("turnover24h",0)) for x in tick.get("list",[])};sel=sorted(sy,key=lambda x:q.get(x,0),reverse=True)[:limit]
 if not sel: return []
 if "BTCUSDT" not in sel:sel[-1]="BTCUSDT"
 def one(s):
  try:
   rows=bybit_result(get("/v5/market/kline",{"category":"linear","symbol":s,"interval":"5","limit":160})).get("list",[])
   return {"symbol":s,"klines":list(reversed(rows))}
  except:return None
 with ThreadPoolExecutor(max_workers=4) as p:
  for x in p.map(one,sel):
   if x:snapshots[x["symbol"]]=x
 return sel

async def stream(sel):
 args=[topic for s in sel for topic in (f"publicTrade.{s}",f"tickers.{s}")]
 while running:
  if not scanner_active:
   await asyncio.sleep(1);continue
  try:
   async with websockets.connect(WS,ping_interval=20,ping_timeout=10,max_size=2**22) as ws:
    await ws.send(json.dumps({"op":"subscribe","args":args}))
    async for raw in ws:
     if not scanner_active:
      await asyncio.sleep(0.5);continue
     msg=json.loads(raw)
     if msg.get("op")=="ping":
      await ws.send(json.dumps({"op":"pong"}));continue
     d=msg.get("data",{});topic=msg.get("topic","")
     if topic.startswith("publicTrade"):
      for trade in d:
       s=trade.get("s");p=float(trade["p"]);q=float(trade["v"])
       trades[s].append({"ts":time.time(),"quote":p*q,"buy":trade.get("S")=="Buy"})
     elif topic.startswith("tickers"):
      s=d.get("symbol");bid=float(d.get("bid1Price",0));ask=float(d.get("ask1Price",0));mid=(bid+ask)/2
      if s and mid:books[s]={"bid_qty":float(d.get("bid1Size",0)),"ask_qty":float(d.get("ask1Size",0)),"spread_pct":(ask-bid)/mid*100}
  except:await asyncio.sleep(2)

async def broadcast(obj):
 msg=json.dumps(obj,separators=(",",":"))
 for c in list(clients):
  try:await c.send_text(msg)
  except:clients.discard(c)

async def loop(sel):
 while running:
  if not scanner_active:
   await asyncio.sleep(1);continue
  rows=sorted((analyze(x) for x in snapshots.values()),key=lambda x:x["score"],reverse=True)
  btc=snapshots.get("BTCUSDT");reg="UNKNOWN"
  if btc:
   c=[float(x[4]) for x in btc["klines"]];a=ema(c,20);b=ema(c,50);reg="BULLISH" if c[-1]>a>b else "BEARISH" if c[-1]<a<b else "RANGE"
  await broadcast({"type":"market","time":time.strftime("%H:%M:%S"),"next_update":time.time()+UPDATE_INTERVAL,"regime":reg,"markets":len(sel),"rows":rows})
  await asyncio.sleep(UPDATE_INTERVAL)

HTML=r"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Crypto Radar V3</title>
<style>*{box-sizing:border-box}body{margin:0;background:#070d18;color:#e9eff8;font:14px Arial}.head{height:68px;border-bottom:1px solid #1e2b40;padding:0 24px;display:flex;align-items:center}.logo{font-size:22px;font-weight:800}.controls{display:flex;gap:10px;margin-left:18px}.btn{padding:9px 16px;border:1px solid #243b5b;border-radius:8px;background:#0f1d30;color:#e9eff8;font-weight:700;cursor:pointer}.btn:disabled{opacity:.45;cursor:not-allowed}.btn-start{background:#133c2a;border-color:#2d7a4f}.btn-stop{background:#3a1621;border-color:#7a3048}.live{margin-left:auto;color:#5ee39a}.wrap{max-width:1700px;margin:auto;padding:20px}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.card,.panel{background:#0e1727;border:1px solid #1e2d45;border-radius:12px}.card{padding:16px}.label{color:#8194b1;font-size:11px}.value{font-size:23px;font-weight:800;margin-top:8px}.panel{margin-top:16px;overflow:hidden}.ph{padding:15px;border-bottom:1px solid #1e2b40;font-weight:bold}table{width:100%;border-collapse:collapse;min-width:1100px}th,td{padding:11px;border-bottom:1px solid #18243a;text-align:center}th{font-size:11px;color:#8194b1;background:#101b2d}tr:hover{background:#122037;cursor:pointer}.long{color:#5ee39a}.short{color:#ff6b82}.detail{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;padding:16px}.chart{height:310px;background:#09111f;border-radius:10px}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.metric{background:#09111f;border:1px solid #1b2940;border-radius:9px;padding:11px}.metric b{display:block;margin-top:5px}.reason{color:#aab8cc;margin-top:12px;line-height:1.8}@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}.detail{grid-template-columns:1fr}}</style></head><body>
<div class="head"><div class="logo">CRYPTO INTRADAY RADAR <span style="color:#708cff">V3</span></div><div class="controls"><button id="startBtn" class="btn btn-start">تشغيل</button><button id="stopBtn" class="btn btn-stop">إيقاف</button></div><div class="live">● <span id="conn">CONNECTING</span></div></div>
<div class="wrap"><div class="cards"><div class="card"><div class="label">MARKET REGIME</div><div class="value" id="reg">—</div></div><div class="card"><div class="label">MARKETS</div><div class="value" id="m">—</div></div><div class="card"><div class="label">TOP SCORE</div><div class="value" id="sc">—</div></div><div class="card"><div class="label">TOP SYMBOL</div><div class="value" id="ts">—</div></div><div class="card"><div class="label">UPDATED</div><div class="value" id="tm">—</div></div></div>
<div class="panel"><div class="ph">TOP INTRADAY OPPORTUNITIES</div><div style="overflow:auto"><table><thead><tr><th>SYMBOL</th><th>SIGNAL</th><th>SCORE</th><th>PRICE</th><th>5M%</th><th>RSI</th><th>RVOL</th><th>BUY%</th><th>CVD</th><th>BOOK</th><th>SPREAD</th><th>ENTRY</th><th>SL</th></tr></thead><tbody id="rows"></tbody></table></div></div>
<div class="panel"><div class="ph" id="title">SELECT A MARKET</div><div class="detail"><div class="chart"></div><div><div class="metrics" id="metrics"></div><div class="reason" id="reason"></div></div></div></div></div>
<script>
let data=[];let ws=null;let scannerStatus="running";let nextUpdate=0;const $=x=>document.getElementById(x),n=(x,d=3)=>Number(x).toFixed(d);
function logEvent(text){let line=document.createElement("div");line.className="log-line";line.textContent=`[${new Date().toLocaleTimeString()}] ${text}`;$("log").appendChild(line);$("log").scrollTop=$("log").scrollHeight}
function setScannerState(status){scannerStatus=status;const running=status==="running";$("startBtn").disabled=running;$("stopBtn").disabled=!running;$("conn").textContent=running?"LIVE":status.toUpperCase()}
function sendControl(action){if(!ws||ws.readyState!==WebSocket.OPEN){logEvent("Control skipped: WebSocket is not connected");return}ws.send(JSON.stringify({action}));logEvent(`Control sent: ${action}`)}
function render(r){data=r;$("rows").innerHTML=r.map((x,i)=>`<tr onclick="sel(${i})"><td><b>${x.symbol}</b></td><td class="${x.direction.toLowerCase()}">${x.signal}</td><td>${x.score}</td><td>${n(x.price,6)}</td><td>${n(x.change_5m,2)}%</td><td>${n(x.rsi,1)}</td><td>${n(x.rvol,2)}x</td><td>${n(x.buy_ratio*100,0)}%</td><td>${n(x.cvd,0)}</td><td>${n(x.book_imbalance*100,1)}%</td><td>${n(x.spread_pct,3)}%</td><td>${n(x.entry,6)}</td><td>${n(x.stop,6)}</td></tr>`).join("");if(r.length){$("sc").textContent=r[0].score;$("ts").textContent=r[0].symbol;sel(0)}}
function sel(i){let x=data[i];if(!x)return;$("title").textContent=`${x.symbol} • ${x.signal} • ${x.score}/100`;$("metrics").innerHTML=[["ENTRY",n(x.entry,6)],["STOP",n(x.stop,6)],["TP1",n(x.tp1,6)],["TP2",n(x.tp2,6)],["RSI",n(x.rsi,1)],["RVOL",n(x.rvol,2)+"x"],["BUY FLOW",n(x.buy_ratio*100,1)+"%"],["CVD",n(x.cvd,0)],["BOOK",n(x.book_imbalance*100,1)+"%"],["SPREAD",n(x.spread_pct,4)+"%"],["FLOW",n(x.flow_quote,0)],["VELOCITY",n(x.trade_velocity,2)+"/s"]].map(a=>`<div class="metric"><span class="label">${a[0]}</span><b>${a[1]}</b></div>`).join("");$("reason").innerHTML="<b>Signal reasons</b><br>• "+x.reasons.join("<br>• ")}
$("startBtn").onclick=()=>sendControl("start");$("stopBtn").onclick=()=>sendControl("stop");$("copyLog").onclick=()=>navigator.clipboard.writeText($("log").innerText).then(()=>logEvent("Log copied"));$("clearLog").onclick=()=>$("log").replaceChildren();setInterval(()=>$("countdown").textContent=nextUpdate?Math.max(0,Math.ceil(nextUpdate-Date.now()/1000)):"--",250);
function connect(){let p=location.protocol==="https:"?"wss":"ws";ws=new WebSocket(`${p}://${location.host}/ws`);ws.onopen=()=>{logEvent("WebSocket connected");setScannerState(scannerStatus);ws.send("ready")};ws.onclose=()=>{setScannerState("reconnecting");logEvent("WebSocket disconnected; retrying");setTimeout(connect,1500)};ws.onmessage=e=>{let x=JSON.parse(e.data);if(x.type==="status"){setScannerState(x.status||"running");if(x.time)$("tm").textContent=x.time;return}nextUpdate=x.next_update||0;$("loading").hidden=true;logEvent(`Market update received: ${x.markets} markets`);$("reg").textContent=x.regime;$("m").textContent=x.markets;$("tm").textContent=x.time;render(x.rows)}}connect();
</script></body></html>"""
HTML=HTML.replace("</style>", ".controls{display:flex;gap:10px;margin-left:18px}.btn{padding:9px 16px;border:1px solid #243b5b;border-radius:8px;background:#0f1d30;color:#e9eff8;font-weight:700;cursor:pointer}.btn:disabled{opacity:.45;cursor:not-allowed}.btn-start{background:#133c2a;border-color:#2d7a4f}.btn-stop{background:#3a1621;border-color:#7a3048}.log-head{display:flex;align-items:center;justify-content:space-between}.log-actions{display:flex;gap:8px}.log-btn{padding:5px 10px;border:1px solid #294463;border-radius:6px;background:#122037;color:#d8e5f5;cursor:pointer}.log-box{max-height:180px;overflow:auto;padding:10px 15px;background:#09111f;color:#aab8cc;font:12px monospace;white-space:pre-wrap}.log-line{padding:2px 0;border-bottom:1px solid #14233a}.loading{position:fixed;inset:0;display:grid;place-items:center;background:#070d18e8;z-index:5}.loading[hidden]{display:none}.spinner{width:34px;height:34px;border:3px solid #294463;border-top-color:#70c8ff;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>",1)
HTML=HTML.replace("<body>", '<body><div id="loading" class="loading"><div><div class="spinner"></div><div style="margin-top:12px">Loading market data...</div></div></div>',1)
HTML=HTML.replace('<div class="live">● <span id="conn">CONNECTING</span></div>', '<div class="controls"><button id="startBtn" class="btn btn-start">تشغيل</button><button id="stopBtn" class="btn btn-stop">إيقاف</button></div><div class="live">● <span id="conn">CONNECTING</span> · next <span id="countdown">--</span>s</div>',1)
HTML=HTML.replace('<div class="panel"><div class="ph">TOP INTRADAY OPPORTUNITIES</div>', '<div class="panel"><div class="ph log-head"><span>LIVE EXECUTION LOG</span><div class="log-actions"><button id="copyLog" class="log-btn">Copy</button><button id="clearLog" class="log-btn">Clear</button></div></div><details open><summary style="padding:10px 15px;cursor:pointer;color:#8194b1">Show or hide log</summary><div id="log" class="log-box"></div></details></div><div class="panel"><div class="ph">TOP INTRADAY OPPORTUNITIES</div>',1)
HTML=HTML.replace('let data=[];const $=', 'let data=[];let ws=null;let nextUpdate=0;const $=',1)
HTML=HTML.replace('function connect(){let p=location.protocol', 'function logEvent(text){let line=document.createElement("div");line.className="log-line";line.textContent=`[${new Date().toLocaleTimeString()}] ${text}`;$("log").appendChild(line);$("log").scrollTop=$("log").scrollHeight}function setScannerState(status){let active=status==="running";$("startBtn").disabled=active;$("stopBtn").disabled=!active;$("conn").textContent=active?"LIVE":status.toUpperCase();logEvent(`Scanner ${status}`)}function sendControl(action){if(!ws||ws.readyState!==WebSocket.OPEN){logEvent("Control skipped: WebSocket is not connected");return}ws.send(JSON.stringify({action}));logEvent(`Control sent: ${action}`)}$("startBtn").onclick=()=>sendControl("start");$("stopBtn").onclick=()=>sendControl("stop");$("copyLog").onclick=()=>navigator.clipboard.writeText($("log").innerText).then(()=>logEvent("Log copied"));$("clearLog").onclick=()=>$("log").replaceChildren();setInterval(()=>{$("countdown").textContent=nextUpdate?Math.max(0,Math.ceil(nextUpdate-Date.now()/1000)):"--"},250);function connect(){let p=location.protocol',1)
HTML=HTML.replace('w=new WebSocket(`${p}://${location.host}/ws`);w.onopen=()=>{$("conn").textContent="LIVE";w.send("ready")};w.onclose=()=>{$("conn").textContent="RECONNECTING";setTimeout(connect,1500)};w.onmessage=e=>{let x=JSON.parse(e.data);$("reg").textContent=x.regime;', 'ws=new WebSocket(`${p}://${location.host}/ws`);ws.onopen=()=>{logEvent("WebSocket connected");ws.send("ready")};ws.onclose=()=>{setScannerState("reconnecting");logEvent("WebSocket disconnected; retrying");setTimeout(connect,1500)};ws.onmessage=e=>{let x=JSON.parse(e.data);if(x.type==="status"){setScannerState(x.status||"running");if(x.time)$("tm").textContent=x.time;return}nextUpdate=x.next_update||0;$("loading").hidden=true;logEvent(`Market update received: ${x.markets} markets`);$("reg").textContent=x.regime;',1)

@asynccontextmanager
async def lifespan(app):
 global running, selected_symbols
 selected_symbols=await asyncio.to_thread(bootstrap)
 a=asyncio.create_task(stream(selected_symbols));b=asyncio.create_task(loop(selected_symbols))
 yield
 running=False;a.cancel();b.cancel();S.close()

app=FastAPI(title="Crypto Intraday Radar V3",lifespan=lifespan)
@app.get("/")
async def root():return HTMLResponse(HTML)
@app.websocket("/ws")
async def ws(ep:WebSocket):
 global scanner_active
 await ep.accept();clients.add(ep)
 await ep.send_text(json.dumps({"type":"status","status":"running" if scanner_active else "stopped","time":time.strftime("%H:%M:%S")}))
 try:
  while True:
   msg=await ep.receive_text()
   if not msg:continue
   try:payload=json.loads(msg)
   except:payload={"action":msg}
   if isinstance(payload,str):payload={"action":payload}
   action=payload.get("action")
   if action=="start":
    scanner_active=True
    await broadcast({"type":"status","status":"running","time":time.strftime("%H:%M:%S")})
   elif action=="stop":
    scanner_active=False
    await broadcast({"type":"status","status":"stopped","time":time.strftime("%H:%M:%S")})
 except Exception:
  pass
 finally:
  clients.discard(ep)
