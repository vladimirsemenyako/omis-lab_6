import React, { useState, useEffect, useRef } from 'react';
import './VoiceAssistant.css';
import DevicesModal from './DevicesModal';
import SettingsModal from './SettingsModal';
import { Device, Settings } from '../types';
import { api } from '../services/api';

const VoiceAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ type: string; text: string; timestamp?: Date }>>([
    { type: 'assistant', text: 'Привет! Я ваш голосовой помощник. Чем могу помочь?', timestamp: new Date() }
  ]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [status, setStatus] = useState('Готов к работе');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const lastProcessedCommandRef = useRef<{ text: string; timestamp: number } | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setStatus('Слушаю...');
        recognitionTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 10000);
      };

      recognitionRef.current.onnomatch = () => {
        setIsRecording(false);
        setStatus('Готов к работе');
        addMessage('system', 'Речь не распознана. Попробуйте еще раз.');
      };

      recognitionRef.current.onresult = (event: any) => {
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current);
          recognitionTimeoutRef.current = null;
        }

        const resultIndex = event.results.length - 1;
        const transcript = event.results[resultIndex][0].transcript.trim();
        const isFinal = event.results[resultIndex].isFinal;

        if (!isFinal) {
          setStatus(`Слушаю... (${transcript})`);
          return;
        }

        if (transcript.length === 0) {
          return;
        }

        if (isProcessingRef.current) {
          return;
        }

        if (lastProcessedCommandRef.current && lastProcessedCommandRef.current.text === transcript && transcript !== '') {
          const timeSinceLastCommand = Date.now() - lastProcessedCommandRef.current.timestamp;
          if (timeSinceLastCommand < 2000) {
            return;
          }
        }

        isProcessingRef.current = true;
        lastProcessedCommandRef.current = { text: transcript, timestamp: Date.now() };

        addMessage('user', transcript);
        setIsRecording(false);
        setStatus('Обработка...');

        processVoiceCommand(transcript).finally(() => {
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 1500);
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current);
          recognitionTimeoutRef.current = null;
        }

        let errorMsg = 'Ошибка распознавания';
        if (event.error === 'no-speech') {
          errorMsg = 'Речь не распознана. Попробуйте еще раз.';
        } else if (event.error === 'network') {
          errorMsg = 'Ошибка сети. Проверьте подключение.';
        } else if (event.error === 'not-allowed') {
          errorMsg = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
        } else if (event.error === 'aborted') {
          errorMsg = 'Распознавание прервано.';
        }
        addMessage('system', errorMsg);
        setIsRecording(false);
        setStatus('Готов к работе');
      };

      recognitionRef.current.onend = () => {
        if (recognitionTimeoutRef.current) {
          clearTimeout(recognitionTimeoutRef.current);
          recognitionTimeoutRef.current = null;
        }
        setIsRecording(false);
        if (!isProcessingRef.current) {
          setStatus('Готов к работе');
        }
      };
    } else {
      addMessage('system', 'Ваш браузер не поддерживает распознавание речи. Используйте текстовый ввод.');
    }

    loadDevices();
    loadSettings();

    return () => {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadDevices = async () => {
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.getSettings(1);
      setSettings(data);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const addMessage = (type: string, text: string) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      addMessage('system', 'Распознавание речи недоступно');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Ошибка запуска распознавания:', error);
        addMessage('system', `Не удалось запустить распознавание: ${error?.message || 'неизвестная ошибка'}`);
        setIsRecording(false);
        setStatus('Готов к работе');
      }
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    addMessage('user', textInput);
    const inputText = textInput;
    setTextInput('');
    await processTextCommand(inputText);
  };

  const processVoiceCommand = async (command: string) => {
    try {
      const response = await api.processVoiceCommand({ text: command });
      addMessage('assistant', response.message || 'Команда выполнена');
      setStatus('Готов к работе');
      await loadDevices();
    } catch (error: any) {
      console.error('Ошибка обработки команды:', error);
      addMessage('system', `Ошибка: ${error?.message || 'Ошибка обработки команды'}`);
      setStatus('Готов к работе');
    }
  };

  const processTextCommand = async (command: string) => {
    if (isProcessingRef.current) {
      return;
    }

    if (lastProcessedCommandRef.current && lastProcessedCommandRef.current.text === command.trim() && command.trim() !== '') {
      const timeSinceLastCommand = Date.now() - lastProcessedCommandRef.current.timestamp;
      if (timeSinceLastCommand < 2000) {
        return;
      }
    }

    try {
      isProcessingRef.current = true;
      lastProcessedCommandRef.current = { text: command.trim(), timestamp: Date.now() };

      setStatus('Обработка команды...');
      const response = await api.processVoiceCommand({ text: command });
      addMessage('assistant', response.message || 'Команда выполнена');
      setStatus('Готов к работе');
      await loadDevices();
    } catch (error: any) {
      console.error('Ошибка обработки текстовой команды:', error);
      addMessage('system', `Ошибка: ${error?.message || 'Ошибка обработки команды'}`);
      setStatus('Готов к работе');
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="voice-assistant-app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Устройства</h2>
          <button 
            className="icon-button add-device-btn"
            onClick={() => setShowDevicesModal(true)}
            title="Добавить устройство"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        
        <div className="devices-preview">
          {devices.length === 0 ? (
            <div className="empty-state">
              <p>Нет устройств</p>
              <button 
                className="link-button"
                onClick={() => setShowDevicesModal(true)}
              >
                Добавить устройство
              </button>
            </div>
          ) : (
            devices.slice(0, 5).map(device => (
              <div key={device.id} className="device-preview-item">
                <div className="device-preview-info">
                  <span className="device-preview-name">{device.name}</span>
                  <span className={`device-preview-status ${device.is_on ? 'on' : 'off'}`}>
                    {device.is_on ? 'Включено' : 'Выключено'}
                  </span>
                </div>
                <div className={`device-preview-indicator ${device.is_on ? 'active' : ''}`}></div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button 
            className="sidebar-button"
            onClick={() => setShowSettingsModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
            Настройки
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <h1>Голосовой помощник</h1>
            <div className={`status-badge ${isRecording ? 'recording' : ''}`}>
              <span className="status-dot"></span>
              {status}
            </div>
          </div>
          <div className="header-right">
            <button 
              className="header-button"
              onClick={() => setShowDevicesModal(true)}
              title="Управление устройствами"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </button>
            <button 
              className="header-button"
              onClick={() => setShowSettingsModal(true)}
              title="Настройки"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </button>
          </div>
        </header>

        <div className="chat-area" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message message-${msg.type}`}>
              <div className="message-content">
                {msg.text}
              </div>
              {msg.timestamp && (
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <input
              type="text"
              className="text-input"
              placeholder="Введите команду или нажмите микрофон..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={toggleVoiceRecording}
              title={isRecording ? 'Остановить запись' : 'Начать запись'}
            >
              {isRecording ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
            <button 
              className="send-button"
              onClick={sendTextMessage}
              disabled={!textInput.trim()}
              title="Отправить"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {showDevicesModal && (
        <DevicesModal
          devices={devices}
          onClose={() => setShowDevicesModal(false)}
          onDeviceChange={loadDevices}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSettingsChange={loadSettings}
        />
      )}
    </div>
  );
};

export default VoiceAssistant;
