namespace SpriteKind {
    export const Decoration = SpriteKind.create()
} 

//% color=#84b89f icon="\uf279"
//% groups='["Operations","Values","Conversions","Directions"]'
namespace tilemap {
    /**
     * Determines if the tile in the loaded tilemap at the given location
     * is of a particular kind.
     */
    //% block="tile at col $col row $row is $tile"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% group="Operations" weight=80
    export function tileIs(col: number, row: number, tile: Image): boolean {
        return tile.equals(tiles.getTileAt(col, row));
    }

    /**
     * Executes a piece of code for every tile of a given kind in the loaded
     * tilemap.
     */
    //% block="for each $tileKind tile at $col $row"
    //% draggableParameters="reporter"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% group="Operations" weight=70 blockGap=8
    export function forEachTileOfKind(tileKind: Image, cb: (col: number, row: number) => void) {
        const height = tilemapRows();
        const width = tilemapColumns();

        for (let c = 0; c < width; c++) {
            for (let r = 0; r < height; r++) {
                if (tileIs(c, r, tileKind)) cb(c, r);
            }
        }
    }

    /**
     * Executes a piece of code for every tile in the loaded tilemap
     */
    //% block="for each tile at $col $row with image $tile"
    //% draggableParameters="reporter"
    //% group="Operations" weight=60
    export function forEachTileOfMap(cb: (col: number, row: number, tile: Image) => void) {
        const height = tilemapRows();
        const width = tilemapColumns();

        for (let c = 0; c < width; c++) {
            for (let r = 0; r < height; r++) {
                cb(c, r, tiles.getTileAt(c, r));
            }
        }
    }

    /**
     * Cover the tile in the loaded tilemap at a given location with
     * another tile. Tiles are covered with sprites of kind Decoration.
     */
    //% block="cover tile at col $col row $row with $cover"
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    //% group="Operations" weight=50 blockGap=8
    export function coverTile(col: number, row: number, cover: Image) {
        const coverSprite = sprites.create(cover, SpriteKind.Decoration);
        coverSprite.setFlag(SpriteFlag.Ghost, true);
        coverSprite.z = -1;
        tiles.placeOnTile(coverSprite, tiles.getTileLocation(col, row));
    }

    /**
     * Cover all tiles of a given kind in the loaded tilemap with
     * another tile. Tiles are covered with sprites of kind Decoration.
     */
    //% block="cover all $tileKind tiles with $cover"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    //% group="Operations" weight=40 blockGap=8
    export function coverAllTiles(tileKind: Image, cover: Image) {
        forEachTileOfKind(tileKind, function (col: number, row: number) {
            coverTile(col, row, cover);
        });
    }
    
    /**
     * On each tile of a given kind, create a sprite of a given SpriteKind.
     */
    //% block="on each $tileKind tile create a sprite of kind $spriteKind"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% spriteKind.shadow=spritekind
    //% group="Operations" weight=30 blockGap=8
    export function createSpritesOnTiles(tileKind: Image, spriteKind: number) {
        forEachTileOfKind(tileKind, (col, row) => {
            tiles.placeOnTile(sprites.create(img`.`), tiles.getTileLocation(col, row));
        });
    }

    /**
     * Replace all tiles of a given kind in the loaded tilemap with
     * another tile.
     */
    //% block="replace all $from tiles with $to"
    //% from.shadow=tileset_tile_picker
    //% from.decompileIndirectFixedInstances=true
    //% to.shadow=tileset_tile_picker
    //% to.decompileIndirectFixedInstances=true
    //% group="Operations" weight=20
    export function replaceAllTiles(from: Image, to: Image) {
        forEachTileOfKind(from, function (col: number, row: number) {
            tiles.setTileAt(tiles.getTileLocation(col, row), to);
        });
    }

    /**
     * Center the camera on a given tile location.
     */
    //% block="center camera on col $col row $row"
    //% group="Operations" weight=10 blockGap=8
    export function centerCameraOnTile(col: number, row: number) {
        const loc = tiles.getTileLocation(col, row);
        scene.centerCameraAt(loc.x, loc.y);
    }

    /**
     * Returns the width of tiles in the loaded tilemap.
     */
    //% block="tile width"
    //% group="Values" weight=30
    export function tileWidth(): number {
        const tm = game.currentScene().tileMap;

        if (!tm) return 0;
        return 1 << tm.scale;
    }

    /**
     * Returns the number of columns in the currently loaded tilemap.
     */
    //% block="tilemap columns"
    //% group="Values" weight=20 blockGap=8
    export function tilemapColumns(): number {
        const tm = game.currentScene().tileMap;

        if (!tm) return 0;
        const height = tm.areaHeight() >> tm.scale;
        return tm.areaWidth() >> tm.scale;
    }

    /**
     * Returns the number of rows in the currently loaded tilemap.
     */
    //% block="tilemap rows"
    //% group="Values" weight=10 blockGap=8
    export function tilemapRows(): number {
        const tm = game.currentScene().tileMap;

        if (!tm) return 0;
        return tm.areaHeight() >> tm.scale;
    }

    /**
     * Converts a screen coordinate to a tilemap coordinate.
     */
    //% block="screen coordinate $value to tile coordinate"
    //% group="Conversions" weight=30 blockGap=8
    export function screenCoordinateToTile(value: number) {
        const tm = game.currentScene().tileMap;
        if (!tm) return value >> 4;
        return value >> tm.scale;
    }

    /**
     * Converts a tilemap coordinate to a screen coordinate.
     */
    //% block="tile coordinate $value to screen coordinate"
    //% group="Conversions" weight=20 blockGap=8
    export function tileCoordinateToScreen(value: number) {
        const tm = game.currentScene().tileMap;
        if (!tm) return value << 4;
        return value << tm.scale;
    }

    /**
     * Converts a tilemap coordinate to a screen coordinate and
     * adds half a tile width.
     */
    //% block="centered tile coordinate $value to screen coordinate"
    //% group="Conversions" weight=10 blockGap=8
    export function centeredTileCoordinateToScreen(value: number) {
        const tm = game.currentScene().tileMap;
        if (!tm) return (value << 4) + 8;
        return (value << tm.scale) + (1 << (tm.scale - 1));
    }

    /**
     * Gets the neighboring column in the given direction.
     */
    //% block="column $direction of $column"
    //% direction.shadow=direction_editor
    //% group="Directions" weight=40 blockGap=8
    export function columnInDirection(column: number, direction: number) {
        if (direction === WorldDirection.East) return column + 1;
        else if (direction === WorldDirection.West) return column - 1;
        else return column;
    }

    /**
     * Gets the neighboring row in the given direction.
     */
    //% block="row $direction of $row"
    //% direction.shadow=direction_editor
    //% group="Directions" weight=30
    export function rowInDirection(row: number, direction: number) {
        if (direction === WorldDirection.North) return row - 1;
        else if (direction === WorldDirection.South) return row + 1;
        else return row;
    }

    /**
     * Executes a piece of code for each cardinal direction starting at North
     * and going clockwise.
     */
    //% block="for each direction $direction"
    //% draggableParameters="reporter"
    //% group="Directions" weight=20
    export function forEachDirection(cb: (direction: WorldDirection) => void) {
        cb(WorldDirection.North);
        cb(WorldDirection.East);
        cb(WorldDirection.South);
        cb(WorldDirection.West);
    }

    //% blockId=direction_editor shim=TD_ID
    //% block="$direction"
    //% group="Directions" weight=10
    export function _directionEditor(direction: WorldDirection): WorldDirection {
        return direction;
    }
}