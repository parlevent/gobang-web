const CHESS_TYPE = {
    BLACK: 1,
    WHITE: -1,
    NONE: 0
};

const STATUS = {
    BUSY: 1,
    WAITING: 2,
    THINKING: 3,
    GAMEOVER: 0
};

const baseUrl = "http://202.120.40.4:7777";

const endpoints = {
    socket: baseUrl + "/socket",
    sendMsg: "/app/sendMsg",
    recMsg: name => "/user/" + name + '/msg'
};

const BOARD_SIZE = 640;
const LINES_NUM = 15;
const GRID_SIZE = BOARD_SIZE / (LINES_NUM + 1);
const CHESS_RADIUS = GRID_SIZE / 2.5;

function getAbsPos(x, y) {
    return {
        x: (x + 1) * GRID_SIZE,
        y: (y + 1) * GRID_SIZE
    }
}

function toggleType(type) {
    return -type;
}

function windowToCanvas(canvas, x, y) {
    let bbox = canvas.getBoundingClientRect();

    return { x: x - bbox.left * (canvas.width  / bbox.width),
        y: y - bbox.top  * (canvas.height / bbox.height)
    };
}

function getSmallPos(x, y) {
    return {
        x: parseInt((x + GRID_SIZE / 2) / GRID_SIZE) - 1,
        y: parseInt((y + GRID_SIZE / 2) / GRID_SIZE) - 1
    }
}