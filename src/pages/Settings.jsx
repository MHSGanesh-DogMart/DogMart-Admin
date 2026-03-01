import React from 'react';
import TopBar from '../components/Layout/TopBar';

export default function Settings() {
    return (
        <div>
            <TopBar title="Settings" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Settings</h2>
                        <p className="page-subtitle">Manage admin settings</p>
                    </div>
                </div>
                <div className="card">
                    <p>Settings configuration page is coming soon.</p>
                </div>
            </div>
        </div>
    );
}
