// Define the size of the aquarium
const aquarium = document.querySelector(".aquarium");
const aquariumWidth = window.innerWidth;
const aquariumHeight = window.innerHeight;

const infoBox = document.getElementById("info-box");
const hideInfo = document.getElementById("hide");
const roleContainerHider = document.getElementById("roleContainerHider");

let updateInfo;
let isHidden = false;

// Define the school of fish
const livingThings = [];

const goodGenePool = [
  "healthy",
  "normal",
  "slow metabolism",
  "slow aging",
  "good vision",
  "agile",
];
const badGenePool = [
  "sick",
  "albino",
  "fast metabolism",
  "fast aging",
  "bad vision",
  "bulky",
];

let shrimpSpawnRate = 1000;
// Define the Fish class
class Fish {
  constructor(svg, role, gender, size, speed, age, goodGenes, badGenes) {
    // Fish definitions
    this.svg = svg;
    this.role = role;
    this.gender = gender;
    this.intervals = [];
    this.isSelected = false;
    this.selectedGenes = [];
    this.goodGenePool = goodGenes;
    this.badGenePool = badGenes;
    this.species = this.svg.split(".")[0];

    // Select random genes from the gene pool

    const goodGeneIndex = Math.floor(Math.random() * this.goodGenePool.length);
    let badGeneIndex;
    do {
      badGeneIndex = Math.floor(Math.random() * this.badGenePool.length);
    } while (badGeneIndex === goodGeneIndex);
    this.selectedGenes.push(this.goodGenePool[goodGeneIndex]);
    this.selectedGenes.push(this.badGenePool[badGeneIndex]);

    if (speed < 5) {
      speed = speed + (Math.floor(Math.random() * 6) + 5);
    }

    this.size = size;
    this.age = age;
    this.state = "Wandering";
    this.mood = "healthy";
    this.baseSpeed = speed;
    this.isPregnant = false;
    this.hunger = 0;
    this.speed = speed;
    this.speedLock = false;
    this.breedLock = false;
    this.isExhausted = false;
    this.isAlive = true;
    this.agingFactor = 2500;
    this.hungerFactor = 1250;
    this.eyeSigth = 300;
    this.stamina = 200 + Math.floor(Math.random() * 11) + 10;
    this.maxStamina = this.stamina;
    this.canBreed = false;

    // Create the HTML element for the fish
    this.element = document.createElement("div");
    this.img = document.createElement("img");
    this.roleContainer = document.createElement("div");
    this.fishGender = document.createElement("span");

    // apply random % filter to the fish but not more than 60%
    this.img.style.filter = `grayscale(${Math.floor(Math.random() * 60)}%)`;

    // Set fish properties based on selectedGenes
    this.selectedGenes.forEach((gene) => {
      let randomEyeSigthVal = Math.floor(Math.random() * 51) + 50;
      let randomStaminaVal = Math.floor(Math.random() * 11) + 10;
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
          this.img.style.filter = "brightness(0.35) invert(1)";
          break;
        case "fast metabolism":
          this.hungerFactor = this.hungerFactor - 750;
          break;
        case "slow aging":
          this.agingFactor = this.agingFactor + 750;
          break;
        case "slow metabolism":
          this.hungerFactor = this.hungerFactor + 750;
          break;
        case "fast aging":
          this.agingFactor = this.agingFactor - 750;
          break;
        case "bad vision":
          this.eyeSigth = this.eyeSigth - randomEyeSigthVal;
          break;
        case "good vision":
          this.eyeSigth = this.eyeSigth + randomEyeSigthVal;
          break;
        case "bulky":
          this.stamina = this.stamina - randomStaminaVal;
          this.maxStamina = this.maxStamina - randomStaminaVal;
          break;
        case "agile":
          this.stamina = this.stamina + randomStaminaVal;
          this.maxStamina = this.maxStamina + randomStaminaVal;
          break;
      }
    });
    this.lifeSpan = 30 + Math.random() * 40;

    // Create the HTML element for the fish role
    this.roleElement = document.createElement("span");
    this.roleElement.className = "role-item";

    switch (this.age) {
      case "baby":
        this.setPower(true);
        this.canBreed = false;
        this.lifeTime = 1;
        break;
      case "adult":
        this.setPower(false);
        this.canBreed = true;
        this.lifeTime = 15;
        break;
      case "elder":
        this.setPower(false);
        this.canBreed = true;
        this.lifeTime = 30;
        break;
    }

    // Age fish
    this.agingInterval = setInterval(() => {
      this.lifeTime++;
      this.ageFish();
    }, this.agingFactor);

    // Define the fish's hunger values
    this.hungerVal = Math.floor(Math.random() * 11) + 40;
    this.starvingVal = this.hungerVal + Math.floor(Math.random() * 11) + 10;
    this.deathVal = this.starvingVal + Math.floor(Math.random() * 11) + 30;
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
        if (isHidden) {
          this.roleContainer.style.display = "flex";
        }
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
      if (isHidden) {
        this.roleContainer.style.display = "none";
      }
      this.isSelected = false;
      this.element.style.outline = "none";
      this.element.style.outlineOffset = "none";
      this.element.style.cursor = "pointer";
      this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.angle}deg)`;
    });

    // Create role container

    this.roleContainer.className = "role-container";
    if (!isHidden) {
      this.roleContainer.style.display = "flex";
    } else {
      this.roleContainer.style.display = "none";
    }

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
      this.canBreed = true;
      this.fishGender.innerText = this.gender + " " + this.age;
      this.img.className = this.size;
    } else if (this.lifeTime >= 15) {
      this.age = "adult";
      this.canBreed = true;
      this.fishGender.innerText = this.gender + " " + this.age;
      this.img.className = this.size;
      this.setPower();
    } else if (this.lifeTime >= 0) {
      this.age = "baby";
      this.canBreed = false;
      this.img.className = "baby";
      this.fishGender.innerText = this.gender + " " + this.age;
    }
  }

  resetSpeed() {
    this.speed = this.baseSpeed;
    this.speedLock = false;
  }

  die(fish) {
    let deathSize;
    if (fish.age == "baby") {
      deathSize = "baby";
    } else {
      deathSize = fish.size;
    }

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
    deadFishImg.className = deathSize + " dead";
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
        this.nutritivity = 25;
        break;
      case "baby":
        this.power = 1;
        this.nutritivity = 30;
        break;
      case "small":
        this.nutritivity = 45;
        this.power = 2;
        break;
      case "medium":
        this.nutritivity = 55;
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

    const closestFish = this.getClosestFish();
    // If predator is close to prey, start chasing it
    if (this.mood == "hungry" || this.mood == "starving") {
      if (
        closestFish &&
        this.power > closestFish.power &&
        this.svg != closestFish.svg
      ) {
        const distance1 = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );

        if (distance1 < this.eyeSigth) {
          if (!this.isExhausted) {
            this.setState("Hunting");
          }
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

    if (
      closestFish &&
      this.power < closestFish.power &&
      this.svg != closestFish.svg
    ) {
      const distance2 = Math.sqrt(
        Math.pow(this.x - closestFish.x, 2) +
          Math.pow(this.y - closestFish.y, 2)
      );
      if (distance2 < this.eyeSigth - 50) {
        if (!this.isExhausted) {
          this.setState("Escaping");
        }
        this.canBreed = false;
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
      (this.mood == "hungry" || this.mood == "starving")
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

    // If canBreed is true, look for a mate and chase it
    if (
      this.canBreed &&
      this.size != "tiny" &&
      closestFish.canBreed &&
      !this.breedLock
    ) {
      this.setState("Looking for mate");
      if (
        closestFish &&
        this.svg == closestFish.svg &&
        this != closestFish &&
        closestFish.age != "baby" &&
        this.gender != closestFish.gender
      ) {
        const distance4 = Math.sqrt(
          Math.pow(this.x - closestFish.x, 2) +
            Math.pow(this.y - closestFish.y, 2)
        );
        if (distance4 < this.eyeSigth + 100) {
          this.angle = Math.atan2(
            closestFish.y - this.y,
            closestFish.x - this.x
          );
          this.angle = (this.angle * 180) / Math.PI;

          if (distance4 < 40) {
            this.breed(closestFish);
          }
        } else {
          if (!this.isExhausted) {
            this.setState("Wandering");
          }
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
    if (this.isPregnant) {
      defaultMood = "pregnant";
    } else if (this.selectedGenes.includes("sick")) {
      defaultMood = "sick";
    } else {
      defaultMood = "healthy";
    }
    if (this.hunger > this.hungerVal) {
      this.canBreed = false;
      this.mood = "hungry";
    }
    if (this.hunger > this.starvingVal) {
      this.canBreed = false;
      this.mood = "starving";
    }
    if (this.hunger < this.hungerVal) {
      if (this.age != "baby") {
        this.canBreed = true;
      }
      this.mood = defaultMood;
    }
    this.fishState.innerText = this.state + " " + this.mood;
  }

  breed(fish) {
    if (!this.breedLock && fish.canBreed) {
      this.setSpeed(0, true);
      this.setState("Breeding");
      this.breedLock = true;
      setTimeout(() => {
        this.setState("Wandering");
        this.resetSpeed();

        if (this.gender == "female") {
          this.setMood();
          this.giveBirth(fish);
        } else {
          this.breeedLock = true;
          this.canBreed = false;
        }
      }, 3000);
    }
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

  increaseStamina() {
    if (this.stamina <= this.maxStamina) {
      this.stamina += 1;
    }
  }
  decreaseStamina() {
    if (this.stamina >= 0) {
      this.stamina -= 1;
    }
  }

  giveBirth(father) {
    // Give a random number for pregnancy time
    let pregnancyTime = Math.floor(Math.random() * 10000) + 10000;
    console.log(pregnancyTime);
    this.isPregnant = true;
    this.canBreed = false;
    this.breedLock = true;
    if (this.isPregnant) {
      this.setMood();
      this.pregnancyInterval = setTimeout(() => {
        this.setState("Wandering");
        this.resetSpeed();

        // Create 10 or less babies
        let babyCount = Math.floor(Math.random() * 15);
        if (babyCount <= 0) {
          babyCount = 2;
        }

        // Get current alive count of this kind
        let currentCount = 0;
        livingThings.forEach((fish) => {
          if (fish.svg == this.svg) {
            currentCount++;
          }
        });

        if (currentCount + babyCount > 100) {
          babyCount = 1;
        }

        for (let i = 0; i < babyCount; i++) {
          const baby = createAnimal(
            this.svg,
            this.role,
            getRandomGender(),
            this.size,
            Math.floor(Math.random() * 11) + 10,
            "baby",
            this.selectedGenes,
            father.selectedGenes
          );

          // put baby near mother
          baby.x = this.x + 10;
          baby.y = this.y + 10;
        }

        this.isPregnant = false;
      }, pregnancyTime);
      this.intervals.push(this.pregnancyInterval);
    }
  }

  turn() {
    // Randomly change the direction of the fish smoothly over time
    const turnAngle = Math.random() * 8 - 4;
    this.angle += turnAngle;
  }

  fishController() {
    if (this.state == "Wandering") {
      this.resetSpeed();
    }
    if (this.state == "Hunting" || this.state == "Escaping") {
      this.decreaseStamina();
      if (this.stamina == 0) {
        this.isExhausted = true;
        this.setState("Exhausted");
        this.setSpeed(this.speed - 5, true);
      }
    }
    if (
      this.state == "Exhausted" ||
      this.state == "Wandering" ||
      this.state == "Looking for mate"
    ) {
      this.increaseStamina();
      if (this.stamina == this.maxStamina) {
        this.isExhausted = false;
        this.setState("Wandering");
        this.resetSpeed();
      }
    }
  }

  live() {
    this.update();
    this.turn();
    this.fishController();
  }
}
const createAnimal = (
  svg,
  role,
  gender,
  size,
  speed,
  age,
  goodGenes,
  badGenes
) => {
  const fish = new Fish(
    svg,
    role,
    gender,
    size,
    speed,
    age,
    goodGenes,
    badGenes
  );
  livingThings.push(fish);
  return fish;
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
const speciesInfo = document.getElementById("species");
const genInfo = document.getElementById("genes");
const ageInfo = document.getElementById("age");
const hungerInfo = document.getElementById("hunger");
const speedInfo = document.getElementById("speed");
const staminaInfo = document.getElementById("stamina");
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
    speciesInfo.innerText = "Species: " + fish.species;
    genInfo.innerText = "Genes: " + fish.selectedGenes;
    ageInfo.innerText = "Age: " + fish.lifeTime;
    if (!canStarve) {
      hungerInfo.innerText =
        "Hunger: " + fish.hunger + " (shrimps eat dead plants)";
    } else {
      hungerInfo.innerText = "Hunger: " + fish.hunger;
    }
    speedInfo.innerText = "Speed: " + fish.speed;
    staminaInfo.innerText = "Stamina: " + fish.stamina;
  }, 100);
};

createAnimal(
  "shark.svg",
  "predator",
  "male",
  "large",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "turtle.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "turtle.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "octopus2.svg",
  "prey",
  "male",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "octopus2.svg",
  "prey",
  "female",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "octopus1.svg",
  "prey",
  "male",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "octopus1.svg",
  "prey",
  "female",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "clown.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "dolphin.svg",
  "prey",
  "female",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "dolphin.svg",
  "prey",
  "male",
  "medium",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
); /*
createAnimal(
  "clown.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "dorito.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "dorito.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "stylish.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "stylish.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "ballon.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "ballon.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "blue.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "blue.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "bow.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "bow.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "shark.svg",
  "predator",
  "female",
  "large",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "piranha.svg",
  "predator",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "piranha.svg",
  "predator",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);*/
createAnimal(
  "golden.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "golden.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "seahorse.svg",
  "prey",
  "male",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);
createAnimal(
  "seahorse.svg",
  "prey",
  "female",
  "small",
  Math.floor(Math.random() * 11) + 10,
  "adult",
  goodGenePool,
  badGenePool
);

let deathCount = 0;

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

function hideContainers(value) {
  const _containers = document.querySelectorAll(".role-container");
  _containers.forEach((container) => {
    if (value) {
      isHidden = true;
      container.style.display = "none";
    } else {
      isHidden = false;
      container.style.display = "flex";
    }
  });
}

roleContainerHider.addEventListener("change", () => {
  console.log("checked");
  if (roleContainerHider.checked) {
    hideContainers(true);
  } else {
    hideContainers(false);
  }
});

// Randomly spawn shrimp every 10 seconds with a random speed and gender
const shrimpSpeed = Math.floor(Math.random() * 6) + 5;
if (shrimpSpeed < 5) {
  shrimpSpeed = shrimpSpeed + (Math.floor(Math.random() * 6) + 5);
}
setInterval(() => {
  createAnimal(
    "shrimp.svg",
    "prey",
    getRandomGender(),
    "tiny",
    shrimpSpeed,
    "adult",
    goodGenePool,
    badGenePool
  );
}, shrimpSpawnRate);
let predators;
let preys;
let legitLivings;
// Update preys and predators arrays every .5 seconds
setInterval(() => {
  predators = livingThings.filter((fish) => fish.role === "predator");
  predators = predators.length;
  preys = livingThings.filter((fish) => fish.role === "prey");
  preys = preys.length;
  legitLivings = livingThings.filter((fish) => fish.size !== "tiny");
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
