const BOARD_SIZE = 640
const NO_OF_CELLS = 32
type GameState = 'Playing' | 'Paused';

type Cell = number;
type Board = Cell[][];
const stateColors = ["#202020", "#FF5050", "#50FF50", "#5050FF"];
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;
const ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error(`Could not initialize 2d context`);
}

const nextBtn = document.getElementById('next') as HTMLButtonElement;
if (nextBtn === null) {
    throw new Error(`Next button not found`);
}



const CELL_WIDTH = ctx.canvas.width / NO_OF_CELLS;
const CELL_HEIGHT = ctx.canvas.height / NO_OF_CELLS;


function createBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < NO_OF_CELLS; i++) {
        board.push(new Array<Cell>(NO_OF_CELLS).fill(0));
    }
    return board;
}

interface State {
    "color": string;
    "default": number;
    "transitions": {
        [key: string]: number;
    }
}
type Automaton = State[];
const GoL: Automaton = [
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

const Seeds: Automaton = [
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


const BB: Automaton = [
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


function countNeighbours(current: Board, nbors: number[], r0: number, c0: number) {
    nbors.fill(0);
    const dr = [-1, 0, 1, 0, 1, -1, -1, 1];
    const dc = [0, -1, 0, 1, 1, 1, -1, -1];

    for (let index = 0; index < dr.length; index++) {
        const r = r0 + dr[index];
        const c = c0 + dc[index];
        if (0 <= r && r < NO_OF_CELLS && 0 <= c && c < NO_OF_CELLS) {
            nbors[current[r][c]]++;
        }
    }
}
function computeNextBoard(automaton: Automaton, current: Board, next: Board) {


    const nbors = new Array(automaton.length).fill(0);
    for (let i = 0; i < NO_OF_CELLS; i++) {
        for (let j = 0; j < NO_OF_CELLS; j++) {
            countNeighbours(current, nbors, i, j);
            const state = automaton[current[i][j]];
            next[i][j] = state.transitions[nbors.join("")];
            if (next[i][j] === undefined)
                next[i][j] = state["default"];
        }
    }


}

function render(ctx: CanvasRenderingContext2D, automaton: Automaton, board: Board) {
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < NO_OF_CELLS; i++) {
        for (let j = 0; j < NO_OF_CELLS; j++) {
            let r = i * CELL_WIDTH;
            let c = j * CELL_WIDTH;
            ctx.fillStyle = automaton[board[i][j]].color;
            ctx.fillRect(r, c, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}

let currentAutomanton = BB;
let currentBoard = createBoard();
let nextBoard = createBoard();
render(ctx, currentAutomanton, currentBoard);


canvas.addEventListener("click", (e) => {
    const row = Math.floor(e.offsetX / CELL_WIDTH);
    const col = Math.floor(e.offsetY / CELL_HEIGHT);

    const state = document.getElementsByName("state");
    for (let i = 0; i < state.length; ++i) {
        if ((state[i] as HTMLInputElement).checked) {
            currentBoard[row][col] = i;
            render(ctx, currentAutomanton, currentBoard);
            return;
        }
    }
});

nextBtn.addEventListener('click', () => {
    computeNextBoard(GoL, currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
    render(ctx, currentAutomanton, currentBoard);
});



