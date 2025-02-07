import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './components/Login';
import Register from './components/Register';
import Main from './components/Main';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
