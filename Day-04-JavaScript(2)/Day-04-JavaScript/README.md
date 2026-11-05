# Orbits. – Day 4: JavaScript Fundamentals & DOM Manipulation

Apex Lark Full Stack Development Internship Program

A professional single-page startup website built with plain HTML5, CSS3 and JavaScript (ES6). It presents the company's services and process, and adds theme switching, live content, event handling and client-side form validation without ever reloading the page.

**Design:** a sci-fi space HUD. A black void with a perspective grid floor, twinkling stars and drifting planetary systems on a canvas, a notched screen frame, a monospace readout panel (Quality and live FPS), and a bottom-right "Travel through planetary systems" navigation dock.

**Sections:** hero with live clock and greeting, services, process, live interaction demo, quote generator, contact form with character counter, registration form, footer.

## Live features

| Feature | What it does | Events used |
|---|---|---|
| Dark / Light theme toggle | Switches the whole site and remembers the choice | `click` |
| Digital clock and greeting | Live clock with a greeting based on the hour | timer (`setInterval`) |
| Responsive navigation menu | Side dock on desktop, pop-up "Systems" menu on tablets and phones, active link highlight | `click`, `keydown` |
| Space background and HUD | Canvas starfield, grid and planets that shift with the mouse and scroll, live FPS gauge, cursor coordinates, Simplified view switch | `mousemove`, `scroll`, `click` |
| 3D orbit scene | Tilts toward the mouse, pauses on hover, changes colour | `mousemove`, `mouseover`, `mouseleave`, `click`, `dblclick` |
| Live interaction demo | One card for each required event, plus a live event log | `click`, `dblclick`, `mouseover`, `mouseleave`, `keypress`, `input`, `submit` |
| Random quote generator | Shows a new quote each time, never the same one twice in a row | `click` |
| Contact form with character counter | Counts characters and words, meter turns amber then red, validates on send | `input`, `submit` |
| Registration form | Validates every field as you type and on submit | `input`, `blur`, `submit` |

### Form validation rules
- **Full name:** required, letters only, at least 3 characters
- **Email:** required, valid format
- **Phone:** required, 10 digits starting with 6–9 (optional `+91` or `0` prefix)
- **Password:** required, at least 8 characters, with a strength meter
- **Confirm password:** required, must match the password

## JavaScript concepts demonstrated
- **Variables:** `const` and `let`, block scope, `'use strict'`
- **Data types and operators:** strings, numbers, booleans, template literals, arithmetic, comparison and logical operators
- **Functions:** arrow functions, default parameters, functions returning values, small single-purpose modules
- **Arrays:** `quotes` and `events` arrays, `push`/`unshift`/`pop`, `map`, `filter`, `every`, `find`, `forEach`, spread syntax
- **Objects:** `state`, `validators`, quote objects, object destructuring-style access, `Object.keys`
- **Loops:** `for...of` (event log), `do...while` (random quote), array iteration methods
- **Conditionals:** `if`/`else`, ternary operator, early returns
- **DOM manipulation:** `querySelector`, `createElement`, `textContent`, `innerHTML`, `classList.add/remove/toggle`, `style.setProperty`, `dataset`, `hidden`, ARIA attributes
- **Events:** listeners for all required events, `preventDefault()` on submit, `IntersectionObserver` for the active nav link

## Project structure
```
Day-04-JavaScript/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## Setup and run
1. Clone the repository: `git clone <your-repo-link>`
2. Open the `Day-04-JavaScript` folder in Visual Studio Code.
3. Open `index.html` in Google Chrome. Or use the Live Server extension, then choose "Open with Live Server".
4. No build step or installation is needed.

## Try it
1. Click **Light mode** in the header to switch themes.
2. Hover over the planet, then double-click it to change the colour.
3. In **See the interactions live**, interact with each card and watch the log.
4. Press **New quote** several times.
5. In **Tell us about your project**, type until the meter turns red at 200 characters, then send.
6. Submit the empty registration form to see every error, then fill it in correctly.

## Screenshots
Add your screenshots to `assets/images/` and update the file names below.

| Dark theme (desktop) | Light theme (desktop) |
|---|---|
| ![Dark desktop](assets/images/dark-desktop.png) | ![Light desktop](assets/images/light-desktop.png) |

| Form validation errors | Mobile menu |
|---|---|
| ![Validation](assets/images/validation.png) | ![Mobile](assets/images/mobile-menu.png) |

## Tools used
Visual Studio Code · HTML5 · CSS3 · JavaScript (ES6) · Google Chrome · Git and GitHub
