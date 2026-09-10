import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/fozing/api';

export default function ProfilePage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { setLoading(false); return; }
    axios.get(`${API_BASE}/wallet/${userId}`)
      .then((response) => setWallet(response.data))
      .catch((err) => { console.error(err); setError(err); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Failed to load profile.</div>;
  return <div>{wallet ? JSON.stringify(wallet) : 'No wallet data'}</div>;
}
