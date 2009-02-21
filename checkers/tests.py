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
        


        
        
