import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const SocketDebug = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('disconnected');

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const onConnect = () => {
      setStatus('connected');
      addLog(`✅ Connected - ID: ${socket.id}`);
      addLog(`Transport: ${socket.io?.engine?.transport?.name}`);
    };

    const onDisconnect = (reason) => {
      setStatus('disconnected');
      addLog(`❌ Disconnected: ${reason}`);
    };

    const onConnectError = (err) => {
      setStatus('error');
      addLog(`⚠️ Error: ${err.message}`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    addLog(`Initial state: ${socket.connected ? 'connected' : 'disconnected'}`);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const testConnection = () => {
    addLog('🔄 Testing connection...');
    socket.connect();
  };

  const testEmit = () => {
    addLog('📤 Sending test event...');
    socket.emit('ping', { test: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Socket.IO Debug</h1>
        
        <div className={`p-4 rounded-lg mb-6 ${
          status === 'connected' ? 'bg-green-900/30 border border-green-500' :
          status === 'error' ? 'bg-red-900/30 border border-red-500' :
          'bg-slate-800 border border-slate-700'
        }`}>
          <div className="text-white font-semibold mb-2">
            Status: <span className="uppercase">{status}</span>
          </div>
          <div className="text-slate-400 text-sm">
            Socket ID: {socket.id || 'Not connected'}
          </div>
          <div className="text-slate-400 text-sm">
            Transport: {socket.io?.engine?.transport?.name || 'N/A'}
          </div>
          <div className="text-slate-400 text-sm">
            URL: {socket.io?.uri || 'N/A'}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testConnection}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reconnect
          </button>
          <button
            onClick={testEmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={!socket.connected}
          >
            Test Emit
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Clear Logs
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-white font-semibold mb-3">Connection Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="text-slate-300 text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-white font-semibold mb-3">Device Info</h2>
          <div className="text-slate-400 text-sm space-y-1">
            <div>User Agent: {navigator.userAgent}</div>
            <div>Platform: {navigator.platform}</div>
            <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
            <div>Connection: {navigator.connection?.effectiveType || 'Unknown'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketDebug;