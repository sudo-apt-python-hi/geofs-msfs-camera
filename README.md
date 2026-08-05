# GeoFS Cinematic Camera

A lightweight cinematic follow camera for **GeoFS** that transforms the standard Follow Camera into a smooth, dynamic chase camera inspired by modern flight simulators such as Microsoft Flight Simulator and X-Plane.

Designed to feel like the aircraft is being filmed by a helicopter or drone rather than having a camera rigidly attached to it.

---

# Features

## 🎥 Spring-Based Camera Physics

A physics-driven spring system gives the camera realistic weight and inertia, creating smooth, natural movement instead of rigid tracking.

## ✈️ Dynamic Camera Distance

The camera automatically moves farther away as the aircraft gains speed or performs energetic maneuvers, enhancing the sensation of speed and scale.

## 🔍 Dynamic Cinematic FOV

The field of view smoothly adjusts based on the aircraft's energy (speed, throttle, G-forces, and vertical speed), making takeoffs, climbs, turns, and landings feel more dramatic while still respecting your preferred GeoFS FOV.

## 🌬️ Crosswind Camera Drift

The camera subtly drifts with crosswinds, giving the impression that it's flying through the same air as the aircraft instead of remaining perfectly fixed behind it.

## 🌀 Cinematic Turn Orbit

During turns, the camera naturally swings to the outside of the aircraft based on bank angle and turn rate, creating smooth airshow-style chase shots.

## 🛫 G-Force Camera Response

High G maneuvers gently compress and extend the camera, adding a sense of momentum and aircraft weight.

## 🛬 Landing Impact Simulation

Firm landings generate a subtle camera compression and rebound, giving touchdowns a satisfying sense of impact.

## ⚙️ Rotation Inertia

Heading, pitch, and roll changes are smoothed with rotational inertia, making the camera behave like a stabilized camera rig rather than instantly matching every aircraft movement.

## 🌪️ Dynamic Spring Physics

The camera spring automatically becomes tighter at higher speeds, improving stability during cruise while remaining smooth during taxi and low-speed flight.

## 🪶 Lightweight & Optimized

Runs efficiently using GeoFS frame callbacks with minimal performance impact.

## 🔄 Follow Camera Integration

Works seamlessly with GeoFS's built-in **Follow Camera** mode without replacing the simulator's existing camera system.

---

# WARNING

Currently optimized for the **Boeing 737-700**.

Some other aircrafts, like the **Concorde** are functional, but may exhibit spring movement until aircraft-specific tuning is added.

Using other aircraft may result in incorrect camera positioning or unexpected behavior, as camera tuning has only been calibrated for the 737-700.

---

# Installation

There are two ways to use the script.

## Method 1 — Tampermonkey (Recommended)

1. Install the **Tampermonkey** browser extension.
2. Create a new userscript.
3. Delete the default template.
4. Copy the contents of the latest `GeoFS Cinematic Camera` script.
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

The camera will automatically respond to:

* Airspeed
* Throttle
* Crosswinds
* Bank angle
* Turn rate
* G-forces
* Vertical speed
* Landings

No additional setup or configuration is required.

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

* When the crosswind direction rapidly changes from one side of the aircraft to the other, the camera may briefly spring sideways before settling.
* Camera tuning is currently optimized for the Boeing 737-700 and may require adjustment for other aircraft.

---

# Roadmap

Planned future improvements include:

* Additional aircraft support
* Custom camera presets
* User-configurable settings menu
* Improved horizon stabilization
* Optional cinematic camera modes
* Camera shake profiles for different aircraft

---

# Contributing

Contributions, suggestions, bug reports, and feature requests are always welcome!

Feel free to open an Issue or submit a Pull Request.

---

# Disclaimer

GeoFS Cinematic Camera is an unofficial community add-on for GeoFS.

This project is not affiliated with, endorsed by, or associated with the GeoFS developers.
