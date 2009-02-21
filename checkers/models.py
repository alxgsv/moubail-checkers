from appengine_django.models import BaseModel
from google.appengine.ext import db

class Player(db.Expando):
    imei = db.StringProperty()
    score = db.IntegerProperty()
       
    created_at = db.DateTimeProperty(auto_now_add=True)
    
    def game(self):
        return self.checkersgames1.get() or self.checkersgames2.get()

class Game:
    pass

class CheckersGame(db.Expando, Game):
    player1 = db.ReferenceProperty(Player, collection_name="checkersgames1")
    player2 = db.ReferenceProperty(Player, collection_name="checkersgames2")
    state = db.TextProperty()
    
    created_at = db.DateTimeProperty(auto_now_add=True)
    last_turn_at = db.DateTimeProperty(auto_now=True)
    timeout = db.IntegerProperty()
    
