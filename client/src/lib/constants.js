// User constants
export const TANK_SIZE = 10
export const TANK_BARREL_SIZE = 22
export const TANK_BARREL_WIDTH = 2
export const TERRAIN_GRASS_COLOR = '#567d46'
export const TERRAIN_GRASS_WIDTH = 10
export const TERRAIN_DIRT_COLOR = '#402905'

// System constants
export const DEG2RAD = Math.PI/180
export const RAD2DEG = 180/Math.PI



export const polarProjectionX = (x, distance, degrees) => x + distance * Math.cos(degrees * DEG2RAD)
export const polarProjectionY = (y, distance, degrees) => y + distance * Math.sin(degrees * DEG2RAD)
export const rad2deg = (radian) => radian * RAD2DEG
export const deg2rad = (degrees) => degrees * DEG2RAD

export const calcDegrees = (degrees, num) => {
  if(num === 0) return degrees

  if(num > 0){
    if(num + degrees > 360){
      return (degrees + num) - 360
    } else {
      return degrees + num
    }
  } else {
    num = Math.abs(num)

    if(degrees - num < 0){
      return (degrees - num) + 360
    } else {
      return degrees - num
    }
  }
}