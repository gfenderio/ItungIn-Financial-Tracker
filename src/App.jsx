import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Debt from './pages/Debt';

import AllTransactions from './pages/AllTransactions';
import TransactionDetail from './pages/TransactionDetail';

import Profile from './pages/Profile';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<AllTransactions />} />
                <Route path="debt" element={<Debt />} />
                <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/transaction/:id" element={<TransactionDetail />} />
        </Routes>
    );
}

export default App;
