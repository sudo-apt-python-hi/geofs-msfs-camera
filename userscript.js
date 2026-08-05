// ==UserScript==
// @name         GeoFS Cinematic Camera v3
// @namespace    GeoFS
// @version      3.3.0
// @description  Lightweight cinematic follow camera for GeoFS
// @match        https://*.geo-fs.com/*
// @match        https://geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {

"use strict";


//==================================================
// SETTINGS
//==================================================

const SETTINGS = {

    enabled: true,

    // Follow camera
    baseDistance: 42,
    speedDistance: 12,

    baseHeight: 4,
    speedHeight: 2,

    sideOffset: 0,

    // Motion physics
    accelerationInfluence: 0.030,
    brakingInfluence: 0.045,
    verticalInfluence: 0.030,

// Dynamic FOV
    baseFOV: 1.40,
    maxFOVBonus: 0.20,
    fovSmoothing: 0.04,

    speedFOVWeight: 0.45,
    throttleFOVWeight: 0.20,
    gForceFOVWeight: 0.25,
    verticalFOVWeight: 0.10,
    maxDistanceBonus: 3,

    // Spring
    springStrength: 0.12,
    springDamping: 0.84,
    // Crosswind
    crosswindStrength: 2.0,// maximum sideways offset (meters)
    crosswindSmoothing: 0.03,
    maxCrosswindSpeed: 40,// m/s wind needed for full effect
    // Cinematic turn orbit
    bankOrbitStrength: 0.06,// meters per degree of bank
    yawOrbitStrength: 0.20,// extra swing during quick turns
    maxOrbit: 6,// never move farther than this
    orbitSmoothing: 0.06,
    // Rotation lag
    rotationSmoothing: 0.08,
    rollInfluence: 0.40,
    pitchInfluence: 0.25,
    yawInfluence: 0.35,
    // Rotation inertia
    rotationStrength: 0.08,
    rotationDamping: 0.92,

    pitchLagStrength: 0.06,
    rollLagStrength: 0.08,
    yawLagStrength: 0.04,
    // Landing
    landingCompression: 0.9,
    landingRebound: 0.45,
    landingThreshold: 1.5,
    gForceStrength: 0.7,
    gForceSmoothing: 0.05,
    // General smoothing
    smoothing: 0.10,

    // Debug
    debug: false
};


//==================================================
// CAMERA STATE
//==================================================

const state = {

    // spring position
    x: 0,
    y: 0,
    z: 0,

    // spring velocity
    vx: 0,
    vy: 0,
    vz: 0,

    // desired camera values

    targetDistance: SETTINGS.baseDistance,
    targetHeight: SETTINGS.baseHeight,

    gForceOffset: 0,

    fov: SETTINGS.baseFOV,
    targetFOV: SETTINGS.baseFOV,

    baseFOV: null,
    lastAppliedFOV: null,
    distanceBonus: 0,

    // smoothed camera values

    distance: SETTINGS.baseDistance,
    height: SETTINGS.baseHeight,
    // Crosswind drift
    cameraOrbit: 0,
    targetCameraOrbit: 0,
    turnOrbit: 0,
    // Rotation lag
heading: 0,
pitch: 0,
roll: 0,
    // Previous aircraft attitude
lastHeading: 0,
lastPitch: 0,
lastRoll: 0,
    // Landing
wasGrounded: true,
landingVelocity: 0,

dynamicSpringStrength: SETTINGS.springStrength,
dynamicSpringDamping: SETTINGS.springDamping,

// Inertial offsets
rotationX: 0,
rotationY: 0,
rotationZ: 0,

targetHeading: 0,
targetPitch: 0,
targetRoll: 0
};


//==================================================
// HELPERS
//==================================================

function updateCrosswind(data) {

    // Wind contribution
    const windAngle =
        (data.relativeWind || 0) * Math.PI / 180;

    const crosswind =
        Math.sin(windAngle);

    const windStrength =
        clamp(
            (data.windSpeed || 0) /
            SETTINGS.maxCrosswindSpeed,
            0,
            1
        );

    // Aircraft attitude
    const htr =
        geofs.aircraft.instance.object3d.htr;

    const bank = htr[2];

    // Heading rate
    let headingRate =
        htr[0] - state.lastHeading;

    if (headingRate > 180) headingRate -= 360;
    if (headingRate < -180) headingRate += 360;

    // Orbit contributions
    const windOrbit =
        -crosswind *
        windStrength *
        SETTINGS.crosswindStrength;

    const bankOrbit =
        bank *
        SETTINGS.bankOrbitStrength;

    const yawOrbit =
        headingRate *
        SETTINGS.yawOrbitStrength;

    state.targetCameraOrbit =
        clamp(
            windOrbit +
            bankOrbit +
            yawOrbit,
            -SETTINGS.maxOrbit,
             SETTINGS.maxOrbit
        );

    state.cameraOrbit =
        lerp(
            state.cameraOrbit,
            state.targetCameraOrbit,
            SETTINGS.orbitSmoothing
        );
}
    function updateRotationLag() {

    const htr = geofs.aircraft.instance.object3d.htr;

    const heading = htr[0];
    const pitch = htr[1];
    const roll = htr[2];

    let headingRate = heading - state.lastHeading;

    // Handle 359° -> 0° wraparound
    if (headingRate > 180) headingRate -= 360;
    if (headingRate < -180) headingRate += 360;

    const pitchRate = pitch - state.lastPitch;
    const rollRate = roll - state.lastRoll;

    state.lastHeading = heading;
    state.lastPitch = pitch;
    state.lastRoll = roll;

    state.rotationX +=
        (-rollRate * SETTINGS.rollLagStrength - state.rotationX) *
        SETTINGS.rotationStrength;

    state.rotationY +=
        (headingRate * SETTINGS.yawLagStrength - state.rotationY) *
        SETTINGS.rotationStrength;

    state.rotationZ +=
        (-pitchRate * SETTINGS.pitchLagStrength - state.rotationZ) *
        SETTINGS.rotationStrength;

    state.rotationX *= SETTINGS.rotationDamping;
    state.rotationY *= SETTINGS.rotationDamping;
    state.rotationZ *= SETTINGS.rotationDamping;
}

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}

function lerp(current, target, amount) {

    return current + (target - current) * amount;

}


//==================================================
// SPRING ENGINE
//==================================================

function updateSpring(positionKey, velocityKey, target) {

    state[velocityKey] +=
        (target - state[positionKey]) *
        state.dynamicSpringStrength;

    state[velocityKey] *=
        state.dynamicSpringDamping;

    state[positionKey] +=
        state[velocityKey];

}


//==================================================
// SPEED CAMERA
//==================================================

function updateSpeed(data) {

    const speed =
        clamp(
            (data.airspeedms - 30) / 120,
            0,
            1
        );

    const curve = speed * speed;

    state.targetDistance =
        SETTINGS.baseDistance +
        curve * SETTINGS.speedDistance +
        state.distanceBonus;

    state.targetHeight =
        SETTINGS.baseHeight +
        curve * SETTINGS.speedHeight;

    state.distance =
        lerp(
            state.distance,
            state.targetDistance,
            SETTINGS.smoothing
        );

    state.height =
        lerp(
            state.height,
            state.targetHeight,
            SETTINGS.smoothing
        );

}
function updateFOV(data) {

    // User changed FOV?
    if (
        Math.abs(
            geofs.camera.currentFOV -
            (state.lastAppliedFOV ?? state.fov)
        ) > 0.02
    ) {
        state.baseFOV = geofs.camera.currentFOV;
    }

    // --------------------------
    // Speed
    // --------------------------

    const speed =
        clamp(
            (data.airspeedms - 25) / 140,
            0,
            1
        );

    // --------------------------
    // Throttle
    // --------------------------

    const throttle =
        clamp(
            data.throttle || 0,
            0,
            1
        );

    // --------------------------
    // G Force
    // --------------------------

    const g =
        clamp(
            Math.abs(data.loadFactor - 1) / 2,
            0,
            1
        );

    // --------------------------
    // Vertical speed
    // --------------------------

    const vertical =
        clamp(
            Math.abs(
                geofs.aircraft.instance
                ?.rigidBody
                ?.velocity?.[2] || 0
            ) / 40,
            0,
            1
        );

    // --------------------------
    // Combine everything
    // --------------------------

    const energy =

        speed * SETTINGS.speedFOVWeight +

        throttle * SETTINGS.throttleFOVWeight +

        g * SETTINGS.gForceFOVWeight +

        vertical * SETTINGS.verticalFOVWeight;

    state.distanceBonus =
    lerp(
        state.distanceBonus,
        energy * SETTINGS.maxDistanceBonus,
        SETTINGS.fovSmoothing
    );

    state.targetFOV =
        state.baseFOV +
        energy *
        SETTINGS.maxFOVBonus;

    state.fov =
        lerp(
            state.fov,
            state.targetFOV,
            SETTINGS.fovSmoothing
        );

    geofs.camera.setFOV(state.fov);

    state.lastAppliedFOV = state.fov;
}
    function updateDynamicSpring(data) {

    const speed =
        clamp(
            data.airspeedms / 120,
            0,
            1
        );

    // Make the curve stronger
    const curve = speed * speed;

    state.dynamicSpringStrength =
        lerp(
            0.09,
            0.18,
            curve
        );

    state.dynamicSpringDamping =
        lerp(
            0.80,
            0.92,
            curve
        );

}


//==================================================
// AIRCRAFT MOTION
//==================================================

function updateMotion() {

    const accel =
        geofs.aircraft.instance
        ?.rigidBody
        ?.v_acceleration ||
        [0, 0, 0];

    const targetX =
        accel[1] *
        SETTINGS.accelerationInfluence;

    const targetY =
        -accel[0] *
        SETTINGS.brakingInfluence;

    const targetZ =
        accel[2] *
        SETTINGS.verticalInfluence;

    updateSpring("x", "vx", targetX);
    updateSpring("y", "vy", targetY);
    updateSpring("z", "vz", targetZ);

}
    //==================================================
// G-FORCE
//==================================================

function updateGForce(data) {

    const target =
        -(data.loadFactor - 1) *
        SETTINGS.gForceStrength;

    state.gForceOffset =
        lerp(
            state.gForceOffset,
            target,
            SETTINGS.gForceSmoothing
        );

}
    function updateLanding(data) {

    const grounded = data.groundContact;

    // Detect first frame of touchdown
    if (!state.wasGrounded && grounded) {

        const verticalSpeed =
            Math.abs(
                geofs.aircraft.instance
                ?.rigidBody
                ?.velocity?.[2] || 0
            );

        if (verticalSpeed > SETTINGS.landingThreshold) {

            state.vz -=
                verticalSpeed *
                SETTINGS.landingCompression;

        }

    }

    state.wasGrounded = grounded;

}
//==================================================
// CAMERA CONTROLLER
//==================================================

function applyCamera() {

    const follow = geofs.camera?.definitions?.follow;

    if (!follow)
        return;
    if (
    !follow.offsets ||
    !follow.offsets.current
) return;

    // Smooth distance
    follow.distance = lerp(
        follow.distance,
        state.distance,
        SETTINGS.smoothing
    );

    // Camera position

    follow.offsets.current[0] =
        state.x +
        SETTINGS.sideOffset +
        state.cameraOrbit; +
        state.rotationX;

    follow.offsets.current[1] =
        state.y +
        state.rotationY;

    follow.offsets.current[2] =
        state.height + state.z +
        state.rotationZ +
        state.gForceOffset;

}


//==================================================
// MAIN UPDATE
//==================================================

function updateCamera() {
    try {

    if (!SETTINGS.enabled)
        return;

    if (!window.geofs)
        return;

    if (!geofs.camera)
        return;

    if (!geofs.aircraft?.instance)
        return;

    if (geofs.camera.currentModeName !== "follow")
        return;

    const data = geofs.animation.values;

    if (!data)
        return;

    updateSpeed(data);

    updateFOV(data);

    updateDynamicSpring(data);

    updateRotationLag();

    updateMotion();

    updateLanding(data);

    updateCrosswind(data);

    applyCamera();

}
    catch (e) {
        console.error("Camera error:", e);
    }
}


//==================================================
// CAMERA RESET
//==================================================

function resetCamera() {

    const follow =
        geofs.camera?.definitions?.follow;

    if (!follow)
        return;

    follow.distance =
        SETTINGS.baseDistance;

    follow.offsets.current[0] = 0;
    follow.offsets.current[1] = 0;
    follow.offsets.current[2] = 0;

}


//==================================================
// STARTUP
//==================================================

function initialize() {

    console.log("GeoFS Cinematic Camera v3 loading...");

    const wait = setInterval(() => {

        if (
            window.geofs &&
            geofs.api &&
            geofs.camera?.definitions?.follow?.offsets?.current &&
            geofs.aircraft?.instance
        ) {

            clearInterval(wait);
            state.baseFOV = geofs.camera.currentFOV;
            state.fov = state.baseFOV;
            geofs.api.addFrameCallback(updateCamera);

            console.log("GeoFS Cinematic Camera v3 loaded.");

        }

    }, 500);

}

initialize();


//==================================================
// CLEANUP
//==================================================

window.addEventListener(
    "beforeunload",
    resetCamera
);

})();
