var width = window.innerWidth;
var height = window.innerHeight;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 
    75,             //view angle
    width/height,   //window aspect ratio
    0.1,            //near cliping
    15000            //far clipping
);
camera.position.set(300,300,300);


var renderer = new THREE.WebGLRenderer()
renderer.setSize( width, height );
document.body.appendChild(renderer.domElement);

//adding user controls to the scene
var contorls ;
function set_controls(){
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}




//world ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var world;
function createWorld(){
    var worldGeometry = new THREE.SphereGeometry( 350, 32, 32 );
    var worldTexture = new THREE.TextureLoader().load('../assets/world/space.jpg');
    var worldMaterial = new THREE.MeshBasicMaterial({map : worldTexture, overdraw: 0.1, side: THREE.DoubleSide });
    world = new THREE.Mesh( worldGeometry, worldMaterial );
    scene.add( world );
}


//center sphere font ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var sphere;
var CubeTextureLoader = new THREE.CubeTextureLoader();
    CubeTextureLoader.setPath( '../assets/world/' );

    var textureCube = CubeTextureLoader.load( [
    	'left.jpg', 'right.jpg',
    	'top.jpg', 'bottom.jpg',
    	'front.jpg', 'back.jpg'
    ] );

    var sphereGeometry = new THREE.SphereGeometry(6,32,32);

function create_sphere(){
    
    var sphereMaterial = new THREE.MeshBasicMaterial({
        color:  0xffffff,
        envMap: textureCube
    });

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0,0,0);
    scene.add( sphere );

}

//danishansari font----------------------------------------------------------------------------

//function create_danishansarifont(){
 


//}
//lighting
function create_lighting(){
    var ambientLight = new THREE.AmbientLight(0x404040,3);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set(15,15,15);
    scene.add( directionalLight );
}

window.addEventListener('resize', function(){
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = (width/height);
    camera.updateProjectionMatrix(); // update camera's perspective after updating params
});

//animate logo--------------------------------------------------------------------------------------------------------------------------------------------------------
async function animateLogo(){
    camSpan(-75,  75,  75);
}

async function cam(x,y,z,vx,vy,vz){
    var xs = (camera.position.x<x)?1:-1;
    var ys = (camera.position.y<y)?1:-1;
    var zs = (camera.position.z<z)?1:-1;
    return new Promise((resolve)=>{
        if(Math.round(camera.position.x)==x && Math.round(camera.position.y)==y && Math.round(camera.position.z)==z){  return resolve();}
        else{
            if(Math.round(camera.position.x) != x) camera.position.x += xs*vx*1;
            if(Math.round(camera.position.y) != y) camera.position.y += ys*vy*1;
            if(Math.round(camera.position.z) != z) camera.position.z += zs*vz*1;
            camera.lookAt(0,0,0);
            camera.updateProjectionMatrix();
            return setTimeout(()=>{
                //console.log(camera.position);
                resolve(cam(x,y,z,vx,vy,vz));
            },10);
        }
    })
}

async function camSpan(x,y,z){
    return new Promise((resolve)=>{
        var dx = Math.abs( camera.position.x - x),
        dy = Math.abs( camera.position.y - y),
        dz = Math.abs( camera.position.z - z),
        vx = 1,
        vy = dy/(dx==0)?1:dx,
        vz = dz/(dx==0)?1:dx;
        return resolve(cam(x,y,z,vx,vy,vz));
    });
}

async function followPath(i,cords){
    return new Promise((resolve)=>{
        if(i<cords.length-1){
            return resolve(()=>{
                console.log(cords[i].x, cords[i].y, cords[i].z);
                camSpan( cords[i].x, cords[i].y, cords[i].z );
                followPath(++i,cords)
            });
        }else{
            console.log('ended');
            return resolve();
        }
    });
}

function logging(x,y,z){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            console.log(x,y,z);
            resolve();
        },2000);
    })
}


function recursive(i,cords){
    return new Promise((resolve)=>{
        camSpan(cords[i].x,cords[i].y,cords[i].z).then(()=>{
            if(i>=cords.length-1){
                console.log('ended');
                return resolve();
            }else{
                return resolve(recursive(++i,cords));
            }
        });
    });
}

async function init(){
    createWorld();
    create_sphere();
    
    var cords=[
        { x:   300 ,        y:   300 ,        z:   300 },
        { x:   50 ,        y:   50 ,        z:   50 },
        { x:    0 ,        y:   20 ,        z:   85 },
        { x:    0 ,        y:   10 ,        z:   70 },
        { x:  -30 ,        y:   30 ,        z:   55 },
        { x:  -19 ,        y:  -27 ,        z:   49 },
        { x:    0 ,        y:   10 ,        z:   70 },
        
    ];
    camera.lookAt(0,0,0);
    camera.position.set(300,300,300);

    recursive(0,cords).then(()=>{
        //console.log('ended the rec cords');
        rotatearoundcenter(0).then(()=>{
            //console.log('ended this rotationala motion');
        });
    });
    
    

    requestAnimationFrame(GameLoop);
}

function rotatearoundcenter(i){
    return new Promise((resolve)=>{
        if(i>6){
            return resolve();
        }else{
            return setTimeout(()=>{
                var x= Math.sin(i*Math.PI)*100;
                var y= 0;
                var z= Math.cos(i*Math.PI)*100;
                //console.log(i,x,y,z);
                camera.position.set(x,y,z);
                camera.lookAt(0,0,0);
                resolve(rotatearoundcenter(i+0.01));
            },30)
        }
    })
}

/*function rotatearoundcenter(i){
    var x= Math.sin(i*Math.PI)*100;
    var y= 0;
    var z= Math.cos(i*Math.PI)*100;
    camera.lookAt(0,0,0);
    setTimeout(()=>{
        i+=0.01;
        camera.position.set(x,y,z);
        rotatearoundcenter(i);   
    },30);
}*/


var i=0;
//update the frame
var update = function(){
    world.rotation.y += 0.01;
};

//render the graphics
var render = function(){
    //render the scene ad per the camera position
    renderer.render(scene, camera);
};

//game loop engine
var GameLoop = function(){
    requestAnimationFrame(GameLoop);
    update();
    render();
};

 $('document').ready(function(){
    init();
 });
