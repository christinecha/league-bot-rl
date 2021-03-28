import React, { useEffect, useState, useRef } from 'react'
import { getGuildUser } from '../api'

const GuildUsers = React.createContext({})

export const useGuildUsers = () => React.useContext(GuildUsers)
export const GuildUsersProvider = ({ guildId, userIds, children }) => {
  const membersRef = useRef({})
  const [members, setMembers] = useState({})
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    setComplete(false)
    Promise.all(
      userIds.map((userId) => {
        return getGuildUser({ userId, guildId }).then((res) => {
          const user = res ? res.data : null
          membersRef.current = { ...membersRef.current, [userId]: user }
          setMembers(membersRef.current)
        })
      })
    ).then(() => {
      setComplete(true)
    })
  }, [userIds])

  return (
    <GuildUsers.Provider value={{ members, complete }}>
      {children}
    </GuildUsers.Provider>
  )
}
