import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element=<Dashboard/>
                />
                <Route
                    path="*" //щоби завжди перенаправляло до головної сторінки
                    element=<Dashboard />
                />
            </Routes>
        </Router>
    );
}


export default App;
