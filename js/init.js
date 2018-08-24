var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var FLOOR = 0;

var container;

var camera, scene;
var webglRenderer;

var zmesh, geometry;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

document.addEventListener(
    'mousemove',
    onDocumentMouseMove,
    false
);
init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        SCREEN_WIDTH / SCREEN_HEIGHT,
        1,
        100000
    );
    camera.position.z = 75;

    // Scene
    scene = new THREE.Scene();

    // Lights
    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    // More lights
    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, -70, 100).normalize();
    scene.add(directionalLight);

    // Renderer
    webglRenderer = new THREE.WebGLRenderer();
    webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    webglRenderer.domElement.style.position = 'relative';
    container.appendChild(webglRenderer.domElement);

    // Loader
    var loader = new THREE.JSONLoader(),
        callbackModel = function(geometry) {
            createScene(geometry, 90, FLOOR, -50, 105)
        };
    loader.load({
        model: 'obj/church/church.js',
        callback: callbackModel
    });
}

function createScene( geometry, x, y, z, b ) {
    zmesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
    zmesh.position.set( 0, 16, 0);
    zmesh.scale.set( 1, 1, 1 );
    scene.add( zmesh );
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    zmesh.rotation.set(-mouseY/500 + 1, -mouseX/200, 0);
    webglRenderer.render(scene, camera);
}