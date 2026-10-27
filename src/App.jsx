import React, { useState, useEffect } from 'react';
import { config } from './config';

function App() {
  const [user, setUser] = useState(null);
  const [secureData, setSecureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle incoming OAuth authorization code redirect callback or session injection
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');

    if (code || window.location.hostname !== 'localhost') {
      setUser({
        name: 'Authenticated Enterprise User',
        email: 'user@databricks-workspace.com',
        authType: 'Databricks Managed Auth'
      });
      if (code) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Explicit SSO Login Trigger
  const handleSSOLogin = () => {
    if (window.location.hostname === 'localhost' || !config.databricksClientId || config.databricksClientId === "YOUR_DATABRICKS_OAUTH_CLIENT_ID") {
      setUser({
        name: 'Local Developer',
        email: 'developer@company.com',
        authType: 'Simulated Local SSO'
      });
      return;
    }

    const authUrl = new URL(`${config.databricksHost}/oidc/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', config.databricksClientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'all-apis');

    window.location.href = authUrl.toString();
  };

  const handleLogout = () => {
    setUser(null);
    setSecureData(null);
    setError(null);
  };

  // Call Node.js Backend Proxy
  const fetchSecureDataFromNode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.backendUrl}/api/proxy/secure-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer simulated-user-token'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const result = await response.json();
      setSecureData(result);
    } catch (err) {
      console.error("Error fetching from Node server:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 1: SSO Login View
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2>Databricks App Gateway</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
          Please sign in using your workspace credentials to access the secure dashboard.
        </p>
        <button 
          onClick={handleSSOLogin} 
          style={{ width: '100%', padding: '12px', backgroundColor: '#FF3621', color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Sign in with Databricks SSO
        </button>
      </div>
    );
  }

  // SCREEN 2: Authenticated Dashboard View
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Welcome, {user.name}</h3>
          <span style={{ fontSize: '12px', color: '#666' }}>{user.email} • Authenticated via {user.authType}</span>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Secure Application Actions</h3>
        <p style={{ color: '#555', fontSize: '14px' }}>
          Your user session is active. Click below to execute automated M2M backend proxy calls via FastAPI.
        </p>
        <button 
          onClick={fetchSecureDataFromNode} 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: loading ? '#ccc' : '#0066cc', color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Executing M2M Request...' : 'Invoke Backend API (M2M)'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#ffe6e6', color: '#cc0000', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {secureData && (
        <div style={{ marginTop: '20px' }}>
          <h4>Response from Databricks M2M Backend:</h4>
          <pre style={{ background: '#f4f4f4', padding: '15px', borderRadius: '4px', overflowX: 'auto', fontSize: '13px' }}>
            {JSON.stringify(secureData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;