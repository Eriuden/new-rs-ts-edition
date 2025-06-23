import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUsers } from "../redux/actions/Users.action"
import UserCard from "./UserCard"
import { isEmpty } from "../Utils"

export const Searcher = () => {

    type appDispatch = () => any
    const [search, setSearch] = useState("")
    const users = useSelector((state: any) => state.allUsersReducer)
    const useAppDispatch = () => useDispatch<appDispatch>()
    const dispatch = useAppDispatch()

    useEffect(()=> {
        getUsers(users, dispatch)
    }, [search])

    const handleSearchChange = (e: any) => {
        setSearch(e.target.value)

        const result = users.filter((user: any)=> user.name.toLowerCase()
        .includes(search.toLowerCase()) 
        || user.gender.toLowerCase().includes(search.toLowerCase())
        )

        setSearch(result)
    }
  return (
    <div className='flex justify-center'>
      <form action='' className='border-2 rounded-sm my-4 max-w-[100%] border-black'>
        <input className='text-center' type="text" placeholder="user/gender"
        onChange={handleSearchChange} value={search}/>
      </form>

      <div>
        { !isEmpty(users[0]) && search !="" ? (
          users.map((user:any) => {
            if (user.name.includes(search)){
              <UserCard userProps={user} key={user._id}/>
            }
          })
        ): ""}
      </div>
    </div>
  )
}


