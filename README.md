# Tic-Tac-Toe Premium

A modern, accessible, and responsive Tic-Tac-Toe game with a premium UI/UX.

**🚀 Live Demo:** [https://diegotalaveracampos.github.io/X-O-Tic-Tac-Toe/](https://diegotalaveracampos.github.io/X-O-Tic-Tac-Toe/)

This project showcases strong front-end development skills, including advanced UI/UX implementation, accessibility compliance (ARIA), state management, local storage persistence, and AI logic development.

---

## Key Features

### Advanced Gameplay
- **Player vs Player (PvP) and Player vs Computer (PvC) Modes:**
    - PvC offers **3 difficulty levels:** Easy, Medium, and **Hard** (implementing different levels of AI strategy).
- **Undo Functionality:** Allows players to reverse the last move.
- **Starting Player Selector (X or O):** In PvC mode, if 'O' is selected to start, the AI gracefully makes the opening move.

### Modern UI/UX & Interactivity
- **Persistable User Preferences:**
    - **Sound and Vibration controls** with settings stored locally using `localStorage`.
- **Rich Visual Feedback:**
    - Includes **Animations, Particle Effects, and Confetti** for an engaging and modern feel.

### Accessibility & Responsiveness
- **Full Keyboard Navigation:**
    - **Arrow Keys** for seamlessly navigating between cells.
    - **Enter / Space** to place a mark.
- **ARIA Accessibility:** Implements **ARIA roles and states** for screen reader compatibility.
- **Focus Management:** Meticulous focus handling, especially within modals, for an intuitive experience.
- **Responsive Design:** Ensures a flawless experience across all devices and screen sizes.

---

## Local Execution

The project is built with simple, portable HTML, CSS, and JavaScript. You can run it instantly by opening `index.html` directly in your browser or by using a local static server.

```powershell
# Using http-server (via npx)
npx http-server -p 5173 -c-1
