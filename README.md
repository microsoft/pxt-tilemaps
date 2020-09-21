# Tilemaps ![Build status badge](https://github.com/riknoll/overworld/workflows/MakeCode/badge.svg)

This extension contains advanced APIs for working with tilemaps in blocks.

## Usage

## createSpritesOnTiles

The ``||tiles.createSpritesOnTiles||`` block creates an empty sprite on top of each location with the specified tile. Combine this with ``||sprites.onCreated||`` to initialize the empty sprites with an image, position, etc.

### Parameters

* `tileKind` is the image of the tile where sprites will be created
* `spriteKind` is the kind of sprite that will be created

### Example 1

Create a small green box on each empty tile.

```blocks

sprites.onCreated(SpriteKind.Enemy, function (sprite) {
    sprite.setImage(img`
        7 7 
        7 7 
        `)
})
tiles.setTilemap(tiles.createTilemap(hex`0400040000000000000000000000000000000000`, img`
. . . . 
. . . . 
. . . . 
. . . . 
`, [myTiles.transparency16], TileScale.Sixteen))

tiles.createSpritesOnTiles(myTiles.transparency16, SpriteKind.Enemy)

```

## Create a project with this extension

This repository can be added as an **extension** in Microsoft MakeCode.

* open https://arcade.makecode.com/
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for https://github.com/riknoll/overworld and click import

## Edit this extension

To edit this repository in Microsoft MakeCode.

* open https://arcade.makecode.com/
* click on **Import** then click on **Import URL**
* paste https://github.com/riknoll/overworld and click import

## Supported targets

* for PXT/arcade
(The metadata above is needed for package search.)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
