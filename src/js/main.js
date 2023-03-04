// Define the size of the aquarium
const aquariumWidth = window.innerWidth;
const aquariumHeight = window.innerHeight;
const aquarium = document.querySelector(".aquarium");

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
    this.baseSpeed = speed;
    this.speed = speed;
    this.speedLock = false;
    this.isExhausted = false;
    this.isAlive = true;

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

    this.lifeSpan = 30 + Math.random() * 40;
    setInterval(() => {
      this.lifeTime++;
      this.ageFish();
    }, 10000);

    switch (this.size) {
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
    this.fishState.innerText = this.state;
    this.fishState.className = "role-item";

    // Create img element for the fish
    this.img = document.createElement("img");
    this.img.classList.add(size);
    this.img.src = "./assets/svg/animals/" + this.svg;
    // add shadow to the fish
    this.img.style.filter = "drop-shadow(0px 0px 1px #000000)";
    this.element.appendChild(this.img);
    this.element.style.cursor = "pointer";
    this.element.className = "fish";
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
    this.roleContainer = document.createElement("div");

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
        this.die(this);
        this.isAlive = false;
      }
    } else if (this.lifeTime >= 30) {
      this.age = "elder";
      this.fishGender.innerText = this.gender + " " + this.age;
    } else if (this.lifeTime >= 15) {
      this.age = "adult";
      this.fishGender.innerText = this.gender + " " + this.age;
    } else if (this.lifeTime >= 0) {
      this.age = "baby";
      this.fishGender.innerText = this.gender + " " + this.age;
    }
  }

  resetSpeed() {
    this.speed = this.baseSpeed;
    this.speedLock = false;
  }

  die(fish) {
    console.log(fish.role + " died");
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
    if (this.role === "predator") {
      const closestFish = this.getClosestFish();
      if (
        closestFish &&
        closestFish.role === "prey" &&
        this.power > closestFish.power
      ) {
        const distance = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance < 300) {
          if (!this.isExhausted) {
            this.state = "Hunting";
            this.fishState.innerText = this.state;
          }
          this.angle = Math.atan2(
            closestFish.y - this.y,
            closestFish.x - this.x
          );
          this.angle = (this.angle * 180) / Math.PI;
        } else {
          if (!this.isExhausted) {
            this.state = "Wandering";
            this.fishState.innerText = this.state;
          }
        }
      }
    }
    // If prey is close to a predator, start running away
    if (this.role === "prey") {
      const closestFish = this.getClosestFish();
      if (
        closestFish &&
        closestFish.role === "predator" &&
        this.power < closestFish.power
      ) {
        const distance = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance < 250) {
          if (!this.isExhausted) {
            this.state = "Escaping";
            this.fishState.innerText = this.state;
          }

          this.angle = Math.atan2(
            this.y - closestFish.y,
            this.x - closestFish.x
          );
          this.angle = (this.angle * 180) / Math.PI;
        } else {
          this.state = "Wandering";
          this.fishState.innerText = this.state;
        }
      }
    }

    // If predator and prey are close, eat prey
    if (this.role === "predator") {
      const closestFish = this.getClosestFish();
      if (closestFish) {
        const distance = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance < 25) {
          this.die(closestFish);
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
      this.setSpeed(this.speed + 5, false);
      // if fish is escaping more than 5 seconds, change state to exhausted and slow down
      setTimeout(() => {
        this.state = "Exhausted";
        this.isExhausted = true;
        this.fishState.innerText = this.state;
        this.setSpeed(this.speed - 8, true);
      }, 8000);
      // if fish is exhausted more than 5 seconds, change state to wandering and reset speed
      setTimeout(() => {
        this.state = "Wandering";
        this.isExhausted = false;
        this.fishState.innerText = this.state;
        this.resetSpeed();
      }, 16000);
    }
    if (this.state === "Escaping") {
      this.setSpeed(this.speed + 5, false);
      // if fish is escaping more than 5 seconds, change state to exhausted and slow down
      setTimeout(() => {
        this.state = "Exhausted";
        this.isExhausted = true;
        this.fishState.innerText = this.state;
        this.setSpeed(this.speed - 5, true);
      }, 5000);
      // if fish is exhausted more than 5 seconds, change state to wandering and reset speed
      setTimeout(() => {
        this.state = "Wandering";
        this.isExhausted = false;
        this.fishState.innerText = this.state;
        this.resetSpeed();
      }, 10000);
    }
  }

  // If female, spawn a new fish every 10 seconds if not escaping or hunting
  spawn() {
    if (this.gender === "female" && this.state != "Escaping") {
      this.state = "Pregnant";
      this.fishState.innerText = this.state;
      setTimeout(() => {
        const _newfish = new Fish(
          "marine",
          this.svg,
          this.role,
          this.gender,
          "baby",
          15,
          "baby"
        );
        livingThings.push(_newfish);
        const baby = document.createElement("div");
        baby.className = "fish";
        const babyImg = document.createElement("img");
        babyImg.src = `./assets/svg/animals/${this.svg}`;
        babyImg.className = "baby";
        baby.appendChild(babyImg);
        aquarium.appendChild(baby);
      }, 10000);
    }
  }
}
const createAnimal = (habit, svg, role, gender, size, speed, age) => {
  const fish = new Fish(habit, svg, role, gender, size, speed, age);
  livingThings.push(fish);
};
createAnimal("marine", "clown.svg", "prey", "male", "small", 20, "baby");
createAnimal("marine", "dorito.svg", "prey", "female", "small", 25, "baby");
createAnimal("marine", "stylish.svg", "prey", "male", "small", 22, "adult");
createAnimal("marine", "classic.svg", "prey", "male", "small", 21, "adult");
createAnimal("marine", "ballon.svg", "prey", "male", "small", 26, "elder");
createAnimal("marine", "dolphin.svg", "prey", "male", "medium", 18, "elder");
createAnimal("marine", "shark.svg", "predator", "male", "baby", 28, "baby");

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
    fish.fishController();
  });
  requestAnimationFrame(update);
});

// Add random bubbles to the aquarium different sizes with correct aspect ratio
const bubbleCount = 20;
for (let i = 0; i < bubbleCount; i++) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const size = Math.random() * 40 + 20;
  bubble.style.opacity = Math.random() * 0.5 + 0.5;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";
  bubble.style.left = Math.random() * aquariumWidth + "px";
  bubble.style.top = Math.random() * aquariumHeight + "px";
  aquarium.appendChild(bubble);
}
