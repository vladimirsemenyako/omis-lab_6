from abc import ABC, abstractmethod
from typing import List, Dict, Any


class IAnalysisStrategy(ABC):
    @abstractmethod
    def analyze_data(self, data: List[str]) -> Dict[str, Any]:
        pass


class StatisticalAnalysisStrategy(IAnalysisStrategy):
    def analyze_data(self, data: List[str]) -> Dict[str, Any]:
        text = " ".join(data).lower()
        
        actions = {
            "включи": "turn_on",
            "выключи": "turn_off",
            "включить": "turn_on",
            "выключить": "turn_off",
            "открой": "open",
            "закрой": "close",
            "увеличь": "increase",
            "уменьши": "decrease",
            "стоп": "stop",
            "пауза": "pause"
        }
        
        device_types = {
            "свет": "light",
            "ламп": "light",
            "освещение": "light",
            "кондиционер": "thermostat",
            "телевизор": "tv",
            "телевизора": "tv",
            "телевизору": "tv",
            "кофемашина": "coffee_maker",
            "термостат": "thermostat",
            "камера": "security_camera",
            "пылесос": "robot_vacuum",
            "замок": "smart_lock"
        }
        
        action = None
        for keyword, act in actions.items():
            if keyword in text:
                action = act
                break
        
        device_type = None
        for keyword, dtype in device_types.items():
            if keyword in text:
                device_type = dtype
                break
        
        locations = ["гостиная", "спальня", "кухня", "ванная", "коридор"]
        location = None
        for loc in locations:
            if loc in text:
                location = loc
                break
        
        return {
            "action": action or "unknown",
            "device_type": device_type,
            "location": location,
            "recognized_text": text
        }


class MachineLearningStrategy(IAnalysisStrategy):
    def analyze_data(self, data: List[str]) -> Dict[str, Any]:
        return StatisticalAnalysisStrategy().analyze_data(data)

