import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from '@heygen/streaming-avatar';

export default function Avatar() {
  const [stream, setStream] = useState(null);
  const [debug, setDebug] = useState('');
  const [text, setText] = useState('');
  const [avatarParams, setAvatarParams] = useState({
    quality: AvatarQuality.Low,
    avatarName: 'Timeora_I_public', // Use a default public avatar
    voice: { rate: 1.5 }, // optional
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const avatar = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (avatar.current) {
        avatar.current.stopAvatar();
        avatar.current = null;
      }
    };
  }, []);

  const updateStatus = (msg) => {
    setDebug((prev) => `${prev}\n${msg}`);
    console.log(msg);
  };

  const fetchAccessToken = async () => {
    try {
      // In production, fetch from your backend
      const response = await fetch('http://localhost:8000/session', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to fetch token');
      const data = await response.json();
      if (data.code === '10008') {
        throw new Error("Quota exceeded. Please upgrade your HeyGen plan.");
      }
      return data.data.token;
    } catch (error) {
      updateStatus(`Error: ${error.message}`);
      return null;
    }
  };

  const startSession = async () => {
    setIsLoading(true);
    updateStatus('Fetching token...');
    const token = await fetchAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      avatar.current = new StreamingAvatar({
        token: token,
      });

      // Event listeners
      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log('Avatar started talking', e);
      });
      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log('Avatar stopped talking', e);
      });
      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsSessionActive(false);
        setStream(null);
      });
      avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Stream ready:', event.detail);
        setStream(event.detail);
      });

      updateStatus('Creating stream...');
      await avatar.current.createStartAvatar({
        quality: avatarParams.quality,
        avatarName: avatarParams.avatarName,
        voice: avatarParams.voice,
      });

      setIsSessionActive(true);
      updateStatus('Session started successfully');
    } catch (error) {
      updateStatus(`Error starting session: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (avatar.current) {
      await avatar.current.stopAvatar();
      avatar.current = null;
    }
    setStream(null);
    setIsSessionActive(false);
    updateStatus('Session ended');
  };

  const handleSpeak = async () => {
    if (!avatar.current || !text) return;
    try {
      await avatar.current.speak({ text: text });
      setText('');
    } catch (error) {
      updateStatus(`Error speaking: ${error.message}`);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(console.error);
      };
    }
  }, [stream]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-gray-100 rounded-lg overflow-hidden aspect-video relative mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!isSessionActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white flex-col">
            <div className="text-xl font-bold mb-2">Virtual AI Assistant</div>
            {isLoading ? 'Connecting...' : 'Click Start to begin'}
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        {!isSessionActive ? (
          <button
            onClick={startSession}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={endSession}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            End Session
          </button>
        )}
      </div>

      {isSessionActive && (
        <div className="flex w-full max-w-2xl gap-2 flex-col">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something to say..."
              className="flex-1 px-4 py-2 border rounded text-black"
              onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
            />
            <button
              onClick={handleSpeak}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Speak
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (!window.webkitSpeechRecognition) {
                  updateStatus("Speech recognition not supported in this browser.");
                  return;
                }
                const recognition = new window.webkitSpeechRecognition();
                recognition.lang = 'en-US';
                recognition.onstart = () => updateStatus("Listening...");
                recognition.onend = () => updateStatus("Stopped listening.");
                recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript;
                  setText(transcript);
                  // Optional: Auto-speak
                  // avatar.current.speak({ text: transcript });
                };
                recognition.start();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            >
              🎤 Voice Input
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 p-2 bg-gray-800 text-green-400 font-mono text-xs w-full max-w-2xl h-32 overflow-y-auto whitespace-pre-wrap">
        {debug}
      </div>
    </div>
  );
}
