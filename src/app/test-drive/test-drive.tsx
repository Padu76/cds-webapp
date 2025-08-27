import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Loader2, File, Folder } from 'lucide-react';

const DriveTestComponent = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test health check
      const response = await fetch('/api/drive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setStatus(result);

      // Se connessione OK, prova a cercare documenti
      if (result.connected) {
        const searchResponse = await fetch('/api/drive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: '' }) // Query vuota per ottenere tutti i documenti
        });

        if (searchResponse.ok) {
          const docs = await searchResponse.json();
          setDocuments(docs);
        }
      }
      
    } catch (err) {
      setError(err.message);
      setStatus({ connected: false, documentsFound: 0, errors: [err.message] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Database className="w-6 h-6 text-blue-600" />
          <span>Test Google Drive Connection</span>
        </h2>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          <span>{loading ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg border ${
          status.connected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {status.connected ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold">
              Connection Status: {status.connected ? 'Connected' : 'Disconnected'}
            </h3>
          </div>
          
          <div className="text-sm space-y-1">
            <p>Documents Found: <strong>{status.documentsFound}</strong></p>
            <p>Supported Types: <strong>{status.supportedTypes?.join(', ')}</strong></p>
            
            {status.errors && status.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-600 font-semibold">Errors:</p>
                <ul className="list-disc list-inside text-red-600">
                  {status.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-600">Connection Error</h3>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Documents List */}
      {documents && documents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <span>Documents Found ({documents.length})</span>
          </h3>
          
          <div className="grid gap-3">
            {documents.slice(0, 10).map((doc, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-sm">{doc.document?.name || 'Unknown'}</h4>
                      <p className="text-xs text-gray-500">
                        Type: {doc.document?.type || 'Unknown'} | 
                        Size: {doc.document?.size ? Math.round(doc.document.size / 1024) + 'KB' : 'Unknown'}
                      </p>
                      {doc.document?.keywords && (
                        <p className="text-xs text-blue-600 mt-1">
                          Keywords: {doc.document.keywords.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Match: {doc.matchScore}
                  </span>
                </div>
                
                {doc.relevantSections && doc.relevantSections.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Preview:</strong> {doc.relevantSections[0].substring(0, 200)}...
                  </div>
                )}
              </div>
            ))}
            
            {documents.length > 10 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                ... and {documents.length - 10} more documents
              </div>
            )}
          </div>
        </div>
      )}
      
      {status?.connected && documents.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Connection successful but no documents found. Check if the folder ID is correct and contains supported file types.
          </p>
        </div>
      )}
    </div>
  );
};

export default DriveTestComponent;