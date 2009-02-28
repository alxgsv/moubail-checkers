import copy, pprint, random, logging
from datetime import datetime

from appengine_django.models import BaseModel
from google.appengine.ext import db

from django.utils import simplejson as sj

class Player(db.Expando):
    imei = db.StringProperty()
    score = db.IntegerProperty()
       
    created_at = db.DateTimeProperty(auto_now_add=True)
    game_requested = db.DateTimeProperty()
    
    def game(self):
        return self.checkersgames1.get() or self.checkersgames2.get()


class Checker:
    def __init__(self, player, type="Normal"):
        self.player = player
        self.type = type
        
    def is_king(self):
        return self.type == "King"
    
    def dump_to_list(self):
        return [self.player.key(), self.type]

class Board:
    """ 
    8x8 checkers board. Player1 it on top, Player2 on the bottom.

    1   1   1   1  
      1       1   1
    1   1   1   1  
                   
                   
      2   2   2   2
    2   2   2   2  
      2   2   2   2

    Coordinates:
        - left upper:   [0][0]
        - right upper:  [7][0]
        - left bottom:  [0][0]
        - right bottom: [7][7]
     
    Acessing cells by self.checkers[2][1]
    """
    
    empty = [[None for i in range(8)] for i in range(8)]
    def __init__(self, player1, player2, board_list=[],):
        self.player1 = player1
        self.player2 = player2
        if not board_list:
            self.checkers = self.start_configuration(player1, player2)
            return
        self.checkers = copy.deepcopy(Board.empty)
        for x in range(len(board_list)):
            for y in range(len(board_list[x])):
                for player in [player1, player2]:
                    if board_list[x][y] and player.key().__str__() == board_list[x][y][0]:
                        self.checkers[x][y] = Checker(player, board_list[x][y][1])
                        
        
    def dump_to_list(self):
        dump = copy.deepcopy(self.checkers)
        for x in range(len(dump)):
            for y in range(len(dump[x])):
                try:
                    dump[x][y] = [dump[x][y].player.key().__str__(), dump[x][y].type] 
                except AttributeError:
                    pass
        return dump                
    
    def start_configuration(self, player1, player2):
        checkers = copy.deepcopy(Board.empty)
        for x in range(len(checkers)):
            for y in range(len(checkers[x])):
                if y in [0,1,2] and (x+y)%2 == 0:
                    checkers[x][y] = Checker(player1)
                elif y in [5,6,7] and (x+y)%2 == 0:
                    checkers[x][y] = Checker(player2)
        return checkers
    
    def pretty_print(self):
        print
        for y in range(len(self.checkers[0])):
            for x in range(len(self.checkers)):
                #print "[%s%s]"%(x,y),
                if self.checkers[x][y] == None:
                    print " ",
                else:
                    print self.player_to_number(self.checkers[x][y].player),
            print
    
    def player_to_number(self, player):
        number = None
        if player.key() == self.player1.key(): number = 1
        elif  player.key() == self.player2.key(): number = 2
        return number
    
    def move(self, fr, to):
        checker = self.checkers[fr[0]][fr[1]]
        logging.warn("Moving %s from %s to %s"%(checker, fr, to))
        self.checkers[fr[0]][fr[1]] = None
        self.checkers[to[0]][to[1]] = checker

    def possible_moves_for(player):
        

    def __call__(self, x, y):
        return self.checkers[x][y]
    
class Game:
    pass

class CheckersGame(db.Model, Game):
    player1 = db.ReferenceProperty(Player, collection_name="checkersgames1")
    player2 = db.ReferenceProperty(Player, collection_name="checkersgames2")
    state = db.TextProperty()
    turner = db.ReferenceProperty(Player, collection_name="checkersgames_turner")
    
    created_at = db.DateTimeProperty(auto_now_add=True)
    last_update_at = db.DateTimeProperty(auto_now=True)
    last_turn_at = db.DateTimeProperty()
    timeout = db.IntegerProperty()
    
    def for_player1(self):
        return self.requester and self.requester.key() == self.player1.key()
    
    def for_player2(self):
        return self.requester and self.requester.key() == self.player2.key()
    
    def requester_is_turner(self):
        logging.info("requester is turner " + str(self.requester.key() == self.turner.key()))
        return self.requester.key() == self.turner.key()

    def change_turner(self):
        if self.turner.key() == self.player1.key():
            self.turner = self.player2
        else:
            self.turner = self.player1
    
    def player_coords(self, xy):
        if self.for_player1(): return [int(xy[1]), int(xy[0])]
        elif self.for_player2(): return [7-int(xy[1]), 7-int(xy[0])]
    
    def setup(self, player=None):
        if self.state:
            self.unpack()
        else:
            self.board = Board(self.player1, self.player2)
            self.turner = random.choice([self.player1, self.player2])
        self.requester = player
    
    def pack(self):
        dump = self.board.dump_to_list()   
        self.state = sj.dumps({'board' : dump})
    
    def save(self):
        self.pack()
        self.put()
    
    def unpack(self):
        self.board = Board(self.player1, self.player2, sj.loads(self.state)["board"])    
    
    def apply_turn_queue(self, turnqueue):
        logging.info("get queue %s"%turnqueue)
        if not self.requester_is_turner(): return False            
        logging.info("this queue is accepable")
        while turnqueue:
            turn = turnqueue[:4]
            turnqueue = turnqueue[4:]
            self.board.move(self.player_coords(turn[2:]), self.player_coords(turn[:2]))
        self.last_turn_at = datetime.now()
        self.change_turner()

    def to_response(self):
        response_board = self.board.dump_to_list()
        if self.for_player2(): 
            response_board = copy.deepcopy(response_board)
            response_board.reverse()
            for i in range(len(response_board)):
                response_board[i].reverse()
        for x in range(len(response_board)):
            for y in range(len(response_board[x])):
                if not response_board[x][y]:
                    response_board[x][y] = False
                elif response_board[x][y][0] == self.requester.key().__str__():
                    response_board[x][y] = "1%s"%response_board[x][y][1][0]
                else:
                    response_board[x][y] = "2%s"%response_board[x][y][1][0]
        return {'board': response_board, 'your_turn': self.requester_is_turner(), 'status':'onair'}
        
    
