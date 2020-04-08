//% color=#b8849b icon="\uf0ac"
//% groups='["Creation", "Connections", "Overworld Grid"]'
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

    //
    // Creation
    //

    /**
     * Creates a tilemap that can be connected to other tilemaps through the overworld.
     */
    //% blockId=create_overworld_map
    //% block="create tilemap $tilemap"
    //% tilemap.fieldEditor="tilemap"
    //% tilemap.fieldOptions.decompileArgumentAsString="true"
    //% tilemap.fieldOptions.filter="tile"
    //% group="Creation" weight=50 blockGap=8
    export function createMap(tilemap: tiles.TileMapData): WorldMap {
        return new WorldMap(tilemap);
    }

    /**
     * Sets the current overworld tilemap.
     */
    //% block="load tilemap $map"
    //% map.shadow=create_overworld_map
    //% group="Creation" weight=40 blockGap=8
    export function loadMap(map: WorldMap) {
        const loaded = getLoadedMap();

        tilemap.destorySpritesOfKind(SpriteKind._TileSprite)

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
     * Returns the loaded overworld tilemap.
     */
    //% block="loaded tilemap"
    //% group="Creation" weight=30
    export function getLoadedMap(): WorldMap {
        return OverWorldState.getInstance().loadedMap
    }

    /**
     * Runs code when an overworld tilemap is loaded.
     */
    //% block="on tilemap loaded $tilemap"
    //% draggableParameters="reporter"
    //% group="Creation" weight=20 blockGap=8
    export function onMapLoaded(cb: (tilemap: WorldMap) => void) {
        control.onEvent(OVERWORLD_MAP_ID, MAP_LOADED_EVENT, function () {
            cb(getLoadedMap());
        });
    }

    /**
     * Runs code when an overworld tilemap is unloaded.
     */
    //% block="on tilemap unloaded $tilemap"
    //% draggableParameters="reporter"
    //% group="Creation" weight=10 blockGap=8
    export function onMapUnloaded(cb: (tilemap: WorldMap) => void) {
        OverWorldState.getInstance().addUnloadListener(cb);
    }

    //
    // Connections
    //

    function connectMapByIdCore(sourceMap: WorldMap, destination: WorldMap, connectionID: number) {
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
     * Connects the source tilemap to a destination tilemap with a connection ID. 
     * Connections are stored on the source tilemap and IDs can be reused between
     * different source tilemaps.
     */
    //% block="connect $sourceTilemap to $destination with ID $connectionID"
    //% sourceTilemap.shadow=variables_get
    //% sourceTilemap.defl=sourceTilemap
    //% destination.shadow=create_overworld_map
    //% group="Connections" weight=20 blockGap=8
    export function connectMapById(sourceTilemap: WorldMap, destination: WorldMap, connectionID: number) {
        connectMapByIdCore(sourceTilemap, destination, connectionID);
        connectMapByIdCore(destination, sourceTilemap, connectionID);
    }

    /**
     * Loads the overworld tilemap connected to the loaded source tilemap by the
     * given connection ID.
     */
    //% block="load destination tilemap from connection ID $connectionID"
    //% group="Connections" weight=30 blockGap=8
    export function loadConnectedMap(connectionID: number) {
        loadMap(getConnectedMap(getLoadedMap(), connectionID));
    }


    /**
     * Gets the destination tilemap connected to the source tilemap by the given connection ID.
     */
    //% block="get tilemap connected to $sourceTilemap by ID $connectionID"
    //% sourceTilemap.shadow=variables_get
    //% sourceTilemap.defl=sourceTilemap
    //% group="Connections" weight=10 blockGap=8
    export function getConnectedMap(sourceTilemap: WorldMap, connectionID: number): WorldMap {
        if (!sourceTilemap) return null;

        for (const connection of sourceTilemap.connections) {
            if (connection.id === connectionID) return connection.map;
        }

        return null;
    }

    //
    // Overworld Grid
    //

    /**
     * Assign the tilemap to the specified column and row in the overworld grid.
     */
    //% block="set tilemap at overworld col $worldColumn row $worldRow to $map"
    //% map.shadow=create_overworld_map
    //% group="Overworld Grid" weight=60 blockGap=8
    export function setWorldLocationToMap(worldColumn: number, worldRow: number, map: WorldMap) {
        OverWorldState.getInstance().setMapAtLocation(worldColumn, worldRow, map);
    }

    /**
     * Loads the tilemap at a given column and row from the
     * overworld grid.
     */
    //% block="load tilemap at overworld col $worldColumn row $worldRow"
    //% group="Overworld Grid" weight=50 blockGap=8
    export function loadMapAt(worldColumn: number, worldRow: number) {
        loadMap(getMapAtWorldLocation(worldColumn, worldRow));
        OverWorldState.getInstance().loadedColumn = worldColumn;
        OverWorldState.getInstance().loadedRow = worldRow;
    }

    /**
     * Get the tilemap at the given column and row from the overworld grid.
     */
    //% block="get tilemap at overworld col $worldColumn row $worldRow"
    //% group="Overworld Grid" weight=30 blockGap=8
    export function getMapAtWorldLocation(worldColumn: number, worldRow: number): WorldMap {
        return OverWorldState.getInstance().getMapAtLocation(worldColumn, worldRow);
    }

    /**
     * Loads the tilemap adjacent to the loaded tilemap in the
     * given direction from the overworld.
     */
    //% block="load tilemap in direction $direction"
    //% direction.shadow=direction_editor
    //% group="Overworld Grid" weight=40
    export function loadMapInDirection(direction: number) {
        loadMapAt(
            tilemap.columnInDirection(loadedWorldColumn(), direction),
            tilemap.rowInDirection(loadedWorldRow(), direction)
        );
    }

    /**
     * Get the column of the loaded tilemap in the overworld.
     */
    //% block="loaded overworld column"
    //% group="Overworld Grid" weight=20 blockGap=8
    export function loadedWorldColumn() {
        return OverWorldState.getInstance().loadedColumn;
    }

    /**
     * Get the row of the loaded tilemap in the overworld.
     */
    //% block="loaded overworld row"
    //% group="Overworld Grid" weight=10 blockGap=8
    export function loadedWorldRow() {
        return OverWorldState.getInstance().loadedRow;
    }
} 