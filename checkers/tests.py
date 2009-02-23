import unittest, copy
from models import *


class CheckersGameTestCase(unittest.TestCase):
    def setUp(self):
        self.player1 = Player(imei="imei1")
        self.player1.put()
        self.player2 = Player(imei="imei2")
        self.player2.put()
        self.game = CheckersGame(player1 = self.player1, player2 = self.player2)
        self.game.put()
        self.game.setup(self.player1)
        
    def testFindingGame(self):        
        self.assertEquals(self.game.key(), self.player1.game().key())
        
    def testStartBoard(self):
        board = Board(self.player1, self.player2)
        self.assertEquals(board(0,0).player.key(), self.player1.key())
        self.assertEquals(board(0,1), None)
        self.assertEquals(board(0,6).player.key(), self.player2.key())        
        self.assertEquals(board(2,7), None)
        self.assertEquals(board(7,7).player.key(), self.player2.key())
    
    def testPackingUnpacking(self):
       
        self.game.pack()
        self.game.put()
        state = copy.copy(self.game.state)
        self.game.unpack()
        self.assertEquals(state, self.game.state)        

    def testCoordsTransformation(self):
        self.assertEquals(self.game.player_coords("00"), [0,0])
        self.game.setup(self.player2)
        self.assertEquals(self.game.player_coords("00"), [7,7])
