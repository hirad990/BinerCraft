import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/fozing/api';

export default function ProfilePage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { setLoading(false); return; }
    axios.get(`${API_BASE}/wallet/${userId}`).then(r => setWallet(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{wallet ? JSON.stringify(wallet) : 'No wallet data'}</div>;
}
