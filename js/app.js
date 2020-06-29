


import * as THREE from './libs/three.module.js';

import Stats from 'stats.js';
import { loader } from './loader.js';
import { moving } from './moving.js';
import { player, playerHitboxMesh, playerDefaultPosition, mixer, playerModel } from './player.js';
import { enemySpawner, enemies, intervalToMove } from './enemies.js';
import { Environment } from './environment.js';
export let camera, scene, renderer, controls;
export let light;
export let canvas = document.querySelector('#gameCanvas');
export let mainLoaded = 0;
export let add = () => {
    mainLoaded++;
}

import {OrbitControls} from './libs/OrbitControls';


export let collissionDetected = false;

let scoreValueDisplay = document.querySelector('#scoreValue');
export let scoreValue = 0;
let clock = new THREE.Clock();

// GLOBAL STATES 
let isPlaying = false;
let isCollapsed = false
let isJump = false;

let collapsedScreen = document.querySelector('#collapsedScreen');
let collapsedScreenScore = document.querySelector('#finalScore');
let collapsedScreenButton = document.querySelector('#restartButton');

let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);



const init = () => { // init all required environment

    // if there is a hi score in localstorage grab it and if not set value to 0
    document.querySelector('#bestValue').innerHTML = localStorage.getItem('score') ? localStorage.getItem('score') : 0

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 500);
    
    /* camera.position.set(
        12.11335282741436,
        22.431344959973545,
        -8.155109793722527
    )
    camera.rotation.set(
        -2.575459746596432,
        0.6059858107445513,
        2.794286842857644
    ) */

    camera.position.set(
        11.107887494115303,
        10.597672258150979,
        -13.287483538618204
    )
    camera.rotation.set(
        -2.862817515434483,
        0.6801154027308529,
        2.9634955878264626
    )
    
    // create scene
     scene = new THREE.Scene();

    // lights
    let DLight = new THREE.DirectionalLight(0xedc9af , .5);
    let DLightTargetObject = new THREE.Object3D();
    DLight.position.set(-50, 30, -30);
    DLight.target = DLightTargetObject;
    DLightTargetObject.position.set(65, 9, 50);

    // create shadows on objects
    DLight.castShadow = true;
    DLight.shadow.radius = 1;
    DLight.shadow.mapSize.width = 1024 * 1;
    DLight.shadow.mapSize.height = 1024 * 1;
    DLight.shadow.camera.scale.y = 10;
    DLight.shadow.camera.scale.x = 20;
    DLight.shadow.camera.near = 0;
    DLight.shadow.camera.far = 200;
    // ambient light(everywhere)
    let ALight = new THREE.AmbientLight(0xedc9af, 1.5);

    scene.add(ALight);
    scene.add(DLight);
    scene.add(DLightTargetObject);

    // add fog
    scene.fog = new THREE.Fog(0xE7B251, 1, 125);

    // scene background color(environment)
    scene.background = new THREE.Color(0xE7B251);

    loader();// all objects loaders

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas // render to existing canvas
    });
    
    renderer.setClearColor(0xE6CBB2); // to have light background color
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap ;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.Uncharted2ToneMapping
    
    // just for testing
    controls = new OrbitControls(camera, canvas);

    // pointer to see where enemies should be eliminated
    let pointerGeo = new THREE.CubeGeometry(2, 2, 2);
    let pointerMat = new THREE.MeshBasicMaterial({ color: 0x0000f0 })
    let pointer = new THREE.Mesh(pointerGeo, pointerMat);
    pointer.position.set(25, 1, 0);
    scene.add(pointer);

    // on window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

// handle keypress/ up function to interact with the player obj
const keyPressedHandler = (e) => {
    switch (e.code) {
        case "KeyS":
            isJump = false;
            // hit box
            playerHitboxMesh.scale.y = .5;
            playerHitboxMesh.position.y = 2;

            break;
        case "Space":
            if(isJump)return;
            isJump = true;
            playerHitboxMesh.position.y = 7;
            // reset position y not to fly
            setTimeout(() => {
                playerHitboxMesh.position.y = 2.5;
                //playerModel.position.y = 1.5;
                isJump = false;
            }, 400);
            
            break;
    }
}
const keyUpHandler = (e) => {
    if(e.code === "KeyS") {

        setTimeout(() => {
            playerHitboxMesh.position.y = 2.5;
            playerHitboxMesh.scale.y = 1;

        }, 100);
        
    }
}
isPlaying = true;
// for collision detection
let eBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

const reset = () => {

    isJump = false;// if collision was in the air
   
    eBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    /* playerModel.position.set(
        playerDefaultPosition.x,
        1.5,
        playerDefaultPosition.z
    ) */
    playerHitboxMesh.position.set(
        playerDefaultPosition.x,
        2.5,
        playerDefaultPosition.z
    )
    scoreValue = 0;
    // if there is a hi score in localstorage grab it and if not set value to 0
    document.querySelector('#bestValue').innerHTML = localStorage.getItem('score');
    isCollapsed = false;
    isPlaying = true;
   
    enemies[0].position.x = -100
    enemies[1].position.x = -120
    enemies[2].position.x = -140
    enemies[3].position.x = -160

}

// isPlaying = true;
// main animate function ( game loop )

const animate = () => {
    // console.log(camera.rotation)
    // console.log(camera.position)
    stats.begin();
    requestAnimationFrame(animate);

    // console.log('in animate we are')
    // console.log(!isPlaying)
    // console.log(isCollapsed)

    if (!isPlaying || isCollapsed)return;


   
    // check + movement for all the elements
    moving();

    // running player
/*     let delta = clock.getDelta();
    if (mixer) mixer.update(delta); */
    
    // update the score
    scoreValueDisplay.innerHTML = scoreValue.toFixed(0);
    scoreValue += .3;

    // collision check
    if (enemies.length) {

    // check if any of the enemies reach the destroyer pointer and if yes remove from the scene
        enemies.map((e, index) => {

            let pBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            pBox.setFromObject(playerHitboxMesh);
            eBox.setFromObject(e);
            
           /*  if (eBox.intersectsBox(pBox)) {
                
                
                collapsedScreen.style.display = 'block';
                collapsedScreenScore.innerHTML = `Score:${scoreValue.toFixed(0)}`;
                collapsedScreenButton.addEventListener('click',() => {
                  
                    reset();
                    collapsedScreen.style.display = 'none';
                })

                isCollapsed = true;
                isPlaying = false;
                let score = localStorage.getItem('score');

                // if there is a value and that value is less than current
                if(score*1 < scoreValue) {
                    localStorage.setItem('score', scoreValue.toFixed(0));
                }
            
            } */
            
        });
    }
    renderer.render(scene, camera);

    stats.end();
}



let startScreen = document.querySelector('.startMenu');

document.querySelector('.startGameButton').addEventListener('click',()=>{

    startScreen.style.display = 'none';
    isPlaying = true;
       
})



// events
document.addEventListener('keypress', keyPressedHandler);
document.addEventListener('keyup', keyUpHandler);




let stopLoadingObjectsLoop = true;
const loadingObjects = () => {
    if (!stopLoadingObjectsLoop)return;
    // console.log('---')
    // console.log(mainLoaded)
    if (mainLoaded === 5) {
        console.log('4');
        //init();

        // init environment
        Environment();

        // init player
        player();

        enemySpawner()
        setTimeout(() => {
            enemySpawner()
        }, 1400);
        setTimeout(() => {
            enemySpawner()
        }, 2400);
        setTimeout(() => {
            enemySpawner()
        }, 3400);
        stopLoadingObjectsLoop = false;
    }
    requestAnimationFrame(loadingObjects);
}

init();
animate();
loadingObjects()
