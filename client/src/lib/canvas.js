export const CANVAS_HEIGHT = 700
export const CANVAS_WIDTH = 1400

export const getRndInt = (min, max) => Math.floor(Math.random() * (max+1 - min) + min)
const genRndInt = (i) => Math.floor(Math.random()*i)+1 // return random int with low bound of 1


// terrain generation algo's.
// based on the 1d perlin noise generator

const normWave = (wave, upper, lower) => {
	let min = Math.min(...wave)
	let max = Math.max(...wave)
	let omg = upper - lower // outer magnitude, not oh my god

	return wave.map(y => (((y-min) / (max-min)) * omg) + lower) // inner magnitude * outer
}

const mkWave = (length, offset, wWidth, wHeight) => {
	let wMp = (Math.PI*2) / wWidth // wave Multiplier

	return Array.from({length}, (_, i) => Math.floor(Math.cos((i + offset) * wMp) * wHeight)) // Some inline magic with perlin calcs
}

const joinWave = (w1, w2) => w1.map((y, i) => y + w2[i])

export const genHeightmap = (maxW, maxY) => {
	let wave = mkWave(maxW, maxW/genRndInt(10), maxW/genRndInt(2), maxY/genRndInt(5))

	for (let i = 0; i < 10; i++){
		let d = genRndInt(i) // devisor -> may not be 0
		wave = joinWave(wave, mkWave(maxW, maxW/genRndInt(10), maxW/(d*2.5), maxY/(d*5)))
	}

	return normWave(wave, maxW/2, getRndInt(50, 200))
}

export const getLineCoords = (maxW = CANVAS_WIDTH, maxH = CANVAS_HEIGHT, reduxHeightmap) => {
	// Heigtmap only generates Y hights from minX to maxX
	// For line drawing to work, it needs to be boxed and needs a X coord

	let hm = reduxHeightmap.reduce((acc, y, x) => acc.push(x, y) && acc, [])

  hm.unshift(-50, hm[1])     // start drawing outside of canvas
	hm.push(
		maxW+20, hm[(maxW*2)-1], // end drawing straight out of canvas
		maxW+20, maxH + 20,			 // bottom right
		-20, maxH + 20,					 // bottom left   
	) 

	return hm
}