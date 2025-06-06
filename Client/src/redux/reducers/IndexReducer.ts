import {combineReducers} from "redux"
import { userReducer } from "./UserReducer"
import { errorReducer } from "./ErrorReducer"
import { allUsersReducer } from "./UsersReducer"


const reducers = combineReducers({
userReducer,
allUsersReducer,
errorReducer,

})

export default reducers