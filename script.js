const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let paths = [], redoStack = [];
let drawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let brushSize = 5;

function setupCanvas() {
    //adjust the canvas size
    const rect = canvas.getBoundingClientRect();
    const dpi = window.devicePixelRatio;

    canvas.width = rect.width * dpi;
    canvas.height = rect.height * dpi;

    console.log(rect);
    console.log(dpi);

    console.log(canvas.width,canvas.height);
}


setupCanvas();


document.addEventListener('DOMContentLoaded',(event)=>{
    document.getElementById('pencil').addEventListener('click', () => setActiveTool('pencil'));
    document.getElementById('eraser').addEventListener('click', () => setActiveTool('eraser'));
    document.getElementById('undo').addEventListener('click', () => undoLastAction());
    document.getElementById('redo').addEventListener('click', () => redoLastAction());
    document.getElementById('clearAll').addEventListener('click', () => clearCanvas());
    document.getElementById('colorPicker').addEventListener('change',(e) => {
        currentColor = e.target.value;
        setActiveTool('pencil');
    });
    document.getElementById('brushSize').addEventListener('change',(e)=>{
        brushSize = e.target.value;
    })
    canvas.addEventListener('mousedown',startDrawing);
    canvas.addEventListener('mouseup',stopDrawing);
    canvas.addEventListener('mousemove',draw);

    setActiveTool('pencil');
})


function setActiveTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.toolItem').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tool}`).classList.add('active');
}

function stopDrawing() {
    drawing = false;
}

function clearCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    paths= [];
    redoStack = [];
}

function undoLastAction() {
    //check if there are any drawing sections stored in the path array
    if(paths.length > 0) {
        //pop the last drawing action from the paths array and push it into redoStack
        redoStack.push(paths.pop());
        redrawCanvas();
    }
}

function draw(e) {
    if(!drawing) return;
    //get mouse position
    const mousePos = getMousePos(e);
    //add that mouse position to the existing path in the paths array
    paths[paths.length - 1].points.push(mousePos);
    redrawCanvas();

}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width/window.devicePixelRatio, canvas.height/window.devicePixelRatio);
    paths.forEach(drawPath);
}

function drawPath(path) {
    ctx.beginPath();
    ctx.moveTo(path.points[0].x,path.points[0].y);

    for(let i=1;i<path.points.length;i++){
        ctx.lineTo(path.points[i].x,path.points[i].y);
    }

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.stroke();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    return {x,y};
}

function startDrawing(e) {
    drawing = true;
    const mousePos = getMousePos(e);

    //paths => array of object
    paths.push({
        color: currentTool === 'eraser'?'white':currentColor,
        points:[mousePos],
        width: brushSize
    });

    redoStack = []
}

function redoLastAction() {
    if(redoStack.length > 0){
        paths.push(redoStack.pop());
        redrawCanvas();
    }
}