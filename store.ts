namespace tiles {
    const __internalKind = SpriteKind.create();

    interface SerializedSprite {
        image: Image;
        buf: Buffer;
        data: any;
    }

    let stateStack: StoredState[];
    function state() {
        if (!stateStack) {
            stateStack = [new StoredState()];
            game.addScenePushHandler(function() {
                stateStack.push(new StoredState())
            })
            game.addScenePopHandler(function() {
                stateStack.pop()
            })
        }
        else if (!stateStack.length) {
            stateStack = [new StoredState()];
        }
        return stateStack[stateStack.length - 1];
    }

    class StoredState {
        store: {[index: string]: SerializedSprite[]};
        maps: tiles.WorldMap[];
        keys: string[];
        nextKey: number;

        constructor() {
            this.store = {};
            this.maps = [];
            this.keys = [];
            this.nextKey = 0;
        }

        storeSpritesForMap(tilemap: tiles.WorldMap, toStore: SerializedSprite[]) {
            const key = this.getKey(tilemap, true);
            const existing = this.store[key];
            if (existing) {
                this.store[key] = existing.concat(toStore);
            }
            else {
                this.store[key] = toStore;
            }
        }

        restorSpritesForMap(tilemap: tiles.WorldMap) {
            const key = this.getKey(tilemap, false);
            if (key && this.store[key]) {
                const allStored = this.store[key];
                delete this.store[key];

                const index = this.maps.indexOf(tilemap);
                this.maps.removeAt(index);
                this.keys.removeAt(index);

                for (const stored of allStored) {
                    recreateSprite(stored);
                }
            }
        }

        getKey(tilemap: tiles.WorldMap, createIfMissing: boolean) {
            const index = this.maps.indexOf(tilemap);
            if (index === -1) {
                if (createIfMissing) {
                    const newKey = (this.nextKey++) + ""
                    this.maps.push(tilemap);
                    this.keys.push(newKey);
                    return newKey;
                }
                return null;
            }
            return this.keys[index];
        }
    }


    /**
     * Stores all sprites with the given kind in the current tilemap.
     *
     * Warning: this might not work with all games!
     */
    //% block="store sprites of kind $kind for loaded map"
    //% blockId=tilemap_storeSpritesByKind
    //% kind.shadow=spritekind
    //% group="Sprites" weight=8
    export function storeSpritesByKindForLoadedMap(kind: number) {
        // Using spritesbykind makes sure we only get sprites and
        // not other drawables
        const kindMap = game.currentScene().spritesByKind;
        let allStored: SerializedSprite[] = [];

        const allSprites = (kindMap as any)[kind] as sprites.SpriteSet;

        if (!allSprites) return;

        for (const toStore of allSprites.sprites()) {
            allStored.push(serializeSprite(toStore));
            // change kind to prevent destroy event handlers from running
            toStore.setKind(__internalKind);
            toStore.destroy();
        }
        state().storeSpritesForMap(tiles.getLoadedMap(), allStored);
    }


    /**
     * Stores all sprites in the current tilemap.
     *
     * Warning: this might not work with all games!
     */
    //% block="store all sprites for loaded map"
    //% blockId=tilemap_storeAllSprites
    //% group="Sprites" weight=6
    export function storeAllSpritesForLoadedMap() {
        // Using spritesbykind makes sure we only get sprites and
        // not other drawables
        const kindMap = game.currentScene().spritesByKind;
        let allStored: SerializedSprite[] = [];

        for (const kind of Object.keys(kindMap)) {
            const allSprites = (kindMap as any)[kind] as sprites.SpriteSet;

            for (const toStore of allSprites.sprites()) {
                allStored.push(serializeSprite(toStore));
                // change kind to prevent destroy event handlers from running
                toStore.setKind(__internalKind);
                toStore.destroy();
            }
        }

        state().storeSpritesForMap(tiles.getLoadedMap(), allStored);
    }


    /**
     * Restores all of the sprites stored for the current map. To store
     * sprites, use storeAllSpritesForLoadedMap or storeSpritesByKindForLoadedMap
     *
     * Warning: this might not work with all games!
     */
    //% block="restore all sprites for loaded map"
    //% blockId=tilemap_resstoreAllSprites
    //% group="Sprites" weight=7
    export function restoreSpritesForLoadedMap() {
        state().restorSpritesForMap(tiles.getLoadedMap());
    }

    function serializeSprite(sprite: Sprite): SerializedSprite {
        const buf = control.createBuffer(48);
        let k = 0;

        let followId = 0;
        let followSpeed = 0;
        let followTurn = 0;

        const scene = game.currentScene();
        if (scene.followingSprites) {
            for (const fs of scene.followingSprites) {
                if (fs.self === sprite) {
                    followId = fs.target.id;
                    followSpeed = fs.rate;
                    followTurn = fs.turnRate;
                    break;
                }
            }
        }

        buf.setNumber(NumberFormat.Int32LE, k, sprite._x as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._y as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._vx as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._vy as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._ax as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._ay as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._fx as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite._fy as any as number); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, sprite.kind()); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, followId); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, followSpeed); k += 4;
        buf.setNumber(NumberFormat.Int32LE, k, followTurn); k += 4;

        // FIXME: we need to store the IDs of stored sprites so that we can restore
        // those properly if the other sprite is also stored
        return {
            image: sprite.image,
            buf: buf,
            data: sprite.data
        };
    }

    function recreateSprite(sprite: SerializedSprite) {
        const newSprite = sprites.create(sprite.image, __internalKind);

        const buf = sprite.buf;
        let k = 0;
        newSprite._x = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._y = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._vx = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._vy = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._ax = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._ay = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._fx = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite._fy = buf.getNumber(NumberFormat.Int32LE, k) as any as Fx8; k += 4;
        newSprite.setKind(buf.getNumber(NumberFormat.Int32LE, k)); k += 4;
        const followId = buf.getNumber(NumberFormat.Int32LE, k); k += 4;
        const followSpeed = buf.getNumber(NumberFormat.Int32LE, k); k += 4;
        const followTurn = buf.getNumber(NumberFormat.Int32LE, k); k += 4;

        if (followId) {
            let followSprite: Sprite;
            const spritesByKind = game.currentScene().spritesByKind;
            for (const kind of Object.keys(spritesByKind)) {
                if (followSprite) break;
                const allSprites: sprites.SpriteSet = (spritesByKind as any)[kind];
                for (const sprite of allSprites.sprites()) {
                    if (sprite.id === followId) {
                        followSprite = sprite;
                        break;
                    }
                }
            }

            if (followSprite && !(followSprite.flags & sprites.Flag.Destroyed)) {
                newSprite.follow(followSprite, followSpeed, followTurn);
            }
        }

        newSprite.data = sprite.data;
    }
}