var parameters = {
color:   new FRAME.Parameters.Color( 'Color', 0xffffff ),
opacity: new FRAME.Parameters.Float( 'Opacity', 1, 0, 1 )
};

var renderer = resources.get( 'renderer' );

var camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
var scene = new THREE.Scene();
var mesh = new THREE.Mesh(
new THREE.PlaneGeometry( 2, 2 ),
new THREE.MeshBasicMaterial( { transparent: true } )
);
scene.add( mesh );

function start(){}

function update( progress ){

mesh.material.color.setHex( parameters.color.value );
mesh.material.opacity = parameters.opacity.value * ( 1 - progress );
renderer.render( scene, camera );

}
