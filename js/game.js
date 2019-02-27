class Game {
    constructor(canvasId, myName, advName, btnConnect) {
        this.canvas = document.getElementById(canvasId);
        this.inputMyName = document.getElementById(myName);
        this.inputAdvName = document.getElementById(advName);
        this.myName = "";
        this.advName = "";

        this.btnConnect = document.getElementById(btnConnect);
        this.ctx = this.canvas.getContext("2d");
        this.turn = CHESS_TYPE.BLACK;
        this.status = STATUS.BUSY;

        this.board = null;
        this.stompClient = null;

        this.setup();
    }

    setup() {
        this.board = new Array(LINES_NUM);
        for (let i = 0; i < LINES_NUM; i++) {
            this.board[i] = new Array(LINES_NUM);
            for (let j = 0; j < LINES_NUM; j++) {
                this.board[i][j] = CHESS_TYPE.NONE;
            }
        }
        this.drawGrid();

        this.canvas.onmouseup = e => {
            e.preventDefault();
            if (this.status !== STATUS.THINKING) return;

            let pos = windowToCanvas(this.canvas, e.clientX, e.clientY);
            pos = getSmallPos(pos.x, pos.y);

            this.addChessman(pos.x, pos.y);
            this.reDraw();

            this.stompClient.send(endpoints.sendMsg, {}, JSON.stringify({
                'sender': this.myName,
                'receiver': this.advName,
                'x': pos.x,
                'y': pos.y
            }));

            if (this.isGameOver(pos.x, pos.y)) {
                this.status = STATUS.GAMEOVER;
                alert(this.turn === CHESS_TYPE.BLACK ? "黑方胜利！" : "白方胜利！");
            } else {
                this.turn = toggleType(this.turn);
                this.status = STATUS.WAITING;
                // let smartPos = this.getAIPos();
                // this.addChessman(smartPos.x, smartPos.y);
                // this.reDraw();
                // this.turn = toggleType(this.turn);
                // this.status = STATUS.THINKING;
            }
        };

        this.setupConnection();

        this.btnConnect.onmouseup = e => {
            e.preventDefault();

            let myName = this.inputMyName.value,
                advName = this.inputAdvName.value;

            if (myName === null || myName === "" || advName === null || advName === "") {
                alert("请填写你和对手的昵称");
                return;
            }

            this.inputMyName.disabled = true;
            this.inputAdvName.disabled = true;
            this.myName = myName;
            this.advName = advName;

            if (myName > advName)
                this.status = STATUS.THINKING;
            else
                this.status = STATUS.WAITING;

            let socket = new SockJS(endpoints.socket);
            this.stompClient = Stomp.over(socket);
            this.stompClient.connect({}, () => {
                console.log("Connect successfully!");

                this.stompClient.subscribe(endpoints.recMsg(this.myName), (data) => {
                    console.log("received: " + JSON.parse(data.body).content);
                    let obj = JSON.parse(data.body);
                    if (obj.sender !== advName) return;
                    console.log("(" + obj.x + "," + " " + obj.y + ")");
                    this.addChessman(parseInt(obj.x), parseInt(obj.y));
                    this.status = STATUS.THINKING;
                    this.reDraw();
                    this.turn = toggleType(this.turn);
                });
            });
        }
    }

    setupConnection() {

    }

    drawGrid() {
        this.ctx.fillStyle = "#c8c8c8";
        this.ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

        this.ctx.strokeStyle = "#111";
        for (let i = 1; i <= LINES_NUM; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(GRID_SIZE, i * GRID_SIZE);
            this.ctx.lineTo(GRID_SIZE * LINES_NUM, i * GRID_SIZE);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(i * GRID_SIZE, GRID_SIZE);
            this.ctx.lineTo(i * GRID_SIZE, GRID_SIZE * LINES_NUM);
            this.ctx.stroke();
        }
    }

    drawAllChessmen() {
        this.ctx.strokeStyle = "#bbb";

        for (let i = 0; i < LINES_NUM; i++) {
            for (let j = 0; j < LINES_NUM; j++) {
                if (this.board[i][j] === CHESS_TYPE.NONE) continue;

                this.ctx.fillStyle = (this.board[i][j] === CHESS_TYPE.BLACK) ? "#000" : "#fff";
                let pos = getAbsPos(i, j);

                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, CHESS_RADIUS, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }

    reDraw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawGrid();
        this.drawAllChessmen();
    }

    addChessman(x, y) {
        this.board[x][y] = this.turn;
    }

    isGameOver(x, y) {
        let type = this.board[x][y];
        // 横着的
        let count = 1;
        for (let i = x - 1; i >= 0 && this.board[i][y] === type; i--) count++;
        for (let i = x + 1; i < LINES_NUM && this.board[i][y] === type; i++) count++;
        if (count >= 5) return true;

        // 竖着的
        count = 1;
        for (let i = y - 1; i >= 0 && this.board[x][i] === type; i--) count++;
        for (let i = y + 1; i < LINES_NUM && this.board[x][i] === type; i++) count++;
        if (count >= 5) return true;

        // 左下斜
        count = 1;
        for (let i = x - 1, j = y + 1; i >= 0 && j < LINES_NUM && this.board[i][j] === type; i--, j++) count++;
        for (let i = x + 1, j = y - 1; i < LINES_NUM && j >= 0 && this.board[i][j] === type; i++, j--) count++;
        if (count >= 5) return true;

        // 右下斜
        count = 1;
        for (let i = x - 1, j = y - 1; i >= 0 && j >= 0 && this.board[i][j] === type; i--, j--) count++;
        for (let i = x + 1, j = y + 1; i < LINES_NUM && j < LINES_NUM && this.board[i][j] === type; i++, j++) count++;
        if (count >= 5) return true;

        return false;
    }

    getAIPos() {
        return {
            x: 3,
            y: 5
        }
    }

    play() {

    };
}


let game = new Game("board", "mine", "adv", "connect");
game.play();
