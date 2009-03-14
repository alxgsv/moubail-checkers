alert("load");
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
IMEI = false;
TURN_QUEUE = [];

function dev_mode(){
  return typeof(DEV) != "undefined" && DEV ;
}

// IMEI

function getIMEI(){
    try {
        systemServiceObj = device.getServiceObject("Service.SysInfo", "ISysInfo");
        var result = systemServiceObj.ISysInfo.GetInfo({Entity: "Device", Key: "IMEI"});
        IMEI = hex_sha1(result.ReturnValue.StringData);
    }
	catch (ex) 
	{
        var a = new Date();
        IMEI = a.valueOf();
        if(dev_mode()){IMEI = prompt();}
    }
}

// NETWORK FUNCTIONS
function query_to_param(){	
  var plain_queue = "";
	$(TURN_QUEUE).each(function(i, e){plain_queue += e[1]+e[0];});
	return plain_queue;
}

function send_queue(){
	$.getJSON(get_url('action'), {imei:IMEI, queue:query_to_param()}, function(data){
		TURN_QUEUE = [];
		process_server_response(data);
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
				$('#p'+y+x).attr('src', 'f.png');
			}
  	}
  }
}

function touch_server(){
   $.getJSON(get_url('action'), {imei:IMEI}, function(data){
        process_server_response(data);
	}); 
}

function toss_online() {
  if(!IMEI){getIMEI();}
  if (tossed) {
    document.info.bttn.value = "Who goes first?";
    reset();
    tossed = false;
    return false;
  } else {
    alert(get_url('action'));  
    $.getJSON(get_url('action'), {imei:IMEI}, function(data){
        alert(data);
        process_server_response(data);
	});
	alert("sent");
    
  }
}

function process_server_response(response){
   if (response.status == "over"){ 
        if(response.you_win){
           disp.innerHTML = "Congratulations! You are the winner!"; 
        }else{
           disp.innerHTML = "You are defeated. Don't give up :-)";  
        }
        moved = true;
   }else if (response.status == "onair"){
  		update_board_from_response(response.board);
        tossed = response.your_turn;       
        if(response.your_turn){
           disp.innerHTML = "Your turn";
           moved = false;
        }else{
           moved = true;
           disp.innerHTML = "Waiting for the opponent turn";
           setTimeout('touch_server()', 5000);
        }     
   }else if(response.status == "waiting"){
        moved = true;
        disp.innerHTML = "Searching for the opponent";
        setTimeout('touch_server()', 5000);
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
    
  }else{ 

  }
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
    if(!ONLINE_GAME){player_go = false;}
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
