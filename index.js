var BOARD_SIZE = 640;
var NO_OF_CELLS = 32;
var stateColors = ["#202020", "#FF5050", "#50FF50", "#5050FF"];
var canvas = document.getElementById('canvas');
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;
var ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error("Could not initialize 2d context");
}
var nextBtn = document.getElementById('next');
if (nextBtn === null) {
    throw new Error("Next button not found");
}
var CELL_WIDTH = ctx.canvas.width / NO_OF_CELLS;
var CELL_HEIGHT = ctx.canvas.height / NO_OF_CELLS;
function createBoard() {
    var board = [];
    for (var i = 0; i < NO_OF_CELLS; i++) {
        board.push(new Array(NO_OF_CELLS).fill(0));
    }
    return board;
}
var GoL = [
    {
        "transitions": {
            "53": 1,
        },
        "default": 0,
        "color": "#202020",
    },
    {
        "transitions": {
            "53": 1,
            "62": 1,
        },
        "default": 0,
        "color": "#FF5050",
    }
    // [
    // row means dead cells
    // col means alive cells
    // only make current cell alive if it has 3 alive neighbours ans 5 dead neighbours
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 1, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ],
    // [
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 1, 0, 0, 0, 0, 0],
    //     [0, 0, 1, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ],
];
var Seeds = [
    {
        "transitions": {
            "62": 1,
        },
        "default": 0,
        "color": "#202020",
    },
    {
        "transitions": {},
        "default": 0,
        "color": "#FF5050",
    },
];
var BB = [
    // 0 - Dead
    {
        "transitions": {
            "026": 1,
            "125": 1,
            "224": 1,
            "323": 1,
            "422": 1,
            "521": 1,
            "620": 1,
        },
        "default": 0,
        "color": "#202020",
    },
    // 1 - Live
    {
        "transitions": {},
        "default": 2,
        "color": "#FF5050",
    },
    // 2 - Dying
    {
        "transitions": {},
        "default": 0,
        "color": "#50FF50",
    },
];
function countNeighbours(current, nbors, r0, c0) {
    nbors.fill(0);
    var dr = [-1, 0, 1, 0, 1, -1, -1, 1];
    var dc = [0, -1, 0, 1, 1, 1, -1, -1];
    for (var index = 0; index < dr.length; index++) {
        var r = r0 + dr[index];
        var c = c0 + dc[index];
        if (0 <= r && r < NO_OF_CELLS && 0 <= c && c < NO_OF_CELLS) {
            nbors[current[r][c]]++;
        }
    }
}
function computeNextBoard(automaton, current, next) {
    var nbors = new Array(automaton.length).fill(0);
    for (var i = 0; i < NO_OF_CELLS; i++) {
        for (var j = 0; j < NO_OF_CELLS; j++) {
            countNeighbours(current, nbors, i, j);
            var state = automaton[current[i][j]];
            next[i][j] = state.transitions[nbors.join("")];
            if (next[i][j] === undefined)
                next[i][j] = state["default"];
        }
    }
}
function render(ctx, automaton, board) {
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var i = 0; i < NO_OF_CELLS; i++) {
        for (var j = 0; j < NO_OF_CELLS; j++) {
            var r = i * CELL_WIDTH;
            var c = j * CELL_WIDTH;
            ctx.fillStyle = automaton[board[i][j]].color;
            ctx.fillRect(r, c, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}
var currentAutomanton = BB;
var currentBoard = createBoard();
var nextBoard = createBoard();
render(ctx, currentAutomanton, currentBoard);
canvas.addEventListener("click", function (e) {
    var row = Math.floor(e.offsetX / CELL_WIDTH);
    var col = Math.floor(e.offsetY / CELL_HEIGHT);
    var state = document.getElementsByName("state");
    for (var i = 0; i < state.length; ++i) {
        if (state[i].checked) {
            currentBoard[row][col] = i;
            render(ctx, currentAutomanton, currentBoard);
            return;
        }
    }
});
nextBtn.addEventListener('click', function () {
    var _a;
    computeNextBoard(GoL, currentBoard, nextBoard);
    _a = [nextBoard, currentBoard], currentBoard = _a[0], nextBoard = _a[1];
    render(ctx, currentAutomanton, currentBoard);
});
