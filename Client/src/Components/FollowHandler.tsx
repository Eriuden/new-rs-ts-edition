import {useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { followUser, unfollowUser } from '../redux/actions/User.action'
import { isEmpty } from '../utils'

export default function FollowHandler(idToFollow: any, type: string) {
    const userData = useSelector((state:any) => state.userReducer)
    const [isFollowed, setIsFollowed] = useState(false)
    const dispatch = useDispatch()

    const handleFollow = () => {
        followUser(userData._id, idToFollow, dispatch)
        setIsFollowed(true)
    }

    const handleUnfollow = () => {
        unfollowUser(userData._id, idToFollow,dispatch)
        setIsFollowed(false)
    }

    useEffect(()=> {
        if (isEmpty(userData.following)) {
            if (userData.following.includes(idToFollow)) {
                setIsFollowed(true)
            } else setIsFollowed(false)
        }
    }, [userData, idToFollow])

  return (
    <div>
      {isFollowed && !isEmpty(userData) && (
            <span onClick={handleUnfollow}>
                {type === "suggestion" && <button>Se désabonner</button>}
            </span>
       )}

       {isFollowed === false && !isEmpty(userData) && (
        <span onClick={handleFollow}>
            {type === "suggestion" && <button>S'abonner</button>}
        </span>
       )}


    </div>
  )
}

