// Define the size of the aquarium
const aquariumWidth = window.innerWidth;
const aquariumHeight = window.innerHeight;

// Define the school of fish
const livingThings = [];

// Define the Fish class
class Fish {
  constructor(habit, svg, role, size, speed) {
    // Fish definitions
    this.habit = habit;
    this.svg = svg;
    this.role = role;
    this.size = size;
    // Randomly generate the initial position and direction of the fish
    this.x = Math.random() * aquariumWidth;
    this.y = Math.random() * aquariumHeight;
    this.angle = Math.random() * 360;

    // Set the speed and size of the fish
    this.speed = speed;
    this.screen = 40 + Math.random() * 40;

    // Create the HTML element for the fish
    this.element = document.createElement("div");
    // Display a span on top of the fish to show its role
    this.roleElement = document.createElement("span");
    this.roleElement.innerText = this.role;
    this.roleElement.className = "role";
    this.element.appendChild(this.roleElement);

    // Create img element for the fish
    this.img = document.createElement("img");
    this.img.classList.add(size);
    this.img.src = "./assets/svg/animals/" + this.svg;
    this.element.appendChild(this.img);
    this.element.className = "fish";
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;

    // Add the fish to the aquarium
    document.body.appendChild(this.element);
  }
  update() {
    // Update the position of the fish based on its current direction and speed
    const deltaX = this.speed * Math.cos((this.angle * Math.PI) / 180);
    const deltaY = this.speed * Math.sin((this.angle * Math.PI) / 180);
    const newX = this.x + deltaX;
    const newY = this.y + deltaY;
    const lerpX = lerp(this.x, newX, 0.5);
    const lerpY = lerp(this.y, newY, 0.5);
    this.x = lerpX;
    this.y = lerpY;

    // Wrap the fish around the edges of the screen if it goes out of bounds
    if (this.x < -this.screen) {
      this.x = window.innerWidth + this.screen;
    } else if (this.x > window.innerWidth + this.screen) {
      this.x = -this.screen;
    }
    if (this.y < -this.screen) {
      this.y = window.innerHeight + this.screen;
    } else if (this.y > window.innerHeight + this.screen) {
      this.y = -this.screen;
    }

    // Update the position and orientation of the fish element on the page
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
  }

  turn() {
    // Randomly change the direction of the fish
    const angleChange = Math.random() * 60 - 30;
    this.angle += angleChange;
  }
}
const createAnimal = (habit, svg, role, size, speed) => {
  const fish = new Fish(habit, svg, role, size, speed);
  livingThings.push(fish);
};
createAnimal("marine", "clown.svg", "prey", "small", 8);
createAnimal("marine", "dorito.svg", "prey", "small", 10);
createAnimal("marine", "stylish.svg", "prey", "small", 10);
createAnimal("marine", "classic.svg", "prey", "small", 8);
createAnimal("marine", "ballon.svg", "prey", "small", 8);
createAnimal("marine", "dolphin.svg", "prey", "medium", 10);

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

// Update the position and direction of each fish every frame
requestAnimationFrame(function update() {
  document.getElementById("population").innerText =
    "Fish count: " + livingThings.length;
  livingThings.forEach((fish) => {
    fish.update();
    fish.turn();
  });
  requestAnimationFrame(update);
});
