namespace SpriteKind {
    export const Decoration = SpriteKind.create()
} 

//% color=#84b89f
namespace overworld {
    /**
     * Returns the number of columns in the currently loaded tilemap.
     */
    //% block="tilemap columns"
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
    export function tilemapRows(): number {
        const tm = game.currentScene().tileMap;

        if (!tm) return 0;
        return tm.areaHeight() >> tm.scale;
    }

    /**
     * Returns the width of tiles in the loaded tilemap.
     */
    //% block="tile width"
    export function tileWidth(): number {
        const tm = game.currentScene().tileMap;

        if (!tm) return 0;
        return 1 << tm.scale;
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
    export function replaceAllTiles(from: Image, to: Image) {
        forEachTileOfKind(from, function (col: number, row: number) {
            tiles.setTileAt(tiles.getTileLocation(col, row), to);
        });
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
    export function coverAllTiles(tileKind: Image, cover: Image) {
        forEachTileOfKind(tileKind, function (col: number, row: number) {
            coverTile(col, row, cover);
        });
    }

    /**
     * Cover the tile in the loaded tilemap at a given location with
     * another tile. Tiles are covered with sprites of kind Decoration.
     */
    //% block="cover tile at col $col row $row with $cover"
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    export function coverTile(col: number, row: number, cover: Image) {
        const coverSprite = sprites.create(cover, SpriteKind.Decoration);
        coverSprite.setFlag(SpriteFlag.Ghost, true);
        tiles.placeOnTile(coverSprite, tiles.getTileLocation(col, row));
    }

    /**
     * Executes a piece of code for every tile of a given kind in the loaded
     * tilemap.
     */
    //% block="for each $tileKind tile at $col $row"
    //% draggableParameters="reporter"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
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
     * Determines if the tile in the loaded tilemap at the given location
     * is of a particular kind.
     */
    //% block="tile at col $col row $row is $tile"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    export function tileIs(col: number, row: number, tile: Image): boolean {
        return tile.equals(tiles.getTileAt(col, row));
    }
    
    /**
     * On each tile of a given kind, create a sprite of a given SpriteKind.
     */
    //% block="on each $tileKind tile create a sprite of kind $spriteKind"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% kind.shadow=spritekind
    export function createSpritesOnTiles(tileKind: Image, spriteKind: number) {
        forEachTileOfKind(tileKind, (col, row) => {
            tiles.placeOnTile(sprites.create(img`.`), tiles.getTileLocation(col, row));
        });
    }

    /**
     * Center the camera on a given tile location.
     */
    //% block="center camera on col $col row $row"
    export function centerCameraOnTile(col: number, row: number) {
        const loc = tiles.getTileLocation(col, row);
        scene.centerCameraAt(loc.x, loc.y);
    }
}