import copy, pprint

from appengine_django.models import BaseModel
from google.appengine.ext import db

class Player(db.Expando):
    imei = db.StringProperty()
    score = db.IntegerProperty()
       
    created_at = db.DateTimeProperty(auto_now_add=True)
    
    def game(self):
        return self.checkersgames1.get() or self.checkersgames2.get()

class Board:
    """ 8x8 checkers board """
    # def move(self, from_coords, to_coords):
    empty = [[None for i in range(8)] for i in range(8)]
    def __init__(self, player1, player2, board_array=[],):
        self.player1 = player1
        self.player2 = player2
        if not board_array:
            self.checkers = self.start_configuration(player1, player2)
            return
        self.checkers = copy.deepcopy(Board.empty)
        for x in range(len(board_array)):
            for x in range(len(board_array[x])):
                for player in players:
                    if player.key() == board_array[x][y]:
                        self.checkers[x][y] = player
                        
        
    def dump_to_array(self):
        dump = copy.deepcopy(self.checkers)
        for x in range(len(dump)):
            for y in range(len(dump[x])):
                try:
                    dump[x][y] = dump[x][y].key()
                except AtributeError:
                    pass
        return dump                
    
    def start_configuration(self, player1, player2):
        checkers = copy.deepcopy(Board.empty)
        for x in range(len(checkers)):
            for y in range(len(checkers[x])):
                if y in [0,1,2] and (x+y)%2 == 1:
                    checkers[x][y] = player1
                elif y in [5,6,7] and (x+y)%2 == 1:
                    checkers[x][y] = player2
        return checkers
    
    def pretty_print(self):
        print
        for y in [len(self.checkers[0])-i-1 for i in range(len(self.checkers[0]))]:
            for x in range(len(self.checkers)):
                if self.checkers[x][y] == None:
                    print " ",
                else:
                    print self.player_to_number(self.checkers[x][y]),
            print
    
    def player_to_number(self, player):
        number = None
        if player.key() == self.player1.key(): number = 1
        elif  player.key() == self.player2.key(): number = 2
        return number
    
    def __call__(self, x, y):
        return self.checkers[x][y]
    
class Game:
    pass

class CheckersGame(db.Expando, Game):
    player1 = db.ReferenceProperty(Player, collection_name="checkersgames1")
    player2 = db.ReferenceProperty(Player, collection_name="checkersgames2")
    state = db.TextProperty()
    
    created_at = db.DateTimeProperty(auto_now_add=True)
    last_turn_at = db.DateTimeProperty(auto_now=True)
    timeout = db.IntegerProperty()
    
    def unpack(self):
        self.board = []
    
