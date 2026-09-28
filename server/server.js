const path=require('path');const http=require('http');const express=require('express');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);const io=new Server(server);app.use(express.static(path.join(__dirname,'public')));
const games=new Map();const ROWS=6,COLS=7;
function empty(){return Array.from({length:ROWS},()=>Array(COLS).fill(0));}function id(){return Math.random().toString(36).slice(2,7).toUpperCase();}
function win(b,r,c,p){for(const[dr,dc]of[[1,0],[0,1],[1,1],[1,-1]]){let n=1;for(const s of[-1,1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&b[rr][cc]===p){n++;rr+=dr*s;cc+=dc*s;}}if(n>=4)return true}return false;}
function emit(g){io.to(g.room).emit('state',{board:g.board,players:{names:g.names,avatars:g.avatars},turn:g.turn,status:g.status,winner:g.winner||0,code:g.code,scores:g.scores});}
function newGame(){let code;do{code=id()}while(games.has(code));const g={code,room:code,board:empty(),players:{1:null,2:null},names:{1:null,2:null},avatars:{1:null,2:null},turn:1,status:'waiting',winner:0,scores:{1:0,2:0},rematch:{1:false,2:false}};games.set(code,g);return g;}
function resetRound(g){g.board=empty();g.turn=1;g.status=g.players[1]&&g.players[2]?'playing':'waiting';g.winner=0;g.rematch={1:false,2:false};}
io.on('connection',s=>{
 s.on('create',data=>{const g=newGame();s.join(g.room);g.players[1]=s.id;g.names[1]=(data?.name||'Player 1').slice(0,20);g.avatars[1]=data?.avatar||'😀';s.data={code:g.code,player:1};emit(g);s.emit('joined',{code:g.code,player:1});});
 s.on('join',data=>{const g=games.get(String(data?.code||'').toUpperCase());if(!g)return s.emit('errorMsg','Game not found.');if(g.players[2])return s.emit('errorMsg','That game already has two players.');g.players[2]=s.id;s.join(g.room);g.names[2]=(data?.name||'Player 2').slice(0,20);g.avatars[2]=data?.avatar||'😀';s.data={code:g.code,player:2};g.status='playing';g.rematch={1:false,2:false};emit(g);s.emit('joined',{code:g.code,player:2});});
 s.on('move',col=>{const g=games.get(s.data?.code),p=s.data?.player;if(!g||g.status!=='playing'||p!==g.turn)return;col=Number(col);if(!Number.isInteger(col)||col<0||col>=COLS)return;let r=-1;for(let i=ROWS-1;i>=0;i--)if(g.board[i][col]===0){r=i;break}if(r<0)return;g.board[r][col]=p;if(win(g.board,r,col,p)){g.status='won';g.winner=p;g.scores[p]++;}else if(g.board[0].every(Boolean))g.status='draw';else g.turn=p===1?2:1;g.rematch={1:false,2:false};emit(g);});
 s.on('restart',()=>{const g=games.get(s.data?.code);if(!g||g.status==='playing')return;resetRound(g);emit(g);});
 s.on('rematch',()=>{const g=games.get(s.data?.code),p=s.data?.player;if(!g||g.status==='playing'||!p)return;g.rematch[p]=true;if(g.rematch[1]&&g.rematch[2]){resetRound(g);io.to(g.room).emit('rematchReady');emit(g);}else s.emit('rematchPending');});
 s.on('disconnect',()=>{const g=games.get(s.data?.code),p=s.data?.player;if(!g)return;if(g.players[p]===s.id)g.players[p]=null;if(!g.players[1]&&!g.players[2])games.delete(g.code);else{g.status='waiting';g.rematch={1:false,2:false};emit(g);io.to(g.room).emit('opponentLeft');}});
});
server.listen(process.env.PORT||3000,()=>console.log('Connect 4 server running on http://localhost:'+(process.env.PORT||3000)));
