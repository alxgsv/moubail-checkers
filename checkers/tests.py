import unittest
from models import *

class CheckersGameTestCase(unittest.TestCase):
    def setUp(self):
        self.player1 = Player(imei="imei1")
        self.player1.put()
        self.player2 = Player(imei="imei2")
        self.player2.put()
        self.game = CheckersGame(player1 = self.player1, player2 = self.player2)
        self.game.put()
        
    def testFindingGame(self):        
        self.assertEquals(self.game.key(), self.player1.game().key())
        
    def testStartBoard(self):
        board = Board(self.player1, self.player2)        
        self.assertEquals(board(0,1).key(), self.player1.key())
        self.assertEquals(board(0,0), None)
        self.assertEquals(board(0,7).key(), self.player2.key())        
        self.assertEquals(board(2,6), None)
