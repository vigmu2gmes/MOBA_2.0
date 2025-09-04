import { Room, Client } from "@colyseus/core";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("string") name: string;
  @type("number") hp: number = 20;
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") id: number = 0;
}

class MyRoomState extends Schema {
  @type({map: Player }) players = new MapSchema<Player>();
  @type("number") player_count = 0;
}

const spawn_positions = [ 
  { x: 0, y: 0 },
  { x: 200, y: 281 },
  { x: 755, y: 281 },
  { x: 100, y: 400 },
  { x: 850, y: 400 },
  { x: 100, y: 150 },
  { x: 850, y: 150 }, 
];

export class MyRoom extends Room<MyRoomState> {
  maxClients = 6;
  state = new MyRoomState();
  private match_counts = [ 2, 4, 6 ];
  
  

  onCreate (options: any) {
  this.state.player_count = this.clients.length;

  this.onMessage("move", (client, data) => {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.x = data.x;
      player.y = data.y; 
    }
  });

  this.onMessage("damage", (client, damage: number) => {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.hp -= damage.damage;
      console.log(player.hp);
      if (player.hp < 0) player.hp = 0;
      if (player.hp === 0) {
        console.log("DEATH");
      } 
    }
  });
  }

  onJoin (client: Client, options: any) {
  this.state.player_count = this.clients.length;
  console.log("Player joined. Total: ", this.state.player_count);

  this.state.players.set(client.sessionId, new Player().assign({ id: this.state.player_count, x: spawn_positions[this.state.player_count].x, y: spawn_positions[this.state.player_count].y }));
  }

  onLeave (client: Client, consented: boolean) {
  this.state.players.delete(client.sessionId);
  
  this.state.player_count = this.clients.length;
  console.log("Player left. Total: ", this.state.player_count);
  }

  onDispose() {
  }

}
