import { FOLLOW_USER,DELETE_USER, GET_USER, UPDATE_USER, UPLOAD_PICTURE,
UNFOLLOW_USER } from "../actions/User.action";

const initialState: any = {}

export const userReducer = (state = initialState,action: any) => {
    switch(action.type) {
        case GET_USER:
            return action.payload
        case UPLOAD_PICTURE:
            return {
                ...state,
                picture: action.payload
            }
        case UPDATE_USER:
            return {
                ...state,
                pseudo : action.payload,
                bio : action.payload,
                gender : action.payload,
                address : action.payload

            }
        case FOLLOW_USER:
            return {
                ...state,
                following : [action.payload.idToFollow, ...state.following]
            }
        case UNFOLLOW_USER:
            return {
                ...state,
                following: state.following.filter((id: any) => id !== action.payload.idToUnfollow),
            }
        case DELETE_USER:
            return state.filter((user: any) => user._id !== action.payload.userId)

        default:
            return state;
    }
}