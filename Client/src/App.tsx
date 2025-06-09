import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from './Components/Header'
import { useDispatch } from "react-redux" 
import { getUser } from './redux/actions/User.action'
import './App.css'

function App() {

  type appDispatch = () => any 

  const [uid, setUid] = useState("")
  const useAppDispatch = () => useDispatch<appDispatch>()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const fetchToken = async () => {
    await axios({
      method: "get",
      url: `${process.env.REACT_APP_API_URL}jwtid`,
      withCredentials: true
    })
    .then((res) => {
      console.log(res);
      setUid(res.data)
    })
    .catch(() => console.log("Pas de tokens"))
    }
    fetchToken()

    if (uid) getUser(uid, dispatch)
  }, [uid])

  return (
    <div className="App">
      <Header/>
      <Searcher/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/user-profile/:id" element={<UserProfile/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/messages/:id" element={<MessageIndex/>}/>
      </Routes>
      
    </div>
  )
}

export default App
