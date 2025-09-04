-- Put functions in this file to use them in several other scripts.
-- To get access to the functions, you need to put:
-- require "my_directory.my_file"
-- in any script using the functions.
-- test
local game = {}

game.cSdk = require("colyseus.sdk")
local client = game.cSdk.Client("ws://localhost:2567")

function game.start()
	client:join_or_create("my_room", {}, function(err, joined)
		if err then
			pprint(err)
			return
		end
		game.room = joined
		game.cb = game.cSdk.callbacks(game.room)

		game.cb:listen("player_count", function(c)
			gui.set_text(gui.get_node("player_count"), c .. " / 6")
			if c == 1 or c == 2 or c == 4 or c == 6 then
				gui.set_enabled(gui.get_node("enter"), true)
			else 
				gui.set_enabled(gui.get_node("enter"), false)
			end
		end)

		game.cb:on_remove("players", function(c)
			print(c)
		end)
	end)
end

function game.callbacks()
	game.cb:on_add("players", function(player, sessionId) 
		if player.id % 2 == 0 then
			factory.create("/characters#red_character", vmath.vector3(player.x, player.y, 0))
			game.gui_position = vmath.vector3(player.x, player.y + 30, 0)
		else
			factory.create("/characters#blue_character", vmath.vector3(player.x, player.y, 0))
			game.gui_position = vmath.vector3(player.x, player.y + 30, 0)
		end
	end)
end

return game