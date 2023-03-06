// Define the size of the aquarium
const aquarium = document.querySelector(".aquarium");
const aquariumWidth = window.innerWidth;
const aquariumHeight = window.innerHeight;

const infoBox = document.getElementById("info-box");
const hideInfo = document.getElementById("hide");

let updateInfo;

// Define the school of fish
const livingThings = [];

const goodGenePool = [
  "healthy",
  "normal",
  "slow metabolism",
  "slow aging",
  "good eyesight",
  "agile",
];
const badGenePool = [
  "sick",
  "albino",
  "fast metabolism",
  "fast aging",
  "bad eyesight",
  "bulky",
];

let shrimpSpawnRate = 2500;
// Define the Fish class
class Fish {
  constructor(svg, role, gender, size, speed, age) {
    // Fish definitions
    this.svg = svg;
    this.role = role;
    this.gender = gender;
    this.intervals = [];
    this.isSelected = false;
    this.selectedGenes = [];

    const goodGeneIndex = Math.floor(Math.random() * goodGenePool.length);
    let badGeneIndex;
    do {
      badGeneIndex = Math.floor(Math.random() * badGenePool.length);
    } while (badGeneIndex === goodGeneIndex);
    this.selectedGenes.push(goodGenePool[goodGeneIndex]);
    this.selectedGenes.push(badGenePool[badGeneIndex]);

    this.size = size;
    this.age = age;
    this.state = "Wandering";
    this.mood = "healthy";
    this.baseSpeed = speed;
    this.hunger = 0;
    this.speed = speed;
    this.speedLock = false;
    this.isExhausted = false;
    this.isAlive = true;
    this.agingFactor = 10000;
    this.hungerFactor = 2500;
    this.eyeSigth = 300;
    this.stamina = 5000;

    // Create the HTML element for the fish
    this.element = document.createElement("div");
    this.img = document.createElement("img");
    this.roleContainer = document.createElement("div");
    this.fishGender = document.createElement("span");

    // apply random % filter to the fish but not more than 60%
    this.img.style.filter = `grayscale(${Math.floor(Math.random() * 60)}%)`;

    // Set fish properties based on selectedGenes
    this.selectedGenes.forEach((gene) => {
      let randomEyeSightVal = Math.floor(Math.random() * 51) + 50;
      let randomStaminaVal = Math.floor(Math.random() * 4001) + 1000;
      switch (gene) {
        case "healthy":
          this.speed = speed;
          this.mood = "healthy";
          this.baseSpeed = this.speed;
          break;
        case "sick":
          this.speed = this.speed - 5;
          this.mood = "sick";
          this.baseSpeed = this.speed;
          break;
        case "albino":
          this.img.style.filter = "grayscale(100%)";
          break;
        case "fast metabolism":
          this.hungerFactor = this.hungerFactor - 1500;
          break;
        case "slow aging":
          this.agingFactor = this.agingFactor + 2500;
          break;
        case "slow metabolism":
          this.hungerFactor = this.hungerFactor + 1500;
          break;
        case "fast aging":
          this.agingFactor = this.agingFactor - 2500;
          break;
        case "bad eyesight":
          this.eyeSigth = this.eyeSigth - randomEyeSightVal;
          break;
        case "good eyesight":
          this.eyeSigth = this.eyeSigth + randomEyeSightVal;
          break;
        case "bulky":
          this.stamina = this.stamina - randomStaminaVal;
          break;
        case "agile":
          this.stamina = this.stamina + randomStaminaVal;
          break;
      }
    });
    if (this.age != "baby") {
      this.canMate = true;
    } else {
      this.canMate = false;
    }
    this.lifeSpan = 30 + Math.random() * 40;

    // Create the HTML element for the fish role
    this.roleElement = document.createElement("span");
    this.roleElement.className = "role-item";

    switch (this.age) {
      case "baby":
        this.setPower(true);
        this.lifeTime = 0;
        break;
      case "adult":
        this.setPower(false);
        this.lifeTime = 15;
        break;
      case "elder":
        this.setPower(false);
        this.lifeTime = 30;
        break;
    }

    // Age fish
    this.agingInterval = setInterval(() => {
      this.lifeTime++;
      this.ageFish();
    }, this.agingFactor);

    // Define the fish's hunger values
    this.hungerVal = Math.floor(Math.random() * 11) + 20;
    this.starvingVal = this.hungerVal + Math.floor(Math.random() * 11) + 30;
    this.deathVal = this.starvingVal + Math.floor(Math.random() * 11) + 70;
    this.intervals.push(this.agingInterval);

    // Increase hunger every 5 seconds if not a autotroph
    if (this.power > 0) {
      this.hungerInterval = setInterval(() => {
        this.hunger++;
        this.setMood();
        if (this.hunger > this.deathVal) {
          this.die(this);
          console.log(this.svg + "died of hunger");
        }
      }, this.hungerFactor);
      this.intervals.push(this.hungerInterval);
    }
    // Randomly generate the initial position and direction of the fish
    this.x = Math.random() * aquariumWidth;
    this.y = Math.random() * aquariumHeight;
    this.angle = Math.random() * 360;

    // Set the speed and size of the fish
    this.speed = speed;
    this.screen = 40 + Math.random() * 40;

    // Create the HTML element for the fish

    this.fishState = document.createElement("span");
    this.fishState.innerText = this.state + " " + this.mood;
    this.fishState.className = "role-item";

    // Create img element for the fish

    this.img.src = "./assets/svg/animals/" + this.svg;
    if (this.age != "baby") {
      this.img.className = this.size;
    } else {
      this.img.className = "baby";
    }
    // add shadow to the fish
    this.element.appendChild(this.img);
    this.element.style.cursor = "pointer";
    this.element.className = "fish";
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;

    // Add a red circle around the fish when it is clicked and remove other circles from other fish
    this.element.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.isAlive) {
        infoBox.style.display = "flex";
        clearInterval(updateInfo);
        updateFishInfo(this);
        livingThings.forEach((fish) => {
          fish.isSelected = false;
          fish.element.style.outline = "none";
          fish.element.style.outlineOffset = "none";
          fish.element.style.cursor = "pointer";
          fish.element.style.transform = `translate(${fish.x}px, ${fish.y}px) rotate(${fish.angle}deg)`;
        });
        this.isSelected = true;
        this.element.style.outline = "2px solid red";
        this.element.style.borderRadius = "50%";
        this.element.style.outlineOffset = "-2px";
        this.element.style.cursor = "default";
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
      }
    });
    // If clicked to the aquarium, remove the red circle around the fish
    aquarium.addEventListener("click", () => {
      infoBox.style.display = "none";
      livingThings.forEach((fish) => {
        fish.isSelected = false;
        fish.element.style.outline = "none";
        fish.element.style.outlineOffset = "none";
        fish.element.style.cursor = "pointer";
        fish.element.style.transform = `translate(${fish.x}px, ${fish.y}px) rotate(${fish.angle}deg)`;
      });
    });

    // Create role container

    this.roleContainer.className = "role-container";

    aquarium.appendChild(this.roleContainer);
    // Display fish gender on fish but do not rotate it with the fish

    this.fishGender.innerText = this.gender + " " + this.age;
    this.fishGender.className = "role-item";
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
      this.setPower();
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
    if (fish.isSelected) {
      infoBox.style.display = "none";
    }

    fish.intervals.forEach((interval) => {
      clearInterval(interval);
    });
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
    fish.setSpeed(0, true);
  }
  setPower(override) {
    switch (this.size) {
      case "tiny":
        this.power = 0;
        this.nutritivity = 5;
        break;
      case "baby":
        this.power = 1;
        this.nutritivity = 8;
        break;
      case "small":
        this.nutritivity = 35;
        this.power = 2;
        break;
      case "medium":
        this.nutritivity = 70;
        this.power = 3;
        break;
      case "large":
        this.nutritivity = 80;
        this.power = 4;
        break;
    }
    if (override) {
      this.power = 1;
      this.nutritivity = 8;
    }
    this.roleElement.innerText = this.role + " " + this.power;
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
    if (this.mood == "hungry" || this.mood == "starving") {
      const closestFish = this.getClosestFish();
      if (
        closestFish &&
        this.power > closestFish.power &&
        !this.isExhausted &&
        this.svg != closestFish.svg
      ) {
        const distance1 = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );

        if (distance1 < this.eyeSigth) {
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
      const distance2 = Math.sqrt(
        Math.pow(this.x - closestFish.x, 2) +
          Math.pow(this.y - closestFish.y, 2)
      );
      if (distance2 < this.eyeSigth) {
        if (!this.isExhausted) {
          this.setState("Escaping");
        }
        this.angle = Math.atan2(this.y - closestFish.y, this.x - closestFish.x);
        this.angle = (this.angle * 180) / Math.PI;
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
      if (closestFish && this.svg != closestFish.svg) {
        const distance3 = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance3 < 50) {
          this.hunger -= closestFish.nutritivity;
          // If selectedGenes has sick gene, set mood to sick otherwise set to healthy
          this.setMood();
          this.setState("Wandering");
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

  // Set mood
  setMood() {
    let defaultMood;
    if (this.selectedGenes.includes("sick")) {
      defaultMood = "sick";
    } else {
      defaultMood = "healthy";
    }
    if (this.hunger > this.hungerVal) {
      this.mood = "hungry";
    }
    if (this.hunger > this.starvingVal) {
      this.mood = "starving";
    }
    if (this.hunger < this.hungerVal) {
      this.mood = defaultMood;
    }
    this.fishState.innerText = this.state + " " + this.mood;
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
    if (this.state == "Wandering") {
      this.resetSpeed();
    }
    if (this.state == "Hunting") {
      // if fish is escaping for a long time, change state to exhausted and slow down
      setTimeout(() => {
        this.setState("Exhausted");
        this.isExhausted = true;
        this.setSpeed(this.speed - 8, true);
      }, this.stamina + 2000);
      // if fish is exhausted for a long time, change state to wandering and reset speed
      setTimeout(() => {
        this.setState("Wandering");
        this.isExhausted = false;
        this.resetSpeed();
      }, this.stamina + 8000);
    }
    if (this.state == "Escaping") {
      // if fish is escaping for a long time, change state to exhausted and slow down
      setTimeout(() => {
        this.setState("Exhausted");
        this.isExhausted = true;
        this.setSpeed(this.speed - 5, true);
      }, this.stamina);
      // if fish is exhausted for a long time, change state to wandering and reset speed
      setTimeout(() => {
        this.setState("Wandering");
        this.isExhausted = false;
        this.resetSpeed();
      }, this.stamina + 5000);
    }
  }

  live() {
    this.update();
    this.turn();
    this.fishController();
  }
}
const createAnimal = (svg, role, gender, size, speed, age) => {
  const fish = new Fish(svg, role, gender, size, speed, age);
  livingThings.push(fish);
};
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
// Instantiate elements for infos
const genInfo = document.getElementById("genes");
const ageInfo = document.getElementById("age");
const hungerInfo = document.getElementById("hunger");
const speedInfo = document.getElementById("speed");

hideInfo.addEventListener("click", () => {
  infoBox.style.display = "none";
  clearInterval(updateInfo);
});
const updateFishInfo = (fish) => {
  let canStarve = true;
  if (fish.power == 0) {
    canStarve = false;
  }
  // Create interval to update info
  updateInfo = setInterval(() => {
    genInfo.innerHTML = "Genes: " + fish.selectedGenes;
    ageInfo.innerHTML = "Age: " + fish.lifeTime;
    if (!canStarve) {
      hungerInfo.innerHTML =
        "Hunger: " + fish.hunger + " (shrimps eat dead plants)";
    } else {
      hungerInfo.innerHTML = "Hunger: " + fish.hunger;
    }
    speedInfo.innerHTML = "Speed: " + fish.speed;
  }, 100);
};

createAnimal(
  "shark.svg",
  "predator",
  getRandomGender(),
  "large",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);

createAnimal(
  "clown.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "adult"
);
createAnimal(
  "dolphin.svg",
  "prey",
  getRandomGender(),
  "medium",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);
createAnimal(
  "clown.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);
createAnimal(
  "dorito.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "adult"
);
createAnimal(
  "stylish.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "adult"
);
createAnimal(
  "stylish.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);
createAnimal(
  "ballon.svg",
  "prey",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "elder"
);
createAnimal(
  "shark.svg",
  "predator",
  getRandomGender(),
  "large",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);
createAnimal(
  "piranha.svg",
  "predator",
  getRandomGender(),
  "small",
  Math.floor(Math.random() * 11) + 20,
  "baby"
);

let deathCount = 0;

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

// Randomly spawn shrimp every 10 seconds with a random speed and gender
setInterval(() => {
  createAnimal(
    "shrimp.svg",
    "prey",
    getRandomGender(),
    "tiny",
    Math.floor(Math.random() * 11) + 10,
    "adult"
  );
}, shrimpSpawnRate);
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
  document.getElementById("dead-count").innerText =
    "Total Deaths: " + deathCount;
  livingThings.forEach((fish) => {
    fish.live();
  });

  requestAnimationFrame(update);
});
