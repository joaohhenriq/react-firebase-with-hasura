import React from 'react';
import ReactDOM from 'react-dom';
import Auth from './Auth';
import './index.css'
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Auth />, document.getElementById('root'));

serviceWorker.unregister();
