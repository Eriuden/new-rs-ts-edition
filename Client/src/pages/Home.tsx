import {useState, useEffect} from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUsers } from "../redux/actions/Users.action" 
import UserCard from "../Components/UserCard"
import { isEmpty } from "../utils"

export const Home = () => {
    const [loadCard, setLoadCard] = useState(false)
    const [count, setCount] = useState(0)
    const dispatch = useDispatch()
    const users = useSelector((state:any)=> state.allUsersReducer)
  
  
    const loadMore = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 1 >
        document.scrollingElement!.scrollHeight)
        {
          setLoadCard(true)
        }
    }
  
    useEffect(()=> {
      if (loadCard) {
        getUsers(count, dispatch)
        setLoadCard(false)
        setCount(count + 10)
      }
      window.addEventListener("scroll", loadMore)
    }, [loadCard, dispatch, count])
    
    return (
      <div>
        <div>
          <ul>
            {!isEmpty(users[0]) &&
              users.map((article:any) => {
                return <UserCard articleProps={article} key={article._id}/>
            })}
          </ul>
        </div>
      </div>
    )
}

