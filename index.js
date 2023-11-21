const tableContainer = document.getElementById('table-container');
const welcomeMessage = document.querySelector('#welcome-message');
const pointElement = document.getElementById('point');

const userName = prompt('Enter your name here'); 
welcomeMessage.textContent += userName;

// Create table
let columns = parseInt(prompt('Enter number of table columns, maximum is 10'));
let rows = parseInt(prompt('Enter number of table rows, maximum is 10'));
while(!columns || columns > 10) {
    columns = parseInt(prompt('Enter number of table columns, maximum is 10'));
}
while(!rows || rows > 10) {
    rows = parseInt(prompt('Enter number of table rows, maximum is 10'));
}
for(let i = 0; i < rows; i++) {
    const row = document.createElement('div');
    row.id = `row-${i}`;
    row.classList.add('row');
    for(let j = 0; j < columns; j++) {
        const column = document.createElement('div');
        column.id = `${i}-${j}`;
        column.classList.add('square');
        row.appendChild(column);
    }
    tableContainer.append(row);
};
// Set up and start game
const assets = {
    mario: 'https://icons.iconarchive.com/icons/ph03nyx/super-mario/64/Paper-Mario-icon.png',
    mushroom: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Novosel_mushroom.svg/64px-Novosel_mushroom.svg.png',
    poison: 'https://pm1.narvii.com/6508/2cab51768eafc444e372b827797b2e00cb9d8ab2_hq.jpg'
};
const arrowKey = {
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    down: 'ArrowDown'
};
const bufferSpace = 1;
let intervalId = null;
let marioRow = 0;
let marioColumn = 0;
let marioSpeed = 1000;
let marioPosition, mushroomRow, mushroomColumn;
let points = 0;
let rightBuffer, leftBuffer, downBuffer, upBuffer;
let unavailblePositions = [];
// Add Observer Pattern
function ObserverList() {
    this.observerList = [];
} 

ObserverList.prototype = {
    subscribe: function(fn) {
        this.observerList.push(fn);
    },
    unsubscribe: function(fn) {
        this.observerList = this.observerList.filter((item) => {
            if(fn != item) {
                return fn;
            };
        })
    },
    notify: function(data) {
        this.observerList.forEach((observer) => observer(data))
    }
}

let observer = new ObserverList();
observer.subscribe(move);
startGame();
document.addEventListener('keydown', (e) => {
    move(e.key)
})
function avoidBufferArea(targetRow, targetColumn) {
    let leftOutsideArea = null; 
    let rightOutsideArea = null;
    if(targetRow > downBuffer || targetRow < upBuffer) { // Row ouside buffer range
        targetColumn = Math.floor(Math.random() * columns);
    } else {
        if(leftBuffer > 0) { // if there is any space on the left
            leftOutsideArea = Math.floor(Math.random() * (leftBuffer - 1));
        }
        if(rightBuffer < columns - 1) { // if there is any space on the right
            rightOutsideArea = Math.floor(Math.random() * (columns - rightBuffer - 1) + rightBuffer + 1);
        }
        if(leftOutsideArea && rightOutsideArea) {
            targetColumn = Math.round(Math.random()) ? leftOutsideArea : rightOutsideArea;
        } else {
            targetColumn = leftOutsideArea || leftOutsideArea === 0 ? leftOutsideArea : rightOutsideArea;
        }
    }
    return {targetRow, targetColumn};
}
function findBufferArea() {
    // Find row condition
    if(marioRow + bufferSpace <= rows - bufferSpace) {
        downBuffer = marioRow + bufferSpace;
    } else {
        downBuffer = rows - bufferSpace;
    }
    if(marioRow - bufferSpace >= 0) {
        upBuffer = marioRow - bufferSpace;
    } else {
        upBuffer = marioRow;
    }
    // Find column condition
    if(marioColumn + bufferSpace <= columns - bufferSpace) {
        rightBuffer = marioColumn + bufferSpace;
    } else {
        rightBuffer = columns - bufferSpace;
    }
    if(marioColumn - bufferSpace >= 0) {
        leftBuffer = marioColumn - bufferSpace;
    } else {
        leftBuffer = marioColumn;
    }
}
function generateMushroom() {
    mushroomRow = Math.floor(Math.random() * rows);
    const {targetColumn, targetRow} = avoidBufferArea(mushroomRow, mushroomColumn);
    mushroomColumn = targetColumn;
    mushroomRow = targetRow;
    unavailblePositions.push(`${mushroomRow}-${mushroomColumn}`);
    const mushroomPosition = document.getElementById(`${mushroomRow}-${mushroomColumn}`);
    const mushroomElement = document.createElement('img');
    mushroomElement.src = assets.mushroom;
    mushroomPosition.append(mushroomElement);
    setTimeout(() => {
        mushroomElement.style.display = 'none';
    }, 3000);
}
function generatePoison() {
    let poisonRow = Math.floor(Math.random() * rows);
    let poisonColumn = null;
    const {targetColumn, targetRow} = avoidBufferArea(poisonRow, poisonColumn);
    poisonColumn = targetColumn;
    poisonRow = targetRow;
    while(unavailblePositions.includes(`${poisonRow}-${poisonColumn}`)) {
        poisonRow = Math.floor(Math.random() * rows);
        const {targetColumn, targetRow} = avoidBufferArea(poisonRow, poisonColumn);
        poisonColumn = targetColumn;
        poisonRow = targetRow;
    }
    unavailblePositions.push(`${poisonRow}-${poisonColumn}`);
    const poisonPosition = document.getElementById(`${poisonRow}-${poisonColumn}`);
    const poisonElement = document.createElement('img');
    poisonElement.src = assets.poison;
    poisonElement.classList.add('poison');
    poisonPosition.append(poisonElement);
    setTimeout(() => {
        poisonElement.style.display = 'none';
    }, 3000);
}
function hitMushroom() {
    if(marioSpeed > 100) {
        marioSpeed -= 100;
    }
    points += 1;
    pointElement.textContent = `Score: ${points}`;
    reset();
    findBufferArea();
    generateMushroom();
    for(let i = 0; i < Math.max(columns, rows) - 1; i++) {
        generatePoison();
    }  
}
function move(direction) {
    localStorage.setItem('keyPressed', direction);
    if(direction === arrowKey.right) {
        toRight();
    } else if(direction === arrowKey.left) {
        toLeft();
    } else if(direction === arrowKey.up) {
        toUp();
    } else if (direction === arrowKey.down){
        toDown();
    }
}
function pause() {
    clearInterval(intervalId);
}
function reset() {
    if(unavailblePositions.length > 0) {
        for(let id of unavailblePositions) {
            const removeElement = document.getElementById(id);
            removeElement.removeChild(removeElement.firstChild);
        }
    }
    unavailblePositions = [];
}
function resume() {
    const keyPressed = localStorage.getItem('keyPressed');
    observer.notify(keyPressed);
}
function startGame() {
    if(intervalId) {
        clearInterval(intervalId);
    }
    reset();
    points = 0;
    marioRow = 0;
    marioColumn = 0;
    marioSpeed = 1000;
    pointElement.textContent = `Score: ${points}`;
    const initialPosition = document.getElementById(`${marioRow}-${marioColumn}`);
    marioPosition = document.createElement('img');
    marioPosition.src = assets.mario;
    initialPosition.append(marioPosition);
    findBufferArea();
    generateMushroom();
    for(let i = 0; i < Math.max(columns, rows) - 1; i++) {
        generatePoison();
    }
}
function toRight() {
    if(intervalId) {
        clearInterval(intervalId);
    }
        intervalId = setInterval(() => {
            if(marioColumn < columns - 1) {
                marioColumn += 1;
            } else {
                toLeft();
                return;
            }
            updatePosition();
        }, marioSpeed)
}
function toLeft() {
    if(intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        if(marioColumn > 0) {
            marioColumn -= 1;
        } else {
            toRight();
            return;
        }
        updatePosition();
    }, marioSpeed)
    
}
function toUp() {
    if(intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        if(marioRow > 0) {
            marioRow -= 1;
        } else {
            toDown();
            return;
        }
        updatePosition();
    }, marioSpeed)
}
function toDown() {
    if(intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        if(marioRow < rows - 1) {
            marioRow += 1;
        } else {
            toUp();
            return;
        }
        updatePosition();
    }, marioSpeed)
}
function updatePosition() {
    const newPosition = document.getElementById(`${marioRow}-${marioColumn}`);
    newPosition.append(marioPosition);
    if(unavailblePositions.includes(`${marioRow}-${marioColumn}`)) {
        if(marioRow === mushroomRow && marioColumn === mushroomColumn) {
            hitMushroom();
            return;
        } else {
            newPosition.removeChild(marioPosition);
            alert("You lose");
            startGame();
            return;
        }
    }
}