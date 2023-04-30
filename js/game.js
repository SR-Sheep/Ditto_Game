var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

const gameWrap = document.getElementById('gameWrap');
const restartButton = document.getElementById('restartBtn');
const startButton = document.getElementById('startBtn');

const gameWidth = gameWrap.offsetWidth;
const gameHeight = gameWrap.offsetHeight;

canvas.width = 1200;
canvas.height = 300;

// 쿠키 만료 날짜 설정
const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + 30); // 30일 뒤

let jumpping = false;
let down = false;
let jumppingTime = 0;
let animation;

//최고점을 쿠키에서 가져옴
const cookies = document.cookie.split(';');
const cookieObj = cookies.reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});
// 최고 점수 설정
let highScore = cookieObj.highScore ?? 0;
let limitJumpCount = 1;
let jumpCount = 0;

let timer = 0;
let obstacleArr = [];

const defaultSpeed = 10; //초기 속도
const maxGameSpeed = 30; //최대 속도
let gameSpeed = defaultSpeed;

const floor = 170;
const obstacleImgWidth = 50;
const obstacleImgHeight = 50;
const maxJumpTime = 20;

let jumpV = maxJumpTime;
const jumpA = 1;

let obstacleImg1 = new Image();
obstacleImg1.src = "asset/img/gamza.jpg";
//공룡 이미지
let subject = new Image();
subject.src = "asset/img/dino_64.png";
//공룡 이미지 프레임 선언
const subjectFrames = [{x : 0, y: 0 , width : 64, height : 64}
                        ,{x : 63, y: 0 , width : 64, height : 64}
                        ,{x : 126, y: 0 , width : 64, height : 64}
                        ,{x : 189, y: 0 , width : 64, height : 64}];


let deadSubject = new Image()
deadSubject.src = "asset/img/Dino_dead.png";

let groundImg = new Image();
groundImg.src = "asset/img/ground.png";
let skyImg = new Image();
skyImg.src="asset/img/sky.png";
let cat = new Image();
cat.src="asset/img/cat.png";
let cat_2_1 = new Image();
cat_2_1.src="asset/img/2_1_cat.jpg";
let cat_1_3 = new Image();
cat_1_3.src="asset/img/1_3_cat.jpg";


const canvasWidth = 600;
const canvasHeight = 300;

let isNight = false;

let obstacleInterval = 50; //장애물 출현 간격

let gameover = false;

//공룡
let dino = {
    x: 50,
    y: floor,
    width: 30,
    height: 30,
    draw: function() {
        const frame = parseInt(timer/10)%4;
        const subjectFrame = subjectFrames[frame];
        console.log(frame);
        //ctx.fillStyle = '#666';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(subject,subjectFrame.x, subjectFrame.y, subjectFrame.width,subjectFrame.height,this.x-10,this.y-20,50, 50);
    },
    dead: function(){
        ctx.drawImage(deadSubject,this.x-10,this.y-20,50, 50);
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
    constructor(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    draw(color){
        if(color=='yellow'){
            ctx.drawImage(cat_2_1,this.x,this.y,this.width,this.height);
        }else if(color=='green'){
            ctx.drawImage(cat_1_3,this.x,this.y,this.width,this.height);
        }else{
            ctx.drawImage(cat,this.x,this.y,this.width,this.height);
        }
        //ctx.fillStyle = color??'black';
        //ctx.drawImage(cat,this.x-10,this.y-20, obstacleImgWidth, obstacleImgHeight);
        //ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

//장애물 0 기본
class Obstacle0 extends Obstacle{
    constructor(){
        const size = 30;
        super(800,floor,size,size);
    }
    draw(){
        super.draw('red');
    }
}

//장애물 1
class Obstacle1 extends Obstacle{
    constructor(){
        super(800,floor,60,20);
    }
    draw(){
        super.draw('green');
    }
}

//장애물 2
class Obstacle2 extends Obstacle{
    constructor(){
        super(800,floor-20,20,40);
    }
    draw(){
        super.draw('yellow');
    }
}
//장애물 3
class Obstacle3 extends Obstacle{
    constructor(){
        super(800,floor-100,20,20);
    }
    draw(){
        super.draw('blue');
    }
}



//구름 객체
class Cloud{
    constructor(){
        this.x = 800;
        this.y = floor;
        this.width = 30;
        this.height = 30;
    }
    draw(){
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            const x = Math.random() * canvas.width; // x 좌표
            const y = Math.random() * canvas.height; // y 좌표
            const r = Math.random() * 5; // 반지름
            ctx.arc(x, y, r, 0, 2 * Math.PI); // 점 그리기
            ctx.fillStyle = "black"; // 점 색상 설정
            ctx.fill();
          }


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

    isNight = timer%900>700;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameSpeed = defaultSpeed + Math.floor(timer/1000);
    if(gameSpeed>maxGameSpeed) gameSpeed = maxGameSpeed;
    //하늘
    sky.update();
    //땅
    ground.update();
    //장애물 생성, obstacleInterval 프레임마다
    if(timer % obstacleInterval === 0){
        //장애물 타입 현재 0-3 4종류
        const type = Math.round(Math.random()*3);
        var obstacle;
        switch(type){
            case 0 : obstacle = new Obstacle0; break;
            case 1 : obstacle = new Obstacle1; break;
            case 2 : obstacle = new Obstacle2; break;
            case 3 : obstacle = new Obstacle3; break;
        }
        obstacleArr.push(obstacle);
    }
    //점프(상승)
    if(jumpping&&!down){
        jumppingTime++; //점프 타이머 증가
        jumpV -=jumpA; //지면에 멀어질수록 속도 감소
        dino.y -=jumpV; //점프력
    //점프 하강
    }else if(dino.y<floor){
        jumpV +=jumpA; //지면에 가까워질수록 속도 증가
        dino.y+=jumpV;
        if(dino.y>floor){
            dino.y = floor; //공룡 위치 초기화
            jumpV=maxJumpTime; //점프 속도 초기화
        } 
    }else if(dino.y>=floor){
        dino.y = floor; //공룡 위치 초기화
        jumpV=maxJumpTime; //점프 속도 초기화
    }
    //점프 타이머 maxJumpTime 이상일 경우 점프 중단
    if(jumppingTime > maxJumpTime){
        jumppingTime = 0;
        jumpping = false;
        down = true;
        jumpV = 0;
    }
    //점프 제한, 사용자 인식 상 땅에 닿아도 점프가 안되는 것 같은 부분이 있어 조정
    if(dino.y>=floor-5){
        down = false;
        jumpCount = 0;
    }
    //점수
    drawScore();
    
    let check = false;
    //맨 처음 요소가 화면 밖으로 나가면 제거
    if(obstacleArr[0]?.x +obstacleArr[0]?.width < 0){
        obstacleArr.splice(0,1);
    }
    //반복문
    obstacleArr.forEach((obstacle,idx,o)=>{
        obstacle.x-=gameSpeed;
        obstacle.draw();
        //충돌여부 판단
        check = check|checkCollision(dino,obstacle);
    })
    
    //충돌시
    if(check){
        dino.dead();
        cancelAnimationFrame(animation);
        //루프 종료
        gameOver();
        return false;
    }else{
        dino.draw();
    }
    //밤이면 반전
    if(isNight){
        reveseCanversColor();
    }
}

//loop();

//충돌 검사
function checkCollision(dino, obstacle){
    return dino.x-10 <= obstacle.x + obstacle.width && //공룡 왼쪽 x
    dino.x + dino.width >= obstacle.x && //공룡 오른쪽 x
    dino.y-20 <= obstacle.y + obstacle.height && //공룡 위 y
    dino.y + dino.height >= obstacle.y //공룡 아래 y
}
//키다운 이벤트
document.addEventListener('keydown',function(e){
    //스페이스바
    if(e.code==='Space'&&!down){
        jumpping = true;
        jumpCount++;
    }
})
//키업 이벤트
document.addEventListener('keyup',function(e){
    //스페이스바
    if(e.code==='Space'&&!down){
        jumppingTime = 60;
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
        // 쿠키를 설정합니다.
        document.cookie = `highScore=${highScore};expires=${expirationDate.toUTCString()};path=/`;
    }
    timer = 0;
    makeReStartButton();
    //reset();  
}

//리셋 버튼
function makeReStartButton(){
    restartButton.classList.remove("hide");
}
//시작버튼 클릭 시
startButton.onclick= function(){
    startButton.classList.add("hide");
    loop();
}

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

//색상 반전 흐음.... 일단 보류
function reveseCanversColor(){
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // 빨강 값 반전
    data[i + 1] = 255 - data[i + 1]; // 초록 값 반전
    data[i + 2] = 255 - data[i + 2]; // 파랑 값 반전
  }

  ctx.putImageData(imageData, 0, 0);
}