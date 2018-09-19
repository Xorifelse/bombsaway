import {SET_HEIGHTMAP} from '../actions/heightMap'
// import {USER_LOGOUT} from '../actions/users'

/*
The state will contain the heightmap delivered by the server - equeal for all players
*/

export default (state = null, {type, payload}) => {
  switch (type) {
    case SET_HEIGHTMAP:
      return payload
    default:
      return state
  }
}
