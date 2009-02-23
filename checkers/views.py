import sys
from datetime import datetime, timedelta

from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponse

from django.utils import simplejson as sj

from models import Player, CheckersGame

def turn(request):

    return HttpResponse(sj.dumps("dasda"))

def new_game(request):
    player = Player.gql("WHERE imei = :1", request.GET['imei']).get()
    if not player:
        player = Player(imei = request.GET['imei'])
    player.game_requested = datetime.now()
    player.put()
    opponents = Player.gql("WHERE game_requested > :1 ", datetime.now() - timedelta(0, 45)).fetch(2)
    opponents = filter(lambda x: x.imei != request.GET['imei'], opponents)
    if opponents:
        opponent = opponents[0]
        player.game_requested = None
        opponent.game_requested = None
        game = CheckersGame(player1 = opponent, player2 = player)
        game.setup()
        player.put()
        opponent.put()
        game.put()
        return HttpResponseRedirect("/api/action/?imei=%s"%request.GET['imei'])
    return HttpResponse(sj.dumps({'status' : 'waiting'}))

def action(request):
    player = Player.gql("WHERE imei = :1", request.GET['imei']).get()
     
    if not player:
        return HttpResponseRedirect("/api/newgame/?imei=%s"%request.GET['imei'])
    game = player.game()
    if not game:
        return HttpResponseRedirect("/api/newgame/?imei=%s"%request.GET['imei'])
    game.setup(player)      
    return HttpResponse(sj.dumps(game.to_response()))
