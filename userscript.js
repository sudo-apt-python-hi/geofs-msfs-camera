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
// GLOBAL SETTINGS
//==================================================

const SETTINGS = {

    enabled: true,
    debug: false,

    // General camera smoothing
    smoothing: 0.10,
    fovSmoothing: 0.04,
    orbitSmoothing: 0.06,
    gForceSmoothing: 0.05,

    // Dynamic FOV Weights
    speedFOVWeight: 0.45,
    throttleFOVWeight: 0.20,
    gForceFOVWeight: 0.25,
    verticalFOVWeight: 0.10,

    // Crosswind
    maxCrosswindSpeed: 40,

    // Rotation engine
    rotationStrength: 0.08,
    rotationDamping: 0.92

};


//==================================================
// PROFILE FACTORY
//==================================================

function createProfile(overrides = {}) {

    return {

        follow: {
            distance: 42,
            speedDistance: 12,

            height: 4,
            speedHeight: 2,

            sideOffset: 0,

            ...(overrides.follow || {})
        },

        motion: {
            acceleration: 0.030,
            braking: 0.045,
            vertical: 0.030,

            ...(overrides.motion || {})
        },

        fov: {
            base: 1.40,
            maxBonus: 0.20,
            maxDistanceBonus: 3,

            ...(overrides.fov || {})
        },

        spring: {
            strength: 0.12,
            damping: 0.84,

            ...(overrides.spring || {})
        },

        crosswind: {
            strength: 2.0,

            ...(overrides.crosswind || {})
        },

        orbit: {
            bank: 0.06,
            yaw: 0.20,
            max: 6,

            ...(overrides.orbit || {})
        },

        rotation: {
            pitchLag: 0.06,
            rollLag: 0.08,
            yawLag: 0.04,

            ...(overrides.rotation || {})
        },

        landing: {
            compression: 0.90,
            rebound: 0.45,
            threshold: 1.5,

            ...(overrides.landing || {})
        },

        gForce: {
            strength: 0.70,

            ...(overrides.gForce || {})
        }

    };

}


//==================================================
// AIRCRAFT PROFILES
//==================================================

const AIRCRAFT_PROFILES = {

    default: createProfile(),

    //--------------------------------------------------
    // C172, Baron, DR400, Cub...
    //--------------------------------------------------

    lightAircraft: createProfile({

        follow: {
            distance: 34,
            speedDistance: 8,
            height: 3
        },

        spring: {
            strength: 0.14,
            damping: 0.82
        }

    }),

    //--------------------------------------------------
    // A220 / A320 / 737 / CRJ / E-Jets
    //--------------------------------------------------

    narrowBody: createProfile({

        follow: {
            distance: 46,
            speedDistance: 14,
            height: 5
        },

        spring: {
            strength: 0.11,
            damping: 0.87
        }

    }),

    //--------------------------------------------------
    // 747 / 767 / 777 / 787
    // A330 / A340 / A350 / A380
    //--------------------------------------------------

    wideBody: createProfile({

        follow: {
            distance: 54,
            speedDistance: 18,
            height: 7,
            speedHeight: 4
        },

        spring: {
            strength: 0.09,
            damping: 0.91
        },

        crosswind: {
            strength: 1.5
        },

        orbit: {
            bank: 0.05,
            yaw: 0.16,
            max: 5
        }

    }),

    //--------------------------------------------------
    // Concorde
    //--------------------------------------------------

concorde: createProfile({

    follow: {
        distance: 52,
        speedDistance: 14,
        height: 7,
        speedHeight: 2
    },

    motion: {
        acceleration: 0.018,
        braking: 0.022,
        vertical: 0.016
    },

    spring: {
        strength: 0.065,
        damping: 0.92
    },

    orbit: {
        bank: 0.03,
        yaw: 0.07,
        max: 2.5
    },

    rotation: {
        pitchLag: 0.020,
        rollLag: 0.030,
        yawLag: 0.018
    },

    fov: {
        maxBonus: 0.28,
        maxDistanceBonus: 3
    },
}),

    a350: createProfile({

    follow: {
        distance: 70,
        speedDistance: 18,
        height: 7,
        speedHeight: 3
    },

    motion: {
        acceleration: 0.020,
        braking: 0.028,
        vertical: 0.018
    },

    spring: {
        strength: 0.075,
        damping: 0.93
    },

    crosswind: {
        strength: 1.3
    },

    orbit: {
        bank: 0.045,
        yaw: 0.13,
        max: 4
    },

    rotation: {
        pitchLag: 0.040,
        rollLag: 0.050,
        yawLag: 0.030
    },

    fov: {
        maxBonus: 0.20,
        maxDistanceBonus: 3
    }

}),

    b777: createProfile({

    follow: {
        distance: 65,
        speedDistance: 19,
        height: 7,
        speedHeight: 3
    },

    motion: {
        acceleration: 0.024,
        braking: 0.030,
        vertical: 0.020
    },

    spring: {
        strength: 0.080,
        damping: 0.92
    },

    crosswind: {
        strength: 1.5
    },

    orbit: {
        bank: 0.050,
        yaw: 0.15,
        max: 4.5
    },

    rotation: {
        pitchLag: 0.045,
        rollLag: 0.055,
        yawLag: 0.035
    },

    fov: {
        maxBonus: 0.22,
        maxDistanceBonus: 3.5
    }

}),

    a380: createProfile({

    follow: {
        distance: 67,
        speedDistance: 16,
        height: 8,
        speedHeight: 2
    },

    motion: {
        acceleration: 0.016,
        braking: 0.022,
        vertical: 0.014
    },

    spring: {
        strength: 0.055,
        damping: 0.94
    },

    crosswind: {
        strength: 1.2
    },

    orbit: {
        bank: 0.030,
        yaw: 0.10,
        max: 3
    },

    rotation: {
        pitchLag: 0.018,
        rollLag: 0.025,
        yawLag: 0.015
    },

    fov: {
        maxBonus: 0.18,
        maxDistanceBonus: 2.5
    }

}),

    //--------------------------------------------------
    // Fighters
    //--------------------------------------------------

    fighter: createProfile({

        follow: {
            distance: 30,
            speedDistance: 20,
            height: 2
        },

        spring: {
            strength: 0.16,
            damping: 0.80
        },

        orbit: {
            bank: 0.09,
            yaw: 0.30,
            max: 8
        },

        fov: {
            maxBonus: 0.28,
            maxDistanceBonus: 6
        }

    }),

    //--------------------------------------------------
    // Helicopters
    //--------------------------------------------------

    helicopter: createProfile({

        follow: {
            distance: 20,
            speedDistance: 4,
            height: 2
        },

        spring: {
            strength: 0.18,
            damping: 0.78
        }

    })

};


//==================================================
// ACTIVE PROFILE
//==================================================

let currentProfile = AIRCRAFT_PROFILES.default;


//==================================================
// AIRCRAFT DETECTION
//==================================================

function updateAircraftProfile() {

    const name =
        geofs.aircraft.instance.aircraftRecord?.name || "";

    if (
        /(737|A220|A318|A319|A320|A321|CRJ|E170|E175|E190|E195)/i.test(name)
    ) {

        currentProfile = AIRCRAFT_PROFILES.narrowBody;
        return;

    }
    if (/A350/i.test(name)) {
        currentProfile = AIRCRAFT_PROFILES.a350;
        return;
    }

    if (/777-300ER|777 300ER|777-300/i.test(name)) {
        currentProfile = AIRCRAFT_PROFILES.b777;
        return;
    }
    if (/A380/i.test(name)) {
        currentProfile = AIRCRAFT_PROFILES.a380;
        return;
}


    if (
        /(747|757|767|777|787|A300|A310|A330|A340|A350|A380)/i.test(name)
    ) {

        currentProfile = AIRCRAFT_PROFILES.wideBody;
        return;

    }

    if (/concorde/i.test(name)) {

        currentProfile = AIRCRAFT_PROFILES.concorde;
        return;

    }

    if (
        /(F-|MiG|Rafale|Typhoon|Gripen|SU-|F16|F18)/i.test(name)
    ) {

        currentProfile = AIRCRAFT_PROFILES.fighter;
        return;

    }

    if (
        /(Bell|UH-|EC|Helicopter|R22|R44|H125|H145)/i.test(name)
    ) {

        currentProfile = AIRCRAFT_PROFILES.helicopter;
        return;

    }

    currentProfile = AIRCRAFT_PROFILES.lightAircraft;

}


//==================================================
// CAMERA STATE
//==================================================

const state = {

    // Spring position
    x: 0,
    y: 0,
    z: 0,

    // Spring velocity
    vx: 0,
    vy: 0,
    vz: 0,

    // Camera values
    distance: currentProfile.follow.distance,
    height: currentProfile.follow.height,

    targetDistance: currentProfile.follow.distance,
    targetHeight: currentProfile.follow.height,

    // FOV
    baseFOV: null,
    fov: currentProfile.fov.base,
    targetFOV: currentProfile.fov.base,
    lastAppliedFOV: null,

    distanceBonus: 0,

    // Crosswind
    cameraOrbit: 0,
    targetCameraOrbit: 0,

    // G force
    gForceOffset: 0,

    // Aircraft attitude
    heading: 0,
    pitch: 0,
    roll: 0,

    lastHeading: 0,
    lastPitch: 0,
    lastRoll: 0,

    // Dynamic spring
    dynamicSpringStrength: currentProfile.spring.strength,
    dynamicSpringDamping: currentProfile.spring.damping,

    // Landing
    wasGrounded: true,
    landingVelocity: 0,

    // Inertial rotation
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

    const curve =
        speed * speed;


    state.targetDistance =
        currentProfile.follow.distance +
        curve *
        currentProfile.follow.speedDistance +
        state.distanceBonus;


    state.targetHeight =
        currentProfile.follow.height +
        curve *
        currentProfile.follow.speedHeight;


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


//==================================================
// DYNAMIC FOV
//==================================================

function updateFOV(data) {


    // Detect manual FOV changes
    if (
        Math.abs(
            geofs.camera.currentFOV -
            (state.lastAppliedFOV ?? state.fov)
        ) > 0.02
    ) {

        state.baseFOV =
            geofs.camera.currentFOV;

    }


    const speed =
        clamp(
            (data.airspeedms - 25) / 140,
            0,
            1
        );


    const throttle =
        clamp(
            data.throttle || 0,
            0,
            1
        );


    const g =
        clamp(
            Math.abs(data.loadFactor - 1) / 2,
            0,
            1
        );


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


    const energy =

        speed *
        SETTINGS.speedFOVWeight +

        throttle *
        SETTINGS.throttleFOVWeight +

        g *
        SETTINGS.gForceFOVWeight +

        vertical *
        SETTINGS.verticalFOVWeight;



    state.distanceBonus =
        lerp(
            state.distanceBonus,
            energy *
            currentProfile.fov.maxDistanceBonus,
            SETTINGS.fovSmoothing
        );


    state.targetFOV =

        state.baseFOV +

        energy *
        currentProfile.fov.maxBonus;



    state.fov =

        lerp(
            state.fov,
            state.targetFOV,
            SETTINGS.fovSmoothing
        );


    geofs.camera.setFOV(state.fov);


    state.lastAppliedFOV =
        state.fov;

}


//==================================================
// DYNAMIC SPRING
//==================================================

function updateDynamicSpring(data) {


    const speed =
        clamp(
            data.airspeedms / 120,
            0,
            1
        );


    const curve =
        speed * speed;


    state.dynamicSpringStrength =
        lerp(
            currentProfile.spring.strength,
            currentProfile.spring.strength * 1.25,
            curve
        );


    state.dynamicSpringDamping = clamp(
        lerp(
            currentProfile.spring.damping - 0.05,
            currentProfile.spring.damping + 0.05,
            curve
        ),
        0,
        0.995
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

        [0,0,0];


    const targetX =

        accel[1] *
        currentProfile.motion.acceleration;



    const targetY =

        -accel[0] *
        currentProfile.motion.braking;



    const targetZ =

        accel[2] *
        currentProfile.motion.vertical;



    updateSpring(
        "x",
        "vx",
        targetX
    );


    updateSpring(
        "y",
        "vy",
        targetY
    );


    updateSpring(
        "z",
        "vz",
        targetZ
    );

}


//==================================================
// G FORCE
//==================================================

function updateGForce(data) {


    const target =

        -(data.loadFactor - 1) *
        currentProfile.gForce.strength;



    state.gForceOffset =

        lerp(
            state.gForceOffset,
            target,
            SETTINGS.gForceSmoothing
        );

}


//==================================================
// LANDING
//==================================================

function updateLanding(data) {


    const grounded =
        data.groundContact;



    if (
        !state.wasGrounded &&
        grounded
    ) {


        const verticalSpeed =

            Math.abs(
                geofs.aircraft.instance
                ?.rigidBody
                ?.velocity?.[2] || 0
            );



        if (
            verticalSpeed >
            currentProfile.landing.threshold
        ) {


            state.vz -=

                verticalSpeed *
                currentProfile.landing.compression;

        }

    }


    state.wasGrounded =
        grounded;

}
//==================================================
// CAMERA CONTROLLER
//==================================================

//==================================================
// CROSSWIND / TURN ORBIT
//==================================================

function updateCrosswind(data) {


    const windAngle =

        (data.relativeWind || 0) *
        Math.PI / 180;


    const crosswind =

        Math.sin(windAngle);



    const windStrength =

        clamp(
            (data.windSpeed || 0) /
            SETTINGS.maxCrosswindSpeed,
            0,
            1
        );



    const htr =

        geofs.aircraft.instance
        .object3d
        .htr;



    const bank =
        htr[2];



    let headingRate =

        htr[0] -
        state.lastHeading;



    if (headingRate > 180)
        headingRate -= 360;


    if (headingRate < -180)
        headingRate += 360;



    const windOrbit =

        -crosswind *
        windStrength *
        currentProfile.crosswind.strength;



    const bankOrbit =

        bank *
        currentProfile.orbit.bank;



    const yawOrbit =

        headingRate *
        currentProfile.orbit.yaw;



    state.targetCameraOrbit =

        clamp(

            windOrbit +
            bankOrbit +
            yawOrbit,

            -currentProfile.orbit.max,
             currentProfile.orbit.max

        );



    state.cameraOrbit =

        lerp(

            state.cameraOrbit,

            state.targetCameraOrbit,

            SETTINGS.orbitSmoothing

        );

}



//==================================================
// ROTATION LAG
//==================================================

function updateRotationLag() {


    const htr =

        geofs.aircraft.instance
        .object3d
        .htr;



    const heading =
        htr[0];

    const pitch =
        htr[1];

    const roll =
        htr[2];



    let headingRate =

        heading -
        state.lastHeading;



    if (headingRate > 180)
        headingRate -= 360;


    if (headingRate < -180)
        headingRate += 360;



    const pitchRate =

        pitch -
        state.lastPitch;



    const rollRate =

        roll -
        state.lastRoll;



    state.lastHeading =
        heading;

    state.lastPitch =
        pitch;

    state.lastRoll =
        roll;



    state.rotationX +=

        (
            -rollRate *
            currentProfile.rotation.rollLag -

            state.rotationX

        ) *
        SETTINGS.rotationStrength;



    state.rotationY +=

        (
            headingRate *
            currentProfile.rotation.yawLag -

            state.rotationY

        ) *
        SETTINGS.rotationStrength;



    state.rotationZ +=

        (
            -pitchRate *
            currentProfile.rotation.pitchLag -

            state.rotationZ

        ) *
        SETTINGS.rotationStrength;



    state.rotationX *=
        SETTINGS.rotationDamping;

    state.rotationY *=
        SETTINGS.rotationDamping;

    state.rotationZ *=
        SETTINGS.rotationDamping;

}



//==================================================
// APPLY CAMERA
//==================================================

function applyCamera() {


    const follow =

        geofs.camera
        ?.definitions
        ?.follow;



    if (!follow)
        return;



    if (
        !follow.offsets ||
        !follow.offsets.current
    )
        return;



    follow.distance =

        lerp(

            follow.distance,

            state.distance,

            SETTINGS.smoothing

        );



    follow.offsets.current[0] =

        state.x +

        currentProfile.follow.sideOffset +

        state.cameraOrbit +

        state.rotationX;



    follow.offsets.current[1] =

        state.y +

        state.rotationY;



    follow.offsets.current[2] =

        state.height +

        state.z +

        state.rotationZ +

        state.gForceOffset;

}



//==================================================
// MAIN CAMERA UPDATE
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



        if (
            geofs.camera.currentModeName !==
            "follow"
        )
            return;



        const data =
            geofs.animation.values;



        if (!data)
            return;



        updateAircraftProfile();



        updateSpeed(data);

        updateFOV(data);

        updateDynamicSpring(data);

        updateRotationLag();

        updateMotion();

        updateGForce(data);

        updateLanding(data);

        updateCrosswind(data);

        applyCamera();



    }

    catch(e) {

        console.error(
            "GeoFS Cinematic Camera error:",
            e
        );

    }


}



//==================================================
// RESET
//==================================================

function resetCamera() {


    const follow =

        geofs.camera
        ?.definitions
        ?.follow;



    if (!follow)
        return;



    follow.distance =
        currentProfile.follow.distance;



    if (follow.offsets?.current) {


        follow.offsets.current[0] = 0;
        follow.offsets.current[1] = 0;
        follow.offsets.current[2] = 0;

    }


}



//==================================================
// STARTUP
//==================================================

function initialize() {


    console.log(
        "GeoFS Cinematic Camera loading..."
    );



    const wait =

        setInterval(() => {



            if (

                window.geofs &&

                geofs.api &&

                geofs.camera
                ?.definitions
                ?.follow
                ?.offsets
                ?.current &&

                geofs.aircraft?.instance

            ) {


                clearInterval(wait);



                state.baseFOV =

                    geofs.camera.currentFOV;



                state.fov =
                    state.baseFOV;



                geofs.api.addFrameCallback(
                    updateCamera
                );



                console.log(
                    "GeoFS Cinematic Camera loaded."
                );


            }


        },500);


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
