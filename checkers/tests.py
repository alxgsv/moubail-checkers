import unittest, copy
from models import *

def list_diff(l1, l2):
    return filter(lambda x: x not in l1, l2)

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
        self.assertEquals(self.game.player_coords("10"), [0,1])
        self.game.setup(self.player2)
        self.assertEquals(self.game.player_coords("10"), [7,6])

    def testPossiblePeaceMoves(self):
                # 01234567
        board = ["f   S   ",#0
                 " f      ",#1
                 "  f     ",#2
                 "   f   F",#3
                 "  f f   ",#4
                 "     f  ",#5
                 "      f ",#6
                 " s     f",#7
                ]
        self.game.board.reinit_from_test_board(board)
        
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([2,4]), [[1, 5, None], [3, 5, None]]))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([1,7]), [[0, 6, None], [2,6, None]]))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([4,0]), [[3, 1, None], [5,1, None]]))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([7,3]), [[6, 2, None], [6,4, None]]))
       
    def testPossibleEatMoves(self):
                # 01234567
        board = ["f     f ",#0
                 " s   s s",#1
                 "    s   ",#2
                 "        ",#3
                 "      s ",#4
                 "       F",#5
                 "s s   s ",#6
                 " s      ",#7
                ]
        self.game.board.reinit_from_test_board(board)

        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([0,0]), [[2, 2, [1,1]]]))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([7,5]), [[5, 3, [6,4]], [5, 7, [6,6]]]))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([6,0]), []))
        self.assertFalse(list_diff(self.game.board.possible_moves_for_checker([1,7]), []))
       
