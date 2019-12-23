enum WorldDirection {
    //% block=North
    North,
    //% block=East
    East,
    //% block=South
    South,
    //% block=West
    West
}

//% color=#b8849b
namespace overworld {
    export const OVERWORLD_MAP_ID = 7686; 
    export const MAP_LOADED_EVENT = 7687;

    export class WorldMap {
        tilemap: tiles.TileMapData;
        connections: WorldMapConnection[];

        constructor(tilemap: tiles.TileMapData) {
            this.tilemap = tilemap;
            this.connections = [];
        }
    }

    export class WorldMapConnection {
        constructor(public readonly id: number, public map: WorldMap) {
        }
    }

    class OverWorldState {
        protected static instance: OverWorldState;

        static getInstance(): OverWorldState {
            if (!OverWorldState.instance) OverWorldState.instance = new OverWorldState();
            return OverWorldState.instance;
        }

        static callUnloadListeners() {
            const state = OverWorldState.getInstance();

            for (const listener of state.getUnloadListeners())
                listener(getLoadedMap());
        }

        public loadedColumn: number;
        public loadedRow: number;
        public loadedMap: WorldMap;
        public locations: WorldMap[][];

        protected listeners: ((map: WorldMap) => void)[];

        protected constructor() {
            this.listeners = [];
            this.locations = [];
            this.loadedColumn = -1;
            this.loadedRow = -1;
        }

        getUnloadListeners() {
            return this.listeners;
        }

        addUnloadListener(cb: (map: WorldMap) => void) {
            this.listeners.push(cb);
        }

        setMapAtLocation(worldColumn: number, worldRow: number, map: WorldMap) {
            if (!this.locations[worldColumn]) this.locations[worldColumn] = [];

            this.locations[worldColumn][worldRow] = map;
        }

        getMapAtLocation(worldColumn: number, worldRow: number) {
            if (worldColumn < 0 || worldRow < 0 || !this.locations[worldColumn]) return undefined;
            return this.locations[worldColumn][worldRow];
        }
    }

    /**
     * Executes a piece of code when an overworld tilemap is loaded.
     */
    //% block="on map loaded $map"
    export function onMapLoaded(cb: (map: WorldMap) => void) {
        control.onEvent(OVERWORLD_MAP_ID, MAP_LOADED_EVENT, function () {
            cb(getLoadedMap());
        });
    }

    /**
     * Executes a piece of code when an overworld tilemap is unloaded.
     */
    //% block="on map unloaded $map"
    export function onMapUnloaded(cb: (map: WorldMap) => void) {
        OverWorldState.getInstance().addUnloadListener(cb);
    }

    /**
     * Creates an overworld tilemap.
     */
    //% block="create map $tilemap"
    export function createMap(tilemap: tiles.TileMapData): WorldMap {
        return new WorldMap(tilemap);
    }

    /**
     * Loads an overworld tilemap.
     */
    //% block="load map $map"
    export function loadMap(map: WorldMap) {
        const loaded = getLoadedMap();

        if (loaded) {
            OverWorldState.callUnloadListeners();
        }

        OverWorldState.getInstance().loadedMap = map;

        if (map) {
            scene.setTileMapLevel(map.tilemap);
            control.raiseEvent(OVERWORLD_MAP_ID, MAP_LOADED_EVENT)
        }
        else {
            game.currentScene().tileMap = null;
        }
    }

    /**
     * Loads an overworld tilemap at a given column and row in the
     * overworld grid.
     */
    //% block="load map at world col $worldColumn row $worldRow"
    export function loadMapAt(worldColumn: number, worldRow: number) {
        loadMap(getMapAtWorldLocation(worldColumn, worldRow));
        OverWorldState.getInstance().loadedColumn = worldColumn;
        OverWorldState.getInstance().loadedRow = worldRow;
    }

    /**
     * Loads the overworld tilemap adjacent to the loaded map in the
     * given direction.
     */
    //% block="load map in direction $direction"
    export function loadMapInDirection(direction: WorldDirection) {
        loadMapAt(
            tilemap.columnInDirection(loadedWorldColumn(), direction),
            tilemap.rowInDirection(loadedWorldRow(), direction)
        );
    }

    /**
     * Loads the overworld tilemap connected to the loaded map by the
     * given id.
     */
    //% block="load connected map $connectionID"
    export function loadConnectedMap(connectionID: number) {
        loadMap(getConnectedMap(getLoadedMap(), connectionID));
    }

    /**
     * Returns the loaded overworld map.
     */
    //% block="loaded map"
    export function getLoadedMap(): WorldMap {
        return getMapAtWorldLocation(loadedWorldColumn(), loadedWorldRow());
    }

    /**
     * Gets the destination map connected to the source map by the given ID.
     */
    //% block="get map connected to $source by $connectionID"
    export function getConnectedMap(source: WorldMap, connectionID: number): WorldMap {
        if (!source) return null;

        for (const connection of source.connections) {
            if (connection.id === connectionID) return connection.map;
        }

        return null;
    }

    /**
     * Connects the source map to a destination map by the given ID.
     */
    //% block="connect $source to $destination by $connectionID"
    export function connectMapById(source: WorldMap, destination: WorldMap, connectionID: number) {
        if (!source) return;
        
        for (const connection of source.connections) {
            if (connection.id === connectionID) {
                connection.map = destination;
                return;
            }
        }
        source.connections.push(new WorldMapConnection(connectionID, destination));
    }

    /**
     * Get the world column of the loaded overworld map.
     */
    //% block="loaded world column"
    export function loadedWorldColumn() {
        return OverWorldState.getInstance().loadedColumn;
    }

    /**
     * Get the world row of the loaded overworld map.
     */
    //% block="loaded world row"
    export function loadedWorldRow() {
        return OverWorldState.getInstance().loadedRow;
    }

    /**
     * Get the map at the specified column and row in the overworld grid.
     */
    //% block="get map at world col $worldColumn row $worldRow"
    export function getMapAtWorldLocation(worldColumn: number, worldRow: number): WorldMap {
        return OverWorldState.getInstance().getMapAtLocation(worldColumn, worldRow);
    }

    /**
     * Set the map at the specified column and row in the overworld grid.
     */
    //% block="set map at world col $worldColumn row $worldRow to $map"
    export function setWorldLocationToMap(worldColumn: number, worldRow: number, map: WorldMap) {
        OverWorldState.getInstance().setMapAtLocation(worldColumn, worldRow, map);
    }
} 