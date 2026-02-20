import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Debt from './pages/Debt';
import AddTransaction from './pages/AddTransaction';

import AllTransactions from './pages/AllTransactions';
import TransactionDetail from './pages/TransactionDetail';

// Simple placeholders for now
const Profile = () => <div className="p-4 text-center text-slate-500">Profile Settings (Coming Soon)</div>;

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<AllTransactions />} />
                <Route path="debt" element={<Debt />} />
                <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/transaction/:id" element={<TransactionDetail />} />
        </Routes>
    );
}

export default App;
