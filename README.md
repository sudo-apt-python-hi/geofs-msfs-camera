# GeoFS Cinematic Camera v4.0.0 BETA

A lightweight cinematic follow camera for **GeoFS** that transforms the standard Follow Camera into a smooth, dynamic chase camera inspired by modern flight simulators such as Microsoft Flight Simulator and X-Plane.

Designed to make the camera feel like it's being flown by a helicopter or drone rather than being rigidly attached to the aircraft.

---

# Features

## 🎥 Spring-Based Camera Physics

A physics-driven spring system gives the camera realistic weight and inertia, creating smooth, natural movement instead of rigid tracking.

## ✈️ Dynamic Camera Distance

The camera automatically adjusts its distance based on aircraft speed and energy, making fast aircraft feel faster while keeping slower aircraft closer and more immersive.

## 🔍 Dynamic Cinematic FOV

The field of view smoothly changes based on speed, throttle, G-forces, and vertical motion while still respecting your preferred GeoFS FOV.

## 🌬️ Crosswind Camera Drift

The camera subtly drifts with crosswinds, giving the impression that it's flying through the same air as the aircraft instead of remaining perfectly fixed behind it.

## 🌀 Cinematic Turn Orbit

During turns, the camera naturally swings to the outside of the aircraft based on bank angle and turn rate, creating smooth airshow-style chase shots.

## 🛫 G-Force Camera Response

High G maneuvers gently compress and extend the camera, adding a sense of momentum and aircraft weight.

## 🛬 Landing Impact Simulation

Firm landings generate a subtle camera compression and rebound, giving touchdowns a satisfying sense of impact.

## ⚙️ Rotation Inertia

Heading, pitch, and roll changes are smoothed with rotational inertia, making the camera behave like a stabilized camera rig instead of instantly matching every aircraft movement.

## 🌪️ Dynamic Spring Physics

The camera spring automatically adapts with speed, remaining responsive during taxi and low-speed flight while becoming more stable at cruise speeds.

## ✈️ Aircraft-Specific Camera Profiles (NEW)

The camera now automatically detects supported aircraft and applies custom tuning designed specifically for each one.

Current supported aircraft profiles:

* ✅ Boeing 737-700
* ✅ Concorde
* ✅ Airbus A350
* ✅ Boeing 777-300ER
* ✅ Airbus A380
NOT YET ADDED:
* Generic Light Aircraft
* Generic Fighters
* Generic Helicopters
* Generic Widebody Airliners
* Generic Narrowbody Airliners

Each profile has individually tuned values for camera distance, spring behavior, inertia, orbit, FOV, motion response, and crosswind effects to better match the character of each aircraft.

## 🪶 Lightweight & Optimized

Runs efficiently using GeoFS frame callbacks with minimal performance impact.

## 🔄 Seamless Follow Camera Integration

Works directly with GeoFS's built-in **Follow Camera** mode without replacing or modifying the simulator's camera system.

---

# Tweaking Camera Values

Every aircraft profile can be customized by editing its values inside the script.

Each profile contains sections such as:

* **follow** — Camera distance, height, and speed scaling
* **motion** — Camera movement from acceleration, braking, and vertical motion
* **spring** — Camera stiffness and damping
* **crosswind** — Crosswind camera drift strength
* **orbit** — Banking and turning behavior
* **rotation** — Rotational inertia
* **fov** — Dynamic FOV and distance expansion
* **landing** — Landing compression and rebound
* **gForce** — Camera movement from aircraft G-loading

Feel free to experiment with the numbers to create your own camera style. Small changes (around 0.01–0.03) can noticeably affect how the camera behaves, so it's usually best to adjust values gradually.

---

# Installation

There are two ways to use the script.

## Method 1 — Tampermonkey (Recommended)

1. Install the **Tampermonkey** browser extension.
2. Create a new userscript.
3. Delete the default template.
4. Copy the latest `GeoFS Cinematic Camera` script.
5. Paste it into the new userscript.
6. Save the script (`Ctrl + S`).
7. Open or reload GeoFS.

The cinematic camera automatically activates whenever **Follow Camera** is selected.

---

## Method 2 — Browser Console

Useful if you don't want to install Tampermonkey.

1. Open GeoFS.
2. Wait until the simulator has fully loaded.
3. Press **F12** to open Developer Tools.
4. Open the **Console** tab.
5. Copy the script.
6. Paste it into the console.
7. Press **Enter**.

The script remains active until the page is refreshed.

---

# Usage

1. Start a flight in GeoFS.
2. Switch to **Follow Camera**.
3. Fly normally.

The camera automatically responds to:

* Airspeed
* Throttle
* Crosswinds
* Bank angle
* Turn rate
* G-forces
* Vertical speed
* Landing impacts
* Aircraft type

No additional setup is required.

---

# Updating

If you're using Tampermonkey:

1. Replace your existing userscript with the latest version from this repository.
2. Save the script.
3. Reload GeoFS.

If you're using the browser console, simply paste the newest version again after refreshing the page.

---

# Compatibility

* ✅ GeoFS
* ✅ Google Chrome
* ✅ Microsoft Edge
* ✅ Other Chromium-based browsers
* ⚠️ Firefox should work but has not been fully tested.

---

# Known Issues

* Aircraft profile tuning is still being refined and may continue to improve between releases.
* Some community aircraft may fall back to a generic aircraft profile if no dedicated profile exists.
* Camera behavior may vary slightly as GeoFS physics continue to evolve.

---

# Roadmap

Planned future improvements include:

* More aircraft-specific camera profiles
* User-configurable settings menu
* Optional camera presets
* Improved horizon stabilization
* Additional cinematic camera modes
* Per-aircraft camera customization
* Easier profile editing without modifying the source code

---

# Contributing

Contributions, suggestions, bug reports, and feature requests are always welcome!

Feel free to open an Issue or submit a Pull Request.

---

# Disclaimer

GeoFS Cinematic Camera is an unofficial community add-on for GeoFS.

This project is not affiliated with, endorsed by, or associated with the GeoFS developers.
