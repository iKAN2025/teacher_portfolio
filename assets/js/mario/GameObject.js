import GameEnv from './GameEnv.js';

class GameObject {
    // container for all game objects in game
    constructor(canvas, image, speedRatio) {
        this.x = 0;
        this.y = 0;
        this.frame = 0;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = image;
        this.width = image.width;  // from Image() width
        this.height = image.height; // from Image() height
        this.collisionWidth = 0;
        this.collisionHeight = 0;
        this.aspect_ratio = this.width / this.height;
        this.speedRatio = speedRatio;
        this.speed = GameEnv.gameSpeed * this.speedRatio;
        this.invert = true;
        this.collisionData = {};
        this.jsonifiedElement = '';
        // Add this object to the game object array so collision can be detected
        // among other things
        GameEnv.gameObjects.push(this); 
    }

    // extract change from Game Objects into JSON
    serialize() {
        this.logElement();
    }

    // log Character element change
    logElement() {
        var jsonifiedElement = this.stringifyElement();
        if (jsonifiedElement !== this.jsonifiedElement) {
            console.log(jsonifiedElement);
            this.jsonifiedElement = jsonifiedElement;
        }
    }

    // strigify Character key data
    stringifyElement() {
        var element = this.canvas;
        if (element && element.id) {
            // Convert the relevant properties of the element to a string for comparison
            return JSON.stringify({
                id: element.id,
                width: element.width,
                height: element.height,
                style: element.style.cssText,
                position: {
                    left: element.style.left,
                    top: element.style.top
                },
                filter: element.style.filter
            });
        }
    }

    // X position getter and setter
    getX() {
        return this.x;
    }

    setX(x) {
        this.x = x;
    }

    // Y position getter and setter
    getY() {
        return this.y;
    }

    setY(y) {
        this.y = y;
    }

    /* Destroy Game Object
    * remove canvas element of object
    * remove object from GameObject array
    */
    destroy() {
        const index = GameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            // Remove the canvas from the DOM
            this.canvas.parentNode.removeChild(this.canvas);
            GameEnv.gameObjects.splice(index, 1);
        }
    }

    
    /* Default collision action is no action
     * override when you extend for custom action
    */
    collisionAction(){
        // no action
    }

    /* Default floor action is no action
     * override when you extend for custom action
    */
    floorAction(){
        // no action
    }

    /* Collision checks
     * uses GameObject isCollision to detect hit
     * calls collisionAction on hit
    */
    collisionChecks() {
        for (var gameObj of GameEnv.gameObjects){
            if (this != gameObj ) {
                this.isCollision(gameObj);
                if (this.collisionData.hit){
                    this.collisionAction();
                }
                if (this.collisionData.atFloor) {
                    this.floorAction();
                }
            }
        }
    }

    /* Collision detection method
     * usage: if (player.isCollision(platform)) { // action }
    */
    isCollision(other) {
        const percentage = 0.5; // Adjust this value to change the hitbox size as a percentage

        // bounding rectangles
        const thisRect = this.canvas.getBoundingClientRect();
        const otherRect = other.canvas.getBoundingClientRect();

        const widthReduction = thisRect.width * percentage;
        const heightReduction = thisRect.height * percentage;

        // Expand the hitbox by subtracting reductions from the left, right, top, and bottom
        const thisLeft = thisRect.left + widthReduction;
        const thisTop = thisRect.top + heightReduction;
        const thisRight = thisRect.right - widthReduction;
        const thisBottom = thisRect.bottom - heightReduction;

        // determine hit and points of hit
        this.collisionData = {
            hit: (
                thisLeft < otherRect.right &&
                thisRight > otherRect.left &&
                thisTop < otherRect.bottom &&
                thisBottom > otherRect.top
            ),
            atFloor: (GameEnv.bottom <= this.y), // Check if the object's bottom edge is at or below the floor level
            touchPoints: {
                this: {
                    top: (this.y > other.y),
                    bottom: (this.y < other.y),
                    left: (this.x > other.x),
                    right: (this.x < other.x),
                },
                other: {
                    id: other.canvas.id,
                    top: (this.y < other.y),
                    bottom: (this.y > other.y),
                    left: (this.x < other.x),
                    right: (this.x > other.x),
                },
            },
        };
    }

}

export default GameObject;
