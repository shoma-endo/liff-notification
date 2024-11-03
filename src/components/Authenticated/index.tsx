import { LiffMockPlugin } from '@line/liff-mock'
import { onAuthStateChanged } from 'firebase/auth'
import Script from 'next/script'
import { useContext } from 'react'

import { AuthContext } from '~/contexts/AuthContext'
import { auth } from '~/lib/firebase'

const liffId = process.env.NEXT_PUBLIC_LIFF_ID || 'mock-liff-id'
const isDevelopment = process.env.NODE_ENV === 'development'

export const Authenticated = () => {
  const { setUser: setUserContext } = useContext(AuthContext)

  const login = async (): Promise<void> => {
    if (isDevelopment) {
      setUserContext({
        userUid: 'mock-user-id',
        name: 'Mock User'
      })
      return
    }

    const idToken = liff.getIDToken()!
    console.info(idToken, 'をもとにfirebase tokenを取得する')
    // const { token } = await apiLogin({ idToken, channelId: lineChannelId })
    // await signInWithCustomToken(auth, token)
  }

  const setUser = async (userId: string): Promise<void> => {
    if (isDevelopment) {
      setUserContext({
        userUid: userId,
        name: 'Mock User'
      })
      return
    }
    // Production user setting logic here
  }

  const liffInit = async () => {
    const handleError = (err: any) => {
      console.error(err)
      setUserContext(null)
    }

    try {
      if (isDevelopment) {
        liff.use(new LiffMockPlugin())
        await liff.init({ liffId, mock: true })
        liff.login()
      } else {
        await liff.init({ liffId })
      }

      await login()

      onAuthStateChanged(
        auth,
        async (user) => {
          try {
            if (user) {
              await setUser(user.uid)
            }
          } catch (err) {
            handleError(err)
          }
        },
        (err) => handleError(err)
      )
    } catch (err) {
      handleError(err)
    }
  }

  return <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={() => liffInit()} />
}