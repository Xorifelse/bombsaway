import axios from 'axios';

export const SKELETON_ACTION = 'SKELETON_ACTION'

export function skeletonAction(param) {
  return {
    type: SKELETON_ACTION,
    payload: {
      name: param
    }
  }
}

export function getSkeletonThunk() {
  return function (dispatch){
    axios.get('https://reqres.in/api/users')
      .then(response => {
        response.data.data.map((value, index) => {
          setTimeout(() => dispatch(skeletonAction(value.first_name)), index * 1000 + 1000)
        })
      })
  }
}