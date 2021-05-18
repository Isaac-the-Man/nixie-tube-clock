console.log("script start.");

const app = document.querySelector("#app");

const randomPattern = [
  7, 8, 3, 0, 2, 9, 6, 0, 6,
  8, 5, 7, 3, 4, 8, 7, 4, 9,
  2, 1, 3, 1, 5, 4, 2, 0, 1,
  9, 5, 6
];
let randomIndex = 0;
let randomN = 6;

function createDigit(n) {
	let digit = document.createElement("div");
	digit.classList.add("digit");
	if (n === ".") {
		digit.classList.add("dot");
	}
	digit.textContent = n;
	return digit;
}

function createTube(n) {
	let digit = document.createElement("img");
	digit.src = `./nixie-digits/${n}.png`;
	digit.classList.add("tube");
	return digit;
}

function getFirstDigit(n) {
	if (n > 9) {
		return Math.floor(n/10);
	}
	return 0;
}

function getSecondDigit(n) {
	return n % 10;
}

// get 6-digit time
function getTime() {
	let now = moment();
	return [
		getFirstDigit(now.hour()), 
		getSecondDigit(now.hour()),
		getFirstDigit(now.minutes()), 
		getSecondDigit(now.minutes()),
		getFirstDigit(now.seconds()), 
		getSecondDigit(now.seconds()),
	];
}

// update DOM
function flashDom(time) {
	// clear DOM
	app.innerHTML = "";
	// get date
	let now = moment();
	// create digits
	let h_1, h_2, m_1, m_2, s_1, s_2;
	h_1 = createTube(time[0]);
	h_2 = createTube(time[1]);
	m_1 = createTube(time[2]);
	m_2 = createTube(time[3]);
	s_1 = createTube(time[4]);
	s_2 = createTube(time[5]);
	let dot_1 = createDigit(".");
	let dot_2 = createDigit(".");
	// append digits
	let display = document.createElement("div");
	display.classList.add("digit_display");
	display.appendChild(h_1);
	display.appendChild(h_2);
	display.appendChild(dot_1);
	display.appendChild(m_1);
	display.appendChild(m_2);
	display.appendChild(dot_2);
	display.appendChild(s_1);
	display.appendChild(s_2);
	app.appendChild(display);
	// index + 1
	randomIndex++;
	if (randomIndex == 24) {
		randomIndex = 0;
	}
}

// config
const config = {
	clockPeriod: 200, // 200 ms
	shufflePeriod: 1, // 1 min
	shuffleDuration: 6, // 6 sec
}

// helpers
function getDelay(mode) {
	if (mode === 'clock') {
		return config.clockPeriod;
	}
	if (mode === 'reset') {
		return 50;
	}
	return config.clockPeriod;
}
function checkDigitReset(prev, now) {
	return now[0] < prev[0] || 
		now[1] < prev[1] || 
		now[2] < prev[2] || 
		now[3] < prev[3] || 
		now[4] < prev[4] || 
		now[5] < prev[5];
}

let shuffleMax = Math.floor(config.shufflePeriod*60000 / config.clockPeriod);
console.log(shuffleMax);
let shuffleDurMax = Math.floor(config.shuffleDuration*1000 / config.clockPeriod);
let shuffleCounter = 0;
let shuffleDurCounter = 0;
let prevTime = [0,0,0,0,0,0];
let resetTime = [0,0,0,0,0,0];
let resetCounter = 9;
let mode = 'clock';
// flash clock
function clockTimeout() {
	let t = getTime();
	// check for shuffle
	if (shuffleCounter >= shuffleMax) {
		if (shuffleDurCounter >= shuffleDurMax) { // check when to end shuffle
			// reset counters
			randomIndex = 0;
			shuffleCounter = 0;
			shuffleDurCounter = 0;
			randomN = 6;
		} else {
			randT = randomPattern.slice(randomIndex, randomIndex + 6);
			t[0] = randomN >= 1 ? randT[0] : t[0];
			t[1] = randomN >= 2 ? randT[1] : t[1];
			t[2] = randomN >= 3 ? randT[2] : t[2];
			t[3] = randomN >= 4 ? randT[3] : t[3];
			t[4] = randomN >= 5 ? randT[4] : t[4];
			t[5] = randomN >= 6 ? randT[5] : t[5];
			shuffleDurCounter++;
		}
	} else if (mode === 'clock' && checkDigitReset(prevTime, t)) {  // check for digit reset
		mode = 'reset';
		t[0] = t[0] < prevTime[0] ? resetCounter : t[0];
		t[1] = t[1] < prevTime[1] ? resetCounter : t[1];
		t[2] = t[2] < prevTime[2] ? resetCounter : t[2];
		t[3] = t[3] < prevTime[3] ? resetCounter : t[3];
		t[4] = t[4] < prevTime[4] ? resetCounter : t[4];
		t[5] = t[5] < prevTime[5] ? resetCounter : t[5];
		resetTime = t;
	} else if (mode === 'reset') {
		if (resetCounter <= 0) { // check when to end reset
			mode = 'clock';
			resetCounter = 9;
		} else {
			resetCounter--;
			t[0] = t[0] < prevTime[0] ? resetCounter : t[0];
			t[1] = t[1] < prevTime[1] ? resetCounter : t[1];
			t[2] = t[2] < prevTime[2] ? resetCounter : t[2];
			t[3] = t[3] < prevTime[3] ? resetCounter : t[3];
			t[4] = t[4] < prevTime[4] ? resetCounter : t[4];
			t[5] = t[5] < prevTime[5] ? resetCounter : t[5];
			resetTime = t;
		}
	}
	// render clock
	flashDom(t);
	if (mode === 'clock') {
		shuffleCounter++; // suspend shuffle when resetting digit
		prevTime = t; // lock prev when resetting digit
	}
	setTimeout(clockTimeout, getDelay(mode));
}
clockTimeout();