
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
	AIR,
	FLUX,
	UNBREAKABLE,
	PLAYER,
	STONE, FALLING_STONE,
	BOX, FALLING_BOX,
	KEY1, LOCK1,
	KEY2, LOCK2
}

interface FallingState {
	isFalling(): boolean
	moveHorizontal(map: Map, player: Player, tile: Tile, dx: number): void;
	drop(map: Map, tile: Tile, x: number, y:number): void;
}

class Falling implements FallingState {
	isFalling(): boolean {
		return true;
	}
	moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) { }
	drop(map: Map, tile: Tile, x: number, y: number): void {
		map.drop(tile, x, y);
	}
}

class Resting implements FallingState {
	isFalling(): boolean {
		return false;
	}
	moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {
		player.pushHorizontal(map, tile, dx);
	}
	drop(map: Map, tile: Tile, x: number, y: number): void { }
}

class FallStrategy {
	constructor(private falling: FallingState) {
	}
	update(map: Map, tile: Tile, x: number, y: number) {
		this.falling = map.getBlockOnTopState(x,y);
		this.falling.drop(map, tile, x, y);
	}
	moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {
		this.falling.moveHorizontal(map, player, tile, dx);
	}
}

interface RemoveStrategy {
	check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
	check(tile: Tile) {
		return tile.isLock1();
	}
}

class RemoveLock2 implements RemoveStrategy {
	check(tile: Tile) {
		return tile.isLock2();
	}
}

class KeyConfiguration {
	constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) { }
	is1() {
		return this._1;
	}
	removeLock(map: Map) {
		map.remove(this.removeStrategy);
	}
	setColor(g: CanvasRenderingContext2D, x: number, y: number) {
		g.fillStyle = this.color;
		g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
}

interface Tile {
	isAir(): boolean;
	isLock1(): boolean;
	isLock2(): boolean;
	draw(g: CanvasRenderingContext2D, x: number, y: number): void;
	moveHorizontal(map: Map, player: Player, dx: number): void;
	moveVertical(map: Map, player: Player, dy: number): void;
	update(map: Map, x: number, y: number): void;
	getBlockOnTopState(): FallingState
}

class Air implements Tile {
	isAir() { return true; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) { }
	moveHorizontal(map: Map, player: Player, dx: number) {
		player.move(map, dx, 0);
	}
	moveVertical(map: Map, player: Player, dy: number) {
		player.move(map, 0, dy);
	}
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Falling();
	}
}

class Flux implements Tile {
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		g.fillStyle = "#ccffcc";
		g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
	moveHorizontal(map: Map, player: Player, dx: number) {
		player.move(map, dx, 0);
	}
	moveVertical(map: Map, player: Player, dy: number) {
		player.move(map, 0, dy);
	}
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class Unbreakable implements Tile {
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		g.fillStyle = "#999999";
		g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
	moveHorizontal(map: Map, player: Player, dx: number) { }
	moveVertical(map: Map, player: Player, dy: number) { }
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class PlayerTile implements Tile {
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) { }
	moveHorizontal(map: Map, player: Player, dx: number) { }
	moveVertical(map: Map, player: Player, dy: number) { }
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class Stone implements Tile {
	private fallStrategy: FallStrategy;
	constructor(falling: FallingState) {
		this.fallStrategy = new FallStrategy(falling);
	}
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		g.fillStyle = "#0000cc";
		g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
	moveHorizontal(map: Map, player: Player, dx: number) {
		this.fallStrategy.moveHorizontal(map, player, this, dx);
	}
	moveVertical(map: Map, player: Player, dy: number) { }
	canFall(): boolean {
		return true;
	}
	update(map: Map, x: number, y: number): void {
		this.fallStrategy.update(map, this, x, y);
	}
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class Box implements Tile {
	private fallStrategy: FallStrategy;
	constructor(falling: FallingState) {
		this.fallStrategy = new FallStrategy(falling);
	}
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		g.fillStyle = "#8b4513";
		g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
	moveHorizontal(map: Map, player: Player, dx: number) {
		this.fallStrategy.moveHorizontal(map, player, this, dx);
	}
	moveVertical(map: Map, player: Player, dy: number) { }
	canFall(): boolean {
		return true;
	}
	update(map: Map, x: number, y: number): void {
		this.fallStrategy.update(map, this, x, y);
	}
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class GameKey implements Tile {
	constructor(private keyConf: KeyConfiguration) {
	}
	isAir() { return false; }
	isLock1() { return false; }
	isLock2() { return false; }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		this.keyConf.setColor(g, x, y);
	}
	moveHorizontal(map: Map, player: Player, dx: number) {
		this.keyConf.removeLock(map);
		player.move(map, dx, 0);
	}
	moveVertical(map: Map, player: Player, dy: number) {
		this.keyConf.removeLock(map);
		player.move(map, 0, dy);
	}
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

class GameLock implements Tile {
	constructor(private keyConf: KeyConfiguration) {
	}
	isAir() { return false; }
	isLock1() { return this.keyConf.is1(); }
	isLock2() { return !this.keyConf.is1(); }
	draw(g: CanvasRenderingContext2D, x: number, y: number) {
		this.keyConf.setColor(g, x, y);
	}
	moveHorizontal(map: Map, player: Player, dx: number) { }
	moveVertical(map: Map, player: Player, dy: number) { }
	canFall(): boolean {
		return false;
	}
	update(map: Map, x: number, y: number): void { }
	getBlockOnTopState(): FallingState {
		return new Resting();
	}
}

interface Input {
	handle(map: Map, player: Player): void;
}

class Right implements Input {
	handle(map: Map, player: Player) {
		player.moveHorizontal(map, 1);
	}
}

class Left implements Input {
	handle(map: Map, player: Player) {
		player.moveHorizontal(map, -1);
	}
}

class Up implements Input {
	handle(map: Map, player: Player) {
		player.moveVertical(map, -1);
	}
}

class Down implements Input {
	handle(map: Map, player: Player) {
		player.moveVertical(map, 1);
	}
}

class Player {
	private x = 1;
	private y = 1;
	draw(g: CanvasRenderingContext2D) {
		g.fillStyle = "#ff0000";
		g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
	pushHorizontal(map: Map, tile: Tile, dx: number){
		map.pushHorizontal(this, tile, this.x, this.y, dx);
	}
	moveToTile(map: Map, newx: number, newy: number) {
		map.movePlayer(this.x, this.y, newx, newy);
		this.x = newx;
		this.y = newy;
	}
	move(map: Map, dx: number, dy:number){
		this.moveToTile(map, this.x + dx, this.y + dy);
	}
	moveHorizontal(map: Map, dx: number){
		map.moveHorizontal(this, this.x, this.y, dx);
	}
	moveVertical(map: Map, dy: number){
		map.moveVertical(this, this.x, this.y, dy);
	}
}

class Map {
	private map: Tile[][];
	constructor() {
		this.map = new Array(rawMap.length);
		for (let y = 0; y < rawMap.length; y++) {
			this.map[y] = new Array(rawMap[y].length);
			for (let x = 0; x < rawMap[y].length; x++) {
				this.map[y][x] = transformTile(rawMap[y][x]);
			}
		}
	}
	update() {
		for (let y = this.map.length - 1; y >= 0; y--) {
			for (let x = 0; x < this.map[y].length; x++) {
				this.map[y][x].update(this, x, y);
			}
		}
	}
	draw(g: CanvasRenderingContext2D) {
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[y].length; x++) {
				this.map[y][x].draw(g, x, y);
			}
		}
	}
	drop(tile: Tile, x: number, y: number) {
		this.map[y + 1][x] = tile;
		this.map[y][x] = new Air();
	}
	getBlockOnTopState(x: number, y: number){
		return this.map[y + 1][x].getBlockOnTopState();
	}
	moveHorizontal(player: Player, x: number, y: number, dx: number){
		this.map[y][x + dx].moveHorizontal(this, player, dx);
	}
	moveVertical(player: Player, x: number, y: number, dy: number) {
		this.map[y + dy][x].moveVertical(this, player, dy);
	}
	isAir(x: number, y: number){
		return this.map[y][x].isAir()
	}
	movePlayer(x: number, y: number, newx: number, newy: number) {
		this.map[y][x] = new Air();
		this.map[newy][newx] = new PlayerTile();
	}
	remove(shouldRemove: RemoveStrategy) {
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[y].length; x++) {
				if (shouldRemove.check(this.map[y][x])) {
					this.map[y][x] = new Air();
				}
			}
		}
	}
	pushHorizontal(player: Player, tile: Tile, x: number, y: number, dx: number){
		if (this.isAir(x + dx + dx, y)
			&& !this.isAir(x + dx, y + 1)) {
				this.map[y][x + dx + dx] = tile;
				player.moveToTile(this, x + dx, y);
		}
	}
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BlUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

let player = new Player();
let map = new Map();

let rawMap: RawTile[][] = [
	[2, 2, 2, 2, 2, 2, 2, 2],
	[2, 3, 0, 1, 1, 2, 0, 2],
	[2, 4, 2, 6, 1, 2, 0, 2],
	[2, 8, 4, 1, 1, 2, 0, 2],
	[2, 4, 1, 1, 1, 9, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 2],
];
function assertExhausted(x: never): never {
	throw new Error("Unexpected object: " + x);
}
function transformTile(tile: RawTile) {
	switch (tile) {
		case RawTile.AIR: return new Air();
		case RawTile.PLAYER: return new PlayerTile();
		case RawTile.UNBREAKABLE: return new Unbreakable();
		case RawTile.STONE: return new Stone(new Resting());
		case RawTile.FALLING_STONE: return new Stone(new Falling());
		case RawTile.BOX: return new Box(new Resting());
		case RawTile.FALLING_BOX: return new Box(new Falling());
		case RawTile.FLUX: return new Flux();
		case RawTile.KEY1: return new GameKey(YELLOW_KEY);
		case RawTile.LOCK1: return new GameLock(YELLOW_KEY);
		case RawTile.KEY2: return new GameKey(YELLOW_KEY);
		case RawTile.LOCK2: return new GameLock(YELLOW_KEY);
		default: assertExhausted(tile);
	}
}

let inputs: Input[] = [];

function update(map: Map) {
	handleInputs(map);
	map.update();
}

function handleInputs(map: Map) {
	while (inputs.length > 0) {
		let input = inputs.pop();
		input.handle(map, player);
	}
}

function createGraphics() {
	let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
	let g = canvas.getContext("2d");
	g.clearRect(0, 0, canvas.width, canvas.height);
	return g;
}

function draw(map: Map) {
	let g = createGraphics();
	map.draw(g);
	player.draw(g);
}

function gameLoop(map: Map) {
	let before = Date.now();
	update(map);
	draw(map);
	let after = Date.now();
	let frameTime = after - before;
	let sleep = SLEEP - frameTime;
	setTimeout(() => gameLoop(map), sleep);
}

window.onload = () => {
	gameLoop(map);
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
	if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
	else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
	else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
	else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

