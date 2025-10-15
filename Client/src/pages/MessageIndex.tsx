import { useContext } from 'react';
import {Channel, ChannelHeader, ChannelList, Chat, MessageInput, MessageList, Window} from "stream-chat-react";
import { UidContext } from '../components/AppContext';
import { useChatContext } from 'stream-chat-react';
import { useNavigate} from "react-router";


export default function MessageIndex() {
  const uid = useContext(UidContext)
 
  return <Chat list={Channels} sendChannelsToList client={uid}>
    <ChannelList List={Channels} sendChannelsToList />
    <Channel>
      <Window>
        <ChannelHeader/>
        <MessageList />
        <MessageInput />
      </Window>
    </Channel>
  </Chat>
}



export const Channels = (loadedChannels:any) => {
  const navigate = useNavigate()
  const { setActiveChannel, channel :activeChannel } = useChatContext()

  return (
    <div className='<-60 flex flex-col gap-4 m-3 h-full'>

      <button onClick={navigate("/channel/new")}>Nouvelle conversation</button>

      <hr className='border-gray-500' />

      {loadedChannels != null && loadedChannels.length > 0  
        ? loadedChannels.map(channel => {
            const isActive = channel === activeChannel
            const extraClasses = isActive 
              ? "bg-blue-500 text-white"
              : "hover: bg-blue-100 bg-gray-100"

            return <button onClick={()=> setActiveChannel(channel)}
              disabled={isActive} className={`p-4 rounded-lg flex gap-3
              items-center ${extraClasses}`}
              key={channel.id}
            >
              {channel.data?.image && (<img 
                  src={channel.data.image}
                  className="w-10 h-10 rounded-full object-center object-cover"
                />
              )}
              <div>{channel.data.name || channel.id}</div>
            </button>

          })
        : "Aucune conversation"}
        <hr className='border-gray-500' />
    </div>
  )
}
