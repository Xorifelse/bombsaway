import {SKELETON_ACTION} from '../actions/skeletonAction'

export default (state = '', action = {}) => {
  switch (action.type){
    case SKELETON_ACTION:
      return action.payload
    default:
      return state
  }
}