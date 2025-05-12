import React, { useRef, useState } from 'react';
import Button from './Button';
import Mic from '../assets/mic-logo.svg';

const VoiceToText = ({ setMessage, className }) => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (!recording) {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        try {
          const response = await fetch('http://localhost:5000/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transcription failed');
          }

          const data = await response.json();
          setTranscript(data.transcript);
          setMessage(data.transcript);
        } catch (err) {
          console.error('Fetch error:', err);
          setTranscript('Error transcribing audio');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  return (
    <div className={`voice-to-text-container ${className}`}>
      <button
        onClick={toggleRecording}
        className={`voice-button ${recording ? 'recording' : ''}`}
      >
        {recording ? <img src={Mic} alt='Stop' className='voice-input-logo' /> : <img src={Mic} alt='Start' className='voice-input-logo' />}
      </button>
    </div>
  );
};

export default VoiceToText;