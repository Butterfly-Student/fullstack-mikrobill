// app/routes/mikrotik.tsx
import { useMikrotikStream } from '@/hooks/use-mikrotil-stream';


// Example 1: Simple Interface Monitor
export function InterfaceMonitor() {
  const config = {
    host: '103.139.193.128',
    user: 'fandi1',
    password: '001',
    port: 1012,
  }

  const {
    isConnected,
    isSubscribed,
    latestData,
    error,
    subscribe,
    unsubscribe,
  } = useMikrotikStream('/log/print', config, [
    '=.proplist=time,topics,message',
    '=follow=',
  ])

  return (
    <div className='p-6'>
      <h2 className='mb-4 text-2xl font-bold'>Interface Monitor</h2>

      <div className='mb-4'>
        <span
          className={`rounded px-3 py-1 ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className='mb-4 flex gap-2'>
        <button
          onClick={subscribe}
          disabled={!isConnected || isSubscribed}
          className='rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300'
        >
          Subscribe
        </button>
        <button
          onClick={unsubscribe}
          disabled={!isSubscribed}
          className='rounded bg-red-500 px-4 py-2 text-white disabled:bg-gray-300'
        >
          Unsubscribe
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded bg-red-100 p-4 text-red-700'>{error}</div>
      )}

      <div className='rounded bg-gray-50 p-4'>
        <pre className='overflow-auto text-xs'>
          {latestData ? JSON.stringify(latestData, null, 2) : 'No data'}
        </pre>
      </div>
    </div>
  )
}

// Example 2: Ping Monitor with Command + Params
export function PingMonitor() {
  const config = {
    host: '103.139.193.128',
    user: 'fandi1',
    password: '001',
    port: 1012,
  }

  // execStream with command and params
  const {
    isConnected,
    isSubscribed,
    data,
    latestData,
    error,
    subscribe,
    unsubscribe,
    clearData,
  } = useMikrotikStream(
    '/ping',
    config,
    ['=address=8.8.8.8'], // params untuk ping
    {
      maxDataPoints: 50, // keep last 50 ping results
    }
  )

  return (
    <div className='p-6'>
      <h2 className='mb-4 text-2xl font-bold'>Ping Monitor (8.8.8.8)</h2>

      <div className='mb-4 flex items-center gap-4'>
        <span
          className={`rounded px-3 py-1 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        {isSubscribed && (
          <span className='rounded bg-blue-100 px-3 py-1 text-blue-800'>
            📡 Monitoring Active
          </span>
        )}
      </div>

      <div className='mb-4 flex gap-2'>
        <button
          onClick={subscribe}
          disabled={!isConnected || isSubscribed}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300'
        >
          Start Ping
        </button>
        <button
          onClick={unsubscribe}
          disabled={!isSubscribed}
          className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:bg-gray-300'
        >
          Stop Ping
        </button>
        <button
          onClick={clearData}
          className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
        >
          Clear Data
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded bg-red-100 p-4 text-red-700'>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className='mb-4 rounded bg-white p-4 shadow'>
        <h3 className='mb-2 font-semibold'>Latest Result:</h3>
        <pre className='overflow-auto rounded bg-gray-50 p-3 text-xs'>
          {latestData ? JSON.stringify(latestData, null, 2) : 'No data yet'}
        </pre>
      </div>

      <div className='rounded bg-white p-4 shadow'>
        <h3 className='mb-2 font-semibold'>
          Ping History ({data.length} results)
        </h3>
        <div className='max-h-96 overflow-auto'>
          {data.length === 0 ? (
            <p className='text-gray-500'>No ping data yet</p>
          ) : (
            <div className='space-y-2'>
              {data.map((item, idx) => (
                <div
                  key={idx}
                  className='rounded border border-gray-200 bg-gray-50 p-2 text-xs'
                >
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Example 3: PPPoE Active Connections Monitor
export function PPPoEActiveMonitor() {
  const config = {
    host: '103.139.193.128',
    user: 'fandi1',
    password: '001',
    port: 1012,
  }

  const { isConnected, isSubscribed, data, latestData, error, resubscribe } =
    useMikrotikStream(
      '/ppp/active/print',
      config,
      ['=.proplist=name,caller-id,uptime,address'], // hanya ambil field tertentu
      {
        autoSubscribe: true, // auto subscribe saat component mount
        maxDataPoints: 100,
      }
    )

  return (
    <div className='p-6'>
      <h2 className='mb-4 text-2xl font-bold'>PPPoE Active Connections</h2>

      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <span
            className={`rounded px-3 py-1 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {isSubscribed && (
            <span className='rounded bg-blue-100 px-3 py-1 text-blue-800'>
              📡 Live Monitoring
            </span>
          )}
        </div>
        <button
          onClick={resubscribe}
          className='rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600'
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded bg-red-100 p-4 text-red-700'>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className='rounded bg-white p-4 shadow'>
        <h3 className='mb-2 font-semibold'>Active Users: {data.length}</h3>
        {data.length === 0 ? (
          <p className='text-gray-500'>No active connections</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='p-2 text-left'>Username</th>
                  <th className='p-2 text-left'>Caller ID</th>
                  <th className='p-2 text-left'>IP Address</th>
                  <th className='p-2 text-left'>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, idx) => (
                  <tr key={idx} className='border-t'>
                    <td className='p-2'>{user.name || '-'}</td>
                    <td className='p-2'>{user['caller-id'] || '-'}</td>
                    <td className='p-2'>{user.address || '-'}</td>
                    <td className='p-2'>{user.uptime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className='mt-4 rounded bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-semibold'>Latest Data (Raw):</h3>
        <pre className='overflow-auto text-xs'>
          {latestData ? JSON.stringify(latestData, null, 2) : 'No data'}
        </pre>
      </div>
    </div>
  )
}

// Example 4: Resource Monitor
export function ResourceMonitor() {
  const config = {
    host: '103.139.193.128',
    user: 'fandi1',
    password: '001',
    port: 1012,
  }

  const { isConnected, isSubscribed, latestData, error } = useMikrotikStream(
    '/system/resource/print',
    config,
    undefined, // no params needed
    {
      autoSubscribe: true,
    }
  )

  return (
    <div className='p-6'>
      <h2 className='mb-4 text-2xl font-bold'>System Resource Monitor</h2>

      <div className='mb-4'>
        <span
          className={`rounded px-3 py-1 ${isConnected && isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {isConnected && isSubscribed ? '🟢 Monitoring' : '🔴 Not Connected'}
        </span>
      </div>

      {error && (
        <div className='mb-4 rounded bg-red-100 p-4 text-red-700'>{error}</div>
      )}

      {latestData && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded bg-white p-4 shadow'>
            <h3 className='mb-2 text-sm font-semibold text-gray-600'>
              CPU Load
            </h3>
            <p className='text-2xl font-bold'>
              {latestData['cpu-load'] || '0'}%
            </p>
          </div>
          <div className='rounded bg-white p-4 shadow'>
            <h3 className='mb-2 text-sm font-semibold text-gray-600'>
              Free Memory
            </h3>
            <p className='text-2xl font-bold'>
              {latestData['free-memory'] || '0'} bytes
            </p>
          </div>
          <div className='rounded bg-white p-4 shadow'>
            <h3 className='mb-2 text-sm font-semibold text-gray-600'>Uptime</h3>
            <p className='text-2xl font-bold'>{latestData.uptime || '-'}</p>
          </div>
        </div>
      )}

      <div className='mt-4 rounded bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-semibold'>Raw Data:</h3>
        <pre className='overflow-auto text-xs'>
          {latestData ? JSON.stringify(latestData, null, 2) : 'No data'}
        </pre>
      </div>
    </div>
  )
}

// Main component combining all examples
export default function MikrotikDashboard() {
  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <h1 className='mb-8 text-3xl font-bold'>MikroTik Monitor Dashboard</h1>

      <div className='space-y-8'>
        <PingMonitor />
        <PPPoEActiveMonitor />
        <ResourceMonitor />
        <InterfaceMonitor />
      </div>
    </div>
  )
}