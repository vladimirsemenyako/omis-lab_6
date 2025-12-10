import React, { useState, useEffect } from 'react';
import './Modal.css';
import { Settings } from '../types';
import { api } from '../services/api';

interface SettingsModalProps {
  settings: Settings | null;
  onClose: () => void;
  onSettingsChange: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Settings | null>(settings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!formData) {
    return (
      <div className="modal" onClick={onClose}>
        <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-settings">
            <p>Загрузка настроек...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof Settings, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsLoading(true);
    try {
      await api.updateSettings(1, formData);
      await onSettingsChange();
      onClose();
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error);
      alert(`Ошибка: ${error?.message || 'Не удалось сохранить настройки'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Настройки системы</div>
          <button className="close-btn" onClick={onClose} aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
              Основные
            </button>
            <button
              className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveTab('voice')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              Голос
            </button>
            <button
              className={`tab ${activeTab === 'commands' ? 'active' : ''}`}
              onClick={() => setActiveTab('commands')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Команды
            </button>
          </div>
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'general' && (
            <div className="tab-content active">
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Голосовые ответы</div>
                    <div className="setting-desc">Воспроизводить голосовые ответы системы</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.voice_responses_enabled || false}
                      onChange={(e) => handleChange('voice_responses_enabled', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Автоподтверждение</div>
                    <div className="setting-desc">Выполнять команды без подтверждения</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.auto_confirmation || false}
                      onChange={(e) => handleChange('auto_confirmation', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Подавление шума</div>
                    <div className="setting-desc">Улучшенное распознавание в шумной среде</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.noise_suppression || false}
                      onChange={(e) => handleChange('noise_suppression', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Экстренные команды</div>
                    <div className="setting-desc">Приоритетная обработка команд "Стоп", "Пауза"</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.emergency_commands_priority || false}
                      onChange={(e) => handleChange('emergency_commands_priority', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="tab-content active">
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Тембр голоса</div>
                    <div className="setting-desc">Выберите голос для системы</div>
                  </div>
                  <select
                    className="setting-select"
                    value={formData.voice_timbre || 'female'}
                    onChange={(e) => handleChange('voice_timbre', e.target.value)}
                  >
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                    <option value="neutral">Нейтральный</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Скорость речи</div>
                    <div className="setting-desc">{formData.speech_speed || 100}%</div>
                  </div>
                  <input
                    type="range"
                    className="setting-range"
                    min="50"
                    max="200"
                    value={formData.speech_speed || 100}
                    onChange={(e) => handleChange('speech_speed', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Громкость</div>
                    <div className="setting-desc">{formData.volume || 80}%</div>
                  </div>
                  <input
                    type="range"
                    className="setting-range"
                    min="0"
                    max="100"
                    value={formData.volume || 80}
                    onChange={(e) => handleChange('volume', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Высота тона</div>
                    <div className="setting-desc">{formData.voice_pitch || 200} Hz</div>
                  </div>
                  <input
                    type="range"
                    className="setting-range"
                    min="80"
                    max="300"
                    value={formData.voice_pitch || 200}
                    onChange={(e) => handleChange('voice_pitch', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="tab-content active">
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">Пользовательские ключевые слова</div>
                    <div className="setting-desc">Добавьте свои ключевые слова для управления</div>
                  </div>
                  <div className="keywords-input-group">
                    <input
                      type="text"
                      className="keyword-input"
                      placeholder="Введите новое слово..."
                    />
                    <button className="add-keyword-btn">
                      Добавить
                    </button>
                  </div>
                  {formData.custom_keywords && formData.custom_keywords.length > 0 && (
                    <div className="keywords-list">
                      {formData.custom_keywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag">
                          {keyword}
                          <button className="remove-keyword">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button 
            className="save-settings-btn" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
