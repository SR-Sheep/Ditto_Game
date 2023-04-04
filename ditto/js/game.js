var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

const gameWrap = document.getElementById('gameWrap');
const restartButton = document.getElementById('restartBtn');

const gameWidth = gameWrap.offsetWidth;
const gameHeight = gameWrap.offsetHeight;

canvas.width = 1200;
canvas.height = 300;

let jumpping = false;
let down = false;
let jumppingTime = 0;
let animation;
let highScore = 0;
let limitJumpCount = 1;
let jumpCount = 0;

let timer = 0;
let obstacleArr = [];

const defaultSpeed = 10;
const maxGameSpeed = 30;
let gameSpeed = defaultSpeed;

const floor = 170;
const obstacleImgWidth = 50;
const obstacleImgHeight = 50;


let obstacleImg1 = new Image();
obstacleImg1.src = "asset/img/gamza.jpg";
let subject = new Image();
subject.src = "asset/img/cat.png";
let groundImg = new Image();
groundImg.src = "asset/img/ground.png";
let skyImg = new Image();
skyImg.src="asset/img/sky.png";


const canvasWidth = 600;
const canvasHeight = 300;


//공룡
let dino = {
    x: 50,
    y: floor,
    width: 30,
    height: 30,
    draw: function() {
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        //ctx.drawImage(subject,this.x-10,this.y-20,50, 50);
    }
};

//땅
let ground = {
    x: 0,
    y: 200,
    width: 600,
    height: 50,
    draw: function() {
        //ctx.fillStyle = '#999';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(groundImg,this.x,this.y-20);
        ctx.drawImage(groundImg,this.x+this.width,this.y-20);
    },
    update:function(){
        this.x-=gameSpeed;
        if(this.x<=-this.width){
            this.x = 0;
        }
        this.draw();
    }
};

//하늘
let sky ={
    x: 0,
    y: 40,
    width : 1200,
    height : canvas.height - floor - 10,
    draw: function() {
        //ctx.fillStyle = '#999';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 0.2;
        ctx.drawImage(skyImg,this.x,this.y);
        ctx.drawImage(skyImg,this.x+1200,this.y);
        ctx.globalAlpha = 1;
    },
    update:function(){
        this.x-=gameSpeed/10;
        if(this.x<=-this.width){
            this.x = 0;
        }
        this.draw();
    }
}

ground.draw();

//장애물 객체
class Obstacle{
    constructor(){
        this.x = 800;
        this.y = floor;
        this.width = 30;
        this.height = 30;
    }
    draw(){
        ctx.fillStyle = 'red';
        //ctx.drawImage(obstacleImg1,this.x-10,this.y-20, obstacleImgWidth, obstacleImgHeight);
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}
//점수 그리기
function drawScore() {
    ctx.fillStyle = '#333';
    ctx.font = '15px NeoDunggeunmoPro-Regular';
    //우측 정렬을 위한 위치 보정
    const timerLength = timer.toString().length;
    const timerX = gameWidth - 10 - timerLength*10; 
    ctx.fillText(Math.floor(timer/10), timerX, 50);
    //최고 점수
    if(highScore>0){
        const highScoreX = gameWidth  - 10 - (timerLength+8)*10;
        ctx.fillText('HI:  ' + highScore, highScoreX, 50);
    }
}
function loop(){
    animation = requestAnimationFrame(loop);
    //캔버스 초기화
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //타이머 증가
    timer++;
    gameSpeed = defaultSpeed + Math.floor(timer/1000);
    if(gameSpeed>maxGameSpeed) gameSpeed = maxGameSpeed;
    //하늘
    sky.update();
    //땅
    ground.update();
    //점프(상승)
    if(jumpping&&!down){
        jumppingTime++; //점프 타이머 증가
        dino.y -=5; //점프력
    //점프 하강
    }else if(dino.y<floor){
        dino.y+=5;
    }
    //점프 타이머 100 이상일 경우 점프 중단
    if(jumppingTime > 20){
        jumppingTime = 0;
        jumpping = false;
        down = true;
    }
    //점프 제한, 사용자 인식 상 땅에 닿아도 점프가 안되는 것 같은 부분이 있어 조정
    if(dino.y>=floor-5){
        down = false;
        jumpCount = 0;
    }
    //점수
    drawScore();
    dino.draw();
    //장애물 생성, 120 프레임마다
    if(timer % 120 === 0){
        var obstacle = new Obstacle();
        obstacleArr.push(obstacle);
    }
    let check = false;
    //반복문
    obstacleArr.forEach((obstacle,idx,o)=>{
        //x좌표가 0 미만 시 제거
        if(obstacle.x < 0){
            o.splice(idx,1);
        }
        //충돌여부 판단
        check = check|checkCollision(dino,obstacle);
        obstacle.x-=gameSpeed;
        obstacle.draw();
    })
    //충돌시
    if(check){
        //루프 종료
        gameOver();
        return false;
    }
}

loop();

//충돌 검사
function checkCollision(dino, obstacle){
    const isCollision = dino.x < obstacle.x + obstacle.width && 
    dino.x + dino.width > obstacle.x &&
    dino.y < obstacle.y + obstacle.height &&
    dino.y + dino.height > obstacle.y

    const xDiff = obstacle.x - (dino.x + dino.width);
    const yDiff =  obstacle.y - (dino.y + dino.height);
    //충돌시
    if(isCollision){
        cancelAnimationFrame(animation);
        return true;
    }
    return false;
    
}
//키다운 이벤트
document.addEventListener('keydown',function(e){
    //스페이스바
    if(e.code==='Space'&&!down){
        jumpping = true;
        jumpCount++;
    }
})
//게임오버
function gameOver() {
    //게임 오버 메세지
    ctx.fillStyle = '#333';
    ctx.font = '18px NeoDunggeunmoPro-Regular';
    ctx.fillText("G  A  M  E  O  V  E  R", 323, 100);

    const score = Math.floor(timer/10);
    if(highScore<score){
        highScore=score;
    }
    timer = 0;
    makeReStartButton();
    //reset();  
}

//리셋 버튼
function makeReStartButton(){
    restartButton.classList.remove("hide");
}

// 캔버스에 다시하기 버튼 추가
gameWrap.appendChild(restartButton);


//다시하기 버튼 클릭 시 게임 다시 시작
restartButton.onclick = function() {
    //다시하기 버튼 안보이기
    restartButton.classList.add("hide");
    reset();
}


//리셋
function reset(){
    //dino 리셋
    dino.y=floor;
    //점프 리셋
    jumpping = false;
    //ground 리셋
    ground.x = 0;
    //장애물 리셋
    obstacleArr = [];
    //점수 초기화
    timer = 0;
    //게임 실행
    loop();
    
}