import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Font Awesome Setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { faList, faThLarge } from '@fortawesome/free-solid-svg-icons'

library.add(faList, faThLarge)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)