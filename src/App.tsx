import { Route, Routes } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import ScrollVideo from './components/ScrollVideo'
import ScrollAudio from './components/ScrollAudio'
import AutoTour from './components/AutoTour'
import PromptPage from './components/PromptPage'
import Experience from './experience/Experience'

export default function App() {
  return (
    <SmoothScroll>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ScrollVideo src="/media/journey.mp4" mobileSrc="/media/journey-mobile.mp4" />
              <ScrollAudio />
              <Experience />
              <AutoTour />
            </>
          }
        />
        <Route path="/prompt" element={<PromptPage />} />
      </Routes>
    </SmoothScroll>
  )
}
