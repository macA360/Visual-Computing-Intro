Orbit = function ( object, domElement ) {
    
    this.object = object;
    this.domElement = domElement;
    
    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3();
    
    this.minDistance = 0;
    this.maxDistance = Infinity;
    
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians
    
    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians
    
    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    
    // Mouse buttons
    this.mouseButtons = {LEFT: THREE.MOUSE.ROTATE};
    
    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function () {
    
        var offset = new THREE.Vector3();
    
        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 0, 0 ) );
        var quatInverse = quat.clone().inverse();
    
        return function update() {
    
            var position = scope.object.position;
    
            offset.copy( position ).sub( scope.target );
    
            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion( quat );
    
            // angle from z-axis around y-axis
            spherical.setFromVector3( offset );
    
            if ( scope.autoRotate && state === STATE.NONE ) {
    
                rotateLeft( getAutoRotationAngle() );
    
            }

            spherical.theta += sphericalDelta.theta;
            spherical.phi += sphericalDelta.phi;

    
            // restrict theta to be between desired limits
            spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );
    
            // restrict phi to be between desired limits
            spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
    
            spherical.makeSafe();
    
    
            spherical.radius *= scale;
    
            // restrict radius to be between desired limits
            spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );
    
            offset.setFromSpherical( spherical );
    
            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion( quatInverse );
    
            position.copy( scope.target ).add( offset );
    
            scope.object.lookAt( scope.target );
        
            sphericalDelta.set( 0, 0, 0 );
    
            scale = 1;

            return false;
    
        };
    
    }();
    
    // internals
    var scope = this;
    
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };
    
    var STATE = {
        NONE: - 1,
        ROTATE: 0,

    };
    
    var state = STATE.NONE;
    
    // current position in spherical coordinates
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();
    
    var scale = 1;
    
    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();
    
    function getAutoRotationAngle() {
    
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    
    }
    
    function rotateLeft( angle ) {
    
        sphericalDelta.theta -= angle;
    
    }
    
    function rotateUp( angle ) {
    
        sphericalDelta.phi -= angle;
    
    }
    
    // event callbacks - update the object state
    function handleMouseDownRotate( event ) {
    
        rotateStart.set( event.clientX, event.clientY );
    
    }
    
    function handleMouseMoveRotate( event ) {
    
        rotateEnd.set( event.clientX, event.clientY );
    
        rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
    
        var element = scope.domElement;
    
        rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
    
        rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
    
        rotateStart.copy( rotateEnd );
    
        scope.update();
    
    }
    
    function handleMouseUp( /*event*/ ) {
    
        // no-op
    
    }
    
    // event handlers - FSM: listen for events and reset state
    function onMouseDown( event ) {
    
        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.
    
        scope.domElement.focus ? scope.domElement.focus() : window.focus();
    
        switch ( event.button ) {
    
            case 0:
    
                switch ( scope.mouseButtons.LEFT ) {
    
                    case THREE.MOUSE.ROTATE:
                        handleMouseDownRotate( event );
    
                        state = STATE.ROTATE;

                        break;
    
                    default:
    
                        state = STATE.NONE;
    
                }
    
                break;
        }
    
        if ( state !== STATE.NONE ) {
    
            document.addEventListener( 'mousemove', onMouseMove, false );
            document.addEventListener( 'mouseup', onMouseUp, false );
    
            scope.dispatchEvent( startEvent );
    
        }
    
    }
    
    function onMouseMove( event ) {
    
        event.preventDefault();
    
        switch ( state ) {
    
            case STATE.ROTATE:
    
                handleMouseMoveRotate( event );
    
                break;
    
        }
    
    }
    
    function onMouseUp( event ) {
        
        handleMouseUp( event );
    
        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
    
        scope.dispatchEvent( endEvent );
    
        state = STATE.NONE;
    
    }

    //
    scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
    
    // force an update at start
    this.update();
    
    };
    
    Orbit.prototype = Object.create( THREE.EventDispatcher.prototype );
    Orbit.prototype.constructor = Orbit;
    
    //    Orbit - left mouse
    
    THREE.MapControls = function ( object, domElement ) {
    
        Orbit.call( this, object, domElement );
        
        this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    
    };
    
    THREE.MapControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    THREE.MapControls.prototype.constructor = THREE.MapControls;
    ///* three-orbitcontrols addendum */ module.exports = exports.default = Orbit;
        