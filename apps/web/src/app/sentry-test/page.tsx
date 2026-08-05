'use client';

export default function SentryTestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950 text-white gap-6">
      <h1 className="text-3xl font-bold">Sentry Integration Test</h1>
      <p className="text-zinc-400 text-center max-w-md">
        Click the buttons below to trigger intentional errors. Then check your Sentry dashboard to verify they were caught successfully.
      </p>

      <div className="flex gap-4">
        {/* Frontend Error */}
        <button 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
          onClick={() => {
            throw new Error("Sentry Frontend Test Error!");
          }}
        >
          Trigger Frontend Error
        </button>

        {/* Backend Error */}
        <button 
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 rounded font-medium"
          onClick={async () => {
            try {
              // Call the new backend test endpoint we just created
              await fetch('http://localhost:4000/v1/sentry-debug');
              alert('Backend error triggered. Check your backend terminal and Sentry!');
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Trigger Backend Error
        </button>
      </div>
    </div>
  );
}
