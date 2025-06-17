import {useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import { isEmpty } from '../utils'
import FollowHandler from './FollowHandler'


export default function UserCard({userProps}:any) {
  const [isLoading, setIsloading] = useState(true)
  const usersData = useSelector((state:any)=> state.allUsersReducer)
  const userData = useSelector((state:any)=> state.userReducer)
  
  
  useEffect(() => {
    !isEmpty(usersData[0]) && setIsloading(false)
  }, [usersData])

  return(
    <li key={userProps._id}>
      {isLoading ? (
        <i className='fas-fa-spinner fa-spin'></i>
      ) : (
        <>
          <div>

            <img src={!isEmpty(usersData[0]) &&
              usersData
              .map((user:any) => {
                if (user._id) return user.picture;
                else return null
              })
              .join("")
            } alt="" />

          </div>

            <div>
              <h3>
                {isEmpty(usersData[0]) &&
                  usersData
                  .map((user:any) => {
                    if (user._id) return user.pseudo
                    else return null
                  })
                  .join("")}
              </h3>
              {userData._id && (
                <FollowHandler idToFollow={userProps.id} type ={"card"} />
              )}
            </div>

          <div>

            {!isEmpty(usersData[0]) &&
              usersData
              .map((user:any) => {
                if (user._id) return user.gender;
                else return null
              })
              .join("")
            }

          </div>

          <div>

            {!isEmpty(usersData[0]) &&
              usersData
              .map((user:any) => {
                if (user._id) return user.bio;
                else return null
              })
              .join("")
            }

          </div>
            
        </>
      )}
    </li>
  )
}
