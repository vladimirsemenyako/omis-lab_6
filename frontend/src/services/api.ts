import { Device, Command, Settings, VoiceCommandRequest, VoiceCommandResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getDevices(userId: number = 1): Promise<Device[]> {
    return this.request<Device[]>(`/devices/?user_id=${userId}`);
  }

  async createDevice(device: Partial<Device>): Promise<Device> {
    return this.request<Device>('/devices/', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(deviceId: number, device: Partial<Device>): Promise<Device> {
    return this.request<Device>(`/devices/${deviceId}/`, {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(deviceId: number): Promise<void> {
    return this.request<void>(`/devices/${deviceId}/`, {
      method: 'DELETE',
    });
  }

  async toggleDevice(deviceId: number): Promise<Device> {
    return this.request<Device>(`/devices/${deviceId}/toggle/`, {
      method: 'POST',
    });
  }

  async getCommands(userId: number = 1): Promise<Command[]> {
    return this.request<Command[]>(`/commands/?user_id=${userId}`);
  }

  async createCommand(command: Partial<Command>): Promise<Command> {
    return this.request<Command>('/commands/', {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async getSettings(userId: number = 1): Promise<Settings> {
    return this.request<Settings>(`/settings/${userId}/`);
  }

  async updateSettings(userId: number, settings: Partial<Settings>): Promise<Settings> {
    return this.request<Settings>(`/settings/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async processVoiceCommand(request: VoiceCommandRequest): Promise<VoiceCommandResponse> {
    return this.request<VoiceCommandResponse>('/voice/process/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const api = new ApiService();
