// Define the size of the aquarium
const aquarium = document.querySelector(".aquarium");
const aquariumWidth = window.innerWidth;
const aquariumHeight = window.innerHeight;

// Define the school of fish
const livingThings = [];

// Define the Fish class
class Fish {
  constructor(habit, svg, role, gender, size, speed, age) {
    // Fish definitions
    this.habit = habit;
    this.svg = svg;
    this.role = role;
    this.gender = gender;
    this.size = size;
    this.age = age;
    this.state = "Wandering";
    this.mood = "normal";
    this.baseSpeed = speed;
    this.hunger = 0;
    this.speed = speed;
    this.speedLock = false;
    this.isExhausted = false;
    this.isAlive = true;

    // Define the fish's hunger values
    this.hungerVal = Math.floor(Math.random() * 11) + 10;
    this.starvingVal = this.hungerVal + Math.floor(Math.random() * 11) + 20;
    this.deathVal = this.starvingVal + Math.floor(Math.random() * 11) + 70;

    switch (this.age) {
      case "baby":
        this.lifeTime = 0;
        break;
      case "adult":
        this.lifeTime = 15;
        break;
      case "elder":
        this.lifeTime = 30;
        break;
    }
    if (this.age != "baby") {
      this.canMate = true;
    } else {
      this.canMate = false;
    }
    this.lifeSpan = 30 + Math.random() * 40;

    switch (this.size) {
      case "baby":
        this.power = 0;
        break;
      case "small":
        this.power = 1;
        break;
      case "medium":
        this.power = 2;
        break;
      case "large":
        this.power = 3;
        break;
      default:
        this.power = 1;
    }
    // Age fish
    setInterval(() => {
      this.lifeTime++;
      this.ageFish();
    }, 10000);
    // Increase hunger every 5 seconds if not a autotroph
    if (this.power > 0) {
      setInterval(() => {
        this.hunger++;
        if (
          this.hunger == this.hungerVal &&
          this.mood != "hungry" &&
          this.mood != "starving"
        ) {
          this.mood = "hungry";
        } else if (this.hunger == this.starvingVal && this.mood != "starving") {
          this.mood = "starving";
        } else if (this.hunger == this.deathVal && this.isAlive) {
          console.log(this.svg + " died of hunger.");
          this.die(this);
        }
      }, 5000);
    }
    // Randomly generate the initial position and direction of the fish
    this.x = Math.random() * aquariumWidth;
    this.y = Math.random() * aquariumHeight;
    this.angle = Math.random() * 360;

    // Set the speed and size of the fish
    this.speed = speed;
    this.screen = 40 + Math.random() * 40;

    // Create the HTML element for the fish
    this.element = document.createElement("div");
    this.fishState = document.createElement("span");
    this.fishState.innerText = this.state + " " + this.mood;
    this.fishState.className = "role-item";

    // Create img element for the fish
    this.img = document.createElement("img");
    this.img.src = "./assets/svg/animals/" + this.svg;
    if (this.age != "baby") {
      this.img.className = this.size;
    } else {
      this.img.className = "baby";
    }
    // add shadow to the fish
    this.img.style.filter = "drop-shadow(0px 0px 1px #000000)";
    this.element.appendChild(this.img);
    this.element.style.cursor = "pointer";
    this.element.className = "fish";
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
    this.roleContainer = document.createElement("div");

    // Add a red circle around the fish when it is clicked and remove other circles from other fish
    this.element.addEventListener("click", () => {
      if (this.isAlive) {
        livingThings.forEach((fish) => {
          fish.element.style.outline = "none";
          fish.element.style.outlineOffset = "none";
          fish.element.style.cursor = "pointer";
          fish.element.style.transform = `translate(${fish.x}px, ${fish.y}px) rotate(${fish.angle}deg)`;
        });
        this.element.style.outline = "2px solid red";
        this.element.style.borderRadius = "50%";
        this.element.style.outlineOffset = "-2px";
        this.element.style.cursor = "default";
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
      }
    });

    // Create role container

    this.roleContainer.className = "role-container";

    aquarium.appendChild(this.roleContainer);
    // Display fish gender on fish but do not rotate it with the fish
    this.fishGender = document.createElement("span");
    this.fishGender.innerText = this.gender + " " + this.age;
    this.fishGender.className = "role-item";
    // Display fish role on fish but do not rotate it with the fish
    this.roleElement = document.createElement("span");
    this.roleElement.innerText = this.role + " " + this.power;
    this.roleElement.className = "role-item";
    this.roleContainer.appendChild(this.roleElement);
    this.roleContainer.appendChild(this.fishGender);
    this.roleContainer.appendChild(this.fishState);

    // Add the fish to the aquarium
    aquarium.appendChild(this.element);
  }

  setState(status) {
    this.state = status;
    this.fishState.innerText = this.state + " " + this.mood;
  }

  setSpeed(speed, bypass) {
    if (this.speedLock || !bypass) {
      return;
    }
    this.speed = speed;
    this.speedLock = true;
  }

  // Aging function
  ageFish() {
    if (this.lifeTime >= this.lifeSpan) {
      if (this.isAlive) {
        console.log(this.svg + " died of old age.");
        this.die(this);
      }
    } else if (this.lifeTime >= 30) {
      this.age = "elder";
      this.fishGender.innerText = this.gender + " " + this.age;
      this.canMate = true;
      this.img.className = this.size;
    } else if (this.lifeTime >= 15) {
      this.age = "adult";
      this.fishGender.innerText = this.gender + " " + this.age;
      this.img.className = this.size;
      this.canMate = true;
    } else if (this.lifeTime >= 0) {
      this.age = "baby";
      this.img.className = "baby";
      this.canMate = false;
      this.fishGender.innerText = this.gender + " " + this.age;
    }
  }

  resetSpeed() {
    this.speed = this.baseSpeed;
    this.speedLock = false;
  }

  die(fish) {
    deathCount++;
    fish.isAlive = false;
    const deadFish = document.createElement("div");
    deadFish.className = "fish";
    const deadFishImg = document.createElement("img");
    deadFishImg.src = "./assets/svg/env/dead.svg";
    deadFishImg.className = "small";
    deadFish.appendChild(deadFishImg);
    deadFish.style.transform = `translate(${fish.x}px, ${fish.y}px) rotate(${fish.angle}deg)`;
    aquarium.appendChild(deadFish);
    fish.element.remove();
    fish.roleContainer.remove();
    livingThings.splice(livingThings.indexOf(fish), 1);
    setTimeout(() => {
      deadFish.remove();
    }, 20000);
  }

  update() {
    // Update the position of the fish based on its current direction and speed
    const deltaX = this.speed * Math.cos((this.angle * Math.PI) / 180);
    const deltaY = this.speed * Math.sin((this.angle * Math.PI) / 180);
    const newX = this.x + deltaX;
    const newY = this.y + deltaY;
    const lerpX = lerp(this.x, newX, 0.1);
    const lerpY = lerp(this.y, newY, 0.1);
    this.x = lerpX;
    this.y = lerpY;

    // If predator is close to prey, start chasing it
    if (
      (this.age != "baby" && this.mood == "hungry") ||
      (this.mood == "starving" && this.age != "baby")
    ) {
      const closestFish = this.getClosestFish();
      if (
        closestFish &&
        this.power > closestFish.power &&
        this.svg != closestFish.svg &&
        !this.isExhausted
      ) {
        const distance = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance < 400) {
          this.setState("Hunting");
          this.angle = Math.atan2(
            closestFish.y - this.y,
            closestFish.x - this.x
          );
          this.angle = (this.angle * 180) / Math.PI;
        } else {
          if (!this.isExhausted) {
            this.setState("Wandering");
          }
        }
      }
    }
    // If prey is close to a predator, start running away
    const closestFish = this.getClosestFish();
    if (
      closestFish &&
      this.power < closestFish.power &&
      this.svg != closestFish.svg &&
      closestFish.age != "baby"
    ) {
      const distance = Math.sqrt(
        Math.pow(this.x - closestFish.x, 2) +
          Math.pow(this.y - closestFish.y, 2)
      );
      if (distance < 350) {
        if (!this.isExhausted) {
          this.setState("Escaping");
          this.angle = Math.atan2(
            this.y - closestFish.y,
            this.x - closestFish.x
          );
          this.angle = (this.angle * 180) / Math.PI;
        }
      } else {
        this.setState("Wandering");
      }
    }

    // If predator and prey are close, eat prey
    if (
      closestFish &&
      this.power > closestFish.power &&
      this.state === "Hunting"
    ) {
      const closestFish = this.getClosestFish();
      if (closestFish && closestFish.svg != this.svg) {
        const distance = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance < 55) {
          this.hunger = 0;
          this.mood = "normal";
          this.resetSpeed();
          this.die(closestFish);
          console.log(this.svg + " ate a " + closestFish.svg);
        }
      }
    }

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

    // Make role element follow the fish on top of the fish but not rotate with it
    this.roleContainer.style.transform = `translate(${this.x}px, ${this.y}px) rotate(0deg)`;

    // Update the position and orientation of the fish element on the page
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
  }

  // Get closest fish
  getClosestFish() {
    let closestFish = null;
    let closestDistance = null;
    livingThings.forEach((fish) => {
      if (fish === this) return;
      const distance = Math.sqrt(
        Math.pow(this.x - fish.x, 2) + Math.pow(this.y - fish.y, 2)
      );
      if (closestDistance === null || distance < closestDistance) {
        closestFish = fish;
        closestDistance = distance;
      }
    });
    return closestFish;
  }

  turn() {
    // Randomly change the direction of the fish smoothly over time
    const turnAngle = Math.random() * 10 - 5;
    this.angle += turnAngle;
  }

  fishController() {
    if (this.state === "Wandering") {
      this.resetSpeed();
    }
    if (this.state === "Hunting") {
      // if fish is escaping more than 5 seconds, change state to exhausted and slow down
      setTimeout(() => {
        this.setState("Exhausted");
        this.isExhausted = true;
        this.setSpeed(this.speed - 8, true);
      }, 8000);
      // if fish is exhausted for a long time, change state to wandering and reset speed
      setTimeout(() => {
        this.setState("Wandering");
        this.isExhausted = false;
        this.resetSpeed();
      }, 16000);
    }
    if (this.state === "Escaping") {
      // if fish is escaping more than 5 seconds, change state to exhausted and slow down
      setTimeout(() => {
        this.setState("Exhausted");
        this.isExhausted = true;
        this.setSpeed(this.speed - 5, true);
      }, 5000);
      // if fish is exhausted more than 5 seconds, change state to wandering and reset speed
      setTimeout(() => {
        this.setState("Wandering");
        this.isExhausted = false;
        this.resetSpeed();
      }, 10000);
    }
  }

  live() {
    this.update();
    this.turn();
    this.fishController();
  }
}
const createAnimal = (habit, svg, role, gender, size, speed, age) => {
  const fish = new Fish(habit, svg, role, gender, size, speed, age);
  livingThings.push(fish);
};
createAnimal("marine", "clown.svg", "prey", "female", "small", 20, "adult");
createAnimal("marine", "dorito.svg", "prey", "female", "small", 25, "adult");
createAnimal("marine", "dolphin.svg", "prey", "male", "medium", 30, "adult");
createAnimal("marine", "clown.svg", "prey", "male", "small", 20, "adult");
createAnimal("marine", "dorito.svg", "prey", "male", "small", 25, "adult");
createAnimal("marine", "stylish.svg", "prey", "male", "small", 22, "adult");
createAnimal("marine", "stylish.svg", "prey", "female", "small", 22, "elder");
createAnimal("marine", "classic.svg", "prey", "male", "small", 21, "adult");
createAnimal("marine", "ballon.svg", "prey", "male", "small", 26, "elder");
createAnimal("marine", "shark.svg", "predator", "male", "large", 28, "adult");
createAnimal("marine", "piranha.svg", "predator", "male", "small", 30, "baby");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 15, "adult");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 15, "adult");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 15, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 10, "adult");
createAnimal("marine", "shrimp.svg", "prey", "female", "baby", 15, "adult");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 15, "adult");
createAnimal("marine", "shrimp.svg", "prey", "male", "baby", 15, "adult");

let deathCount = 0;

function getRandomGender() {
  let gender;
  const random = Math.random();
  if (random < 0.5) {
    gender = "female";
  } else {
    gender = "male";
  }
  return gender;
}

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

// Randomly spawn shrimp every 10 seconds with a random speed and gender
setInterval(() => {
  createAnimal(
    "marine",
    "shrimp.svg",
    "prey",
    getRandomGender(),
    "baby",
    Math.random() * 10 + 5,
    "adult"
  );
  console.log("shrimp spawned");
}, 25000);
let predators;
let preys;
// Update preys and predators arrays every .5 seconds
setInterval(() => {
  predators = livingThings.filter((fish) => fish.role === "predator");
  predators = predators.length;
  preys = livingThings.filter((fish) => fish.role === "prey");
  preys = preys.length;
}, 500);

// Update the position and direction of each fish every frame

requestAnimationFrame(function update() {
  document.getElementById("living-count").innerText =
    "Prey Count: " + preys + " " + "Predator Count: " + predators;
  document.getElementById("death-count").innerText =
    "Total Deaths: " + deathCount;
  livingThings.forEach((fish) => {
    fish.live();
  });

  requestAnimationFrame(update);
});
