import React, { useState } from 'react';
import './Modal.css';
import { Device } from '../types';
import { api } from '../services/api';

interface DevicesModalProps {
  devices: Device[];
  onClose: () => void;
  onDeviceChange: () => void;
}

const DevicesModal: React.FC<DevicesModalProps> = ({ devices, onClose, onDeviceChange }) => {
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deviceTypes = [
    { value: 'coffee_maker', label: 'Кофемашина', icon: '☕' },
    { value: 'thermostat', label: 'Умный термостат', icon: '🌡️' },
    { value: 'security_camera', label: 'Камера безопасности', icon: '📹' },
    { value: 'robot_vacuum', label: 'Робот-пылесос', icon: '🤖' },
    { value: 'smart_lock', label: 'Умный замок', icon: '🔒' },
    { value: 'light', label: 'Умный свет', icon: '💡' },
    { value: 'tv', label: 'Телевизор', icon: '📺' }
  ];

  const getDeviceIcon = (type: string) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType?.icon || '📱';
  };

  const handleAddDevice = async () => {
    if (!selectedDeviceType) {
      alert('Пожалуйста, выберите устройство');
      return;
    }

    const deviceType = deviceTypes.find(dt => dt.value === selectedDeviceType);
    if (!deviceType) return;

    setIsLoading(true);
    try {
      await api.createDevice({
        name: deviceType.label,
        device_type: selectedDeviceType,
        location: 'Новое устройство'
      });
      await onDeviceChange();
      setSelectedDeviceType('');
    } catch (error: any) {
      console.error('Ошибка добавления устройства:', error);
      alert(`Ошибка: ${error?.message || 'Не удалось добавить устройство'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number, deviceName: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить устройство "${deviceName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteDevice(deviceId);
      await onDeviceChange();
    } catch (error: any) {
      console.error('Ошибка удаления устройства:', error);
      alert(`Ошибка: ${error?.message || 'Не удалось удалить устройство'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDevice = async (device: Device) => {
    setIsLoading(true);
    try {
      await api.toggleDevice(device.id);
      await onDeviceChange();
    } catch (error: any) {
      console.error('Ошибка переключения устройства:', error);
      alert(`Ошибка: ${error?.message || 'Не удалось переключить устройство'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content devices-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Управление устройствами</div>
          <button className="close-btn" onClick={onClose} aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="device-list">
          {devices.length === 0 ? (
            <div className="empty-device-list">
              <div className="empty-icon">📱</div>
              <p>Нет устройств</p>
              <p className="empty-hint">Добавьте устройство ниже</p>
            </div>
          ) : (
            devices.map(device => (
              <div key={device.id} className="device-item">
                <div className="device-icon">{getDeviceIcon(device.device_type)}</div>
                <div className="device-info">
                  <div className="device-name">{device.name}</div>
                  <div className="device-meta">
                    <span className="device-location">{device.location || 'Не указано'}</span>
                    <span className="device-separator">•</span>
                    <span className={`device-status ${device.is_on ? 'status-on' : 'status-off'}`}>
                      {device.is_on ? 'Включен' : 'Выключен'}
                    </span>
                  </div>
                </div>
                <div className="device-actions">
                  <button
                    className={`toggle-device-btn ${device.is_on ? 'active' : ''}`}
                    onClick={() => handleToggleDevice(device)}
                    disabled={isLoading}
                    title={device.is_on ? 'Выключить' : 'Включить'}
                  >
                    <span className="toggle-icon">{device.is_on ? '●' : '○'}</span>
                  </button>
                  <button
                    className="delete-device-btn"
                    onClick={() => handleDeleteDevice(device.id, device.name)}
                    disabled={isLoading}
                    title="Удалить устройство"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="add-device-section">
          <div className="add-device-header">
            <h3>Добавить устройство</h3>
          </div>
          <div className="add-device-form">
            <select
              className="device-select"
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Выберите тип устройства</option>
              {deviceTypes.map(dt => (
                <option key={dt.value} value={dt.value}>
                  {dt.icon} {dt.label}
                </option>
              ))}
            </select>
            <button 
              className="add-device-btn" 
              onClick={handleAddDevice}
              disabled={!selectedDeviceType || isLoading}
            >
              {isLoading ? 'Добавление...' : 'Добавить устройство'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesModal;
