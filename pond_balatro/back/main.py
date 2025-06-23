from fastapi import FastAPI
import requests
import time
import random


app = FastAPI()
deck_id = ""
player_drawn_val = []
player_drawn_cards = []
enemy_drawn_val = []
enemy_drawn_cards = []
player_jokers = []
start = False
round = 1
blackjack = 21
dificuldades = {"easy": 15, "medium": 17, "hard": 19}
dif = ""
jokers = [
    ["Precoce","Altera o valor a ser atingido de 21 para 18"],
    ["Tardio","Altera o valor a ser atingido de 21 para 24"],
    ["Revolucionário","Cartas de caras valem metade do seu valor normal"],
]
not_added_jokers = jokers.copy()

descartado = False

def game_check(stop: bool, card1 = None, card2 = None):
    global player_drawn_val, enemy_drawn_val, blackjack, start, round, dif, dificuldades, player_jokers, not_added_jokers
    s_p = sum(player_drawn_val)
    s_e = sum(enemy_drawn_val)
    if stop:
        start = False
        while s_e <= dificuldades[dif] + blackjack - 21 and s_e < s_p:
            r = requests.get(f"https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=1")

            card = r.json()["cards"]
            enemy_drawn_cards.append(card[0])

            if card[0]["value"].isdigit():
                enemy_drawn_val.append(int(card[0]["value"]))
            elif card[0]["value"] in ["KING", "QUEEN", "JACK"]:
                enemy_drawn_val.append(10)
            elif card[0]["value"] == "ACE":
                if sum(enemy_drawn_val) + 11 <= blackjack:
                    enemy_drawn_val.append(11)
                else:
                    enemy_drawn_val.append(1)
            s_e = sum(enemy_drawn_val)
            time.sleep(0.1)

        if s_p > blackjack:
            if s_e > blackjack:
                return {"message":f"Tie!", "state": "tie", "player": s_p, "enemy": s_e}
            else:
                player_jokers.clear()
                not_added_jokers = jokers.copy()
                round = 1
                return {"message":f"Enemy wins!", "state": "enemy_win", "player": s_p, "enemy": s_e}
        elif s_p == blackjack:
            if s_e == blackjack:
                return {"message":f"Tie!", "state": "tie", "player": s_p, "enemy": s_e}
            else:
                if len(not_added_jokers) != 0:
                    i = random.randint(0, len(not_added_jokers) - 1)
                    player_jokers.append(not_added_jokers[i])
                    not_added_jokers.pop(i)
                round += 1
                return {"message":f"Player wins!", "state": "player_win", "player": s_p, "enemy": s_e, "joker_added":player_jokers[-1]}
        else:
            if s_e > blackjack:
                if len(not_added_jokers) != 0:
                    i = random.randint(0, len(not_added_jokers) - 1)
                    player_jokers.append(not_added_jokers[i])
                    not_added_jokers.pop(i)
                round += 1
                return {"message":f"Player wins!", "state": "player_win", "player": s_p, "enemy": s_e, "joker_added":player_jokers[-1]}
            elif s_e == blackjack:
                player_jokers.clear()
                not_added_jokers = jokers.copy()
                round = 1
                return {"message":f"Enemy wins!", "state": "enemy_win", "player": s_p, "enemy": s_e}
            elif s_p > s_e:
                if len(not_added_jokers) != 0:
                    i = random.randint(0, len(not_added_jokers) - 1)
                    player_jokers.append(not_added_jokers[i])
                    not_added_jokers.pop(i)
                round += 1
                return {"message":f"Player wins!", "state": "player_win", "player": s_p, "enemy": s_e, "joker_added":player_jokers[-1]}
            elif s_p < s_e:
                player_jokers.clear()
                not_added_jokers = jokers.copy()
                round = 1
                return {"message":f"Enemy wins!", "state": "enemy_win", "player": s_p, "enemy": s_e}
            else:
                return {"message":f"Tie!", "state": "tie", "player": s_p, "enemy": s_e}
    else:
        if s_p > blackjack:
            start = False
            if s_e > blackjack:
                return {"message":f"Tie!", "state": "tie", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}","player": s_p, "enemy": s_e}
            else:
                player_jokers.clear()
                not_added_jokers = jokers.copy()
                round = 1
                return {"message":f"Enemy wins!", "state": "enemy_win", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e}
        elif s_p == blackjack:
            start = False
            if s_e == blackjack:
                return {"message":f"Tie!", "state": "tie", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e}
            else:
                if len(not_added_jokers) != 0:
                    i = random.randint(0, len(not_added_jokers) - 1)
                    player_jokers.append(not_added_jokers[i])
                    not_added_jokers.pop(i)
                round += 1
                return {"message":f"Player wins!", "state": "player_win", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e, "joker_added":player_jokers[-1]}
        else:
            if s_e > blackjack:
                start = False
                i = random.randint(0, len(not_added_jokers) - 1)
                player_jokers.append(not_added_jokers[i])
                not_added_jokers.pop(i)
                round += 1
                return {"message":f"Player wins!", "state": "player_win", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e, "joker_added":player_jokers[-1]}
            elif s_e == blackjack:
                start = False
                player_jokers.clear()
                not_added_jokers = jokers.copy()
                round = 1
                return {"message":f"Enemy wins!", "state": "enemy_win", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e}
            else:
                return {"message":f"Cards drawn", "state": "continue", "card_player":f"{card1['value']} of {card1['suit']}",
                        "card_enemy":f"{card2['value']} of {card2['suit']}", "player": s_p, "enemy": s_e, "round": round}

                

@app.get("/start")
async def root(difficulty: str | None = None):
    global deck_id, player_drawn_val, player_drawn_cards, enemy_drawn_val, enemy_drawn_cards, start, blackjack, round, dif, descartado
    if start == False:
        r = requests.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2")
        deck_id = r.json()["deck_id"]
        player_drawn_cards.clear()
        player_drawn_val.clear()
        enemy_drawn_cards.clear()
        enemy_drawn_val.clear()
        check = 'medium' if difficulty is None else difficulty.lower()
        dif = check if dif == '' else dif
        start = True
        descartado = False
        print(f"Difficulty set to: {dif}")
        blackjack = 21
        if ["Precoce","Altera o valor a ser atingido de 21 para 18"] in player_jokers:
            blackjack -= 3
        if ["Tardio","Altera o valor a ser atingido de 21 para 24"] in player_jokers:
            blackjack += 3

        return {"message": f"Deck created and shuffled. Round {round}", "deck_id": deck_id, "round": round}
    else:
        return {"message": "Game already started. Please stop the game before starting a new one."}

@app.get("/draw")
async def draw():
    global deck_id, player_drawn_val, player_drawn_cards, enemy_drawn_cards, enemy_drawn_val, start, blackjack, dif, dificuldades, player_jokers, round, descartado
    if start:
        if not deck_id:
            return {"message": "No deck available. Please start a new game."}
        
        if len(player_drawn_cards) != len(player_drawn_val):
            return {"message": "Select a value for the ACE before drawing another card."}
        
        card = None
        if sum(enemy_drawn_val) < dificuldades[dif] + blackjack - 21:
            r = requests.get(f"https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=2")

            card = r.json()["cards"]
            player_drawn_cards.append(card[0])
            enemy_drawn_cards.append(card[1])

            if card[1]["value"].isdigit():
                enemy_drawn_val.append(int(card[1]["value"]))
            elif card[1]["value"] in ["KING", "QUEEN", "JACK"]:
                if ["Revolucionário","Cartas de caras valem metade do seu valor normal"] in player_jokers:
                    enemy_drawn_val.append(5)
                else:
                    enemy_drawn_val.append(10)
            elif card[1]["value"] == "ACE":
                if sum(enemy_drawn_val) + 11 <= blackjack:
                    enemy_drawn_val.append(11)
                else:
                    enemy_drawn_val.append(1)
        
        else:
            r = requests.get(f"https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=1")

            card = r.json()["cards"]
            player_drawn_cards.append(card[0])

        if card[0]["value"].isdigit():
            player_drawn_val.append(int(card[0]["value"]))

        elif card[0]["value"] in ["KING", "QUEEN", "JACK"]:
            if ["Revolucionário","Cartas de caras valem metade do seu valor normal"] in player_jokers:
                player_drawn_val.append(5)
            else:
                player_drawn_val.append(10)

        elif card[0]["value"] == "ACE":
            return {"message": "Ace drawn, choose to count as 1 or 11.", "state": "ace_drawn"}
        
        return game_check(False, card[0], enemy_drawn_cards[-1])
    
    else:
        if round > 1:
            return {"message": "Start a new round to play again."}
        return {"message": "Game not started. Please start a new game."}
    
@app.get("/set_ace_value/{value}")
async def set_ace_value(value: int):
    global player_drawn_val, player_drawn_cards, enemy_drawn_val, enemy_drawn_cards, start, blackjack
    if start:
        if value not in [1, 11]:
            return {"message": "Invalid value for Ace. Choose 1 or 11."}
        
        if len(player_drawn_cards) != len(player_drawn_val):
            player_drawn_val.append(value)
            return game_check(False, player_drawn_cards[-1], enemy_drawn_cards[-1])
        else:
            return {"message": "No ACE drawn to set value."}
    else:
        return {"message": "Game not started. Please start a new game."}
    
@app.get("/stop")
async def stop_game():
    global start, player_drawn_val, player_drawn_cards, enemy_drawn_val, enemy_drawn_cards, blackjack
    if start:
        return game_check(True)
    else:
        return {"message": "Game is not currently running."}
    
@app.get("/discard_card")
async def discard_card():
    global player_drawn_cards, player_drawn_val, descartado, player_jokers
    if not player_drawn_cards:
        return {"message": "No cards to discard."}
    
    if descartado:
        return {"message": "You can only discard one card per round."}
    
    if "Café com leite" not in player_jokers:
        return {"message": "You don't have the joker to discard."}
    
    discarded_card = player_drawn_cards.pop()
    discarded_value = player_drawn_val.pop()
    descartado = True
    
    return {
        "message": f"Discarded card: {discarded_card['value']} of {discarded_card['suit']}",
        "discarded_value": discarded_value,
        "remaining_cards": len(player_drawn_cards)
    }

@app.get("/enemy_cards")
async def enemy_cards():
    global enemy_drawn_cards, enemy_drawn_val
    if not enemy_drawn_cards:
        return {"message": "No enemy cards drawn yet."}
    
    return {
        "enemy_cards": enemy_drawn_cards,
        "enemy_values": enemy_drawn_val,
        "total_value": sum(enemy_drawn_val)
    }

@app.get("/player_cards")
async def player_cards():
    global player_drawn_cards, player_drawn_val
    if not player_drawn_cards:
        return {"message": "No player cards drawn yet."}
    
    return {
        "player_cards": player_drawn_cards,
        "player_values": player_drawn_val,
        "total_value": sum(player_drawn_val)
    }

@app.get("/jokers")
async def get_jokers():
    global player_jokers
    return {
        "jokers": player_jokers,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)