from typing import TypedDict

class SettingsDict(TypedDict):
    static_path: str
    template_path: str
    debug: bool
    log_file_prefix: str

settings: SettingsDict
