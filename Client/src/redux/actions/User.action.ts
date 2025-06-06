import axios from "axios";

export const GET_USER = "GET_USER"
export const  UPLOAD_PICTURE = "UPLOAD_PICTURE"
export const  UPDATE_USER = "UPDATE_USER"
export const DELETE_USER = "DELETE_USER"
export const  FOLLOW_USER = "FOLLOW_USER"
export const  UNFOLLOW_USER = "UNFOLLOW_USER"

export const GET_USER_ERRORS = "GET_USER_ERRORS"

export const getUser = (uid: string, dispatch: any) => {   
        return axios
            .get(`${process.env.REACT_APP_API_URL}api/user/${uid}`)
            .then((res) => {
                dispatch({type:GET_USER, payload: res.data})
            })
            .catch((err) => console.log(err))
}

export const uploadPicture = (data: any, id: string, dispatch: any) => {   
        return axios
            .post(`${process.env.REACT_APP_API_URL}api/user/upload`, data)
            .then((res) => {
                if (res.data.errors) {
                    dispatch({ type: GET_USER_ERRORS, payload: res.data.errors})
                } else {
                    dispatch ({ type: GET_USER_ERRORS, payload:""})
                    return axios
                    .get(`${process.env.REACT_APP_API_URL}api/user/${id}`)
                    .then((res) => {
                        dispatch({ type: UPLOAD_PICTURE, payload:res.data.picture})
                    })
                }
            })
            .catch((err) => console.log(err))
}

export const updateUser = (userId: string, pseudo: string, bio: string, 
    gender: string, address: string, dispatch: any) => {
    
        return axios({
            method:"put",
            url: `${process.env.REACT_APP_API_URL}api/user` + userId,
            data: {pseudo, bio, gender, address}
        })
            .then(() => {
                dispatch({type: UPDATE_USER, payload: pseudo, bio, gender})
            })
            .catch((err) => window.alert(err))
    
}


export const deleteUser = (userId: string, pseudo: string, email: string,
     password: string, dispatch: any) => {   
        return axios({
            method:"delete",
            url: `${process.env.REACT_APP_API_URL}api/user/${userId}`,
            data: {pseudo, email, password},
        })
        .then(() => {
            dispatch({ type: DELETE_USER, payload: { userId }})
        })
        .catch((err) => console.log(err))
}

export const followUser = (followerId: string, idToFollow: string, dispatch: any) => {   
        return axios({
            method:"patch",
            url: `${process.env.REACT_APP_API_URL}api/user/follow/` + followerId,
            data: { idToFollow },
        })
            .then(() => {
                dispatch({ type: FOLLOW_USER, payload:{idToFollow}})
            })
            .catch((err) => console.log(err))
}

export const unfollowUser = (followerId: string, idToUnfollow: string, dispatch: any) => {   
        return axios({
            method:"patch",
            url: `${process.env.REACT_APP_API_URL}api/user/unfollow/` + followerId,
            data: { idToUnfollow },
        })
            .then(() => {
                dispatch({ type: UNFOLLOW_USER, payload:{idToUnfollow}})
            })
            .catch((err) => console.log(err))
}