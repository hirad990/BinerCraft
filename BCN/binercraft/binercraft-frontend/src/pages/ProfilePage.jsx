import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/fozing/api';

export default function ProfilePage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }
    axios.get(`${API_BASE}/wallet/${userId}`)
      .then((response) => setWallet(response.data))
      .catch((error) => console.error('Failed to load wallet:', error))
      .finally(() => setLoading(false));
  }, []);

  return null;
}
