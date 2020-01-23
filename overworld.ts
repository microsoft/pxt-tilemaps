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

//% color=#b8849b icon="\uf0ac"
//% groups='["Creation", "Connections", "World Grid"]'
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
     * Creates an overworld tilemap.
     */
    //% blockId=create_overworld_map
    //% block="create map $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% group="Creation" weight=50 blockGap=8
    export function createMap(tilemap: tiles.TileMapData): WorldMap {
        return new WorldMap(tilemap);
    }

    /**
     * Loads an overworld tilemap.
     */
    //% block="load map $map"
    //% map.shadow=create_overworld_map
    //% group="Creation" weight=40 blockGap=8
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
     * Returns the loaded overworld map.
     */
    //% block="loaded map"
    //% group="Creation" weight=30
    export function getLoadedMap(): WorldMap {
        return OverWorldState.getInstance().loadedMap
    }

    /**
     * Executes a piece of code when an overworld tilemap is loaded.
     */
    //% block="on map loaded $map"
    //% draggableParameters="reporter"
    //% group="Creation" weight=20 blockGap=8
    export function onMapLoaded(cb: (map: WorldMap) => void) {
        control.onEvent(OVERWORLD_MAP_ID, MAP_LOADED_EVENT, function () {
            cb(getLoadedMap());
        });
    }

    /**
     * Executes a piece of code when an overworld tilemap is unloaded.
     */
    //% block="on map unloaded $map"
    //% draggableParameters="reporter"
    //% group="Creation" weight=10 blockGap=8
    export function onMapUnloaded(cb: (map: WorldMap) => void) {
        OverWorldState.getInstance().addUnloadListener(cb);
    }

    /**
     * Loads the overworld tilemap connected to the loaded map by the
     * given id.
     */
    //% block="load map connected by ID $connectionID"
    //% group="Connections" weight=30 blockGap=8
    export function loadConnectedMap(connectionID: number) {
        loadMap(getConnectedMap(getLoadedMap(), connectionID));
    }

    /**
     * Connects the source map to a destination map by the given ID.
     */
    //% block="connect $sourceMap to $destination with ID $connectionID"
    //% sourceMap.shadow=variables_get
    //% sourceMap.defl=sourceMap
    //% destination.shadow=create_overworld_map
    //% group="Connections" weight=20 blockGap=8
    export function connectMapById(sourceMap: WorldMap, destination: WorldMap, connectionID: number) {
        if (!sourceMap) return;

        for (const connection of sourceMap.connections) {
            if (connection.id === connectionID) {
                connection.map = destination;
                return;
            }
        }
        sourceMap.connections.push(new WorldMapConnection(connectionID, destination));
    }

    /**
     * Gets the destination map connected to the source map by the given ID.
     */
    //% block="get map connected to $source by ID $connectionID"
    //% source.shadow=create_overworld_map
    //% group="Connections" weight=10 blockGap=8
    export function getConnectedMap(source: WorldMap, connectionID: number): WorldMap {
        if (!source) return null;

        for (const connection of source.connections) {
            if (connection.id === connectionID) return connection.map;
        }

        return null;
    }

    /**
     * Set the map at the specified column and row in the overworld grid.
     */
    //% block="set map at world col $worldColumn row $worldRow to $map"
    //% map.shadow=create_overworld_map
    //% group="World Grid" weight=60 blockGap=8
    export function setWorldLocationToMap(worldColumn: number, worldRow: number, map: WorldMap) {
        OverWorldState.getInstance().setMapAtLocation(worldColumn, worldRow, map);
    }

    /**
     * Loads an overworld tilemap at a given column and row in the
     * overworld grid.
     */
    //% block="load map at world col $worldColumn row $worldRow"
    //% group="World Grid" weight=50 blockGap=8
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
    //% direction.shadow=direction_editor
    //% group="World Grid" weight=40
    export function loadMapInDirection(direction: number) {
        loadMapAt(
            tilemap.columnInDirection(loadedWorldColumn(), direction),
            tilemap.rowInDirection(loadedWorldRow(), direction)
        );
    }

    /**
     * Get the map at the specified column and row in the overworld grid.
     */
    //% block="get map at world col $worldColumn row $worldRow"
    //% group="World Grid" weight=30 blockGap=8
    export function getMapAtWorldLocation(worldColumn: number, worldRow: number): WorldMap {
        return OverWorldState.getInstance().getMapAtLocation(worldColumn, worldRow);
    }

    /**
     * Get the world column of the loaded overworld map.
     */
    //% block="loaded world column"
    //% group="World Grid" weight=20 blockGap=8
    export function loadedWorldColumn() {
        return OverWorldState.getInstance().loadedColumn;
    }

    /**
     * Get the world row of the loaded overworld map.
     */
    //% block="loaded world row"
    //% group="World Grid" weight=10 blockGap=8
    export function loadedWorldRow() {
        return OverWorldState.getInstance().loadedRow;
    }
} 