import { GET_USER_ERRORS } from "../actions/User.action"


const initialState = { userError : []}

export default function errorReducer(state = initialState, action: any) {
    switch (action.type) {
        case GET_USER_ERRORS:
            return{
                userError: action.payload
            }
            default:
                return state
    }
}