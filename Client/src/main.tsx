import { StrictMode } from 'react';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom"
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import reducers from './redux/reducers/indexReducer';
import { configureStore} from "@reduxjs/toolkit"



const store = configureStore({reducer:reducers})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
