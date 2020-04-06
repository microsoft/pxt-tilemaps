// TODO:
// - different categories in Tilemap
// - replace "cover" with create cover sprite

namespace SpriteKind {
    export const TileSprite = SpriteKind.create()
}

//% color=#84b89f icon="\uf279"
//% groups='["Sprites","Tiles","Tilemap","Camera"]'
namespace tilemap {
    //
    // Sprites
    //

    /**
     * Gets the tile location of a sprite.
     */
    //% block="location of $s"
    //% s.shadow=variables_get
    //% s.defl=sprite
    //% group="Sprites" weight=90
    export function locationOfSprite(s: Sprite): tiles.Location {
        return tiles.getTileLocation(screenCoordinateToTile(s.x), screenCoordinateToTile(s.y));
    }

    //
    // Tiles
    //
    /**
     * Determines if the tile in the loaded tilemap at the given location
     * is of a particular kind.
     */
    //% block="tile at $location is $tile"
    //% location.shadow=mapgettile
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% group="Tiles" weight=80
    export function tileIs(location: tiles.Location, tile: Image): boolean {
        return tileIsCore(locationColumn(location), locationRow(location), tile);
    }

    /**
     * Determines if the tile in the loaded tilemap at the given location
     * is a wall.
     */
    //% block="tile at $location is wall"
    //% location.shadow=mapgettile
    //% group="Tiles" weight=79
    export function tileIsWall(location: tiles.Location): boolean {
        const tm = game.currentScene().tileMap;

        return tm ? tm.isObstacle(locationColumn(location), locationRow(location)) : false;
    }

    function tileIsCore(col: number, row: number, tile: Image): boolean {
        return tile.equals(tiles.getTileAt(col, row));
    }

    /**
     * Executes a piece of code for every tile of a given kind in the loaded
     * tilemap.
     */
    export function forEachTileOfKind(tileKind: Image, cb: (location: tiles.Location) => void) {
        // TODO: handlerStatement does not work right
        // block="for each $tileKind tile at $location"
        // draggableParameters="reporter" handlerStatement
        // tileKind.shadow=tileset_tile_picker
        // tileKind.decompileIndirectFixedInstances=true
        // group="Tiles" weight=70 blockGap=8
        const height = tilemapRows();
        const width = tilemapColumns();

        for (let c = 0; c < width; c++) {
            for (let r = 0; r < height; r++) {
                if (tileIsCore(c, r, tileKind)) cb(tiles.getTileLocation(c, r));
            }
        }
    }

    /**
     * Executes a piece of code for every tile in the loaded tilemap
     */
    export function forEachTileOfMap(cb: (location: tiles.Location, tile: Image) => void) {
        // TODO: handlerStatement does not work right
        // block="for each tile at $location with image $tile"
        // draggableParameters="reporter" handlerStatement
        // group="Tiles" weight=60
        const height = tilemapRows();
        const width = tilemapColumns();

        for (let c = 0; c < width; c++) {
            for (let r = 0; r < height; r++) {
                cb(tiles.getTileLocation(c, r), tiles.getTileAt(c, r));
            }
        }
    }

    // Sprites
    /**
     * Cover the tile in the loaded tilemap at a given location with
     * another tile that is a sprite of kind TileSprite.
     */
    //% block="new sprite from tile $cover at $location"
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    //% group="Sprites" weight=50 blockGap=8
    //% location.shadow=mapgettile
    //% blockSetVariable=myTileSprite
    export function createTileSprite(location: tiles.Location, cover: Image): Sprite {
        const coverSprite = sprites.create(cover, SpriteKind.TileSprite);
        coverSprite.setFlag(SpriteFlag.Ghost, true);
        coverSprite.z = -1;
        tiles.placeOnTile(coverSprite, location);
        return coverSprite
    }

    // Sprites
    /**
     * Cover the tile in the loaded tilemap at a given location with
     * another tile that is a sprite of kind TileSprite.
     */
    //% block="create sprite from tile $cover at $location"
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    //% group="Cover" weight=50 blockGap=8
    //% location.shadow=mapgettile
    export function createTileSpriteStmt(location: tiles.Location, cover: Image) {
        createTileSprite(location, cover);
    }

    // Sprites
    /**
     * Cover all tiles of a given kind in the loaded tilemap with
     * another tile that is a sprite of kind TileSprite.
     */
    //% block="on each $tileKind tile create a sprite from tile $cover"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% cover.shadow=tileset_tile_picker
    //% cover.decompileIndirectFixedInstances=true
    //% group="Cover" weight=40 blockGap=8
    export function coverAllTiles(tileKind: Image, cover: Image) {
        forEachTileOfKind(tileKind, loc => createTileSprite(loc, cover));
    }

    // Sprites
    /**
     * On each tile of a given kind, create a sprite of a given SpriteKind. 
     * Useful to use with the "on created [...]" sprite block.
     */
    //% block="on each $tileKind tile create a sprite of kind $spriteKind"
    //% tileKind.shadow=tileset_tile_picker
    //% tileKind.decompileIndirectFixedInstances=true
    //% spriteKind.shadow=spritekind
    //% group="Operations" weight=30 blockGap=8
    export function createSpritesOnTiles(tileKind: Image, spriteKind: number) {
        const scene = game.currentScene();

        const createdHandlers = scene.createdHandlers
            .filter(h => h.kind == spriteKind);

        forEachTileOfKind(tileKind, loc => {
            const sprite = new Sprite(img`.`)
            sprite.setKind(spriteKind);
            scene.physicsEngine.addSprite(sprite);

            // Place on tile so that it can be used in the created
            // handlers
            tiles.placeOnTile(sprite, loc);

            for (const cb of createdHandlers) cb.handler(sprite)

            // The sprite image might have been set by the handler,
            // causing the sprite to change dimensions and be
            // off-center. Place it a second time to correct that
            tiles.placeOnTile(sprite, loc);
        });
    }

    // Tiles
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
        forEachTileOfKind(from, loc =>
            tiles.setTileAt(loc, to)
        );
    }

    // Camera
    /**
     * Center the camera on a given tile location.
     */
    //% block="center camera on $location"
    //% group="Operations" weight=10 blockGap=8
    //% location.shadow=mapgettile
    export function centerCameraOnTile(location: tiles.Location) {
        scene.centerCameraAt(location.x, location.y);
    }

    // Sprites
    /**
     * Destroy all sprites of a given kind. Useful when switching
     * between tilemaps.
     */
    //% block="destroy all sprites of kind $spriteKind"
    //% spriteKind.shadow=spritekind
    //% group="Operations" weight=9 blockGap=8
    export function destorySpritesOfKind(spriteKind: number) {
        sprites.allOfKind(spriteKind).forEach(s => s.destroy());
    }

    // Tilemap
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

    // Tilemap
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

    // Tilemap
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

    // Tilemap
    /**
     * Gets the tilemap column of a tile location
     */
    //% block="$location column"
    //% location.shadow=variables_get
    //% group="Conversions" weight=50 blockGap=8
    export function locationColumn(location: tiles.Location): number {
        return screenCoordinateToTile(location.x);
    }

    // Tilemap
    /**
     * Gets the tilemap row of a tile location
     */
    //% block="$location row"
    //% location.shadow=variables_get
    //% group="Conversions" weight=40 blockGap=8
    export function locationRow(location: tiles.Location): number {
        return screenCoordinateToTile(location.y);
    }

    // Tilemap
    /**
     * Converts a screen coordinate to a tilemap location.
     */
    //% block="screen coordinate $value to tile location"
    //% group="Conversions" weight=30 blockGap=8
    export function screenCoordinateToTile(value: number) {
        const tm = game.currentScene().tileMap;
        if (!tm) return value >> 4;
        return value >> tm.scale;
    }

    // Tilemap
    /**
     * Converts a tilemap location to a screen coordinate.
     */
    //% block="tile coordinate $value to screen coordinate"
    //% group="Conversions" weight=20 blockGap=8
    export function tileCoordinateToScreen(value: number) {
        const tm = game.currentScene().tileMap;
        if (!tm) return value << 4;
        return value << tm.scale;
    }

    // Tilemap
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

    // Tiles
    /**
     * Starting from a tile location, get the neighboring tile location in the given direction.
     */
    //% block="tile location in $direction from location $location"
    //% direction.shadow=direction_editor
    //% location.shadow=variables_get
    //% group="Directions" weight=40 blockGap=8
    export function locationInDirection(location: tiles.Location, direction: number) {
        return tiles.getTileLocation(
            columnInDirection(locationColumn(location), direction),
            rowInDirection(locationRow(location), direction)
        );
    }

    /**
     * Gets the neighboring column in the given direction.
     */
    export function columnInDirection(column: number, direction: number) {
        if (direction === CollisionDirection.Right) return column + 1;
        else if (direction === CollisionDirection.Left) return column - 1;
        else return column;
    }

    /**
     * Gets the neighboring row in the given direction.
     */
    export function rowInDirection(row: number, direction: number) {
        if (direction === CollisionDirection.Top) return row - 1;
        else if (direction === CollisionDirection.Bottom) return row + 1;
        else return row;
    }

    /**
     * Executes a piece of code for each direction of Top, Right, Bottom, Left starting at Top
     * and going clockwise.
     */
    export function forEachDirection(cb: (direction: CollisionDirection) => void) {
        // TODO: handlerStatement does not work right
        // block="for each direction $direction"
        // draggableParameters="reporter" handlerStatement
        // group="Directions" weight=20
        cb(CollisionDirection.Top);
        cb(CollisionDirection.Right);
        cb(CollisionDirection.Bottom);
        cb(CollisionDirection.Left);
    }

    // Tiles
    //% blockId=direction_editor shim=TD_ID
    //% block="$direction"
    //% group="Directions" weight=10
    export function _directionEditor(direction: CollisionDirection): CollisionDirection {
        return direction;
    }
}