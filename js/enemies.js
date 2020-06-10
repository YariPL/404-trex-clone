import * as THREE from '../three.module.js';
import { scene } from './app.js';
export let enemies = [];

// to spawn enemies
export const enemySpawner = () => {

    console.log('enemy spawner')

    // enemy mesh
    let enemyG = new THREE.CubeGeometry(1, 1, 1);
    let enemyMat = new THREE.MeshBasicMaterial({ color: 0x00f000 })
    let enemy = new THREE.Mesh(enemyG, enemyMat);

    // set position
    enemy.position.set(Math.floor((Math.random() * -25) + -25), Math.floor((Math.random() * 2) + 1), 0);
    enemy.name = 'enemy';
    scene.add(enemy);

    // to move
    setInterval(() => {
        enemy.position.x += .1;
    }, Math.floor((Math.random() * .5) + 1));

    enemies.push(enemy); // push to global array to control if reach the pointer

}