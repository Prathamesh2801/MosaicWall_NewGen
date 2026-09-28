import { useEffect, useState } from 'react'
import { APP } from '../../../config/app'
import { connectMockStream } from '../services/mockStream'
import { connectWallStream } from '../services/wallStream'

// Connects to the live SSE stream (or the mock) and feeds events into the wall reducer.
// Returns the connection status: 'connecting' | 'live' | 'offline' | 'mock'.
export function useWallStream(dispatch) {
  const [connection, setConnection] = useState('connecting')

  useEffect(() => {
    const connect = APP.useMock ? connectMockStream : connectWallStream
    return connect({
      onTile: (tile) => dispatch({ type: 'enqueue', tile }),
      onStatus: setConnection,
    })
  }, [dispatch])

  return connection
}
