import sys, logging
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
    # Because there cant be two inequals in one query
    opponents = Player.gql("WHERE game_requested > :1 ", datetime.now() - timedelta(0, 45)).fetch(2)
    opponents = filter(lambda x: x.imei != request.GET['imei'], opponents)
    if opponents:
        opponent = opponents[0]
        player.game_requested, opponent.game_requested = None, None
        game = CheckersGame.create(player1 = opponent, player2 = player)
        player.game, opponent.game = game, game
        game.setup()
        game.put()
        
        player.put()
        opponent.put()
        return HttpResponseRedirect("/api/action/?imei=%s"%request.GET['imei'])
    return HttpResponse(sj.dumps({'status' : 'waiting'}))

def action(request):
    player = Player.gql("WHERE imei = :1", request.GET['imei']).get()
    player.game_requested = datetime.now()
     
    if not player:
        return HttpResponseRedirect("/api/newgame/?imei=%s"%request.GET['imei'])
        
    game = player.game

    if not game:
        return HttpResponseRedirect("/api/newgame/?imei=%s"%request.GET['imei'])

    game.setup(player)

    if request.GET.has_key('queue'):
        game.apply_turn_queue(request.GET['queue'])

    game.check_if_over()

    if game.is_over: player.game = None

    game.save()
    player.put()
    return HttpResponse(sj.dumps(game.to_response()))
