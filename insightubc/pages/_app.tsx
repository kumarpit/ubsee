import '../styles/globals.css'
import type { AppProps } from 'next/app'
import store from '../state/store'
import {Provider} from 'react-redux';
import { SSRProvider } from 'react-bootstrap';

export default function App({ Component, pageProps }: AppProps) {
  return <SSRProvider>
      <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  </SSRProvider>
  
}
