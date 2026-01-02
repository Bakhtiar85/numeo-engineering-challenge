// frontend\src\App.tsx

import { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import type { SocketResposne } from './types';
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const recogitionRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // initialize socket connection
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('transcription', (response: SocketResposne) => {
      if (response.data) {
        setTranscript(prev => [...prev, response.data as string]);
      }
      if (response.errror) {
        console.error('Error from server:', response.errror);
      }
    });

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recogitionRef.current = new SpeechRecognition();
      recogitionRef.current.continuous = true;
      recogitionRef.current.interimResults = true;
      recogitionRef.current.lang = 'en-US';

      recogitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Transcript:', transcript);

        socketRef.current?.emit('transcription', { text: transcript });
      };
    } else {
      console.warn('Speech Recognition not supported in this browser');
    }

    return () => {
      socketRef.current?.disconnect();
    }
  }, [isRecording]);

  const handleRecording = () => {
    if (!isRecording) {
      recogitionRef.current?.start();
      setIsRecording(true);
    } else {
      recogitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <div className="app">
        <h1>Voice transcription project</h1>

        <button type="button" onClick={handleRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        <div className="transcription">
          <h2>Transcription</h2>
          {transcript.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
