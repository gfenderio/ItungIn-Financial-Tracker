import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Debt from './pages/Debt';
import Subscriptions from './pages/Subscriptions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Savings from './pages/Savings';
import Premium from './pages/Premium';

import AllTransactions from './pages/AllTransactions';
import TransactionDetail from './pages/TransactionDetail';

import Profile from './pages/Profile';
import AppTourOverlay from './components/AppTourOverlay';
import PremiumTourOverlay from './components/PremiumTourOverlay';
import CustomAlert from './components/CustomAlert';
import CustomConfirm from './components/CustomConfirm';
import OnboardingModal from './components/OnboardingModal';

function App() {
    return (
        <div className="font-display">
            <OnboardingModal />
            <CustomAlert />
            <CustomConfirm />
            <AppTourOverlay />
            <PremiumTourOverlay />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<AllTransactions />} />
                    <Route path="debt" element={<Debt />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="savings" element={<Savings />} />
                    <Route path="premium" element={<Premium />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="/transaction/:id" element={<TransactionDetail />} />
            </Routes>
        </div>
    );
}

export default App;
