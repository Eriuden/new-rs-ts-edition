import {useState, useContext, useEffect} from 'react'
import {useSelector} from "react-redux"
import {Link} from "react-router-dom"
import { UidContext} from "./AppContext"
import { Squash as Hamburger } from 'hamburger-react'
import Logout from './Logout'
import * as ReactModal from "react-modal"
import Connexion from "./Connexion"
import Inscription from "./Inscription"


export default function Header() {
  const [hamburger, setHamburger] = useState(false)
  const [connexionModal, setConnexionModal] = useState(false)
  const [inscriptionModal, setInscriptionModal] = useState(false)
  const uid = useContext(UidContext)
  const [uidPic, setUidPic] = useState("")

  const switchConnexion = () => {
    setConnexionModal(!connexionModal) 
    setInscriptionModal(false)
  }

  const switchInscription = () => {
    setInscriptionModal(!inscriptionModal) 
    setConnexionModal(false)
  }

  const userData = useSelector((state:any) => state.userReducer)

  useEffect(()=> {
    if (uid) {
      setUidPic(`${userData.picture}`)
    }
  },[uid, userData])

  return (
    <div>
      <div className='bg-gradient-to-r from-cyan-300  via-slate-50 to-purple-300 mb-0'>
        <h1 className='mb-3'>Gendate</h1>
        <p className='py-3'>Le site qui fait pas mauvais genre</p>
      </div>
      

      <nav className='hidden bg-gradient-to-r from-cyan-300 via-slate-50 to-purple-300 flex-row justify-around mt-0 sm:flex '>
        <Link to={"/"}>Acceuil</Link>
        { uid ? (

          <>
            <Link to ={"/user-profile/:id"}>
            <h5>Bienvenue {userData.pseudo}</h5>
            </Link>
            <h5>{uidPic}</h5>
            <Logout/>
          </>
          
        ) : (
          <>
            <span className ="text-black font-serif text-xl" onClick={switchConnexion}>
              Connexion
            </span>

            <span className ="text-black font-serif text-xl " onClick={switchInscription}>
              Inscription
            </span>

            {connexionModal ? (
              <ReactModal ariaHideApp={false} className="max-w-[100%] p-2"
              shouldCloseOnOverlayClick={true}
              shouldCloseOnEsc={true} isOpen={connexionModal ? true : false}>
                <span className='bg-slate-50 py-2 px-4 mx-[83%] md:mx-[74%] lg:mx-[57%] xl:mx-[65%] 2xl:mx-[75%]
                mt-[20%] rounded-md cursor-pointer'
                onClick={switchConnexion}>
                  X
                </span>
                <Connexion/>
              </ReactModal>
            ) : ""}

            {inscriptionModal ? (
              <ReactModal ariaHideApp={false} className="max-w-[100%] p-2"
              shouldCloseOnOverlayClick={true}
              shouldCloseOnEsc={true} isOpen={inscriptionModal ? true : false}>
                <span className='bg-slate-50 py-2 px-4 mx-[83%] md:mx-[74%] lg:mx-[57%] xl:mx-[65%] 2xl:mx-[75%]
                mt-[20%] rounded-md cursor-pointer'
                onClick={switchInscription}>
                  X
                </span>
                <Inscription/>
              </ReactModal>
            ) : ""} 
          </>      
          
          
        )}
      </nav>

      <h2 className='flex m-3 sm:hidden' onClick={()=>setHamburger(!hamburger)}>
        <Hamburger/>
      </h2>
      
      {hamburger ? (
        <nav className='flex flex-col items-start justify-start border-spacing-1 ml-3.5 
        absolute border-2 border-black bg-slate-50 opacity-100 sm:hidden'>
        <Link className='mx-1' to={"/"}>Acceuil</Link>
        
        { uid ? (
          <>
            <Link className='mx-1' to ={"/user-profile/:id"}>
              <h5>Bienvenue {userData.pseudo}</h5>
              <Link className='mx-1' to ={"/messages/:id"}>Messagerie</Link>
            </Link>
            
            <Logout/>
          </>

        ) : (
          <>
            <span className='w-[100%] text-center m-auto text-black'
             onClick={switchConnexion} >Connexion</span>
            <span className='w-[100%] text-center m-auto text-black'
             onClick={switchInscription}>Inscription</span>
          </>
        )}
        
      </nav>
      ):""}

    </div>
  )
}
