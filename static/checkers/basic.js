var body = document.getElementById('body-wrap');

/* BOARD INIT */

// Original code Kurt Grigg http://www.btinternet.com/~kurt.grigg/javascript - heavily modified by Markus Meriluoto 
var dims=42;
var brdh=3;
var brdw=(dims*8)+(brdh*2);

tossed=false;


function is_legal(y,x){
    return (y+x)%2==0;
}

/* one board cell */
function cell(inner){
    return "<div class='check' style='width:"+dims+"px;height:"+dims+"px'>" + inner + "</div>";
}
/* image of checker in cell */
function checker_image(y, x, type){
    return "<img onClick='vbrbasic();pos("+y+","+x+");dots(this);' name=p"+y+""+x+" id=p"+y+""+x+" src='" + type + ".png' style='width:"+dims+"px;height:"+dims+"px'>";
}

function generate_board_html(){
    var board = "";
    
    for (y=0; y < 8; y++){
	    for (x=0; x < 8; x++){
		    var legal = is_legal(y,x);
	
		    if (legal && y < 3)      image = checker_image(y, x, 'u'); 
	        else if (legal && y > 4) image = checker_image(y, x, 'c');
	        else if (legal)          image = checker_image(y, x, 'f');
		    else image = "<img src='b.png' style='width:"+dims+"px;height:"+dims+"px'>";            
            board += cell(image);
	    }
	    board = "<div class='game-row'>" + board + "</div>";
	    //document.getElementById('game-table').innerHTML = html;
    }
    return board;
}

function reset() {
	document.getElementById('game-table').style.display = "none";
	document.getElementById('game-info').style.display = "none";
	resetall();
	setTimeout("setup()",1500);
}
function setup() {
    document.getElementById('game-table').innerHTML = generate_board_html();	
	document.getElementById('game-table').style.display = "block";
	document.getElementById('game-info').style.display = "block";	
	document.getElementById('disp').innerHTML = "You are white.<br />Click the button.";
}

/* END BOARD INIT */

function init()
{
    setup();
		
	getDisplayOrientation();
	setInterval("getDisplayOrientation()",500);
	
	// Obtain the SystemInfo object
    try {
        window.menu.hideSoftkeys();
        sysInfo = document.embeds[0];
    } catch (ex) {
        //alert("SystemInfo object cannot be found.");
        return;
    }
    
}

function vbr(duration,intensity) {
	durationvalue = Number(duration);
	intensityvalue = Number(intensity);
	try {
  	sysInfo.startvibra(durationvalue, intensityvalue);
  }catch(ex){
		
	}
	
}
function vbrbasic() {
	vbr(18,10);
}


function gotourl(url) {	
	url = url.href;
	widget.openURL(url);
}

 
// Display Information
function getDisplayOrientation()
{
    //if (widget.isrotationsupported)

	// Change the screen orientation
	//widget.setDisplayLanscape();
	
	var h = window.screen.height;
	var w = window.screen.width;
 
	if (h > w)
	{
		body.className = "portrait";
	}
  	else {
		body.className = "horizontal";
	}	


}

function infotoggle() {
	info = document.getElementById('info').style;
	if(info.display != 'block') {
		info.display = 'block';
	}
	else {
		info.display = 'none';
	}
}


