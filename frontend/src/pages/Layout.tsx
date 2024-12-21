import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExcalidrawComponent } from "../components/ExacliDraw"
import { CustomButton } from "../components/Button"
import { Maximize2, Minimize2, Share, FileUp, Video, Mic, Edit3 } from 'lucide-react'

export default function Layout() {
  const [hidepanel, setIsHidePanel] = useState(false)
  const [activeScreen, setActiveScreen] = useState<'excalidraw' | 'screenshare' | 'video'>('video')

  return (
    <div className="w-full h-[calc(100vh-4rem)] border-2 border-solid border-zinc-100 p-2 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row h-[calc(100%-4rem)] space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Main screen */}
        <motion.div
          layout
          className={`border border-primary rounded-lg overflow-hidden ${hidepanel ? 'w-full sm:w-[80%]' : 'w-full'}`}
        >
          {activeScreen === 'excalidraw' && <ExcalidrawComponent />}
          {activeScreen === 'screenshare' && <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">Screen Share</div>}
          {activeScreen === 'video' && <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">Video Call</div>}
        </motion.div>

        {/* Chat panel */}
        <AnimatePresence>
          {!hidepanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '20%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-primary rounded-lg relative h-full min-w-[250px]"
            >
              <div className="p-4 h-full overflow-y-auto">
                {/* Chat content goes here */}
                <h2 className="text-lg font-semibold mb-4">Chat</h2>
                {/* Add your chat component here */}
              </div>
              <CustomButton
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-4"
                onClick={() => setIsHidePanel(!hidepanel)}
              >
                <Maximize2 className="h-4 w-4" />
              </CustomButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control panel */}
      <div className="flex flex-wrap justify-center gap-2">
        <CustomButton onClick={() => setActiveScreen('screenshare')} variant="outline">
          <Share className="mr-2 h-4 w-4" /> Share Screen
        </CustomButton>
        <CustomButton onClick={() => {}} variant="outline">
          <FileUp className="mr-2 h-4 w-4" /> Upload PDF
        </CustomButton>
        <CustomButton onClick={() => setActiveScreen('video')} variant="outline">
          <Video className="mr-2 h-4 w-4" /> Video
        </CustomButton>
        <CustomButton onClick={() => {}} variant="outline">
          <Mic className="mr-2 h-4 w-4" /> Audio
        </CustomButton>
        <CustomButton onClick={() => setActiveScreen('excalidraw')} variant="outline">
          <Edit3 className="mr-2 h-4 w-4" /> Whiteboard
        </CustomButton>
        {hidepanel && (
          <CustomButton onClick={() => setIsHidePanel(false)} variant="outline">
            <Minimize2 className="mr-2 h-4 w-4" /> Show Chat
          </CustomButton>
        )}
      </div>

      {/* Small screen video overlay */}
      {activeScreen !== 'video' && (
        <div className="fixed top-14 right-2  min-w-[250px] h-36 bg-background border-2 border-primary rounded-lg overflow-hidden shadow-lg">
          <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
            Video Preview
          </div>
        </div>
      )}
    </div>
  )
}

