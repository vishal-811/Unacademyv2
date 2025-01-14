import React, { useState, useEffect } from 'react'
import { useIsJoinRoomClicked } from '../strore/useRoomJoin'
import { useNavigate } from 'react-router-dom';


export function JoinRoomModal() {
  const [roomId, setRoomId] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const SetisRoomJoinButtonClick = useIsJoinRoomClicked((state) => state.setIsJoinRoomClicked);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`room/${roomId}`)
  }

  const handleClose = () => {
    setIsVisible(false)
    SetisRoomJoinButtonClick(false);
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transition: 'opacity 0.5s ease-in-out',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
      }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl transform ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
        }`}
        style={{
          transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          maxWidth: '400px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 bg-gradient-to-b from-blue-500 to-blue-600">
          <h2 className="text-4xl font-bold mb-6 text-white text-center">
            Join Room
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-white border-opacity-50 rounded-lg focus:outline-none focus:border-opacity-100 transition-all duration-300 text-lg text-white placeholder-white placeholder-opacity-70"
                placeholder="Enter room ID"
                required
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-base font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                Join Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

