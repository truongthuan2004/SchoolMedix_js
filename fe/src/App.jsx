import React from 'react'
import { RouterProvider } from 'react-router-dom'
import routes from './router/routes'

const App = () => {
  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  )
}

export default App
