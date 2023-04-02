var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

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
obstacleImg1.src = "/asset/img/gamza.jpg";
let subject = new Image();
subject.src = "/asset/img/cat.png";
let groundImg = new Image();
groundImg.src = "asset/img/ground.png";
let skyImg = new Image();
skyImg.src="asset/img/sky.png";


//����
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

//��
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

//�ϴ�
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

//��ֹ� ��ü
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
//���� �׸���
function drawScore() {
    ctx.fillStyle = '#333';
    ctx.font = '15px NeoDunggeunmoPro-Regular';
    //���� ������ ���� ��ġ ����
    const timerLength = timer.toString().length;
    const timerX = 600 - timerLength*10; 
    ctx.fillText(Math.floor(timer/10), timerX, 30);
    //�ְ� ����
    if(highScore>0){
        const highScoreX = 600 - (timerLength+8)*10;
        ctx.fillText('HI:  ' + highScore, highScoreX, 30);
    }
}
function loop(){
    animation = requestAnimationFrame(loop);
    //ĵ���� �ʱ�ȭ
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //Ÿ�̸� ����
    timer++;
    gameSpeed = defaultSpeed + Math.floor(timer/1000);
    if(gameSpeed>maxGameSpeed) gameSpeed = maxGameSpeed;
    //�ϴ�
    sky.update();
    //��
    ground.update();
    //����(���)
    if(jumpping&&!down){
        jumppingTime++; //���� Ÿ�̸� ����
        dino.y -=5; //������
    //���� �ϰ�
    }else if(dino.y<floor){
        dino.y+=5;
    }
    //���� Ÿ�̸� 100 �̻��� ��� ���� �ߴ�
    if(jumppingTime > 20){
        jumppingTime = 0;
        jumpping = false;
        down = true;
    }
    //���� ����
    if(dino.y>=floor){
        down = false;
        jumpCount = 0;
    }
    //����
    drawScore();
    dino.draw();
    //��ֹ� ����, 120 �����Ӹ���
    if(timer % 120 === 0){
        var obstacle = new Obstacle();
        obstacleArr.push(obstacle);
    }
    let check = false;
    //�ݺ���
    obstacleArr.forEach((obstacle,idx,o)=>{
        //x��ǥ�� 0 �̸� �� ����
        if(obstacle.x < 0){
            o.splice(idx,1);
        }
        //�浹���� �Ǵ�
        check = check|checkCollision(dino,obstacle);
        obstacle.x-=gameSpeed;
        obstacle.draw();
    })
    //�浹��
    if(check){
        //���� ����
        gameOver();
        return false;
    }
}

loop();

//�浹 �˻�
function checkCollision(dino, obstacle){
    const isCollision = dino.x < obstacle.x + obstacle.width && 
    dino.x + dino.width > obstacle.x &&
    dino.y < obstacle.y + obstacle.height &&
    dino.y + dino.height > obstacle.y

    const xDiff = obstacle.x - (dino.x + dino.width);
    const yDiff =  obstacle.y - (dino.y + dino.height);
    //�浹��
    if(isCollision){
        cancelAnimationFrame(animation);
        return true;
    }
    return false;
    
}
//Ű�ٿ� �̺�Ʈ
document.addEventListener('keydown',function(e){
    //�����̽���
    if(e.code==='Space'&&!down){
        jumpping = true;
        jumpCount++;
    }
})
//���ӿ���
function gameOver() {
    const score = Math.floor(timer/10);
    if(highScore<score){
        highScore=score;
    }
    timer = 0;
    reset();
}

//����
function reset(){
    //dino ����
    dino.y=floor;
    //ground ����
    ground.x = 0;
    //��ֹ� ����
    obstacleArr = [];
    //���� ����
    loop();
    
}