var sketch = require("sketch");
var ui = require("sketch/ui");
var doc = context.document;
var document = sketch.getSelectedDocument();

var { isNativeObject } = require("util");
var availableLayers = [];
var availableLayersLabels = [];
export default function () {
    var selected = document.selectedLayers.layers[0];
    if (selected.type === "Artboard") {
        let myArtboard = selected;
        let myArtboardX = 0;
        let myArtboardY = 0;
        let myArtboardWidth = myArtboard.frame.width;
        let myArtboardHeight = myArtboard.frame.height;
        myArtboard.selected = false;
        myArtboard.layers.forEach((layer) => {
            availableLayers.push(layer);
            availableLayersLabels.push(layer.name);
            layer.selected = true;
        });

        availableLayersLabels.push("None");

        var result;
        var instructionalTextForInput =
            "Please, select a layer that should remain in its default position from th elist below";
        instructionalTextForInput += "\nYou can also select none.";

        // Plugin interactive window
        ui.getInputFromUser(
            "Choose a layer with a fixed position",
            {
                description: instructionalTextForInput,
                type: ui.INPUT_TYPE.selection,
                possibleValues: availableLayersLabels,
            },
            (err, value) => {
                if (err) {
                    return;
                } else {
                    result = value;
                }
            }
        );

        let index = availableLayersLabels.indexOf(result);

        let fixedLayer = {};
        let fixedArea = [];
        if (index < availableLayers.length) {
            fixedLayer = availableLayers[index];
            fixedLayer.selected = false;
            fixedLayer.moveToFront();
            fixedArea = [
                fixedLayer.frame.x,
                fixedLayer.frame.y,
                fixedLayer.frame.width,
                fixedLayer.frame.height,
            ];
        }

        selected = document.selectedLayers.layers;
        let usedAreasWidth = [
            [myArtboardX, myArtboardWidth],
            [fixedArea[0], fixedArea[0] + fixedArea[2]],
        ];
        let usedAreasHeight = [
            [myArtboardY, myArtboardHeight],
            [fixedArea[1], fixedArea[1] + fixedArea[3]],
        ];
        selected.forEach((layer) => {
            // console.log(layer.name);
            let width = layer.frame.width;
            let height = layer.frame.height;
            let newX = iterateRandomPosition(
                getRandomArbitrary(myArtboardX, myArtboardWidth - width),
                width,
                usedAreasWidth
            );
            let newY = iterateRandomPosition(
                getRandomArbitrary(myArtboardY, myArtboardHeight - height),
                height,
                usedAreasHeight
            );
            layer.frame.x = newX;
            layer.frame.y = newY;
            layer.transform.rotation = getRandomArbitrary(-32, 32);
        });
        document.selectedLayers = [];
        myArtboard.selected = true;
    } else {
        sketch.UI.message("🙏 Please, select one Artboard");
    }
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min + 100) + min);
}

function iterateRandomPosition(a = 0, b = 0, usedAreas) {
    // For the Arboard it should be contained
    if (!contained(a, b, usedAreas[0][0], usedAreas[0][1])) {
        let newValue = getRandomArbitrary(usedAreas[0][0], usedAreas[0][1] - b);
        iterateRandomPosition(newValue, b, usedAreas);
    } else {
        // For all the other items, it should not be contained
        let newValue = a;
        for (let i = 1; i < usedAreas.length; i++) {
            if (contained(newValue, b, usedAreas[i][0], usedAreas[i][1])) {
                newValue = getRandomArbitrary(
                    usedAreas[0][0],
                    usedAreas[0][1] - b
                );
                iterateRandomPosition(newValue, b, usedAreas);
            } else {
                return newValue;
            }
        }
    }
    return a;
}

function contained(a = 0, b = 0, ca = 0, cb = 0) {
    let toReturn = false;
    if (a >= ca && b <= cb) {
        toReturn = true;
    }
    return toReturn;
}
