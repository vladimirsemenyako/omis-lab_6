export interface Device {
  id: number;
  name: string;
  device_type: string;
  location: string | null;
  is_active: boolean;
  is_on: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface Command {
  id: number;
  user_id: number;
  device_id: number | null;
  command_text: string;
  recognized_text: string | null;
  action: string | null;
  status: string;
  language: string;
  created_at: string;
}

export interface Settings {
  id: number;
  user_id: number;
  voice_responses_enabled: boolean;
  auto_confirmation: boolean;
  noise_suppression: boolean;
  emergency_commands_priority: boolean;
  voice_timbre: string;
  speech_speed: number;
  volume: number;
  voice_pitch: number;
  custom_keywords: string[];
  command_sequences: any[];
  hot_keys: any[];
  created_at: string;
  updated_at: string | null;
}

export interface VoiceCommandRequest {
  audio_data?: string;
  text?: string;
  language?: string;
}

export interface VoiceCommandResponse {
  recognized_text: string;
  action: string;
  device_id?: number;
  status: string;
  message: string;
}

