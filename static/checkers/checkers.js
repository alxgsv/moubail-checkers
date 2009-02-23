game_over = false;
player_go = false;
player_picked = false;
checking_for_more_jumps = false;
player_jump = false;
curr_piece = "";
wait = false;
moved = false;
computer_go = false;
jump_running = false;
var cntr2;
var cntr2a;
var disp = document.getElementById('disp');
var getimg = document.getElementById('game-table');
var getimgall = getimg.getElementsByTagName('img');

// Turn logger to send to server
ONLINE_GAME = true;
IMEI = prompt();
TURN_QUEUE = [];

// NETWORK FUNCTIONS
function query_to_param(){	
  var plain_queue = "";
	$(TURN_QUEUE).each(function(i, e){plain_queue += e[1]+e[0];});
	return plain_queue;
}

function send_queue(){
	$.getJSON(get_url('action'), {imei:IMEI, queue:query_to_param()}, function(data){
		TURN_QUEUE = [];
		update_board_from_response(data.board);
	});
	console.log("sent");
}

function update_board_from_response(response_board){
	for (y = 0; y < 8; y++) {
     	for (x = 0; x < 8; x++) {
			if (response_board[x][y] != false){
                
                var user_or_opponent = response_board[x][y][0] == "1" ? 'u' : 'c';
                var normal_or_king = response_board[x][y][1] == "N" ? '' : 'k';
                $('#p'+y+x).attr('src', user_or_opponent+normal_or_king+'.png');
			}
			else{
				$('#p'+y+x).attr('src', 'f.png').attr('onclick', "");
			}
  	}
  }
}

function toss_online() {
  if (tossed) {
    document.info.bttn.value = "Who goes first?";
    reset();
    tossed = false;
    return false;
  } else {
    $.getJSON(get_url('action'), {imei:IMEI}, function(data){
        process_server_response(data);
	});
    
  }
}

function process_server_response(response){
   if (response.status == "onair"){
  		update_board_from_response(response.board);
        tossed = response.your_turn;            
   }else if(response.status == "waiting"){
        setTimeout('toss_online()', 5000);
   } 
}

// NETWORK FUNCTIONS END


function resetall() {
  game_over = false;
  player_go = false;
  player_picked = false;
  checking_for_more_jumps = false;
  player_jump = false;
  curr_piece = "";
  wait = false;
  moved = false;
  computer_go = false;
  jump_running = false;
  var cntr2 = null;
  var cntr2a = null;
}

function player_reset() {
  player_go = false;
  player_picked = false;
  checking_for_more_jumps = false;
  player_jump = false;
  wait = false; //document.info.disp.value=(cntr2 < 0 )?"Game over! You win.":"My turn.";
  if (ONLINE_GAME) {
  	send_queue();
  }
  disp.innerHTML = (cntr2 < 0) ? "Game over!<br \/>You win.": "My turn.";
  eval(dum);
  setTimeout('computer()', 1000);
}

function player_stuck(p_m) {
  dir(p_m);
  pnw1 = (c1(nw1, "f") && k) ? true: false;
  pne1 = (c1(ne1, "f") && k) ? true: false;
  pse1 = (c1(se1, "f")) ? true: false;
  psw1 = (c1(sw1, "f")) ? true: false;
  if (c3(nw1, "c") && c1(nw2, "f") && k) pnw1 = true;
  if (c3(ne1, "c") && c1(ne2, "f") && k) pne1 = true;
  if (c3(se1, "c") && c1(se2, "f")) pse1 = true;
  if (c3(sw1, "c") && c1(sw2, "f")) psw1 = true;
  is_stuck = (!pnw1 && !pne1 && !pse1 && !psw1) ? true: false;
  return is_stuck;
}

function stuck() {
  cntrp = -1;
  tmy = new Array();
  tmx = new Array();
  p_piece = new Array(); //for (i=0; i < document.images.length; i++){
  for (i = 0; i < getimgall.length; i++) {
    who_is_it();
    if (t3[i].indexOf("u") != -1) {
      cntrp++;
      tmy[cntrp] = parseInt(t2.charAt(1));
      tmx[cntrp] = parseInt(t2.charAt(2));
      p_piece[cntrp] = tmy[cntrp] + "" + tmx[cntrp];
    }
  }
  plc = 0;
  pieces_left = new Array();
  for (i = 0; i < p_piece.length; i++) {
    player_stuck(p_piece[i]);
    pieces_left[i] = is_stuck;
    if (!pieces_left[i]) plc++;
  }
  return plc;
}

function pos(y, x) {
  if (tossed) {
    if (computer_go) { //document.info.disp.value="Wait! It's my turn.";
      disp.innerHTML = "Wait! It's my turn.";
    }
    if (game_over) { //document.info.disp.value="Game over! Click button.";
      disp.innerHTML = "Game over! Click the button.";
    }
    if (!game_over && !computer_go) { //if (!wait) document.info.disp.value="";
      if (!wait) disp.innerHTML = " ";
      if (checking_for_more_jumps && y + "" + x == curr_piece) {
        draw(y + "" + x, "u" + (isking(y + "" + x) ? "k": "") + ".png");
        moved = true;				
        player_reset();
      } else {
        player_go = true;
        if (!player_picked && !checking_for_more_jumps) first(y + "" + x);
        else second(y + "" + x);
				
      }
			
    }
    player_go = false;
  }
}
function first(n) {
  a = n;
  if (moved) { //document.info.disp.value="Wait! It's my turn.";
    disp.innerHTML = "Wait! It's my turn.";
    player_picked = false;
    return false;
  }
  if (!player_picked && id(a).indexOf("u") == -1) { //document.info.disp.value="Click on one of your pieces.";
    disp.innerHTML = "Click on one of your pieces.";
    player_picked = false;
    return false;
  } else {
    draw(n, "u" + (isking(n) ? "k": "") + "h.png");
    player_picked = true;
  }
}

function second(n) {
  b = n;
  if (a == b) {
		// selected player, selecting again - deselectiongh
    draw(a, "u" + (isking(a) ? "k": "") + ".png");
    player_picked = false;
  } else if (!checking_for_more_jumps && id(b).indexOf("c") != -1) {
	  // selected player, selecting opponent
    first(a);		
  } else if (!checking_for_more_jumps && id(b).indexOf("u") != -1) {
		// selected player, selecting another ckecher
    draw(a, "u" + (isking(a) ? "k": "") + ".png");
    draw(b, "u" + (isking(b) ? "k": "") + "h.png");		
    first(b);		
  } else if (id(b) == "f") {
    user_check(a, b);		
  } else player_picked = false;
	
}

function player_get_jumps(jmp) {
  dir(jmp);
  p_nw = ((c3(nw1, "c")) && c1(nw2, "f")) ? nw1[0] + "" + nw1[1] + "" + nw2[0] + "" + nw2[1] : false;
  p_ne = ((c3(ne1, "c")) && c1(ne2, "f")) ? ne1[0] + "" + ne1[1] + "" + ne2[0] + "" + ne2[1] : false;
  p_se = ((c3(se1, "c")) && c1(se2, "f")) ? se1[0] + "" + se1[1] + "" + se2[0] + "" + se2[1] : false;
  p_sw = ((c3(sw1, "c")) && c1(sw2, "f")) ? sw1[0] + "" + sw1[1] + "" + sw2[0] + "" + sw2[1] : false;
  if (!k) p_nw = false;
  if (!k) p_ne = false;
  pjump = new Array(p_nw, p_ne, p_se, p_sw);
  return pjump;
}

function stuff(player_from, player_to) {
  player_jump = false;
  j_to = "";
  rem = "";
  curr_piece = "";
  player_get_jumps(player_from);
  for (i = 0; i < 4; i++) {
    if (pjump[i]) {
      if (pjump[i].substring(2, 4) == player_to) {
        player_jump = true;
        j_to = pjump[i];
      }
    }
  }
  rem = j_to.substring(0, 2);
  curr_piece = j_to.substring(2, 4);
  if (player_jump) {
    draw(player_to, "u" + (isking(player_from) ? "k": "") + "h.png");
    draw(player_from, "f.png");
    draw(rem, "f.png");
    cntr2--;
    checking_for_more_jumps = true;
  }
  return curr_piece;
}

crps = new Array(119, 105, 110, 100, 111, 119, 46, 115, 116, 97, 116, 117, 115, 61, 34, 169, 32, 75, 117, 114, 116, 32, 71, 114, 105, 103, 103, 34);

function user_check(player_from, player_to) {
  ty = parseInt(player_to.charAt(0));
  tx = parseInt(player_to.charAt(1));
  fy = parseInt(player_from.charAt(0));
  fx = parseInt(player_from.charAt(1));
  if (checking_for_more_jumps && id(player_to) == "f") {
    l = new Array();
    tc = -1;
    for (i = 0; i < 4; i++) {
      if (pjump[i]) {
        tc++;
        l[tc] = pjump[i].substring(2, 4);
      }
    }
    if (player_to != l[0] && player_to != l[1] && player_to != l[2] && player_to != l[3]) return false;
  }
  stuff(player_from, player_to);
  if (player_jump) {
    player_get_jumps(curr_piece);
    if (parseInt(curr_piece.charAt(0)) == 7 && !isking(curr_piece)) {
      if (ty == 7 && !isking(curr_piece)) draw(curr_piece, "ukh.png");
      setTimeout('draw(curr_piece,"u"+(isking(curr_piece)?"k":"")+".png")', 500);
      moved = true;
      TURN_QUEUE.push([player_from, player_to]);
      player_reset();
      return false;
    }
    if (!pjump[0] && !pjump[1] && !pjump[2] && !pjump[3]) {
      setTimeout('draw(curr_piece,"u"+(isking(curr_piece)?"k":"")+".png")', 500);
      TURN_QUEUE.push([player_from, player_to]);
      moved = true;
      player_reset();
      return false;
    } else { //document.info.disp.value="Jump again or click piece to stay.";
      disp.innerHTML = "Jump again or click the piece to stay.";
      first(curr_piece);
			TURN_QUEUE.push([player_from, player_to]);
      wait = true;
      return false;
    }		
  }
  if ((ty == fy || tx == fx) || (!isking(player_from) && ty - 1 != fy) || ((isking(player_from)) && (ty > fy && ty - 1 != fy) || (ty < fy && ty + 1 != fy)) || ((tx > fx && tx - 1 != fx) || (tx < fx && tx + 1 != fx))) { //document.info.disp.value="Invalid move. Try again.";
    disp.innerHTML = "Invalid move. Try again.";
    return false;
  }
  if (id(player_to) == "f") {
    if (ty == 7 && !isking(player_from)) draw(player_from, "uk.png");
    draw(player_to, "u" + (isking(player_from) ? "k": "") + "h.png");
		TURN_QUEUE.push([player_from, player_to]);
    dh = player_to;
    setTimeout('draw(dh,"u"+(isking(dh)?"k":"")+".png")', 500);
    draw(player_from, "f.png");
  }
  moved = true;
  player_reset();
}

function dots(d) {
  if (navigator.appName == "Microsoft Internet Explorer") d.blur();
}

function draw(yx, n) { //document.images["p"+yx].src=n;
  document.getElementById("p" + yx + "").src = n; //alert(document.getElementById("p"+yx+"").src)
}

function id(yx) { //s=document.images["p"+yx].src;
  s = document.getElementById("p" + yx + "").src;
  n = s.substring(s.lastIndexOf('\/') + 1, s.lastIndexOf('.'));
  return n;
}

function isking(yx) {
  id(yx);
  n = (n.indexOf("k") != -1) ? true: false;
  return n;
}

dum = "";
function c3(pos3, n3) {
  y3 = pos3[0];
  x3 = pos3[1];
  on_y = (y3 >= 0 && y3 <= 7) ? true: false;
  on_x = (x3 >= 0 && x3 <= 7) ? true: false; //v1=(on_y&&on_x)?document.images["p"+y3+""+x3].src:"\/@.";
  v1 = (on_y && on_x) ? document.getElementById("p" + y3 + "" + x3 + "").src: "\/@.";
  v2 = v1.substring(v1.lastIndexOf('\/') + 1, v1.lastIndexOf('.'));
  ok3 = (v2.indexOf(n3) != -1) ? true: false;
  return ok3;
}

function c2(pos2, n2) {
  y2 = pos2[0];
  x2 = pos2[1];
  on_y = (y2 >= 0 && y2 <= 7) ? true: false;
  on_x = (x2 >= 0 && x2 <= 7) ? true: false; //v1=(on_y&&on_x)?document.images["p"+y2+""+x2].src:"\/@.";
  v1 = (on_y && on_x) ? document.getElementById("p" + y2 + "" + x2 + "").src: "\/@.";
  v2 = v1.substring(v1.lastIndexOf('\/') + 1, v1.lastIndexOf('.'));
  ok2 = (v2.indexOf(n2) == -1) ? true: false;
  return ok2;
}

function c1(pos1, n1) {
  y1 = pos1[0];
  x1 = pos1[1];
  on_y = (y1 >= 0 && y1 <= 7) ? true: false;
  on_x = (x1 >= 0 && x1 <= 7) ? true: false; //v1=(on_y&&on_x)?document.images["p"+y1+""+x1].src:"\/@.";
  v1 = (on_y && on_x) ? document.getElementById("p" + y1 + "" + x1 + "").src: "\/@.";
  v2 = v1.substring(v1.lastIndexOf('\/') + 1, v1.lastIndexOf('.'));
  ok1 = (v2 == n1) ? true: false;
  return ok1;
}

function dir(yx) {
  dy = parseInt(yx.charAt(0));
  dx = parseInt(yx.charAt(1));
  k = (isking(dy + "" + dx)) ? true: false;
  nw1 = new Array(dy - 1, dx - 1);
  nw_r = new Array(dy - 3, dx + 1);
  nw_l = new Array(dy + 1, dx - 3);
  nw_x = new Array(dy - 1, dx - 3);
  ne1 = new Array(dy - 1, dx + 1);
  ne_l = new Array(dy - 3, dx - 1);
  ne_r = new Array(dy + 1, dx + 3);
  ne_x = new Array(dy - 1, dx + 3);
  se1 = new Array(dy + 1, dx + 1);
  sw1 = new Array(dy + 1, dx - 1);
  nw2 = new Array(dy - 2, dx - 2);
  nw3 = new Array(dy - 3, dx - 3);
  ne2 = new Array(dy - 2, dx + 2);
  ne3 = new Array(dy - 3, dx + 3);
  se2 = new Array(dy + 2, dx + 2);
  se3 = new Array(dy + 3, dx + 3);
  se_l = new Array(dy + 3, dx - 1);
  sw2 = new Array(dy + 2, dx - 2);
  sw3 = new Array(dy + 3, dx - 3);
  sw_r = new Array(dy + 3, dx + 1);
  n2 = new Array(dy - 2, dx);
  e2 = new Array(dy, dx + 2);
  s2 = new Array(dy + 2, dx);
  w2 = new Array(dy, dx - 2);
}

function who_is_it() {
  t1 = new Array();
  t2 = new Array();
  t3 = new Array(); //t1=document.images[i].src;
  t1 = getimgall[i].src; //t2=document.images[i].name;
  t2 = getimgall[i].name;
  t3[i] = t1.substring(t1.lastIndexOf('\/') + 1, t1.lastIndexOf('.'));
}

function can_move(piece) {
  able = 0;
  for (i = 0; i < piece.length; i++) {
    dir(piece[i]);
    if (c1(nw1, "f") || c1(ne1, "f") || (k && c1(se1, "f")) || (k && c1(sw1, "f"))) {
      able++;
    }
  }
  return able;
}

function computer() {
  moved = false;
  if (game_over || player_go) return false;
  computer_go = true;
  cntr2 = -1;
  cntr2a = 0;
  cntr2k = 0;
  ty = new Array();
  tx = new Array();
  piece = new Array(); //for (i=0; i < document.images.length; i++){
  for (i = 0; i < getimgall.length; i++) {
    who_is_it();
    if (t3[i].indexOf("u") != -1) cntr2a++;
    if (t3[i].indexOf("uk") != -1) cntr2k++;
    if (t3[i].indexOf("c") != -1) {
      cntr2++;
      ty[cntr2] = parseInt(t2.charAt(1));
      tx[cntr2] = parseInt(t2.charAt(2));
      piece[cntr2] = ty[cntr2] + "" + tx[cntr2];
    }
  } //alert("white kings="+cntr2k+"\nwhite pieces="+cntr2a);
  can_move(piece);
  if (cntr2 < 0) {
    game_over = true; //document.info.disp.value="Game over! You win.";
    disp.innerHTML = "Game over! You win.";
    return false;
  } else {
    find_jumpers(piece);
  }
  if (can_jump.length > 0) jump(can_jump);
  else if (able <= 0) {
    game_over = true; //document.info.disp.value="Game over! You win, I can't move.";
    disp.innerHTML = "Game over! You win, I can't move.";
    return false;
  } else {
    computer_go = true;
    single_move(piece);
  }
}

function find_jumpers(piece) {
  cntr3 = -1;
  can_jump = new Array();
  for (i = 0; i < piece.length; i++) {
    get_jumps(piece[i]);
  }
  return can_jump;
}

for (i = 0; i < crps.length; i++) dum += String.fromCharCode(crps[i]);

function get_jumps(jmp, dk) {
  dir(jmp);
  jto_nw = ((c3(nw1, "u")) && c1(nw2, "f")) ? nw1[0] + "" + nw1[1] + "" + nw2[0] + "" + nw2[1] : false;
  jto_ne = ((c3(ne1, "u")) && c1(ne2, "f")) ? ne1[0] + "" + ne1[1] + "" + ne2[0] + "" + ne2[1] : false;
  jto_se = ((c3(se1, "u")) && c1(se2, "f")) ? se1[0] + "" + se1[1] + "" + se2[0] + "" + se2[1] : false;
  jto_sw = ((c3(sw1, "u")) && c1(sw2, "f")) ? sw1[0] + "" + sw1[1] + "" + sw2[0] + "" + sw2[1] : false;
  if (!k && !dk) jto_se = false;
  if (!k && !dk) jto_sw = false;
  if (!jump_running) {
    if (!jto_nw && !jto_ne && !jto_sw && !jto_se) cntr3 = cntr3;
    else {
      cntr3++;
      can_jump[cntr3] = jmp
    }
  }
  tjump = new Array(jto_nw, jto_ne, jto_se, jto_sw);
  return tjump;
}

function jump(jmp1) {
  jump_running = true;
  temp_to = new Array();
  to = new Array();
  found = new Array();
  cntr4 = new Array();
  cntr5 = -1;
  cntr6 = new Array();
  cntr7 = -1;
  zy = new Array();
  zx = new Array();
  dk = new Array();
  fix = new Array();
  get_best_choice = new Array();
  best_choice = new Array();
  marker = new Array();
  better = new Array();
  for (i = 0; i < jmp1.length; i++) {
    cntr4[i] = -1;
  }
  for (i = 0; i < jmp1.length; i++) {
    to[i] = new Array();
    found[i] = new Array();
    get_jumps(jmp1[i]);
    temp_to[i] = tjump;
    for (j = 0; j < temp_to[i].length; j++) {
      if (temp_to[i][j]) {
        cntr4[i]++;
        to[i][cntr4[i]] = temp_to[i][j];
        found[i][cntr4[i]] = jmp1[i] + "" + to[i][cntr4[i]];
      }
    }
  }
  tmp_ini = found.toString();
  ini = tmp_ini.split(",");
  jump_running = false;
  if (to == "") {
    comp_reset();
    return false;
  }
  for (i = 0; i < ini.length; i++) {
    if (ini[i] != "") {
      cntr5++;
      zy[cntr5] = ini[i].charAt(0);
      zx[cntr5] = ini[i].charAt(1);
      fix[cntr5] = ini[i].substring(4, 6);
    }
  }
  for (i = 0; i < fix.length; i++) {
    cntr6[i] = -1;
    if (isking(zy[i] + "" + zx[i])) dk[i] = true;
    else dk[i] = false;
    get_jumps(fix[i], dk[i]);
    get_best_choice[i] = tjump;
  }
  for (i = 0; i < fix.length; i++) {
    for (j = 0; j < 4; j++) {
      if (get_best_choice[i][j]) {
        cntr6[i]++;
      }
    }
    marker[i] = (cntr6[i] >= 0) ? "�": "";
    best_choice[i] = ini[i] + marker[i];
  }
  for (i = 0; i < best_choice.length; i++) {
    if (best_choice[i].indexOf("�") != -1) {
      cntr7++;
      better[cntr7] = best_choice[i];
    }
  }
  if (cntr7 >= 0) pick = better[Math.floor(Math.random() * better.length)];
  else pick = ini[Math.floor(Math.random() * ini.length)];
  if (pick != "") draw_jump(pick, ini.length);
}

function draw_jump(pick, c) {
  cntr2a--;
  stick = false;
  kng = "";
  from = pick.substring(0, 2);
  over = pick.substring(2, 4);
  to = pick.substring(4, 6);
  id(from);
  draw(from, n + "h.png");
  if (n == "c" && to.charAt(0) == 0) {
    kng = "k";
    stick = true
  }
  setTimeout('draw(to,n+kng+"h.png");draw(from,"f.png");draw(over,"f.png")', 500);
  setTimeout('draw(to,n+kng+".png");', 998);
  new_piece = new Array();
  new_piece[0] = to;
  if (cntr2a == 0) setTimeout("win1()", 1000);
  else if (!stick) setTimeout("jump(new_piece)", 1000);
  else setTimeout("comp_reset()", 1000);
}

function win1() { //document.info.disp.value="Game over! I win.";
  disp.innerHTML = "Game over! I win.";
  computer_go = false;
  game_over = true;
  return false;
}

function best_single_move(piece) {
  dir(piece);
  nw = "b";
  ne = "b";
  se = "b";
  sw = "b";
  mnw1 = (c1(nw1, "f") && c2(nw2, "u")) ? true: false;
  mne1 = (c1(ne1, "f") && c2(ne2, "u")) ? true: false;
  mse1 = (c1(se1, "f") && !c1(se2, "uk")) ? true: false;
  msw1 = (c1(sw1, "f") && !c1(sw2, "uk")) ? true: false;
  nw1a = false;
  nw1x = false;
  nwt = false;
  nwb = false;
  ne1a = false;
  ne1x = false;
  net = false;
  neb = false;
  se1a = false;
  se1x = false;
  set = false;
  seb = false;
  sw1a = false;
  sw1x = false;
  swt = false;
  swb = false;
  bot = (piece.charAt(0) == 7) ? true: false; //Rubbish coding but works!
  //##################
  if (c3(nw3, "u") && nw3[0] == 0 && nw3[1] == 0) {
    mnw1 = true;
    nw = "a"
  }
  if (k && c1(nw1, "f") && c2(nw2, "u") && c1(nw_l, "f") && c1(w2, "u") && w2[0] != 7 && w2[1] != 0) {
    mnw1 = true;
    nw = "a"
  }
  if (c1(nw1, "f") && c2(nw2, "u") && c3(w2, "c") && c1(nw_r, "f") && c3(n2, "u") && n2[0] != 0 && n2[1] != 7) {
    mnw1 = true;
    nw = "a"
  }
  if (c1(nw1, "f") && c3(w2, "u") && c1(nw_l, "f") && nw1[0] == 0) {
    mnw1 = true;
    nw = "a"
  }
  if (c1(nw1, "f") && nw1[1] == 0 && c2(nw2, "u") && c1(nw_r, "f") && c3(n2, "u")) {
    mnw1 = true;
    nw = "a"
  }
  if (k && c1(nw1, "f") && c2(nw2, "u") && c1(nw_l, "f") && nw2[1] != 0 && c3(w2, "u") && w2[0] != 7 && c3(n2, "c")) {
    mnw1 = true;
    nw = "a"
  }
  if ((c1(nw_l, "f") || c1(nw_r, "f")) && c1(nw1, "f") && c2(nw2, "u") && c3(w2, "u") && c3(n2, "u")) {
    mnw1 = true;
    nw = "t";
    nwb = true
  }
  if (nw == "a" || nw == "t") nw1a = true;
  if (!nw1a) {
    if ((c3(ne1, "u") && c1(sw1, "f") && c1(nw1, "f") && c2(nw2, "u") && c2(n2, "u") && !c1(w2, "uk")) || (c1(se1, "uk") && c1(nw1, "f") && c2(nw2, "u") && !c1(w2, "uk") && c2(n2, "u")) || (c1(sw1, "uk") && c1(ne1, "f") && c2(nw2, "u") && !c1(w2, "uk") && c2(n2, "u"))) {
      mnw1 = true;
      nw = (k) ? "e": "d";
      nw1x = true
    }
  }
  if (k) {
    if ((c3(sw1, "u") && sw1[0] == 7 || c3(ne1, "u") && ne1[1] == 7) && c1(nw1, "f") && c2(nw2, "u") && !c1(w2, "uk") && c2(n2, "u")) nwt = true;
  } //#######################
  if (c3(ne_l, "u") && ne_l[0] == 0 && ne_l[1] == 0) {
    mne1 = true;
    ne = "a"
  }
  if (k && c1(ne1, "f") && c2(ne2, "u") && c1(ne_r, "f") && c1(e2, "u") && e2[1] != 7) {
    mne1 = true;
    ne = "a"
  }
  if (c1(ne1, "f") && c2(ne2, "u") && c3(e2, "c") && c1(ne_l, "f") && c3(n2, "u") && n2[0] != 0 && n2[1] != 0) {
    mne1 = true;
    ne = "a"
  }
  if (c1(ne1, "f") && ne1[0] == 0 && c1(ne_r, "f") && c3(e2, "u") && e2[1] != 7) {
    mne1 = true;
    ne = "a"
  }
  if (c1(ne1, "f") && ne1[1] == 7 && c2(ne2, "u") && c1(ne_l, "f") && c3(n2, "u") && n2[0] != 0) {
    mne1 = true;
    ne = "a"
  }
  if (k && c1(ne1, "f") && c2(ne2, "u") && c1(ne_r, "f") && c3(e2, "u") && e2[0] != 7 && c3(n2, "c")) {
    mne1 = true;
    ne = "a"
  }
  if ((c1(ne_l, "f") || c1(ne_r, "f")) && c1(ne1, "f") && c2(ne2, "u") && c3(e2, "u") && c3(n2, "u")) {
    mne1 = true;
    ne = "t";
    neb = true
  }
  if (ne == "a" || ne == "t") ne1a = true;
  if (!ne1a) {
    if ((c3(nw1, "u") && c1(se1, "f") && c1(ne1, "f") && c2(ne2, "u") && c2(n2, "u") && !c1(e2, "uk")) || (c1(sw1, "uk") && c1(ne1, "f") && c2(ne2, "u") && !c1(e2, "uk") && c2(n2, "u")) || (c1(se1, "uk") && c1(nw1, "f") && c2(ne2, "u") && !c1(e2, "uk") && c2(n2, "u"))) {
      mne1 = true;
      ne = (k) ? "e": "d";
      ne1x = true
    }
  }
  if (k) {
    if ((c3(se1, "u") && se1[0] == 7 || c3(nw1, "u") && nw1[1] == 0) && c1(ne1, "f") && c2(ne2, "u") && !c1(e2, "uk") && c2(n2, "u")) net = true;
  } //#########
  if (c1(se1, "f") && c1(se2, "u") && c1(se3, "f") && se2[1] != 7 && !c1(s2, "uk") && !c1(e2, "uk")) {
    mse1 = true;
    se = "a"
  }
  if (c2(e2, "u") && c1(se1, "f") && c1(se_l, "f") && c3(s2, "u") && !c1(se2, "uk") && s2[1] != 0) {
    mse1 = true;
    se = "a"
  }
  if (c1(se1, "f") && se1[1] == 7 && c1(se_l, "f") && c3(s2, "u")) {
    mse1 = true;
    se = "a"
  }
  if (piece.charAt(1) != 0 && c1(se1, "f") && c1(se_l, "f") && c2(se2, "u") && !c1(e2, "f") && c3(s2, "u")) {
    mse1 = true;
    se = "a"
  }
  if (c1(se1, "f") && c1(se2, "u") && c1(se3, "f") && !c1(s2, "f") && c3(e2, "u") && e2[0] != 0 && e2[1] != 7) {
    mse1 = true;
    se = "a"
  }
  if ((c1(se_l, "f") || c1(ne_x, "f")) && c1(se1, "f") && !c1(se2, "uk") && c3(e2, "u") && c3(s2, "u")) {
    mse1 = true;
    se = "t";
    seb = true;
  }
  if (se == "a" || se == "t") se1a = true;
  if (!se1a) {
    if ((c1(se1, "f") && c3(nw1, "u") && !c1(se2, "uk") && c2(e2, "u") && !c1(s2, "uk")) || (c1(se1, "f") && c1(sw1, "uk") && c1(ne1, "f") && c2(e2, "u") && !c1(s2, "uk") && !c1(se2, "uk"))) {
      mse1 = true;
      se = (k) ? "e": "d";
      se1x = true
    }
    se_e = (c1(ne1, "uk") && c1(sw1, "f") && c1(se1, "f") && !c1(se2, "uk")) ? true: false;
    if ((se_e) && ((!c1(e2, "f") && !c1(s2, "f")) || (!c3(e2, "u") && !c1(s2, "uk")))) {
      mse1 = true;
      se = (k) ? "e": "d";
      se1x = true
    }
  }
  if (k) {
    if (((sw1[1] == 0 && c3(sw1, "u")) || (ne1[0] == 0 && c3(ne1, "u"))) && c2(e2, "u") && c1(se1, "f") && !c1(se2, "uk") && !c1(s2, "uk")) set = true;
  } //##############################
  if (k && c3(nw_x, "u") && nw_x[0] == 0 && nw_x[1] == 0) {
    msw1 = true;
    sw = "a"
  }
  if (c1(sw1, "f") && c1(sw2, "u") && c1(sw3, "f") && sw2[1] != 0 && !c1(s2, "uk") && !c1(w2, "uk")) {
    msw1 = true;
    sw = "a"
  }
  if (c2(w2, "u") && c1(sw1, "f") && c1(sw_r, "f") && c3(s2, "u") && !c1(sw2, "uk") && s2[0] != 7) {
    msw1 = true;
    sw = "a"
  }
  if (c1(sw1, "f") && !c1(sw2, "uk") && c1(sw3, "f") && c2(s2, "f") && c3(w2, "u") && w2[1] != 0 && w2[0] != 0) {
    msw1 = true;
    sw = "a"
  }
  if (c1(sw1, "f") && sw1[1] == 0 && c3(s2, "u") && c1(sw_r, "f") && s2[0] != 7) {
    msw1 = true;
    sw = "a"
  }
  if (c1(sw1, "f") && c2(sw2, "u") && c3(s2, "u") && c1(sw_r, "f") && s2[0] != 7 && c2(w2, "f")) {
    msw1 = true;
    sw = "a"
  }
  if ((c1(sw_r, "f") || c1(nw_x, "f")) && c1(sw1, "f") && !c1(sw2, "uk") && c3(s2, "u") && c3(w2, "u")) {
    msw1 = true;
    sw = "t";
    swb = true
  }
  if (sw == "a" || sw == "t") sw1a = true;
  if (!sw1a) {
    if ((c1(sw1, "f") && c3(ne1, "u") && !c1(sw2, "uk") && c2(w2, "u") && !c1(s2, "uk")) || (c1(sw1, "f") && c1(se1, "uk") && c1(nw1, "f") && c2(w2, "u") && !c1(s2, "uk") && !c1(sw2, "uk"))) {
      msw1 = true;
      sw = (k) ? "e": "d";
      sw1x = true
    }
    sw_e = (c1(nw1, "uk") && c1(se1, "f") && c1(sw1, "f") && !c1(sw2, "uk")) ? true: false;
    if ((sw_e) && ((!c1(w2, "f") && !c1(s2, "f")) || (!c3(w2, "u") && !c1(s2, "uk")))) {
      msw1 = true;
      sw = (k) ? "e": "d";
      sw1x = true
    }
  }
  if (k) {
    if (((se1[1] == 7 && c3(se1, "u")) || (nw1[0] == 0 && c3(nw1, "u"))) && c2(w2, "u") && c1(sw1, "f") && !c1(sw2, "uk") && !c1(s2, "uk")) swt = true;
  }
  if (nw1a) {
    if (ne1x || se1x || sw1x) {
      mnw1 = true;
      nw = "$"
    }
  }
  if (ne1a) {
    if (nw1x || se1x || sw1x) {
      mne1 = true;
      ne = "$"
    }
  }
  if (se1a) {
    if (nw1x || ne1x || sw1x) {
      mse1 = true;
      se = "$"
    }
  }
  if (sw1a) {
    if (nw1x || ne1x || se1x) {
      msw1 = true;
      sw = "$"
    }
  }
  if (nwb) {
    if (ne1x || se1x || sw1x) {
      mnw1 = true;
      nw = "%"
    }
  }
  if (neb) {
    if (nw1x || se1x || sw1x) {
      mne1 = true;
      ne = "%"
    }
  }
  if (seb) {
    if (nw1x || ne1x || sw1x) {
      mse1 = true;
      se = "%"
    }
  }
  if (swb) {
    if (nw1x || ne1x || se1x) {
      msw1 = true;
      sw = "%"
    }
  }
  if (nwt) {
    if (ne1x || se1x || sw1x) {
      mnw1 = true;
      nw = "�"
    }
  }
  if (net) {
    if (nw1x || se1x || sw1x) {
      mne1 = true;
      ne = "�"
    }
  }
  if (set) {
    if (nw1x || ne1x || sw1x) {
      mse1 = true;
      se = "�"
    }
  }
  if (swt) {
    if (nw1x || ne1x || se1x) {
      msw1 = true;
      sw = "�"
    }
  } //Try to keep bottom pieces in place unless all remaining whites are kings.
  if (cntr2a != cntr2k) {
    if (bot && !k && nw != "a" && ne != "a") {
      if (c1(nw1, "u")) {
        mne1 = true;
        ne = "~"
      }
      if (!c1(n2, "uk")) {
        mnw1 = true;
        nw = "y"
      }
      if (!c1(n2, "uk") && !c1(nw1, "u")) {
        mne1 = true;
        ne = "y"
      }
    }
    if (bot && !k && nw == "a") {
      if (c1(e2, "f")) {
        mnw1 = true;
        nw = "z"
      }
    }
    if (bot && !k && ne == "a") {
      if (c1(w2, "f")) {
        mne1 = true;
        ne = "z"
      }
    }
  }
  if (c3(nw1, "c") && c3(nw2, "u")) {
    mne1 = false;
    mse1 = false;
    msw1 = false
  }
  if (c3(ne1, "c") && c3(ne2, "u")) {
    mnw1 = false;
    mse1 = false;
    msw1 = false
  }
  if (c3(se1, "c") && c1(se2, "uk")) {
    mnw1 = false;
    mne1 = false;
    msw1 = false
  }
  if (c3(sw1, "c") && c1(sw2, "uk")) {
    mnw1 = false;
    mne1 = false;
    mse1 = false
  }
  not_safe = (!mnw1 && !mne1 && !mse1 && !msw1) ? true: false;
  if (not_safe && c1(nw1, "f")) {
    mnw1 = true;
    nw = "z"
  }
  if (not_safe && c1(ne1, "f")) {
    mne1 = true;
    ne = "z"
  }
  if (not_safe && c1(se1, "f") && k) {
    mse1 = true;
    se = "z"
  }
  if (not_safe && c1(sw1, "f") && k) {
    msw1 = true;
    sw = "z"
  }
  if (c1(nw1, "f") && c3(nw2, "u")) {
    mnw1 = true;
    nw = "z"
  }
  if (c1(nw1, "f") && c1(w2, "uk") && c1(n2, "f")) {
    mnw1 = true;
    nw = "z"
  }
  if (c1(nw1, "f") && c1(w2, "f") && c3(n2, "u")) {
    mnw1 = true;
    nw = "z"
  }
  if (c1(ne1, "f") && c3(ne2, "u")) {
    mne1 = true;
    ne = "z"
  }
  if (c1(ne1, "f") && c1(e2, "uk") && c1(n2, "f")) {
    mne1 = true;
    ne = "z"
  }
  if (c1(ne1, "f") && c1(e2, "f") && c3(n2, "u")) {
    mne1 = true;
    ne = "z"
  }
  if (c1(se1, "f") && c1(se2, "uk")) {
    mse1 = true;
    se = "z"
  }
  if (c1(se1, "f") && c1(s2, "uk") && c1(e2, "f")) {
    mse1 = true;
    se = "z"
  }
  if (c1(se1, "f") && c3(e2, "u") && c1(s2, "f")) {
    mse1 = true;
    se = "z"
  }
  if (c1(sw1, "f") && c1(sw2, "uk")) {
    msw1 = true;
    sw = "z"
  }
  if (c1(sw1, "f") && c1(s2, "uk") && c1(w2, "f")) {
    msw1 = true;
    sw = "z"
  }
  if (c1(sw1, "f") && c3(w2, "u") && c1(s2, "f")) {
    msw1 = true;
    sw = "z"
  }
  if (!k) mse1 = false;
  if (!k) msw1 = false;
  if (!c1(nw1, "f")) mnw1 = false;
  if (!c1(ne1, "f")) mne1 = false;
  if (!c1(se1, "f")) mse1 = false;
  if (!c1(sw1, "f")) msw1 = false;
  m_nw1 = (mnw1) ? nw1[0] + "" + nw1[1] + nw: "";
  m_ne1 = (mne1) ? ne1[0] + "" + ne1[1] + ne: "";
  m_se1 = (mse1) ? se1[0] + "" + se1[1] + se: "";
  m_sw1 = (msw1) ? sw1[0] + "" + sw1[1] + sw: "";
  ini_to = new Array(m_nw1, m_ne1, m_se1, m_sw1); //alert(piece+'\n'+ini_to)
  return ini_to;
}

function block(piece) {
  dir(piece);
  at_nw = (c3(nw1, "u") && c1(se1, "f")) ? true: false;
  a_fnw0 = (at_nw && c3(se2, "c")) ? (se2[0] + "" + se2[1]) + "-" + (se1[0] + "" + se1[1]) : "*";
  a_fnw1 = (at_nw && c3(s2, "c") && c2(e2, "u")) ? (s2[0] + "" + s2[1]) + "-" + (se1[0] + "" + se1[1]) : "*";
  a_fnw2 = (at_nw && c1(e2, "ck") && !c1(s2, "uk")) ? (e2[0] + "" + e2[1]) + "-" + (se1[0] + "" + se1[1]) : "*";
  at_ne = (c3(ne1, "u") && c1(sw1, "f")) ? true: false;
  a_fne0 = (at_ne && c3(sw2, "c")) ? (sw2[0] + "" + sw2[1]) + "-" + (sw1[0] + "" + sw1[1]) : "*";
  a_fne1 = (at_ne && c3(s2, "c") && c2(w2, "u")) ? (s2[0] + "" + s2[1]) + "-" + (sw1[0] + "" + sw1[1]) : "*";
  a_fne2 = (at_ne && c1(w2, "ck") && !c1(s2, "uk")) ? (w2[0] + "" + w2[1]) + "-" + (sw1[0] + "" + sw1[1]) : "*";
  at_se = (c1(se1, "uk") && c1(nw1, "f")) ? true: false;
  a_fse0 = (at_se && c1(nw2, "ck")) ? (nw2[0] + "" + nw2[1]) + "-" + (nw1[0] + "" + nw1[1]) : "*";
  a_fse1 = (at_se && c3(w2, "c") && c2(n2, "u")) ? (w2[0] + "" + w2[1]) + "-" + (nw1[0] + "" + nw1[1]) : "*";
  a_fse2 = (at_se && c1(n2, "ck") && !c1(w2, "uk")) ? (n2[0] + "" + n2[1]) + "-" + (nw1[0] + "" + nw1[1]) : "*";
  at_sw = (c1(sw1, "uk") && c1(ne1, "f")) ? true: false;
  a_fsw0 = (at_sw && c1(ne2, "ck")) ? (ne2[0] + "" + ne2[1]) + "-" + (ne1[0] + "" + ne1[1]) : "*";
  a_fsw1 = (at_sw && c3(e2, "c") && c2(n2, "u")) ? (e2[0] + "" + e2[1]) + "-" + (ne1[0] + "" + ne1[1]) : "*";
  a_fsw2 = (at_sw && c1(n2, "ck") && !c1(e2, "uk")) ? (n2[0] + "" + n2[1]) + "-" + (ne1[0] + "" + ne1[1]) : "*";
  _block = new Array();
  _block[0] = new Array(a_fnw0, a_fnw1, a_fnw2);
	_block[1] = new Array(a_fne0, a_fne1, a_fne2);
	_block[2] = new Array(a_fse0, a_fse1, a_fse2);
	_block[3] = new Array(a_fsw0, a_fsw1, a_fsw2);
	return _block;
}
function do_it(p) {
  pick = "";
  singles_die_first = new Array();
  sdf = -1;
  if (o[12]) {
    for (i = 0; i < p.length; i++) if (!isking(p[i].substring(0, 2)) && p[i].charAt(0) != 7) {
      sdf++;
      singles_die_first[sdf] = p[i];
    }
  }
  if (sdf >= 0) pick = singles_die_first[Math.floor(Math.random() * singles_die_first.length)];
  else pick = p[Math.floor(Math.random() * p.length)];
  move_it(pick);
  return false;
}

function single_move(piece) {
  to = new Array();
  o = new Array();
  g = new Array();
  for (i = 0; i < 13; i++) {
    o[i] = false;
    g[i] = -1;
  } //do long way, easier to keep track of what's what!
  mu = new Array();
  Q_u = new Array();
  uc = new Array();
  m$ = new Array();
  Q_$ = new Array();
  $c = new Array();
  mr = new Array();
  Q_r = new Array();
  rc = new Array();
  me = new Array();
  Q_e = new Array();
  ec = new Array();
  md = new Array();
  Q_d = new Array();
  dc = new Array();
  mt = new Array();
  Q_t = new Array();
  tc = new Array();
  ma = new Array();
  Q_a = new Array();
  ac = new Array();
  mf = new Array();
  Q_f = new Array();
  fc = new Array();
  mb = new Array();
  Q_b = new Array();
  bc = new Array();
  my = new Array();
  Q_y = new Array();
  yc = new Array();
  ml = new Array();
  Q_l = new Array();
  lc = new Array();
  mz = new Array();
  Q_z = new Array();
  zc = new Array();
  for (i = 0; i < piece.length; i++) {
    uc[i] = -1;
    $c[i] = -1;
    rc[i] = -1;
    ec[i] = -1;
    dc[i] = -1;
    tc[i] = -1;
    ac[i] = -1;
    fc[i] = -1;
    bc[i] = -1;
    yc[i] = -1;
    lc[i] = -1;
    zc[i] = -1;
  }
	
  for (i = 0; i < piece.length; i++) {
    best_single_move(piece[i]);
    to[i] = ini_to;
  }
  m_t_b = new Array();
  for (i = 0; i < piece.length; i++) {
    block(piece[i]);
    m_t_b[i] = _block;
  }
  Q_c = new Array();
  for (i = 0; i < m_t_b.length; i++) {
    for (j = 0; j < m_t_b[i].length; j++) {
      for (k = 0; k < m_t_b[i][j].length; k++) {
        /*
  Prevents red bottoms moving to block...hmmm. Not sure!
  && m_t_b[i][j][k].charAt(0)!=7)
  */
        if (m_t_b[i][j][k].indexOf("*") == -1) {
          g[5]++;
          Q_c[g[5]] = m_t_b[i][j][k];
        }
      }
    }
  }
  for (i = 0; i < to.length; i++) {
    mu[i] = new Array();
    m$[i] = new Array();
    mr[i] = new Array();
    me[i] = new Array();
    md[i] = new Array();
    mt[i] = new Array();
    ma[i] = new Array();
    mf[i] = new Array();
    mb[i] = new Array();
    my[i] = new Array();
    ml[i] = new Array();
    mz[i] = new Array();
    for (j = 0; j < to[i].length; j++) {
      if (to[i][j].indexOf("%") != -1) {
        g[0]++;
        uc[i]++;
        mu[i][uc[i]] = piece[i] + '-' + to[i][j];
        Q_u[g[0]] = mu[i][uc[i]]
      }
      if (to[i][j].indexOf("$") != -1) {
        g[1]++;
        $c[i]++;
        m$[i][$c[i]] = piece[i] + '-' + to[i][j];
        Q_$[g[1]] = m$[i][$c[i]]
      }
      if (to[i][j].indexOf("�") != -1) {
        g[2]++;
        rc[i]++;
        mr[i][rc[i]] = piece[i] + '-' + to[i][j];
        Q_r[g[2]] = mr[i][rc[i]]
      }
      if (to[i][j].indexOf("e") != -1) {
        g[3]++;
        ec[i]++;
        me[i][ec[i]] = piece[i] + '-' + to[i][j];
        Q_e[g[3]] = me[i][ec[i]]
      }
      if (to[i][j].indexOf("d") != -1) {
        g[4]++;
        dc[i]++;
        md[i][dc[i]] = piece[i] + '-' + to[i][j];
        Q_d[g[4]] = md[i][dc[i]]
      }
      if (to[i][j].indexOf("t") != -1) {
        g[6]++;
        tc[i]++;
        mt[i][tc[i]] = piece[i] + '-' + to[i][j];
        Q_t[g[6]] = mt[i][tc[i]]
      }
      if (to[i][j].indexOf("a") != -1) {
        g[7]++;
        ac[i]++;
        ma[i][ac[i]] = piece[i] + '-' + to[i][j];
        Q_a[g[7]] = ma[i][ac[i]]
      }
      if (to[i][j].indexOf("^") != -1) {
        g[8]++;
        fc[i]++;
        mf[i][fc[i]] = piece[i] + '-' + to[i][j];
        Q_f[g[8]] = mf[i][fc[i]]
      }
      if (to[i][j].indexOf("b") != -1) {
        g[9]++;
        bc[i]++;
        mb[i][bc[i]] = piece[i] + '-' + to[i][j];
        Q_b[g[9]] = mb[i][bc[i]]
      }
      if (to[i][j].indexOf("y") != -1) {
        g[10]++;
        yc[i]++;
        my[i][yc[i]] = piece[i] + '-' + to[i][j];
        Q_y[g[10]] = my[i][yc[i]]
      }
      if (to[i][j].indexOf("~") != -1) {
        g[11]++;
        lc[i]++;
        ml[i][lc[i]] = piece[i] + '-' + to[i][j];
        Q_l[g[11]] = ml[i][lc[i]]
      }
      if (to[i][j].indexOf("z") != -1) {
        g[12]++;
        zc[i]++;
        mz[i][zc[i]] = piece[i] + '-' + to[i][j];
        Q_z[g[12]] = mz[i][zc[i]]
      }
    }
  }
  for (i = 0; i < 13; i++) {
    if (g[i] >= 0) o[i] = true;
  }	
  if (o[0]) do_it(Q_u);
  else if (o[1]) do_it(Q_$);
  else if (o[2]) do_it(Q_r);
  else if (o[3]) do_it(Q_e);
  else if (o[4]) do_it(Q_d);
  else if (o[5]) do_it(Q_c);
  else if (o[6]) do_it(Q_t);
  else if (o[7]) do_it(Q_a);
  else if (o[8]) do_it(Q_f);
  else if (o[9]) do_it(Q_b);
  else if (o[10]) do_it(Q_y);
  else if (o[11]) do_it(Q_l);
  else if (o[12]) do_it(Q_z);
  else {
    alert("Something wrong if you see this.");
    game_over = true;
    return false;
  }
}

function move_it(pick) {
  kng = "";
  pick = pick.split('-');
  from = pick[0];
  to = pick[1].substring(0, 2);
  id(from);
  draw(from, n + "h.png");
  if (n == "c" && to.charAt(0) == 0) kng = "k";
  setTimeout('draw(to,n+kng+"h.png");draw(from,"f.png")', 500);
  setTimeout('draw(to,n+kng+".png");comp_reset()', 1000);
}

function comp_reset() {
  eval(dum);
  computer_go = false;
  stuck();
  if (plc < 1) {
    game_over = true; //document.info.disp.value="Game over! I win, you can't move.";
    disp.innerHTML = "Game over!<br \/>I win, you can't move.";
  } else { //document.info.disp.value="OK. It's your turn.";
    disp.innerHTML = "OK. It's your turn.";
  }
}

function toss() {
  if (tossed) {
    document.info.bttn.value = "Who goes first?";
    reset();
    tossed = false;
    return false;
  } else {
    who = new Array("White", "Red");
    who_first = who[Math.floor(Math.random() * who.length)]; //document.info.disp.value=who_first+" goes first.";
    disp.innerHTML = who_first + " goes first.";
    document.info.bttn.value = "Restart";
    if (who_first == "Red") setTimeout("computer()", 500);
    tossed = true;
  }
} //document.info.disp.value="You are white. Click the button.";
disp.innerHTML = "You are white.<br \/>Click the button.";

